import {
  doc,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  increment,
  runTransaction,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getFriendlyErrorMessage } from "../utils/errorMessages";
import {
  isEmergencyMode,
  checkSaveRateLimit,
  recordSaveOperation,
} from "./costProtection";

// Helper function to get user's document reference
const getUserDocRef = (userId) => doc(db, "users", userId);

// Helper function to get user's subcollection reference
const getUserSubcollection = (userId, subcollection) =>
  collection(db, "users", userId, subcollection);

const DEFAULT_LIST_LIMIT = 30; // Default limit for paginated lists

// ===== USER OPERATIONS =====

export const createUserProfile = async (userId, userData) => {
  try {
    const userDocRef = getUserDocRef(userId);

    // Set role based on email from environment variable
    const ownerEmail = import.meta.env.VITE_OWNER_EMAIL;
    const userRole = userData.email === ownerEmail ? "owner" : "user";

    const profileData = {
      ...userData,
      role: userRole,
      totalBinders: 0,
      totalValue: 0,
      photoURL: userData.photoURL || null,
      photoPath: null, // Will be set when user uploads custom picture
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      settings: {
        theme: "light",
        currency: "USD",
        publicProfile: false,
        animationPreference: null, // null = follow system preference
        binderPreferences: {
          gridSize: "3x3",
          sortingDirection: true, // true = ascending
          autoSave: true,
          createdAt: serverTimestamp(),
        },
      },
    };

    await setDoc(userDocRef, profileData);
    return { success: true, data: profileData };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDocRef = getUserDocRef(userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    // SERVER-SIDE DATA VALIDATION - Validate profile updates
    const dataValidation = validateUserProfileData(updates);
    if (!dataValidation.success) {
      return {
        success: false,
        error: dataValidation.error,
      };
    }

    const userDocRef = getUserDocRef(userId);
    const updateData = {
      ...updates,
      lastLoginAt: serverTimestamp(),
    };

    await updateDoc(userDocRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== USER PREFERENCES OPERATIONS =====

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userDocRef = getUserDocRef(userId);

    // Use field-level updates instead of reading entire document first
    const updateData = {
      lastLoginAt: serverTimestamp(),
    };

    // Remove currentPage from preferences before saving
    const { currentPage, ...prefsToSave } = preferences;

    // Handle different types of preferences
    Object.keys(prefsToSave).forEach((key) => {
      if (key === "animationPreference") {
        // Animation preference is stored directly in settings
        updateData[`settings.${key}`] = prefsToSave[key];
      } else {
        // Other preferences go into binderPreferences
        updateData[`settings.binderPreferences.${key}`] = prefsToSave[key];
      }
    });

    // Update timestamp based on preference type
    if (prefsToSave.animationPreference !== undefined) {
      updateData[`settings.updatedAt`] = serverTimestamp();
    }
    if (Object.keys(prefsToSave).some((key) => key !== "animationPreference")) {
      updateData[`settings.binderPreferences.updatedAt`] = serverTimestamp();
    }

    await updateDoc(userDocRef, updateData);
    return { success: true, data: prefsToSave };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const userDocRef = getUserDocRef(userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const binderPreferences = userData.settings?.binderPreferences || {};
      const animationPreference = userData.settings?.animationPreference;

      // Return default preferences if none exist
      const defaultPreferences = {
        gridSize: "3x3",
        sortingDirection: true, // true = ascending
        autoSave: true,
        animationPreference: null, // null = follow system preference
      };

      return {
        success: true,
        data: {
          ...defaultPreferences,
          ...binderPreferences,
          animationPreference:
            animationPreference !== undefined ? animationPreference : null,
        },
      };
    } else {
      return { success: false, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== BINDER OPERATIONS =====

export const addBinder = async (userId, binderData) => {
  if (!userId) {
    return { success: false, error: "User ID is required to add a binder." };
  }
  if (!binderData || !binderData.binderName) {
    return { success: false, error: "Binder name is required." };
  }

  try {
    const emergencyMode = await isEmergencyMode();
    if (emergencyMode) {
      return {
        success: false,
        error:
          "Service temporarily limited due to cost protection measures. Please try again later.",
      };
    }

    // SERVER-SIDE DATA VALIDATION - Validate all binder data
    const dataValidation = validateBinderData(binderData);
    if (!dataValidation.success) {
      return {
        success: false,
        error: dataValidation.error,
      };
    }

    // SERVER-SIDE LIMIT VALIDATION - Check system limits from Firebase
    const systemConfigRef = doc(db, "systemConfiguration", "limits");
    const systemConfigDoc = await getDoc(systemConfigRef);

    // Get current binder count for user
    const bindersQuery = query(
      getUserSubcollection(userId, "binders"),
      orderBy("createdAt", "desc")
    );
    const currentBindersSnap = await getDocs(bindersQuery);
    const currentBinderCount = currentBindersSnap.size;

    // Check if user is authenticated (to determine if they're registered or guest)
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    const isRegisteredUser = userDoc.exists();

    // Get system limits if available
    let maxBinders = Number.MAX_SAFE_INTEGER; // Default unlimited
    let enforceLimits = false;

    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      enforceLimits = systemData.enforceBinnerLimits || false;

      if (enforceLimits) {
        if (isRegisteredUser) {
          maxBinders = systemData.registeredMaxBinders || 25;
        } else {
          maxBinders = systemData.guestMaxBinders || 3;
        }
      }
    }

    // Enforce server-side limit check
    if (enforceLimits && currentBinderCount >= maxBinders) {
      const userType = isRegisteredUser ? "registered" : "guest";
      return {
        success: false,
        error: `Binder limit reached. ${userType} users can have a maximum of ${maxBinders} binders.`,
      };
    }

    // SERVER-SIDE PAGE LIMIT VALIDATION - Check initial page count
    const initialPageCount = binderData.pageCount || 10; // Default to 10 if not specified
    const pageValidation = await validatePageLimits(userId, initialPageCount);
    if (!pageValidation.success) {
      return {
        success: false,
        error: pageValidation.error,
      };
    }

    const newBinderRef = doc(getUserSubcollection(userId, "binders")); // Auto-generates ID

    // Default preference values if not provided in binderData
    const defaults = {
      gridSize: "3x3",
      pageCount: 10,
      description: "",
      showReverseHolos: false,
      hideMissingCards: false,
      missingCards: [],
      sortBy: "overallSlotNumber",
      sortDirection: "asc",
      totalCardsInBinder: 0, // Initialize total cards
    };

    await setDoc(newBinderRef, {
      ...defaults, // Apply defaults first
      ...binderData, // User-provided data overrides defaults
      ownerId: userId,
      createdAt: serverTimestamp(), // Add server timestamp for creation
      updatedAt: serverTimestamp(), // Add server timestamp for last update
    });
    console.log("Binder added successfully with ID:", newBinderRef.id);
    return { success: true, binderId: newBinderRef.id };
  } catch (error) {
    console.error("Error adding binder:", error);
    return { success: false, error: error.message };
  }
};

export const getBindersForUser = async (
  userId,
  queryLimit = DEFAULT_LIST_LIMIT
) => {
  if (!userId) {
    console.error("User ID is required to fetch binders.");
    return { success: false, error: "User ID is required.", binders: [] };
  }
  try {
    const bindersQuery = query(
      getUserSubcollection(userId, "binders"),
      orderBy("createdAt", "desc"),
      limit(queryLimit) // Added limit
    );
    const querySnapshot = await getDocs(bindersQuery);
    const binders = [];
    querySnapshot.forEach((doc) => {
      binders.push({ id: doc.id, ...doc.data() });
    });
    return {
      success: true,
      binders,
      hasMore: querySnapshot.size === queryLimit,
    };
  } catch (error) {
    console.error("Error fetching binders for user:", error);
    return { success: false, error: error.message, binders: [] };
  }
};

export const getBinder = async (userId, binderId) => {
  if (!userId || !binderId) {
    return {
      success: false,
      error: "User ID and Binder ID are required.",
      data: null,
    };
  }
  try {
    const binderDocRef = doc(getUserSubcollection(userId, "binders"), binderId);
    const docSnap = await getDoc(binderDocRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      console.warn(`Binder not found: users/${userId}/binders/${binderId}`);
      return { success: false, error: "Binder not found.", data: null };
    }
  } catch (error) {
    console.error("Error fetching binder:", error);
    return { success: false, error: error.message, data: null };
  }
};

export const updateBinder = async (userId, binderId, updates) => {
  if (!userId || !binderId) {
    return { success: false, error: "User ID and Binder ID are required." };
  }
  if (!updates || Object.keys(updates).length === 0) {
    return { success: false, error: "No updates provided." };
  }

  try {
    // SERVER-SIDE DATA VALIDATION - Validate binder updates
    const dataValidation = validateBinderData(updates);
    if (!dataValidation.success) {
      return {
        success: false,
        error: dataValidation.error,
      };
    }

    // SERVER-SIDE PAGE LIMIT VALIDATION - Check if pageCount is being updated
    if (updates.pageCount !== undefined) {
      const pageValidation = await validatePageLimits(
        userId,
        updates.pageCount
      );
      if (!pageValidation.success) {
        return {
          success: false,
          error: pageValidation.error,
        };
      }
    }

    const binderDocRef = doc(getUserSubcollection(userId, "binders"), binderId);
    await updateDoc(binderDocRef, {
      ...updates,
      updatedAt: serverTimestamp(), // Always update the updatedAt timestamp
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating binder:", error);
    return { success: false, error: error.message };
  }
};

export const deleteBinder = async (userId, binderId) => {
  if (!userId || !binderId) {
    return {
      success: false,
      error: "User ID and Binder ID are required for deletion.",
    };
  }

  try {
    const binderDocRef = doc(getUserSubcollection(userId, "binders"), binderId);

    // Transaction to delete all cards and then the binder
    await runTransaction(db, async (transaction) => {
      // 1. Get all card documents in the binder
      const cardsSnapshot = await getDocs(
        query(getUserSubcollection(userId, "binders", binderId, "cards"))
      );
      // 2. Delete each card document
      cardsSnapshot.forEach((cardDoc) => {
        transaction.delete(
          doc(
            getUserSubcollection(
              userId,
              "binders",
              binderId,
              "cards",
              cardDoc.id
            )
          )
        );
      });
      // 3. Delete the binder document itself
      transaction.delete(binderDocRef);
    });

    console.log(`Binder ${binderId} and all its cards deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting binder:", error);
    return { success: false, error: error.message };
  }
};

// ===== CARD SUBCOLLECTION OPERATIONS =====

const getBinderCardsColRef = (userId, binderId) =>
  collection(db, "users", userId, "binders", binderId, "cards");

export const addCardToBinder = async (userId, binderId, cardData) => {
  if (!userId || !binderId || !cardData || !cardData.cardApiId) {
    return {
      success: false,
      error: "Missing required parameters for adding card.",
    };
  }

  try {
    const emergencyMode = await isEmergencyMode();
    if (emergencyMode) {
      return {
        success: false,
        error: "Service temporarily limited due to cost protection measures.",
      };
    }

    // SERVER-SIDE CARD DATA VALIDATION - Validate card data
    const cardValidation = validateCardData(cardData);
    if (!cardValidation.success) {
      return {
        success: false,
        error: cardValidation.error,
      };
    }

    // SERVER-SIDE CARD LIMIT VALIDATION - Check current card count in binder
    const binderDocRef = doc(getUserSubcollection(userId, "binders"), binderId);
    const binderDoc = await getDoc(binderDocRef);

    if (!binderDoc.exists()) {
      return {
        success: false,
        error: "Binder not found.",
      };
    }

    const currentCardCount = binderDoc.data().totalCardsInBinder || 0;

    // Get system configuration for card limits
    const systemConfigRef = doc(db, "systemConfiguration", "limits");
    const systemConfigDoc = await getDoc(systemConfigRef);

    // Check if user is authenticated (to determine if they're registered or guest)
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    const isRegisteredUser = userDoc.exists();

    // Get system limits if available
    let maxCardsPerBinder = Number.MAX_SAFE_INTEGER; // Default unlimited
    let enforceLimits = false;

    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      enforceLimits = systemData.enforceCardLimits || false;

      if (enforceLimits) {
        if (isRegisteredUser) {
          maxCardsPerBinder = systemData.registeredMaxCardsPerBinder || 400;
        } else {
          maxCardsPerBinder = systemData.guestMaxCardsPerBinder || 50;
        }
      }
    }

    // Enforce server-side card limit check
    if (enforceLimits && currentCardCount >= maxCardsPerBinder) {
      const userType = isRegisteredUser ? "registered" : "guest";
      return {
        success: false,
        error: `Card limit reached. ${userType} users can have a maximum of ${maxCardsPerBinder} cards per binder.`,
      };
    }

    const cardEntryRef = doc(getBinderCardsColRef(userId, binderId)); // Auto-generate ID

    await runTransaction(db, async (transaction) => {
      const binderDoc = await transaction.get(binderDocRef);
      if (!binderDoc.exists()) {
        throw new Error("Binder document does not exist!");
      }

      // Set the new card document
      transaction.set(cardEntryRef, {
        ...cardData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Increment totalCardsInBinder
      const currentTotal = binderDoc.data().totalCardsInBinder || 0;
      transaction.update(binderDocRef, {
        totalCardsInBinder: currentTotal + 1,
        updatedAt: serverTimestamp(),
      });
    });

    return { success: true, cardEntryId: cardEntryRef.id };
  } catch (error) {
    console.error("Error adding card to binder:", error);
    return { success: false, error: error.message };
  }
};

export const updateCardInBinder = async (
  userId,
  binderId,
  cardEntryId,
  updates
) => {
  if (!userId || !binderId || !cardEntryId || !updates) {
    return {
      success: false,
      error: "Missing required parameters for updating card.",
    };
  }
  try {
    const cardDocRef = doc(
      db,
      "users",
      userId,
      "binders",
      binderId,
      "cards",
      cardEntryId
    );
    await updateDoc(cardDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    // If card details affect binder metadata (e.g. rarity counts), update binder here too
    // For now, just updating the card.
    return { success: true };
  } catch (error) {
    console.error("Error updating card in binder:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Batch update multiple card positions for card movements
 * @param {string} userId - User ID
 * @param {string} binderId - Binder ID
 * @param {Array} movements - Array of movement objects
 * @returns {Promise<Object>} Result object with success/error
 */
export const batchUpdateCardMovements = async (userId, binderId, movements) => {
  if (!userId || !binderId || !movements || movements.length === 0) {
    return {
      success: false,
      error: "Missing required parameters for batch updating card movements.",
    };
  }

  try {
    const batch = writeBatch(db);

    for (const move of movements) {
      const cardDocRef = doc(
        db,
        "users",
        userId,
        "binders",
        binderId,
        "cards",
        move.cardId
      );

      batch.update(cardDocRef, {
        pageNumber: move.toPosition.pageNumber,
        slotInPage: move.toPosition.slotInPage,
        overallSlotNumber: move.toPosition.overallSlotNumber,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      success: true,
      updatedCount: movements.length,
    };
  } catch (error) {
    console.error("Error batch updating card movements:", error);
    return { success: false, error: error.message };
  }
};

export const removeCardFromBinder = async (userId, binderId, cardEntryId) => {
  if (!userId || !binderId || !cardEntryId) {
    return {
      success: false,
      error: "Missing required parameters for removing card.",
    };
  }
  try {
    const cardDocRef = doc(
      db,
      "users",
      userId,
      "binders",
      binderId,
      "cards",
      cardEntryId
    );
    const binderDocRef = doc(getUserSubcollection(userId, "binders"), binderId);

    await runTransaction(db, async (transaction) => {
      const binderDoc = await transaction.get(binderDocRef);
      if (!binderDoc.exists()) {
        throw new Error("Binder document does not exist!");
      }
      const cardDoc = await transaction.get(cardDocRef);
      if (!cardDoc.exists()) {
        // Card might have been already deleted, consider this a success or log a warning
        console.warn(
          `Card ${cardEntryId} not found for deletion, but proceeding to update count if necessary.`
        );
      } else {
        transaction.delete(cardDocRef);
      }

      // Decrement totalCardsInBinder, ensuring it doesn't go below 0
      const currentTotal = binderDoc.data().totalCardsInBinder || 0;
      transaction.update(binderDocRef, {
        totalCardsInBinder: Math.max(
          0,
          currentTotal - (cardDoc.exists() ? 1 : 0)
        ), // Only decrement if card existed
        updatedAt: serverTimestamp(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing card from binder:", error);
    return { success: false, error: error.message };
  }
};

export const getCardsForPages = async (userId, binderId, pageNumbers) => {
  if (!userId || !binderId || !pageNumbers || pageNumbers.length === 0) {
    return {
      success: false,
      error: "User ID, Binder ID, and page numbers are required.",
      cards: [],
    };
  }
  try {
    const cardsCollectionRef = getBinderCardsColRef(userId, binderId);
    // Firestore 'in' query supports up to 30 equality clauses.
    // If pageNumbers can exceed this, batching or alternative query needed.
    // For now, assuming pageNumbers length is manageable.
    if (pageNumbers.length > 30) {
      console.warn(
        "Querying for more than 30 page numbers, this might hit Firestore limits or be inefficient."
      );
      // Potentially, chunk pageNumbers and run multiple queries.
    }

    const q = query(
      cardsCollectionRef,
      where("pageNumber", "in", pageNumbers)
      // Removed orderBy to avoid composite index requirement
      // We'll sort in JavaScript instead
    );
    const querySnapshot = await getDocs(q);
    const cards = [];
    querySnapshot.forEach((doc) => {
      cards.push({ id: doc.id, ...doc.data() });
    });

    // Sort the cards in JavaScript to avoid Firebase composite index requirement
    cards.sort((a, b) => {
      // First sort by page number, then by slot in page
      if (a.pageNumber !== b.pageNumber) {
        return a.pageNumber - b.pageNumber;
      }
      // If overallSlotNumber exists, use it; otherwise fall back to slotInPage
      const aSlot = a.overallSlotNumber ?? a.slotInPage ?? 0;
      const bSlot = b.overallSlotNumber ?? b.slotInPage ?? 0;
      return aSlot - bSlot;
    });

    return { success: true, cards };
  } catch (error) {
    console.error("Error fetching cards for pages:", error);
    return { success: false, error: error.message, cards: [] };
  }
};

export const getAllCardsInBinder = async (userId, binderId) => {
  console.warn(
    "WARNING: getAllCardsInBinder fetches ALL cards in a binder. " +
      "This can be very expensive for large binders and should be used sparingly. " +
      "Consider pagination or specific page fetching (getCardsForPages) for UI display."
  );
  if (!userId || !binderId) {
    return { success: false, error: "User ID and Binder ID are required." };
  }
  try {
    const cardsRef = getBinderCardsColRef(userId, binderId);
    // Consider adding a hard cap here if truly necessary, e.g., limit(500)
    const querySnapshot = await getDocs(cardsRef);
    const cards = [];
    querySnapshot.forEach((doc) => {
      cards.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: cards };
  } catch (error) {
    console.error("Error getting all cards in binder:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const bulkAddCardsToBinder = async (userId, binderId, cardsData) => {
  if (!userId || !binderId || !cardsData || cardsData.length === 0) {
    return {
      success: false,
      error: "Missing required parameters for bulk adding cards.",
    };
  }

  try {
    const emergencyMode = await isEmergencyMode();
    if (emergencyMode) {
      return {
        success: false,
        error: "Service temporarily limited due to cost protection measures.",
      };
    }

    // Validate all card data first (client-side validation)
    for (const cardData of cardsData) {
      const cardValidation = validateCardData(cardData);
      if (!cardValidation.success) {
        return {
          success: false,
          error: `Invalid card data for ${cardData.name || "unknown card"}: ${
            cardValidation.error
          }`,
        };
      }
    }

    // **OPTIMIZED: Batch all reads in a single transaction for minimal Firebase requests**
    const binderDocRef = doc(getUserSubcollection(userId, "binders"), binderId);
    const systemConfigRef = doc(db, "systemConfiguration", "limits");
    const userDocRef = getUserDocRef(userId);

    // Use a transaction to read all required data in ONE request
    const transactionResult = await runTransaction(db, async (transaction) => {
      // Read all documents in parallel within the transaction
      const [binderDoc, systemConfigDoc, userDoc] = await Promise.all([
        transaction.get(binderDocRef),
        transaction.get(systemConfigRef),
        transaction.get(userDocRef),
      ]);

      // Validate binder exists
      if (!binderDoc.exists()) {
        throw new Error("Binder not found.");
      }

      const currentCardCount = binderDoc.data().totalCardsInBinder || 0;
      const isRegisteredUser = userDoc.exists();

      // Get system limits if available
      let maxCardsPerBinder = Number.MAX_SAFE_INTEGER;
      let enforceLimits = false;

      if (systemConfigDoc.exists()) {
        const systemData = systemConfigDoc.data();
        enforceLimits = systemData.enforceCardLimits || false;

        if (enforceLimits) {
          if (isRegisteredUser) {
            maxCardsPerBinder = systemData.registeredMaxCardsPerBinder || 400;
          } else {
            maxCardsPerBinder = systemData.guestMaxCardsPerBinder || 50;
          }
        }
      }

      // Check limits
      if (
        enforceLimits &&
        currentCardCount + cardsData.length > maxCardsPerBinder
      ) {
        const userType = isRegisteredUser ? "registered" : "guest";
        throw new Error(
          `Adding ${cardsData.length} cards would exceed the limit. ${userType} users can have a maximum of ${maxCardsPerBinder} cards per binder. Current: ${currentCardCount}`
        );
      }

      // **OPTIMIZED: Use the SAME transaction to write all cards + update binder count**
      const addedCardIds = [];

      // Add all cards to the transaction
      cardsData.forEach((cardData) => {
        const cardEntryRef = doc(getBinderCardsColRef(userId, binderId)); // Auto-generate ID

        transaction.set(cardEntryRef, {
          ...cardData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        addedCardIds.push(cardEntryRef.id);
      });

      // Update binder card count in the same transaction
      transaction.update(binderDocRef, {
        totalCardsInBinder: currentCardCount + cardsData.length,
        updatedAt: serverTimestamp(),
      });

      return {
        addedCount: cardsData.length,
        cardEntryIds: addedCardIds,
      };
    });

    console.log(
      `✅ OPTIMIZED: Successfully bulk added ${transactionResult.addedCount} cards to binder ${binderId} in a SINGLE transaction`
    );

    return {
      success: true,
      ...transactionResult,
    };
  } catch (error) {
    console.error("Error bulk adding cards to binder:", error);
    return { success: false, error: error.message };
  }
};

// ===== COLLECTION OPERATIONS =====

export const createCollection = async (userId, collectionData) => {
  try {
    const collectionsRef = getUserSubcollection(userId, "collections");
    const collection = {
      ...collectionData,
      cardCount: 0,
      totalValue: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collectionsRef, collection);

    // Add activity log
    const activityRef = getUserSubcollection(userId, "activity");
    await addDoc(activityRef, {
      type: "collection_created",
      description: `Created collection "${collectionData.name}"`,
      collectionRef: docRef,
      timestamp: serverTimestamp(),
    });

    return { success: true, collectionId: docRef.id };
  } catch (error) {
    console.error("Error creating collection:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserCollections = async (
  userId,
  queryLimit = DEFAULT_LIST_LIMIT
) => {
  if (!userId) {
    return { success: false, error: "User ID required", collections: [] };
  }
  try {
    const collectionsQuery = query(
      getUserSubcollection(userId, "collections"),
      orderBy("createdAt", "desc"),
      limit(queryLimit) // Added limit
    );
    const querySnapshot = await getDocs(collectionsQuery);
    const collections = [];
    querySnapshot.forEach((doc) => {
      collections.push({ id: doc.id, ...doc.data() });
    });
    return {
      success: true,
      collections,
      hasMore: querySnapshot.size === queryLimit,
    };
  } catch (error) {
    console.error("Error fetching collections:", error);
    return { success: false, error: error.message, collections: [] };
  }
};

// ===== WISHLIST OPERATIONS =====

export const addToWishlist = async (userId, binderData) => {
  try {
    const wishlistRef = getUserSubcollection(userId, "wishlist");
    const wishlistItem = {
      ...binderData,
      priority: "Medium",
      addedAt: serverTimestamp(),
    };

    const docRef = await addDoc(wishlistRef, wishlistItem);
    return { success: true, wishlistId: docRef.id };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserWishlist = async (
  userId,
  queryLimit = DEFAULT_LIST_LIMIT
) => {
  if (!userId) {
    return { success: false, error: "User ID required", wishlist: [] };
  }
  try {
    const wishlistQuery = query(
      getUserSubcollection(userId, "wishlist"),
      orderBy("addedAt", "desc"),
      limit(queryLimit) // Added limit
    );
    const querySnapshot = await getDocs(wishlistQuery);
    const wishlistItems = [];
    querySnapshot.forEach((doc) => {
      wishlistItems.push({ id: doc.id, ...doc.data() });
    });
    return {
      success: true,
      wishlist: wishlistItems,
      hasMore: querySnapshot.size === queryLimit,
    };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return { success: false, error: error.message, wishlist: [] };
  }
};

// ===== ACTIVITY OPERATIONS =====

export const getUserActivity = async (userId, limitCount = 10) => {
  try {
    const activityRef = getUserSubcollection(userId, "activity");
    const q = query(
      activityRef,
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    const activities = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: activities };
  } catch (error) {
    console.error("Error getting user activity:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== MIGRATION FUNCTIONS =====

export const migrateUserRoles = async () => {
  try {
    console.log("Starting user role migration...");

    const ownerEmail = import.meta.env.VITE_OWNER_EMAIL;
    const usersRef = collection(db, "users");

    // Get all users without ordering (to avoid permission issues)
    const querySnapshot = await getDocs(usersRef);

    console.log(`Found ${querySnapshot.size} users to check for migration`);

    const batch = writeBatch(db);
    let updatedCount = 0;

    querySnapshot.docs.forEach((doc) => {
      const userData = doc.data();

      // Check if user already has a role field
      if (!userData.role) {
        console.log(`Migrating user ${doc.id} (${userData.email})`);

        const userRole = userData.email === ownerEmail ? "owner" : "user";

        batch.update(doc.ref, {
          role: userRole,
        });

        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Migration completed. Updated ${updatedCount} users.`);
      return { success: true, updatedCount };
    } else {
      console.log("No users needed migration.");
      return { success: true, updatedCount: 0 };
    }
  } catch (error) {
    console.error("Error during user role migration:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== ADMIN OPERATIONS (Owner Only) =====

export const getAdminStats = async () => {
  try {
    const startTime = Date.now();

    // Use Promise.all for concurrent queries instead of sequential
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [allUsersSnapshot, recentUsersSnapshot, activeUsersSnapshot] =
      await Promise.all([
        // Get all users
        getDocs(collection(db, "users")),
        // Get users created in last 30 days
        getDocs(
          query(
            collection(db, "users"),
            where("createdAt", ">=", thirtyDaysAgo)
          )
        ),
        // Get active users (logged in within last 7 days)
        getDocs(
          query(
            collection(db, "users"),
            where("lastLoginAt", ">=", sevenDaysAgo)
          )
        ),
      ]);

    // Process all results together
    const totalUsers = allUsersSnapshot.size;
    const newUsersThisMonth = recentUsersSnapshot.size;
    const activeUsers = activeUsersSnapshot.size;

    // Calculate total binders and value across all users from the already fetched data
    let totalBindersAcrossUsers = 0;
    let totalValueAcrossUsers = 0;
    let usersWithData = 0;

    allUsersSnapshot.docs.forEach((doc) => {
      const userData = doc.data();
      totalBindersAcrossUsers += userData.totalBinders || 0;
      totalValueAcrossUsers += userData.totalValue || 0;
      if (userData.totalBinders > 0) usersWithData++;
    });

    // Calculate system health based on available metrics
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const systemHealth = calculateSystemHealth({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      responseTime,
      usersWithData,
      totalBindersAcrossUsers,
    });

    return {
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        totalBindersAcrossUsers,
        totalValueAcrossUsers,
        systemHealth: systemHealth.status,
        healthDetails: systemHealth.details,
        responseTime,
      },
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// Helper function to calculate system health
const calculateSystemHealth = ({
  totalUsers,
  activeUsers,
  newUsersThisMonth,
  responseTime,
  usersWithData,
  totalBindersAcrossUsers,
}) => {
  let healthScore = 100;
  const issues = [];

  // Response time check (should be under 2 seconds)
  if (responseTime > 2000) {
    healthScore -= 20;
    issues.push("Slow database response");
  }

  // User activity check (at least 10% of users should be active)
  const activityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 100;
  if (activityRate < 10 && totalUsers > 10) {
    healthScore -= 15;
    issues.push("Low user activity");
  }

  // Data health check (users should have data)
  const dataRate = totalUsers > 0 ? (usersWithData / totalUsers) * 100 : 100;
  if (dataRate < 30 && totalUsers > 5) {
    healthScore -= 10;
    issues.push("Many users have no data");
  }

  // Growth check (should have some new users if not a new app)
  if (totalUsers > 20 && newUsersThisMonth === 0) {
    healthScore -= 10;
    issues.push("No new user growth");
  }

  // Determine status
  let status;
  if (healthScore >= 90) {
    status = "Excellent";
  } else if (healthScore >= 75) {
    status = "Good";
  } else if (healthScore >= 60) {
    status = "Fair";
  } else if (healthScore >= 40) {
    status = "Poor";
  } else {
    status = "Critical";
  }

  return {
    status,
    score: healthScore,
    details: {
      responseTime: `${responseTime}ms`,
      activityRate: `${activityRate.toFixed(1)}%`,
      dataRate: `${dataRate.toFixed(1)}%`,
      issues: issues.length > 0 ? issues : ["All systems normal"],
    },
  };
};

export const getAllUsers = async (limitCount = 50) => {
  try {
    console.log("getAllUsers: Starting query...");

    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(limitCount));

    console.log("getAllUsers: Query created, executing...");

    const querySnapshot = await getDocs(q);

    console.log("getAllUsers: Query executed, processing results...");
    console.log("getAllUsers: Query snapshot size:", querySnapshot.size);

    const users = querySnapshot.docs.map((doc) => {
      console.log("getAllUsers: Processing user doc:", doc.id, doc.data());
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    console.log("getAllUsers: Final users array:", users);

    return { success: true, data: users };
  } catch (error) {
    console.error("getAllUsers: Error occurred:", error);
    console.error("getAllUsers: Error code:", error.code);
    console.error("getAllUsers: Error message:", error.message);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== USER ACCOUNT DELETION =====

export const deleteUserAccount = async (userId) => {
  try {
    console.log(`Starting deletion process for user: ${userId}`);

    // Transaction to delete all user data
    await runTransaction(db, async (transaction) => {
      // 1. Get all user's binders
      const bindersSnapshot = await getDocs(
        getUserSubcollection(userId, "binders")
      );

      // 2. Delete all cards in all binders
      for (const binderDoc of bindersSnapshot.docs) {
        const cardsSnapshot = await getDocs(
          collection(db, "users", userId, "binders", binderDoc.id, "cards")
        );

        cardsSnapshot.forEach((cardDoc) => {
          transaction.delete(cardDoc.ref);
        });

        // Delete the binder itself
        transaction.delete(binderDoc.ref);
      }

      // 3. Delete other subcollections
      const subcollections = ["collections", "wishlist", "activity"];
      for (const subcollection of subcollections) {
        const subcollectionSnapshot = await getDocs(
          getUserSubcollection(userId, subcollection)
        );
        subcollectionSnapshot.forEach((doc) => {
          transaction.delete(doc.ref);
        });
      }

      // 4. Finally delete the user document
      transaction.delete(getUserDocRef(userId));
    });

    console.log(`User account ${userId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== SERVER-SIDE VALIDATION FUNCTIONS =====

// Validate user profile data
export const validateUserProfileData = (data) => {
  const errors = [];

  if (data.displayName && typeof data.displayName === "string") {
    if (data.displayName.length > 50) {
      errors.push("Display name must be 50 characters or less");
    }
  }

  if (data.email && typeof data.email === "string") {
    if (data.email.length > 100) {
      errors.push("Email must be 100 characters or less");
    }
    if (!data.email.includes("@") || !data.email.includes(".")) {
      errors.push("Invalid email format");
    }
  }

  // Validate photo URL if provided
  if (data.photoURL !== undefined) {
    if (data.photoURL !== null && typeof data.photoURL === "string") {
      if (data.photoURL.length > 1000) {
        errors.push("Photo URL must be 1000 characters or less");
      }
      // Basic URL validation
      try {
        new URL(data.photoURL);
      } catch {
        errors.push("Invalid photo URL format");
      }
    }
  }

  // Validate photo path if provided (for Firebase Storage cleanup)
  if (data.photoPath !== undefined) {
    if (data.photoPath !== null && typeof data.photoPath === "string") {
      if (data.photoPath.length > 500) {
        errors.push("Photo path must be 500 characters or less");
      }
    }
  }

  return {
    success: errors.length === 0,
    error: errors.length > 0 ? errors.join(", ") : null,
  };
};

// Validate binder data
export const validateBinderData = (data) => {
  const errors = [];

  if (data.binderName) {
    if (typeof data.binderName !== "string") {
      errors.push("Binder name must be text");
    } else if (data.binderName.length > 100) {
      errors.push("Binder name must be 100 characters or less");
    }
  }

  if (data.description && typeof data.description === "string") {
    if (data.description.length > 500) {
      errors.push("Description must be 500 characters or less");
    }
  }

  if (data.pageCount !== undefined) {
    if (
      typeof data.pageCount !== "number" ||
      data.pageCount < 1 ||
      data.pageCount > 200
    ) {
      errors.push("Page count must be between 1 and 200");
    }
  }

  if (data.maxPages !== undefined) {
    if (
      typeof data.maxPages !== "number" ||
      data.maxPages < 1 ||
      data.maxPages > 200
    ) {
      errors.push("Max pages must be between 1 and 200");
    }
  }

  if (
    data.gridSize &&
    !["1x1", "2x2", "3x3", "3x4", "4x4"].includes(data.gridSize)
  ) {
    errors.push("Invalid grid size");
  }

  return {
    success: errors.length === 0,
    error: errors.length > 0 ? errors.join(", ") : null,
  };
};

// Validate card data
export const validateCardData = (data) => {
  const errors = [];

  if (!data.cardApiId || typeof data.cardApiId !== "string") {
    errors.push("Card API ID is required");
  } else if (data.cardApiId.length > 50) {
    errors.push("Card API ID must be 50 characters or less");
  }

  if (!data.name || typeof data.name !== "string") {
    errors.push("Card name is required");
  } else if (data.name.length > 100) {
    errors.push("Card name must be 100 characters or less");
  }

  if (data.value !== undefined) {
    if (
      typeof data.value !== "number" ||
      data.value < 0 ||
      data.value > 999999
    ) {
      errors.push("Card value must be between 0 and 999,999");
    }
  }

  if (data.pageNumber !== undefined) {
    if (
      typeof data.pageNumber !== "number" ||
      data.pageNumber < 1 ||
      data.pageNumber > 200
    ) {
      errors.push("Page number must be between 1 and 200");
    }
  }

  if (data.slotInPage !== undefined) {
    if (
      typeof data.slotInPage !== "number" ||
      data.slotInPage < 0 ||
      data.slotInPage > 35
    ) {
      errors.push("Slot position must be between 0 and 35");
    }
  }

  return {
    success: errors.length === 0,
    error: errors.length > 0 ? errors.join(", ") : null,
  };
};

// Validate page limits for users
export const validatePageLimits = async (userId, pageCount) => {
  try {
    // Get system configuration
    const systemConfigRef = doc(db, "systemConfiguration", "limits");
    const systemConfigDoc = await getDoc(systemConfigRef);

    // Check if user is registered
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);
    const isRegisteredUser = userDoc.exists();

    let maxPages = Number.MAX_SAFE_INTEGER; // Default unlimited
    let enforceLimits = false;

    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data();
      enforceLimits = systemData.enforcePageLimits || false;

      if (enforceLimits) {
        if (isRegisteredUser) {
          maxPages = systemData.registeredMaxPages || 50;
        } else {
          maxPages = systemData.guestMaxPages || 10;
        }
      }
    }

    if (enforceLimits && pageCount > maxPages) {
      const userType = isRegisteredUser ? "registered" : "guest";
      return {
        success: false,
        error: `Page limit exceeded. ${userType} users can have a maximum of ${maxPages} pages per binder.`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error validating page limits:", error);
    return { success: false, error: "Failed to validate page limits" };
  }
};
