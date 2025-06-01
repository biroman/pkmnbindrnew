/**
 * Unified Storage Interface
 *
 * This interface defines the contract that both IndexedDB and Firebase adapters must implement.
 * It provides a consistent API for storage operations regardless of the underlying storage mechanism.
 */

export const StorageInterface = {
  // Binder Operations
  getBinders: async () => {
    throw new Error("getBinders not implemented");
  },
  getBinder: async (binderId) => {
    throw new Error("getBinder not implemented");
  },
  createBinder: async (binderData) => {
    throw new Error("createBinder not implemented");
  },
  updateBinder: async (binderId, updates) => {
    throw new Error("updateBinder not implemented");
  },
  deleteBinder: async (binderId) => {
    throw new Error("deleteBinder not implemented");
  },

  // Card Operations
  getBinderCards: async (binderId) => {
    throw new Error("getBinderCards not implemented");
  },
  addCardToBinder: async (binderId, cardData) => {
    throw new Error("addCardToBinder not implemented");
  },
  updateCardInBinder: async (binderId, cardId, updates) => {
    throw new Error("updateCardInBinder not implemented");
  },
  removeCardFromBinder: async (binderId, cardId) => {
    throw new Error("removeCardFromBinder not implemented");
  },
  bulkAddCards: async (binderId, cardsData) => {
    throw new Error("bulkAddCards not implemented");
  },
  bulkRemoveCards: async (binderId, cardIds) => {
    throw new Error("bulkRemoveCards not implemented");
  },

  // Search Operations
  searchCards: async (query, filters) => {
    throw new Error("searchCards not implemented");
  },
  searchBinders: async (query) => {
    throw new Error("searchBinders not implemented");
  },

  // Set Completion Operations
  getSetCompletion: async (binderId, setId) => {
    throw new Error("getSetCompletion not implemented");
  },
  updateSetCompletion: async (binderId, setId, completionData) => {
    throw new Error("updateSetCompletion not implemented");
  },
  getMissingCards: async (binderId, setId) => {
    throw new Error("getMissingCards not implemented");
  },

  // Cache Operations (for Pokemon TCG API data)
  getCachedCard: async (cardId) => {
    throw new Error("getCachedCard not implemented");
  },
  setCachedCard: async (cardId, cardData, ttl) => {
    throw new Error("setCachedCard not implemented");
  },
  getCachedSet: async (setId) => {
    throw new Error("getCachedSet not implemented");
  },
  setCachedSet: async (setId, setData, ttl) => {
    throw new Error("setCachedSet not implemented");
  },

  // User Settings
  getUserSettings: async () => {
    throw new Error("getUserSettings not implemented");
  },
  updateUserSettings: async (settings) => {
    throw new Error("updateUserSettings not implemented");
  },

  // Migration & Utility Operations
  getAllData: async () => {
    throw new Error("getAllData not implemented");
  },
  clearAllData: async () => {
    throw new Error("clearAllData not implemented");
  },
  exportData: async () => {
    throw new Error("exportData not implemented");
  },
  importData: async (data) => {
    throw new Error("importData not implemented");
  },

  // Connection & Status
  isConnected: () => {
    throw new Error("isConnected not implemented");
  },
  getStorageInfo: () => {
    throw new Error("getStorageInfo not implemented");
  },
};

/**
 * Storage Types Enum
 */
export const STORAGE_TYPES = {
  INDEXEDDB: "indexeddb",
  FIREBASE: "firebase",
};

/**
 * Common Error Types
 */
export class StorageError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = "StorageError";
    this.code = code;
    this.originalError = originalError;
  }
}

export const STORAGE_ERROR_CODES = {
  NOT_FOUND: "NOT_FOUND",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  NETWORK_ERROR: "NETWORK_ERROR",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  INVALID_DATA: "INVALID_DATA",
  OPERATION_FAILED: "OPERATION_FAILED",
};

/**
 * Data Validation Schemas
 */
export const validateBinderData = (data) => {
  const required = ["name", "description", "createdAt"];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new StorageError(
      `Missing required fields: ${missing.join(", ")}`,
      STORAGE_ERROR_CODES.INVALID_DATA
    );
  }

  return true;
};

export const validateCardData = (data) => {
  const required = ["id", "name", "addedAt"];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new StorageError(
      `Missing required fields: ${missing.join(", ")}`,
      STORAGE_ERROR_CODES.INVALID_DATA
    );
  }

  return true;
};
