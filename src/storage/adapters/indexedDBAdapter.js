/**
 * IndexedDB Adapter for Anonymous Users
 *
 * Provides complete local storage functionality using IndexedDB.
 * This adapter is used for anonymous users who don't have Firebase accounts.
 */

import {
  StorageError,
  STORAGE_ERROR_CODES,
  validateBinderData,
  validateCardData,
} from "./storageInterface.js";

const DB_NAME = "PokemonBinderDB";
const DB_VERSION = 2;

// Object Store Names
const STORES = {
  BINDERS: "binders",
  BINDER_CARDS: "binderCards",
  CARD_CACHE: "cardCache",
  USER_SETTINGS: "userSettings",
  SET_COMPLETION: "setCompletion",
  MISSING_CARDS: "missingCards",
};

class IndexedDBAdapter {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the IndexedDB database
   */
  async init() {
    if (this.isInitialized) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(
          new StorageError(
            "Failed to open IndexedDB",
            STORAGE_ERROR_CODES.OPERATION_FAILED,
            request.error
          )
        );
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Binders store
        if (!db.objectStoreNames.contains(STORES.BINDERS)) {
          const bindersStore = db.createObjectStore(STORES.BINDERS, {
            keyPath: "id",
          });
          bindersStore.createIndex("name", "name", { unique: false });
          bindersStore.createIndex("createdAt", "createdAt", { unique: false });
          bindersStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }

        // Binder Cards store
        if (!db.objectStoreNames.contains(STORES.BINDER_CARDS)) {
          const cardsStore = db.createObjectStore(STORES.BINDER_CARDS, {
            keyPath: ["binderId", "cardId"],
          });
          cardsStore.createIndex("binderId", "binderId", { unique: false });
          cardsStore.createIndex("cardId", "cardId", { unique: false });
          cardsStore.createIndex("addedAt", "addedAt", { unique: false });
        }

        // Card Cache store
        if (!db.objectStoreNames.contains(STORES.CARD_CACHE)) {
          const cacheStore = db.createObjectStore(STORES.CARD_CACHE, {
            keyPath: "id",
          });
          cacheStore.createIndex("expiresAt", "expiresAt", { unique: false });
        }

        // User Settings store
        if (!db.objectStoreNames.contains(STORES.USER_SETTINGS)) {
          db.createObjectStore(STORES.USER_SETTINGS, { keyPath: "key" });
        }

        // Set Completion store
        if (!db.objectStoreNames.contains(STORES.SET_COMPLETION)) {
          const setStore = db.createObjectStore(STORES.SET_COMPLETION, {
            keyPath: ["binderId", "setId"],
          });
          setStore.createIndex("binderId", "binderId", { unique: false });
          setStore.createIndex("setId", "setId", { unique: false });
        }

        // Missing Cards store
        if (!db.objectStoreNames.contains(STORES.MISSING_CARDS)) {
          const missingStore = db.createObjectStore(STORES.MISSING_CARDS, {
            keyPath: ["binderId", "setId", "cardId"],
          });
          missingStore.createIndex("binderId", "binderId", { unique: false });
          missingStore.createIndex("setId", "setId", { unique: false });
        }
      };
    });
  }

  /**
   * Helper method to perform transactions
   */
  async transaction(storeNames, mode = "readonly") {
    await this.init();
    const tx = this.db.transaction(storeNames, mode);

    return {
      stores: storeNames.map((name) => tx.objectStore(name)),
      complete: () =>
        new Promise((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () =>
            reject(
              new StorageError(
                "Transaction failed",
                STORAGE_ERROR_CODES.OPERATION_FAILED,
                tx.error
              )
            );
        }),
    };
  }

  // ================== BINDER OPERATIONS ==================

  async getBinders() {
    try {
      const { stores } = await this.transaction([STORES.BINDERS]);
      const [bindersStore] = stores;

      return new Promise((resolve, reject) => {
        const request = bindersStore.getAll();

        request.onsuccess = () => {
          const binders = request.result.sort(
            (a, b) => b.updatedAt - a.updatedAt
          );
          resolve(binders);
        };

        request.onerror = () =>
          reject(
            new StorageError(
              "Failed to get binders",
              STORAGE_ERROR_CODES.OPERATION_FAILED,
              request.error
            )
          );
      });
    } catch (error) {
      throw new StorageError(
        "Failed to retrieve binders",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async getBinder(binderId) {
    try {
      const { stores } = await this.transaction([STORES.BINDERS]);
      const [bindersStore] = stores;

      return new Promise((resolve, reject) => {
        const request = bindersStore.get(binderId);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            reject(
              new StorageError(
                `Binder with ID ${binderId} not found`,
                STORAGE_ERROR_CODES.NOT_FOUND
              )
            );
          }
        };

        request.onerror = () =>
          reject(
            new StorageError(
              "Failed to get binder",
              STORAGE_ERROR_CODES.OPERATION_FAILED,
              request.error
            )
          );
      });
    } catch (error) {
      throw new StorageError(
        `Failed to retrieve binder ${binderId}`,
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async createBinder(binderData) {
    validateBinderData(binderData);

    const binder = {
      id: `binder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...binderData,
      cardCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      const { stores, complete } = await this.transaction(
        [STORES.BINDERS],
        "readwrite"
      );
      const [bindersStore] = stores;

      const request = bindersStore.add(binder);

      await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(
            new StorageError(
              "Failed to create binder",
              STORAGE_ERROR_CODES.OPERATION_FAILED,
              request.error
            )
          );
      });

      await complete();
      return binder;
    } catch (error) {
      throw new StorageError(
        "Failed to create binder",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async updateBinder(binderId, updates) {
    try {
      const binder = await this.getBinder(binderId);
      const updatedBinder = {
        ...binder,
        ...updates,
        updatedAt: Date.now(),
      };

      const { stores, complete } = await this.transaction(
        [STORES.BINDERS],
        "readwrite"
      );
      const [bindersStore] = stores;

      const request = bindersStore.put(updatedBinder);

      await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(
            new StorageError(
              "Failed to update binder",
              STORAGE_ERROR_CODES.OPERATION_FAILED,
              request.error
            )
          );
      });

      await complete();
      return updatedBinder;
    } catch (error) {
      throw new StorageError(
        `Failed to update binder ${binderId}`,
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async deleteBinder(binderId) {
    try {
      // Delete binder and all its cards
      const { stores, complete } = await this.transaction(
        [
          STORES.BINDERS,
          STORES.BINDER_CARDS,
          STORES.SET_COMPLETION,
          STORES.MISSING_CARDS,
        ],
        "readwrite"
      );

      const [bindersStore, cardsStore, setStore, missingStore] = stores;

      // Delete the binder
      bindersStore.delete(binderId);

      // Delete all cards in the binder
      const cardsIndex = cardsStore.index("binderId");
      const cardsRequest = cardsIndex.openCursor(IDBKeyRange.only(binderId));

      cardsRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Delete set completion data
      const setIndex = setStore.index("binderId");
      const setRequest = setIndex.openCursor(IDBKeyRange.only(binderId));

      setRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Delete missing cards data
      const missingIndex = missingStore.index("binderId");
      const missingRequest = missingIndex.openCursor(
        IDBKeyRange.only(binderId)
      );

      missingRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      await complete();
      return true;
    } catch (error) {
      throw new StorageError(
        `Failed to delete binder ${binderId}`,
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  // ================== CARD OPERATIONS ==================

  async getBinderCards(binderId) {
    try {
      const { stores } = await this.transaction([STORES.BINDER_CARDS]);
      const [cardsStore] = stores;

      return new Promise((resolve, reject) => {
        const index = cardsStore.index("binderId");
        const request = index.getAll(binderId);

        request.onsuccess = () => {
          const cards = request.result.sort((a, b) => a.order - b.order);
          resolve(cards);
        };

        request.onerror = () =>
          reject(
            new StorageError(
              "Failed to get binder cards",
              STORAGE_ERROR_CODES.OPERATION_FAILED,
              request.error
            )
          );
      });
    } catch (error) {
      throw new StorageError(
        `Failed to retrieve cards for binder ${binderId}`,
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async addCardToBinder(binderId, cardData) {
    validateCardData(cardData);

    const card = {
      binderId,
      cardId: cardData.id,
      ...cardData,
      addedAt: Date.now(),
      order: Date.now(), // Simple ordering by add time
    };

    try {
      const { stores, complete } = await this.transaction(
        [STORES.BINDER_CARDS, STORES.BINDERS],
        "readwrite"
      );

      const [cardsStore, bindersStore] = stores;

      // Add the card
      cardsStore.add(card);

      // Update binder card count
      const binderRequest = bindersStore.get(binderId);
      binderRequest.onsuccess = () => {
        const binder = binderRequest.result;
        if (binder) {
          binder.cardCount = (binder.cardCount || 0) + 1;
          binder.updatedAt = Date.now();
          bindersStore.put(binder);
        }
      };

      await complete();
      return card;
    } catch (error) {
      throw new StorageError(
        "Failed to add card to binder",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async removeCardFromBinder(binderId, cardId) {
    try {
      const { stores, complete } = await this.transaction(
        [STORES.BINDER_CARDS, STORES.BINDERS],
        "readwrite"
      );

      const [cardsStore, bindersStore] = stores;

      // Remove the card
      cardsStore.delete([binderId, cardId]);

      // Update binder card count
      const binderRequest = bindersStore.get(binderId);
      binderRequest.onsuccess = () => {
        const binder = binderRequest.result;
        if (binder) {
          binder.cardCount = Math.max((binder.cardCount || 1) - 1, 0);
          binder.updatedAt = Date.now();
          bindersStore.put(binder);
        }
      };

      await complete();
      return true;
    } catch (error) {
      throw new StorageError(
        "Failed to remove card from binder",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async bulkAddCards(binderId, cardsData) {
    try {
      const { stores, complete } = await this.transaction(
        [STORES.BINDER_CARDS, STORES.BINDERS],
        "readwrite"
      );

      const [cardsStore, bindersStore] = stores;

      let addedCount = 0;
      const baseTime = Date.now();

      // Add all cards
      cardsData.forEach((cardData, index) => {
        validateCardData(cardData);

        const card = {
          binderId,
          cardId: cardData.id,
          ...cardData,
          addedAt: baseTime + index,
          order: baseTime + index,
        };

        cardsStore.add(card);
        addedCount++;
      });

      // Update binder card count
      const binderRequest = bindersStore.get(binderId);
      binderRequest.onsuccess = () => {
        const binder = binderRequest.result;
        if (binder) {
          binder.cardCount = (binder.cardCount || 0) + addedCount;
          binder.updatedAt = Date.now();
          bindersStore.put(binder);
        }
      };

      await complete();
      return addedCount;
    } catch (error) {
      throw new StorageError(
        "Failed to bulk add cards",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  // ================== CACHE OPERATIONS ==================

  async getCachedCard(cardId) {
    try {
      const { stores } = await this.transaction([STORES.CARD_CACHE]);
      const [cacheStore] = stores;

      return new Promise((resolve, reject) => {
        const request = cacheStore.get(cardId);

        request.onsuccess = () => {
          const cached = request.result;
          if (cached && cached.expiresAt > Date.now()) {
            resolve(cached.data);
          } else {
            resolve(null);
          }
        };

        request.onerror = () =>
          reject(
            new StorageError(
              "Failed to get cached card",
              STORAGE_ERROR_CODES.OPERATION_FAILED,
              request.error
            )
          );
      });
    } catch (error) {
      return null; // Cache failures should not break the app
    }
  }

  async setCachedCard(cardId, cardData, ttl = 24 * 60 * 60 * 1000) {
    try {
      const { stores, complete } = await this.transaction(
        [STORES.CARD_CACHE],
        "readwrite"
      );
      const [cacheStore] = stores;

      const cacheEntry = {
        id: cardId,
        data: cardData,
        cachedAt: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      cacheStore.put(cacheEntry);
      await complete();
      return true;
    } catch (error) {
      // Cache failures should not break the app
      console.warn("Failed to cache card data:", error);
      return false;
    }
  }

  // ================== UTILITY OPERATIONS ==================

  async getAllData() {
    try {
      const [binders, cards, settings] = await Promise.all([
        this.getBinders(),
        this.transaction([STORES.BINDER_CARDS]).then(({ stores }) => {
          const [cardsStore] = stores;
          return new Promise((resolve) => {
            const request = cardsStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]);
          });
        }),
        this.getUserSettings(),
      ]);

      return {
        binders,
        cards,
        settings,
        exportedAt: Date.now(),
        version: DB_VERSION,
      };
    } catch (error) {
      throw new StorageError(
        "Failed to export all data",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async clearAllData() {
    try {
      const { stores, complete } = await this.transaction(
        [
          STORES.BINDERS,
          STORES.BINDER_CARDS,
          STORES.CARD_CACHE,
          STORES.USER_SETTINGS,
          STORES.SET_COMPLETION,
          STORES.MISSING_CARDS,
        ],
        "readwrite"
      );

      // Clear all stores
      stores.forEach((store) => store.clear());

      await complete();
      return true;
    } catch (error) {
      throw new StorageError(
        "Failed to clear all data",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  async getUserSettings() {
    try {
      const { stores } = await this.transaction([STORES.USER_SETTINGS]);
      const [settingsStore] = stores;

      return new Promise((resolve) => {
        const request = settingsStore.getAll();
        request.onsuccess = () => {
          const settings = {};
          request.result.forEach((item) => {
            settings[item.key] = item.value;
          });
          resolve(settings);
        };
        request.onerror = () => resolve({});
      });
    } catch (error) {
      return {}; // Default empty settings
    }
  }

  async updateUserSettings(settings) {
    try {
      const { stores, complete } = await this.transaction(
        [STORES.USER_SETTINGS],
        "readwrite"
      );
      const [settingsStore] = stores;

      // Convert settings object to key-value pairs
      Object.entries(settings).forEach(([key, value]) => {
        settingsStore.put({ key, value, updatedAt: Date.now() });
      });

      await complete();
      return true;
    } catch (error) {
      throw new StorageError(
        "Failed to update user settings",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    }
  }

  // ================== STATUS OPERATIONS ==================

  isConnected() {
    return this.isInitialized && this.db !== null;
  }

  getStorageInfo() {
    return {
      type: "indexeddb",
      isConnected: this.isConnected(),
      dbName: DB_NAME,
      version: DB_VERSION,
      stores: Object.values(STORES),
    };
  }

  // Placeholder implementations for interface compliance
  async searchCards(query, filters) {
    // This will be implemented in Phase 2 when we add Pokemon TCG API
    return [];
  }

  async searchBinders(query) {
    const binders = await this.getBinders();
    return binders.filter(
      (binder) =>
        binder.name.toLowerCase().includes(query.toLowerCase()) ||
        binder.description.toLowerCase().includes(query.toLowerCase())
    );
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
export const indexedDBAdapter = new IndexedDBAdapter();
