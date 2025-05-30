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

// Helper function to get user's document reference
const getUserDocRef = (userId) => doc(db, "users", userId);

// Helper function to get user's subcollection reference
const getUserSubcollection = (userId, subcollection) =>
  collection(db, "users", userId, subcollection);

// ===== USER OPERATIONS =====

export const createUserProfile = async (userId, userData) => {
  try {
    const userDocRef = getUserDocRef(userId);
    const profileData = {
      ...userData,
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
  }
};
