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
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getFriendlyErrorMessage } from "../utils/errorMessages";

// Helper function to get user's document reference
const getUserDocRef = (userId) => doc(db, "users", userId);

// Helper function to get user's subcollection reference
const getUserSubcollection = (userId, subcollection) =>
  collection(db, "users", userId, subcollection);

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
      totalCards: 0,
      totalValue: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      settings: {
        theme: "light",
        currency: "USD",
        publicProfile: false,
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

// ===== CARD OPERATIONS =====

export const addCard = async (userId, cardData) => {
  try {
    const batch = writeBatch(db);

    // Add card to user's cards collection
    const cardsRef = getUserSubcollection(userId, "cards");
    const cardDocRef = doc(cardsRef);

    const card = {
      ...cardData,
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isFavorite: false,
    };

    batch.set(cardDocRef, card);

    // Update user's total cards count
    const userDocRef = getUserDocRef(userId);
    batch.update(userDocRef, {
      totalCards: increment(1),
      totalValue: increment(cardData.currentValue || 0),
    });

    // Add activity log
    const activityRef = getUserSubcollection(userId, "activity");
    const activityDocRef = doc(activityRef);
    batch.set(activityDocRef, {
      type: "card_added",
      description: `Added ${cardData.name} to collection`,
      cardRef: cardDocRef,
      timestamp: serverTimestamp(),
    });

    await batch.commit();
    return { success: true, cardId: cardDocRef.id };
  } catch (error) {
    console.error("Error adding card:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserCards = async (userId, options = {}) => {
  try {
    const cardsRef = getUserSubcollection(userId, "cards");
    let q = query(cardsRef, orderBy("addedAt", "desc"));

    // Apply filters if provided
    if (options.rarity) {
      q = query(q, where("rarity", "==", options.rarity));
    }
    if (options.isFavorite) {
      q = query(q, where("isFavorite", "==", true));
    }
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const cards = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: cards };
  } catch (error) {
    console.error("Error getting user cards:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const updateCard = async (userId, cardId, updates) => {
  try {
    const cardDocRef = doc(getUserSubcollection(userId, "cards"), cardId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(cardDocRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating card:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const deleteCard = async (userId, cardId) => {
  try {
    const batch = writeBatch(db);

    // Get card data first to update totals
    const cardDocRef = doc(getUserSubcollection(userId, "cards"), cardId);
    const cardDoc = await getDoc(cardDocRef);

    if (!cardDoc.exists()) {
      return { success: false, error: "Card not found" };
    }

    const cardData = cardDoc.data();

    // Delete the card
    batch.delete(cardDocRef);

    // Update user's totals
    const userDocRef = getUserDocRef(userId);
    batch.update(userDocRef, {
      totalCards: increment(-1),
      totalValue: increment(-(cardData.currentValue || 0)),
    });

    // Add activity log
    const activityRef = getUserSubcollection(userId, "activity");
    const activityDocRef = doc(activityRef);
    batch.set(activityDocRef, {
      type: "card_removed",
      description: `Removed ${cardData.name} from collection`,
      timestamp: serverTimestamp(),
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
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

export const getUserCollections = async (userId) => {
  try {
    const collectionsRef = getUserSubcollection(userId, "collections");
    const q = query(collectionsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const collections = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: collections };
  } catch (error) {
    console.error("Error getting user collections:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== WISHLIST OPERATIONS =====

export const addToWishlist = async (userId, cardData) => {
  try {
    const wishlistRef = getUserSubcollection(userId, "wishlist");
    const wishlistItem = {
      ...cardData,
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

export const getUserWishlist = async (userId) => {
  try {
    const wishlistRef = getUserSubcollection(userId, "wishlist");
    const q = query(wishlistRef, orderBy("addedAt", "desc"));
    const querySnapshot = await getDocs(q);

    const wishlist = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: wishlist };
  } catch (error) {
    console.error("Error getting user wishlist:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
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

// ===== ADMIN OPERATIONS (Owner Only) =====

export const getAdminStats = async () => {
  try {
    const startTime = Date.now();

    // Get total user count
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    const totalUsers = usersSnapshot.size;

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsersQuery = query(
      usersRef,
      where("createdAt", ">=", thirtyDaysAgo)
    );
    const recentUsersSnapshot = await getDocs(recentUsersQuery);
    const newUsersThisMonth = recentUsersSnapshot.size;

    // Calculate total cards across all users
    let totalCardsAcrossUsers = 0;
    let totalValueAcrossUsers = 0;
    let usersWithData = 0;

    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data();
      totalCardsAcrossUsers += userData.totalCards || 0;
      totalValueAcrossUsers += userData.totalValue || 0;
      if (userData.totalCards > 0) usersWithData++;
    });

    // Get active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsersQuery = query(
      usersRef,
      where("lastLoginAt", ">=", sevenDaysAgo)
    );
    const activeUsersSnapshot = await getDocs(activeUsersQuery);
    const activeUsers = activeUsersSnapshot.size;

    // Calculate system health based on available metrics
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const systemHealth = calculateSystemHealth({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      responseTime,
      usersWithData,
      totalCardsAcrossUsers,
    });

    return {
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        totalCardsAcrossUsers,
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
  totalCardsAcrossUsers,
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

export const getAllUsers = async (limit = 50) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(limit));
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: users };
  } catch (error) {
    console.error("Error getting all users:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};
