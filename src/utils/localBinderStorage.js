/**
 * Local Binder Storage Utility
 *
 * Manages local storage for pending binder changes before Firebase synchronization.
 * Optimized for performance and minimal Firebase writes.
 */

// New simplified local storage approach - store complete binder state locally

const BINDER_STORAGE_KEY_PREFIX = "pokemon_binder_";
const STORAGE_VERSION = "2.0";

/**
 * Get the storage key for a binder's complete state
 */
const getBinderStorageKey = (binderId) =>
  `${BINDER_STORAGE_KEY_PREFIX}${binderId}`;

/**
 * Get the sync status key for a binder
 */
const getSyncStatusKey = (binderId) =>
  `${BINDER_STORAGE_KEY_PREFIX}${binderId}_sync`;

/**
 * Get complete binder state from local storage
 */
export const getLocalBinderState = (binderId) => {
  try {
    const data = localStorage.getItem(getBinderStorageKey(binderId));
    if (!data) return null;

    const parsed = JSON.parse(data);

    // Validate structure and version
    if (parsed.version !== STORAGE_VERSION) {
      console.warn("Binder state version mismatch, clearing local data");
      clearLocalBinderState(binderId);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error reading local binder state:", error);
    return null;
  }
};

/**
 * Save complete binder state to local storage
 */
export const saveLocalBinderState = (binderId, binderState) => {
  try {
    const dataToSave = {
      version: STORAGE_VERSION,
      binderId,
      cards: binderState.cards || [],
      preferences: binderState.preferences || {},
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(
      getBinderStorageKey(binderId),
      JSON.stringify(dataToSave)
    );

    // Mark as needing sync
    setSyncStatus(binderId, {
      needsSync: true,
      lastModified: dataToSave.lastModified,
    });

    return true;
  } catch (error) {
    console.error("Error saving local binder state:", error);
    return false;
  }
};

/**
 * Initialize local binder state from Firebase data
 */
export const initializeLocalBinderState = (
  binderId,
  firebaseCards = [],
  preferences = {}
) => {
  console.log("initializeLocalBinderState called with:", {
    binderId,
    firebaseCardsLength: firebaseCards.length,
    firebaseCards: firebaseCards.map((c) => ({
      id: c.id,
      page: c.pageNumber,
      slot: c.slotInPage,
    })),
    preferences,
  });

  const localState = getLocalBinderState(binderId);
  const isLocalEmpty =
    !localState || !localState.cards || localState.cards.length === 0;
  const hasFirebaseCards = firebaseCards.length > 0;
  const hasLocalChanges = needsSync(binderId);

  console.log("State analysis:", {
    isLocalEmpty,
    hasFirebaseCards,
    hasLocalChanges,
    localState: localState
      ? { cardsCount: localState.cards?.length || 0 }
      : null,
  });

  // If local is empty, definitely use Firebase data
  if (isLocalEmpty) {
    console.log("Local storage is empty, initializing with Firebase data");

    const updatedState = {
      version: STORAGE_VERSION,
      binderId,
      cards: firebaseCards,
      preferences: { ...(localState?.preferences || {}), ...preferences },
      lastModified: new Date().toISOString(),
    };

    // Save to local storage
    localStorage.setItem(
      getBinderStorageKey(binderId),
      JSON.stringify(updatedState)
    );

    // Mark as synced (since this is from Firebase)
    setSyncStatus(binderId, {
      needsSync: false,
      lastSynced: updatedState.lastModified,
    });

    return updatedState;
  }

  // If local has changes, we need to be smarter about merging
  if (hasLocalChanges && hasFirebaseCards) {
    console.log(
      "Local has changes and Firebase has cards, merging intelligently"
    );

    // Create a map of Firebase cards by position for easy lookup
    const firebaseCardMap = new Map();
    firebaseCards.forEach((card) => {
      const key = `${card.pageNumber}-${card.slotInPage}`;
      firebaseCardMap.set(key, card);
    });

    // Create a map of local cards by position
    const localCardMap = new Map();
    localState.cards.forEach((card) => {
      const key = `${card.pageNumber}-${card.slotInPage}`;
      localCardMap.set(key, card);
    });

    // Start with Firebase cards as base
    const mergedCards = [...firebaseCards];

    // Add or replace with local cards (local takes precedence)
    localState.cards.forEach((localCard) => {
      const key = `${localCard.pageNumber}-${localCard.slotInPage}`;
      const existingIndex = mergedCards.findIndex(
        (card) =>
          card.pageNumber === localCard.pageNumber &&
          card.slotInPage === localCard.slotInPage
      );

      if (existingIndex !== -1) {
        // Replace existing Firebase card with local version
        mergedCards[existingIndex] = localCard;
        console.log(
          `Replaced Firebase card with local card at position ${key}`
        );
      } else {
        // Add new local card that doesn't exist in Firebase
        mergedCards.push(localCard);
        console.log(`Added new local card at position ${key}`);
      }
    });

    console.log("Merge result:", {
      firebaseCardsCount: firebaseCards.length,
      localCardsCount: localState.cards.length,
      mergedCardsCount: mergedCards.length,
      mergedCards: mergedCards.map((c) => ({
        id: c.id,
        page: c.pageNumber,
        slot: c.slotInPage,
      })),
    });

    // Preserve existing local preferences and merge with Firebase preferences
    const preservedPreferences = {
      ...(localState?.preferences || {}), // Existing local preferences
      ...preferences, // Firebase preferences (may be empty during reinitialization)
    };

    console.log("Preference preservation during merge:", {
      existingLocalPrefs: localState?.preferences || {},
      incomingFirebasePrefs: preferences,
      preservedPreferences,
      showReverseHolosPreserved: preservedPreferences.showReverseHolos,
    });

    const updatedState = {
      version: STORAGE_VERSION,
      binderId,
      cards: mergedCards,
      preferences: preservedPreferences,
      lastModified: new Date().toISOString(),
    };

    // Save to local storage
    localStorage.setItem(
      getBinderStorageKey(binderId),
      JSON.stringify(updatedState)
    );

    // Keep sync status as is (still needs sync since we have local changes)
    return updatedState;
  }

  // If local has no unsaved changes, update with Firebase data
  if (!hasLocalChanges && hasFirebaseCards) {
    console.log("No local changes detected, updating with fresh Firebase data");

    // Preserve existing local preferences and merge with Firebase preferences
    // This prevents preferences from being reset during sync cycles
    const preservedPreferences = {
      ...(localState?.preferences || {}), // Existing local preferences
      ...preferences, // Firebase preferences (may be empty during reinitialization)
    };

    console.log("Preference preservation during reinitialization:", {
      existingLocalPrefs: localState?.preferences || {},
      incomingFirebasePrefs: preferences,
      preservedPreferences,
      showReverseHolosPreserved: preservedPreferences.showReverseHolos,
    });

    const updatedState = {
      version: STORAGE_VERSION,
      binderId,
      cards: firebaseCards,
      preferences: preservedPreferences,
      lastModified: new Date().toISOString(),
    };

    // Save to local storage
    localStorage.setItem(
      getBinderStorageKey(binderId),
      JSON.stringify(updatedState)
    );

    // Mark as synced (since this is from Firebase)
    setSyncStatus(binderId, {
      needsSync: false,
      lastSynced: updatedState.lastModified,
    });

    return updatedState;
  }

  // If local state exists and has changes, keep it
  if (localState && localState.lastModified) {
    console.log("Local binder state exists with changes, using local version", {
      cardsCount: localState.cards?.length || 0,
    });
    return localState;
  }

  // Initialize empty state if no Firebase data
  const initialState = {
    version: STORAGE_VERSION,
    binderId,
    cards: firebaseCards,
    preferences,
    lastModified: new Date().toISOString(),
  };

  console.log("Initializing new empty local state:", initialState);

  // Save to local storage
  localStorage.setItem(
    getBinderStorageKey(binderId),
    JSON.stringify(initialState)
  );

  // Mark as synced (since this is from Firebase)
  setSyncStatus(binderId, {
    needsSync: false,
    lastSynced: initialState.lastModified,
  });

  return initialState;
};

/**
 * Clear local binder state
 */
export const clearLocalBinderState = (binderId) => {
  try {
    localStorage.removeItem(getBinderStorageKey(binderId));
    localStorage.removeItem(getSyncStatusKey(binderId));
    return true;
  } catch (error) {
    console.error("Error clearing local binder state:", error);
    return false;
  }
};

/**
 * Add cards to local binder state
 */
export const addCardsToLocalBinder = (binderId, cardsToAdd) => {
  const localState = getLocalBinderState(binderId);
  if (!localState) {
    console.error("No local binder state found");
    return { success: false, error: "No local binder state found" };
  }

  console.log("Adding cards to local binder:", {
    binderId,
    existingCardsCount: localState.cards.length,
    cardsToAddCount: cardsToAdd.length,
    existingCards: localState.cards.map((c) => ({
      id: c.id,
      page: c.pageNumber,
      slot: c.slotInPage,
    })),
    cardsToAdd: cardsToAdd.map((c) => ({
      id: c.id,
      page: c.pageNumber,
      slot: c.slotInPage,
    })),
  });

  const updatedCards = [...localState.cards, ...cardsToAdd];

  console.log("Final cards array after adding:", {
    totalCount: updatedCards.length,
    cards: updatedCards.map((c) => ({
      id: c.id,
      page: c.pageNumber,
      slot: c.slotInPage,
    })),
  });

  const success = saveLocalBinderState(binderId, {
    ...localState,
    cards: updatedCards,
  });

  return {
    success,
    addedCount: cardsToAdd.length,
  };
};

/**
 * Move card in local binder state
 */
export const moveCardInLocalBinder = (binderId, cardId, newPosition) => {
  const localState = getLocalBinderState(binderId);
  if (!localState) {
    console.error("No local binder state found");
    return { success: false, error: "No local binder state found" };
  }

  const updatedCards = localState.cards.map((card) => {
    if (card.id === cardId) {
      return {
        ...card,
        pageNumber: newPosition.pageNumber,
        slotInPage: newPosition.slotInPage,
        overallSlotNumber: newPosition.overallSlotNumber,
      };
    }
    return card;
  });

  const success = saveLocalBinderState(binderId, {
    ...localState,
    cards: updatedCards,
  });

  return { success };
};

/**
 * Move multiple cards (for page reordering)
 */
export const moveCardsInLocalBinder = (binderId, cardUpdates) => {
  const localState = getLocalBinderState(binderId);
  if (!localState) {
    console.error("No local binder state found");
    return { success: false, error: "No local binder state found" };
  }

  // Create a map for quick lookups
  const updateMap = new Map(
    cardUpdates.map((update) => [update.cardId, update])
  );

  const updatedCards = localState.cards.map((card) => {
    const update = updateMap.get(card.id);
    if (update) {
      return {
        ...card,
        pageNumber: update.pageNumber,
        slotInPage: update.slotInPage,
        overallSlotNumber: update.overallSlotNumber,
      };
    }
    return card;
  });

  const success = saveLocalBinderState(binderId, {
    ...localState,
    cards: updatedCards,
  });

  return {
    success,
    updatedCount: cardUpdates.length,
  };
};

/**
 * Update binder preferences in local state
 */
export const updateLocalBinderPreferences = (binderId, preferenceUpdates) => {
  const localState = getLocalBinderState(binderId);
  if (!localState) {
    console.error("No local binder state found");
    return { success: false, error: "No local binder state found" };
  }

  const updatedPreferences = {
    ...localState.preferences,
    ...preferenceUpdates,
  };

  const success = saveLocalBinderState(binderId, {
    ...localState,
    preferences: updatedPreferences,
  });

  return { success };
};

/**
 * Get sync status for a binder
 */
export const getSyncStatus = (binderId) => {
  try {
    const data = localStorage.getItem(getSyncStatusKey(binderId));
    if (!data) return { needsSync: false };
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading sync status:", error);
    return { needsSync: false };
  }
};

/**
 * Set sync status for a binder
 */
export const setSyncStatus = (binderId, status) => {
  try {
    localStorage.setItem(getSyncStatusKey(binderId), JSON.stringify(status));
    return true;
  } catch (error) {
    console.error("Error setting sync status:", error);
    return false;
  }
};

/**
 * Check if binder needs syncing
 */
export const needsSync = (binderId) => {
  const status = getSyncStatus(binderId);
  return status.needsSync === true;
};

/**
 * Revert local binder state to match Firebase data
 * This clears all local changes and reinitializes with provided Firebase data
 */
export const revertToFirebaseState = (
  binderId,
  firebaseCards = [],
  preferences = {}
) => {
  console.log("Reverting local state to Firebase data", {
    binderId,
    firebaseCardsCount: firebaseCards.length,
    preferences,
  });

  // Clear current local state
  clearLocalBinderState(binderId);

  // Reinitialize with fresh Firebase data
  const revertedState = {
    version: STORAGE_VERSION,
    binderId,
    cards: firebaseCards,
    preferences,
    lastModified: new Date().toISOString(),
  };

  // Save reverted state to local storage
  localStorage.setItem(
    getBinderStorageKey(binderId),
    JSON.stringify(revertedState)
  );

  // Mark as synced (since this matches Firebase)
  setSyncStatus(binderId, {
    needsSync: false,
    lastSynced: revertedState.lastModified,
  });

  console.log("Local state reverted successfully", {
    revertedCardsCount: revertedState.cards.length,
    revertedState: revertedState,
  });
  return revertedState;
};

/**
 * Get cards for a specific page from local state
 */
export const getLocalCardsForPage = (binderId, pageNumber) => {
  const localState = getLocalBinderState(binderId);
  if (!localState) {
    console.log(
      `getLocalCardsForPage: No local state found for binder ${binderId}, page ${pageNumber}`
    );
    return [];
  }

  const allCards = localState.cards || [];
  const filteredCards = allCards.filter(
    (card) => card.pageNumber === pageNumber
  );

  // Only log if there are cards or if we're debugging a specific issue
  if (filteredCards.length > 0 || pageNumber === 1) {
    console.log(
      `getLocalCardsForPage: Binder ${binderId}, Page ${pageNumber}`,
      {
        totalCards: allCards.length,
        pageCards: filteredCards.length,
      }
    );
  }

  return filteredCards;
};

/**
 * Get all cards from local state
 */
export const getAllLocalCards = (binderId) => {
  const localState = getLocalBinderState(binderId);
  console.log("getAllLocalCards called:", {
    binderId,
    cardsCount: localState?.cards?.length || 0,
    hasLocalState: !!localState,
  });
  if (!localState) return [];
  return localState.cards;
};

/**
 * Get local binder preferences
 */
export const getLocalBinderPreferences = (binderId) => {
  const localState = getLocalBinderState(binderId);
  if (!localState) return {};
  return localState.preferences;
};

// LEGACY FUNCTIONS - Keep these for backward compatibility but mark as deprecated

/**
 * @deprecated Use getLocalBinderState instead
 */
export const getPendingChanges = (binderId) => {
  console.warn(
    "getPendingChanges is deprecated, use getLocalBinderState instead"
  );
  return null;
};

/**
 * @deprecated Use needsSync instead
 */
export const hasPendingChanges = (binderId) => {
  console.warn("hasPendingChanges is deprecated, use needsSync instead");
  return needsSync(binderId);
};

/**
 * @deprecated Use getLocalBinderState instead
 */
export const getPendingChangesCount = (binderId) => {
  console.warn("getPendingChangesCount is deprecated, use needsSync instead");
  return needsSync(binderId) ? 1 : 0;
};

/**
 * @deprecated Use clearLocalBinderState instead
 */
export const clearPendingChanges = (binderId) => {
  console.warn("clearPendingChanges is deprecated, use setSyncStatus instead");
  return setSyncStatus(binderId, {
    needsSync: false,
    lastSynced: new Date().toISOString(),
  });
};

// Export all legacy functions to maintain compatibility
export const savePendingChanges = () =>
  console.warn("savePendingChanges is deprecated");
export const addCardsToPending = () =>
  console.warn("addCardsToPending is deprecated");
export const removeCardFromPending = () =>
  console.warn("removeCardFromPending is deprecated");
export const addPageMoveToPending = () =>
  console.warn("addPageMoveToPending is deprecated");
export const addCardMoveToPending = () =>
  console.warn("addCardMoveToPending is deprecated");
export const getPendingCardMoves = () =>
  console.warn("getPendingCardMoves is deprecated");
export const getPendingPageMoves = () =>
  console.warn("getPendingPageMoves is deprecated");
export const removeCardMoveFromPending = () =>
  console.warn("removeCardMoveFromPending is deprecated");
export const getPendingChangesSummary = () =>
  console.warn("getPendingChangesSummary is deprecated");
export const clearAllPendingChanges = () =>
  console.warn("clearAllPendingChanges is deprecated");
export const getStorageInfo = () =>
  console.warn("getStorageInfo is deprecated");
export const getPendingCardAdditions = () =>
  console.warn("getPendingCardAdditions is deprecated");
