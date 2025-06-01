/**
 * Storage Provider - Unified Storage Interface
 *
 * This provider automatically switches between IndexedDB (anonymous users)
 * and Firebase (authenticated users) while providing a consistent API.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { indexedDBAdapter } from "./adapters/indexedDBAdapter";
import { firebaseAdapter } from "./adapters/firebaseAdapter";
import { STORAGE_TYPES } from "./adapters/storageInterface";

const StorageContext = createContext(null);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};

export const StorageProvider = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentAdapter, setCurrentAdapter] = useState(null);
  const [storageType, setStorageType] = useState(null);
  const [error, setError] = useState(null);

  // Initialize storage adapter based on auth state
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setError(null);
        setIsInitialized(false);

        if (user) {
          // User is authenticated - use Firebase
          firebaseAdapter.setUserId(user.uid);
          setCurrentAdapter(firebaseAdapter);
          setStorageType(STORAGE_TYPES.FIREBASE);
        } else {
          // User is not authenticated - use IndexedDB
          await indexedDBAdapter.init();
          setCurrentAdapter(indexedDBAdapter);
          setStorageType(STORAGE_TYPES.INDEXEDDB);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Storage initialization error:", error);
        setError(error);

        // Fallback to IndexedDB if Firebase fails
        if (user && !currentAdapter) {
          try {
            await indexedDBAdapter.init();
            setCurrentAdapter(indexedDBAdapter);
            setStorageType(STORAGE_TYPES.INDEXEDDB);
            setIsInitialized(true);
            console.warn("Falling back to IndexedDB due to Firebase error");
          } catch (fallbackError) {
            console.error("IndexedDB fallback also failed:", fallbackError);
          }
        }
      }
    };

    if (!authLoading) {
      initializeStorage();
    }
  }, [user, authLoading]);

  // Storage interface methods
  const storage = currentAdapter
    ? {
        // Binder Operations
        getBinders: () => currentAdapter.getBinders(),
        getBinder: (binderId) => currentAdapter.getBinder(binderId),
        createBinder: (binderData) => currentAdapter.createBinder(binderData),
        updateBinder: (binderId, updates) =>
          currentAdapter.updateBinder(binderId, updates),
        deleteBinder: (binderId) => currentAdapter.deleteBinder(binderId),

        // Card Operations
        getBinderCards: (binderId) => currentAdapter.getBinderCards(binderId),
        addCardToBinder: (binderId, cardData) =>
          currentAdapter.addCardToBinder(binderId, cardData),
        updateCardInBinder: (binderId, cardId, updates) =>
          currentAdapter.updateCardInBinder?.(binderId, cardId, updates),
        removeCardFromBinder: (binderId, cardId) =>
          currentAdapter.removeCardFromBinder(binderId, cardId),
        bulkAddCards: (binderId, cardsData) =>
          currentAdapter.bulkAddCards(binderId, cardsData),
        bulkRemoveCards: (binderId, cardIds) =>
          currentAdapter.bulkRemoveCards?.(binderId, cardIds),

        // Search Operations
        searchCards: (query, filters) =>
          currentAdapter.searchCards(query, filters),
        searchBinders: (query) => currentAdapter.searchBinders(query),

        // Set Completion Operations
        getSetCompletion: (binderId, setId) =>
          currentAdapter.getSetCompletion(binderId, setId),
        updateSetCompletion: (binderId, setId, completionData) =>
          currentAdapter.updateSetCompletion(binderId, setId, completionData),
        getMissingCards: (binderId, setId) =>
          currentAdapter.getMissingCards(binderId, setId),

        // Cache Operations
        getCachedCard: (cardId) => currentAdapter.getCachedCard(cardId),
        setCachedCard: (cardId, cardData, ttl) =>
          currentAdapter.setCachedCard(cardId, cardData, ttl),
        getCachedSet: (setId) => currentAdapter.getCachedSet(setId),
        setCachedSet: (setId, setData, ttl) =>
          currentAdapter.setCachedSet(setId, setData, ttl),

        // User Settings
        getUserSettings: () => currentAdapter.getUserSettings(),
        updateUserSettings: (settings) =>
          currentAdapter.updateUserSettings(settings),

        // Migration & Utility Operations
        getAllData: () => currentAdapter.getAllData(),
        clearAllData: () => currentAdapter.clearAllData(),
        exportData: () => currentAdapter.exportData(),
        importData: (data) => currentAdapter.importData(data),

        // Connection & Status
        isConnected: () => currentAdapter.isConnected(),
        getStorageInfo: () => currentAdapter.getStorageInfo(),

        // Real-time subscriptions (Firebase only)
        subscribeToBinders: (callback) => {
          if (currentAdapter.subscribeToBinders) {
            return currentAdapter.subscribeToBinders(callback);
          }
          return () => {}; // No-op for IndexedDB
        },
        subscribeToBinderCards: (binderId, callback) => {
          if (currentAdapter.subscribeToBinderCards) {
            return currentAdapter.subscribeToBinderCards(binderId, callback);
          }
          return () => {}; // No-op for IndexedDB
        },

        // Storage metadata
        storageType,
        isOnline: user !== null,
        canSync: user !== null,
        adapter: currentAdapter,
      }
    : null;

  const contextValue = {
    storage,
    isInitialized,
    isLoading: authLoading || !isInitialized,
    error,
    storageType,
    isOnline: user !== null,
    canSync: user !== null,
    user,
  };

  return (
    <StorageContext.Provider value={contextValue}>
      {children}
    </StorageContext.Provider>
  );
};

/**
 * Hook for accessing storage with loading states
 */
export const useStorageWithLoading = () => {
  const { storage, isLoading, error } = useStorage();

  return {
    storage,
    isLoading,
    error,
    isReady: !isLoading && !error && storage !== null,
  };
};

/**
 * Hook for storage type information
 */
export const useStorageInfo = () => {
  const { storageType, isOnline, canSync, user } = useStorage();

  return {
    storageType,
    isOnline,
    canSync,
    isGuest: !user,
    isRegistered: !!user,
    storageLocation: storageType === STORAGE_TYPES.FIREBASE ? "Cloud" : "Local",
  };
};

/**
 * Higher-order component for components that require storage
 */
export const withStorage = (Component) => {
  return function StorageWrappedComponent(props) {
    const { storage, isLoading, error } = useStorage();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Initializing storage...</span>
        </div>
      );
    }

    if (error || !storage) {
      return (
        <div className="flex flex-col items-center justify-center min-h-32 text-center">
          <div className="text-red-600 mb-2">Storage initialization failed</div>
          <div className="text-sm text-gray-500">
            {error?.message || "Unknown storage error"}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return <Component {...props} storage={storage} />;
  };
};

export default StorageProvider;
