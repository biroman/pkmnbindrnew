/**
 * Firebase Adapter for Registered Users
 *
 * Provides cloud storage functionality using Firebase Firestore.
 * This adapter is used for registered users who have Firebase accounts.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import {
  StorageError,
  STORAGE_ERROR_CODES,
  validateBinderData,
  validateCardData,
} from "./storageInterface.js";

class FirebaseAdapter {
  constructor() {
    this.userId = null;
    this.unsubscribeFunctions = new Map();
  }

  /**
   * Set the current user ID
   */
  setUserId(userId) {
    this.userId = userId;

    // Clean up any existing subscriptions when user changes
    this.unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeFunctions.clear();
  }

  /**
   * Get user-specific collection reference
   */
  getUserCollection(collectionName) {
    if (!this.userId) {
      throw new StorageError(
        "User ID not set",
        STORAGE_ERROR_CODES.PERMISSION_DENIED
      );
    }
    return collection(db, "users", this.userId, collectionName);
  }

  /**
   * Get user-specific document reference
   */
  getUserDoc(collectionName, docId) {
    if (!this.userId) {
      throw new StorageError(
        "User ID not set",
        STORAGE_ERROR_CODES.PERMISSION_DENIED
      );
    }
    return doc(db, "users", this.userId, collectionName, docId);
  }

  /**
   * Handle Firebase errors
   */
  handleFirebaseError(error, operation) {
    console.error(`Firebase ${operation} error:`, error);

    let code = STORAGE_ERROR_CODES.OPERATION_FAILED;
    let message = `Failed to ${operation}`;

    switch (error.code) {
      case "permission-denied":
        code = STORAGE_ERROR_CODES.PERMISSION_DENIED;
        message = "Permission denied";
        break;
      case "not-found":
        code = STORAGE_ERROR_CODES.NOT_FOUND;
        message = "Document not found";
        break;
      case "unavailable":
        code = STORAGE_ERROR_CODES.NETWORK_ERROR;
        message = "Network error - please check your connection";
        break;
      case "resource-exhausted":
        code = STORAGE_ERROR_CODES.QUOTA_EXCEEDED;
        message = "Storage quota exceeded";
        break;
    }

    throw new StorageError(message, code, error);
  }

  // ================== BINDER OPERATIONS ==================

  async getBinders() {
    try {
      const bindersRef = this.getUserCollection("binders");
      const q = query(bindersRef, orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toMillis?.() || doc.data().updatedAt,
      }));
    } catch (error) {
      this.handleFirebaseError(error, "get binders");
    }
  }

  async getBinder(binderId) {
    try {
      const binderRef = this.getUserDoc("binders", binderId);
      const snapshot = await getDoc(binderRef);

      if (!snapshot.exists()) {
        throw new StorageError(
          `Binder with ID ${binderId} not found`,
          STORAGE_ERROR_CODES.NOT_FOUND
        );
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt:
          snapshot.data().createdAt?.toMillis?.() || snapshot.data().createdAt,
        updatedAt:
          snapshot.data().updatedAt?.toMillis?.() || snapshot.data().updatedAt,
      };
    } catch (error) {
      if (error instanceof StorageError) throw error;
      this.handleFirebaseError(error, "get binder");
    }
  }

  async createBinder(binderData) {
    validateBinderData(binderData);

    const binder = {
      ...binderData,
      cardCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const bindersRef = this.getUserCollection("binders");
      const docRef = await addDoc(bindersRef, binder);

      return {
        id: docRef.id,
        ...binderData,
        cardCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } catch (error) {
      this.handleFirebaseError(error, "create binder");
    }
  }

  async updateBinder(binderId, updates) {
    try {
      const binderRef = this.getUserDoc("binders", binderId);

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(binderRef, updateData);

      // Return updated binder
      return this.getBinder(binderId);
    } catch (error) {
      this.handleFirebaseError(error, "update binder");
    }
  }

  async deleteBinder(binderId) {
    try {
      const batch = writeBatch(db);

      // Delete the binder document
      const binderRef = this.getUserDoc("binders", binderId);
      batch.delete(binderRef);

      // Delete all cards in the binder
      const cardsRef = this.getUserCollection(`binderCards/${binderId}/cards`);
      const cardsSnapshot = await getDocs(cardsRef);
      cardsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete set completion data
      const setCompletionRef = this.getUserCollection(
        `setCompletion/${binderId}/sets`
      );
      const setSnapshot = await getDocs(setCompletionRef);
      setSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete missing cards data
      const missingRef = this.getUserCollection(
        `missingCards/${binderId}/cards`
      );
      const missingSnapshot = await getDocs(missingRef);
      missingSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return true;
    } catch (error) {
      this.handleFirebaseError(error, "delete binder");
    }
  }

  // ================== CARD OPERATIONS ==================

  async getBinderCards(binderId) {
    try {
      const cardsRef = this.getUserCollection(`binderCards/${binderId}/cards`);
      const q = query(cardsRef, orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        cardId: doc.id,
        binderId,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toMillis?.() || doc.data().addedAt,
      }));
    } catch (error) {
      this.handleFirebaseError(error, "get binder cards");
    }
  }

  async addCardToBinder(binderId, cardData) {
    validateCardData(cardData);

    const card = {
      ...cardData,
      addedAt: serverTimestamp(),
      order: Date.now(), // Simple ordering by add time
    };

    try {
      const batch = writeBatch(db);

      // Add the card
      const cardRef = this.getUserDoc(
        `binderCards/${binderId}/cards`,
        cardData.id
      );
      batch.set(cardRef, card);

      // Update binder card count
      const binderRef = this.getUserDoc("binders", binderId);
      batch.update(binderRef, {
        cardCount: (await this.getBinder(binderId)).cardCount + 1,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      return {
        cardId: cardData.id,
        binderId,
        ...cardData,
        addedAt: Date.now(),
        order: Date.now(),
      };
    } catch (error) {
      this.handleFirebaseError(error, "add card to binder");
    }
  }

  async removeCardFromBinder(binderId, cardId) {
    try {
      const batch = writeBatch(db);

      // Remove the card
      const cardRef = this.getUserDoc(`binderCards/${binderId}/cards`, cardId);
      batch.delete(cardRef);

      // Update binder card count
      const binderRef = this.getUserDoc("binders", binderId);
      const currentBinder = await this.getBinder(binderId);
      batch.update(binderRef, {
        cardCount: Math.max((currentBinder.cardCount || 1) - 1, 0),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return true;
    } catch (error) {
      this.handleFirebaseError(error, "remove card from binder");
    }
  }

  async bulkAddCards(binderId, cardsData) {
    try {
      const batch = writeBatch(db);
      const baseTime = Date.now();

      // Add all cards
      cardsData.forEach((cardData, index) => {
        validateCardData(cardData);

        const card = {
          ...cardData,
          addedAt: serverTimestamp(),
          order: baseTime + index,
        };

        const cardRef = this.getUserDoc(
          `binderCards/${binderId}/cards`,
          cardData.id
        );
        batch.set(cardRef, card);
      });

      // Update binder card count
      const binderRef = this.getUserDoc("binders", binderId);
      const currentBinder = await this.getBinder(binderId);
      batch.update(binderRef, {
        cardCount: (currentBinder.cardCount || 0) + cardsData.length,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return cardsData.length;
    } catch (error) {
      this.handleFirebaseError(error, "bulk add cards");
    }
  }

  // ================== SEARCH OPERATIONS ==================

  async searchBinders(searchQuery) {
    try {
      const bindersRef = this.getUserCollection("binders");
      const snapshot = await getDocs(bindersRef);

      const binders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toMillis?.() || doc.data().updatedAt,
      }));

      // Client-side filtering (Firestore doesn't support full-text search out of the box)
      return binders.filter(
        (binder) =>
          binder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          binder.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } catch (error) {
      this.handleFirebaseError(error, "search binders");
    }
  }

  // ================== CACHE OPERATIONS ==================

  async getCachedCard(cardId) {
    try {
      const cacheRef = this.getUserDoc("cardCache", cardId);
      const snapshot = await getDoc(cacheRef);

      if (snapshot.exists()) {
        const cached = snapshot.data();
        const expiresAt = cached.expiresAt?.toMillis?.() || cached.expiresAt;

        if (expiresAt > Date.now()) {
          return cached.data;
        }
      }

      return null;
    } catch (error) {
      // Cache failures should not break the app
      console.warn("Failed to get cached card:", error);
      return null;
    }
  }

  async setCachedCard(cardId, cardData, ttl = 24 * 60 * 60 * 1000) {
    try {
      const cacheRef = this.getUserDoc("cardCache", cardId);

      const cacheEntry = {
        data: cardData,
        cachedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + ttl),
      };

      await updateDoc(cacheRef, cacheEntry);
      return true;
    } catch (error) {
      // Cache failures should not break the app
      console.warn("Failed to cache card data:", error);
      return false;
    }
  }

  // ================== USER SETTINGS ==================

  async getUserSettings() {
    try {
      const settingsRef = this.getUserDoc("profile", "settings");
      const snapshot = await getDoc(settingsRef);

      if (snapshot.exists()) {
        return snapshot.data().settings || {};
      }

      return {};
    } catch (error) {
      console.warn("Failed to get user settings:", error);
      return {};
    }
  }

  async updateUserSettings(settings) {
    try {
      const settingsRef = this.getUserDoc("profile", "settings");

      await updateDoc(settingsRef, {
        settings,
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      this.handleFirebaseError(error, "update user settings");
    }
  }

  // ================== MIGRATION & UTILITY OPERATIONS ==================

  async getAllData() {
    try {
      const [binders, allCards, settings] = await Promise.all([
        this.getBinders(),
        this.getAllUserCards(),
        this.getUserSettings(),
      ]);

      return {
        binders,
        cards: allCards,
        settings,
        exportedAt: Date.now(),
        version: 1,
      };
    } catch (error) {
      this.handleFirebaseError(error, "export all data");
    }
  }

  async getAllUserCards() {
    try {
      const binders = await this.getBinders();
      const allCards = [];

      for (const binder of binders) {
        const cards = await this.getBinderCards(binder.id);
        allCards.push(...cards);
      }

      return allCards;
    } catch (error) {
      console.warn("Failed to get all user cards:", error);
      return [];
    }
  }

  async clearAllData() {
    try {
      const batch = writeBatch(db);

      // Get all user collections and delete them
      const collections = ["binders", "cardCache", "profile"];

      for (const collectionName of collections) {
        const collectionRef = this.getUserCollection(collectionName);
        const snapshot = await getDocs(collectionRef);

        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      // Also delete binder-specific subcollections
      const binders = await this.getBinders();
      for (const binder of binders) {
        const cardsRef = this.getUserCollection(
          `binderCards/${binder.id}/cards`
        );
        const cardsSnapshot = await getDocs(cardsRef);
        cardsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();
      return true;
    } catch (error) {
      this.handleFirebaseError(error, "clear all data");
    }
  }

  // ================== STATUS OPERATIONS ==================

  isConnected() {
    return this.userId !== null;
  }

  getStorageInfo() {
    return {
      type: "firebase",
      isConnected: this.isConnected(),
      userId: this.userId,
      database: "firestore",
    };
  }

  // ================== REAL-TIME SUBSCRIPTIONS ==================

  /**
   * Subscribe to real-time binder updates
   */
  subscribeToBinders(callback) {
    if (!this.userId) return () => {};

    const bindersRef = this.getUserCollection("binders");
    const q = query(bindersRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const binders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toMillis?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toMillis?.() || doc.data().updatedAt,
        }));
        callback(binders);
      },
      (error) => {
        console.error("Binders subscription error:", error);
      }
    );

    this.unsubscribeFunctions.set("binders", unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to real-time binder card updates
   */
  subscribeToBinderCards(binderId, callback) {
    if (!this.userId) return () => {};

    const cardsRef = this.getUserCollection(`binderCards/${binderId}/cards`);
    const q = query(cardsRef, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cards = snapshot.docs.map((doc) => ({
          cardId: doc.id,
          binderId,
          ...doc.data(),
          addedAt: doc.data().addedAt?.toMillis?.() || doc.data().addedAt,
        }));
        callback(cards);
      },
      (error) => {
        console.error("Binder cards subscription error:", error);
      }
    );

    this.unsubscribeFunctions.set(`binderCards_${binderId}`, unsubscribe);
    return unsubscribe;
  }

  // Placeholder implementations for interface compliance
  async searchCards(query, filters) {
    // This will be implemented in Phase 2 when we add Pokemon TCG API
    return [];
  }

  async getSetCompletion(binderId, setId) {
    // Placeholder for Phase 2
    return null;
  }

  async updateSetCompletion(binderId, setId, completionData) {
    // Placeholder for Phase 2
    return null;
  }

  async getMissingCards(binderId, setId) {
    // Placeholder for Phase 2
    return [];
  }

  async getCachedSet(setId) {
    // Placeholder for Phase 2
    return null;
  }

  async setCachedSet(setId, setData, ttl) {
    // Placeholder for Phase 2
    return false;
  }

  async updateCardInBinder(binderId, cardId, updates) {
    // Placeholder for Phase 3
    return null;
  }

  async bulkRemoveCards(binderId, cardIds) {
    // Placeholder for Phase 3
    return 0;
  }

  async exportData() {
    return this.getAllData();
  }

  async importData(data) {
    // Placeholder for Phase 4
    return false;
  }
}

// Export singleton instance
export const firebaseAdapter = new FirebaseAdapter();
