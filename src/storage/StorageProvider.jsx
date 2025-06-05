/**
 * Storage Provider Context
 *
 * Provides unified storage interface that automatically switches between
 * IndexedDB (anonymous users) and Firebase (authenticated users).
 */

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { indexedDBAdapter } from "./adapters/indexedDBAdapter";
// Import firebaseAdapter when it's implemented
// import { firebaseAdapter } from "./adapters/firebaseAdapter";

// Create storage context
const StorageContext = createContext(null);

// Mock Firebase adapter for now (Phase 0/1)
const mockFirebaseAdapter = {
  // Will be replaced with actual Firebase adapter in Phase 4
  getBinders: async () => [],
  createBinder: async () => null,
  updateBinder: async () => null,
  deleteBinder: async () => false,
  getBinderCards: async () => [],
  addCardToBinder: async () => null,
  removeCardFromBinder: async () => false,
  bulkAddCards: async () => 0,
  isConnected: () => false,
  getStorageInfo: () => ({ type: "firebase", isConnected: false }),
};

export const StorageProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentAdapter, setCurrentAdapter] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Initialize storage adapter based on user authentication
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setError(null);
        setIsInitialized(false);

        if (user) {
          // Use Firebase for authenticated users
          console.log("Switching to Firebase storage for authenticated user");
          setCurrentAdapter(mockFirebaseAdapter); // Will be firebaseAdapter in Phase 4
        } else {
          // Use IndexedDB for anonymous users
          await indexedDBAdapter.init();
          setCurrentAdapter(indexedDBAdapter);
        }

        setIsInitialized(true);
      } catch (err) {
        console.error("Storage initialization failed:", err);
        setError(err);

        // Fallback to IndexedDB if Firebase fails
        if (user) {
          console.warn("Firebase failed, falling back to IndexedDB");
          try {
            await indexedDBAdapter.init();
            setCurrentAdapter(indexedDBAdapter);
            setIsInitialized(true);
          } catch (fallbackErr) {
            console.error("IndexedDB fallback also failed:", fallbackErr);
          }
        }
      }
    };

    initializeStorage();
  }, [user]);

  // Unified storage interface
  const storage = {
    // Current adapter
    adapter: currentAdapter,

    // Initialization state
    isInitialized,
    error,

    // User type info
    isAnonymous: !user,
    isAuthenticated: !!user,
    storageType: user ? "firebase" : "indexeddb",

    // ===== BINDER OPERATIONS =====
    getBinders: async () => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.getBinders();
    },

    getBinder: async (binderId) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.getBinder(binderId);
    },

    createBinder: async (binderData) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.createBinder(binderData);
    },

    updateBinder: async (binderId, updates) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.updateBinder(binderId, updates);
    },

    deleteBinder: async (binderId) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.deleteBinder(binderId);
    },

    // ===== CARD OPERATIONS =====
    getBinderCards: async (binderId) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.getBinderCards(binderId);
    },

    addCardToBinder: async (binderId, cardData) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.addCardToBinder(binderId, cardData);
    },

    removeCardFromBinder: async (binderId, cardId) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.removeCardFromBinder(binderId, cardId);
    },

    bulkAddCards: async (binderId, cardsData) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.bulkAddCards(binderId, cardsData);
    },

    // ===== CACHE OPERATIONS =====
    getCachedCard: async (cardId) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.getCachedCard(cardId);
    },

    setCachedCard: async (cardId, cardData, ttl) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.setCachedCard(cardId, cardData, ttl);
    },

    // ===== SEARCH OPERATIONS =====
    searchCards: async (query, filters = {}) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.searchCards(query, filters);
    },

    searchBinders: async (query) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.searchBinders(query);
    },

    // ===== UTILITY OPERATIONS =====
    getAllData: async () => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.getAllData();
    },

    getUserSettings: async () => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.getUserSettings();
    },

    updateUserSettings: async (settings) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.updateUserSettings(settings);
    },

    // ===== STATUS OPERATIONS =====
    isConnected: () => {
      return currentAdapter ? currentAdapter.isConnected() : false;
    },

    getStorageInfo: () => {
      if (!currentAdapter) {
        return { type: "none", isConnected: false, error: "Not initialized" };
      }
      return {
        ...currentAdapter.getStorageInfo(),
        isAnonymous: !user,
        isAuthenticated: !!user,
      };
    },

    // ===== MIGRATION OPERATIONS (Phase 4) =====
    exportData: async () => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.exportData();
    },

    importData: async (data) => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.importData(data);
    },

    clearAllData: async () => {
      if (!currentAdapter) throw new Error("Storage not initialized");
      return await currentAdapter.clearAllData();
    },
  };

  if (!isInitialized && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing storage...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Storage Initialization Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to initialize storage system. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
};

// Hook to use storage context
export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};

export default StorageProvider;
