/**
 * Local Binder Storage Utility
 *
 * Manages local storage for pending binder changes before Firebase synchronization.
 * Optimized for performance and minimal Firebase writes.
 */

const STORAGE_KEY_PREFIX = "pokemon_binder_pending_";
const STORAGE_VERSION = "1.0";

/**
 * Get the storage key for a specific binder
 */
const getStorageKey = (binderId) => `${STORAGE_KEY_PREFIX}${binderId}`;

/**
 * Get pending changes for a binder
 */
export const getPendingChanges = (binderId) => {
  try {
    const data = localStorage.getItem(getStorageKey(binderId));
    if (!data) return null;

    const parsed = JSON.parse(data);

    // Validate structure and version
    if (parsed.version !== STORAGE_VERSION) {
      console.warn("Pending changes version mismatch, clearing data");
      clearPendingChanges(binderId);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error reading pending changes:", error);
    return null;
  }
};

/**
 * Save pending changes for a binder
 */
export const savePendingChanges = (binderId, changes) => {
  try {
    const data = {
      version: STORAGE_VERSION,
      binderId,
      lastModified: new Date().toISOString(),
      ...changes,
    };

    localStorage.setItem(getStorageKey(binderId), JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error saving pending changes:", error);
    return false;
  }
};

/**
 * Clear pending changes for a binder
 */
export const clearPendingChanges = (binderId) => {
  try {
    localStorage.removeItem(getStorageKey(binderId));
    return true;
  } catch (error) {
    console.error("Error clearing pending changes:", error);
    return false;
  }
};

/**
 * Add cards to pending additions with slot assignments
 */
export const addCardsToPending = (binderId, cardsWithSlots) => {
  const existing = getPendingChanges(binderId) || {
    addedCards: [],
    removedCardIds: [],
    updatedCards: [],
    movedCards: [], // Track card movements
    pageMoves: [], // Track page movements as single operations
  };

  // Process each card to add with slot assignment
  const cardsToAdd = cardsWithSlots.map((cardData) => ({
    tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pokemonCardId: cardData.id,
    pageNumber: cardData.assignedSlot?.pageNumber || null,
    slotInPage: cardData.assignedSlot?.slotInPage || null,
    overallSlotNumber: cardData.assignedSlot?.overallSlotNumber || null,
    cardData: {
      name: cardData.name,
      set: cardData.set?.name || "",
      setId: cardData.set?.id || "",
      number: cardData.number || "",
      rarity: cardData.rarity || "",
      images: cardData.images || {},
      tcgplayer: cardData.tcgplayer || {},
      artist: cardData.artist || "",
      cardmarket: cardData.cardmarket || {},
    },
    addedAt: new Date().toISOString(),
    status: "pending",
  }));

  // Allow duplicate cards - each card gets a unique tempId and slot assignment
  const updated = {
    ...existing,
    addedCards: [...existing.addedCards, ...cardsToAdd],
  };

  savePendingChanges(binderId, updated);

  return {
    success: true,
    addedCount: cardsToAdd.length,
    duplicatesSkipped: 0, // No duplicates are skipped now
  };
};

/**
 * Remove a card from pending additions
 */
export const removeCardFromPending = (binderId, tempId) => {
  const existing = getPendingChanges(binderId);
  if (!existing) return false;

  const updated = {
    ...existing,
    addedCards: existing.addedCards.filter((card) => card.tempId !== tempId),
  };

  return savePendingChanges(binderId, updated);
};

/**
 * Get count of pending changes
 */
export const getPendingChangesCount = (binderId) => {
  const changes = getPendingChanges(binderId);
  if (!changes) return 0;

  return (
    (changes.addedCards?.length || 0) +
    (changes.removedCardIds?.length || 0) +
    (changes.updatedCards?.length || 0) +
    (changes.movedCards?.length || 0) +
    (changes.pageMoves?.length || 0)
  );
};

/**
 * Check if there are any pending changes
 */
export const hasPendingChanges = (binderId) => {
  return getPendingChangesCount(binderId) > 0;
};

/**
 * Get all pending card additions (for UI display)
 */
export const getPendingCardAdditions = (binderId) => {
  const changes = getPendingChanges(binderId);
  return changes?.addedCards || [];
};

/**
 * Add a page movement to pending changes (counts as 1 change instead of many card movements)
 */
export const addPageMoveToPending = (binderId, pageMoveData) => {
  const existing = getPendingChanges(binderId) || {
    addedCards: [],
    removedCardIds: [],
    updatedCards: [],
    movedCards: [],
    pageMoves: [],
  };

  const pageMoveEntry = {
    moveId: `pageMove_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fromPagePosition: pageMoveData.fromPagePosition,
    toPagePosition: pageMoveData.toPagePosition,
    affectedCards: pageMoveData.affectedCards, // Array of cards that will be moved
    timestamp: new Date().toISOString(),
    description: `Move page ${pageMoveData.fromPagePosition} to position ${pageMoveData.toPagePosition}`,
  };

  const updated = {
    ...existing,
    pageMoves: [...existing.pageMoves, pageMoveEntry],
  };

  savePendingChanges(binderId, updated);
  return { success: true, moveId: pageMoveEntry.moveId };
};

/**
 * Add a card movement to pending changes
 */
export const addCardMoveToPending = (binderId, moveData) => {
  const existing = getPendingChanges(binderId) || {
    addedCards: [],
    removedCardIds: [],
    updatedCards: [],
    movedCards: [],
    pageMoves: [],
  };

  // Check if this card already has a pending movement
  const existingMoveIndex = existing.movedCards.findIndex(
    (move) => move.cardId === moveData.cardId
  );

  const moveEntry = {
    moveId: `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cardId: moveData.cardId,
    cardName: moveData.cardName,
    fromPosition: {
      pageNumber: moveData.fromPageNumber,
      slotInPage: moveData.fromSlotInPage,
      overallSlotNumber: moveData.fromOverallSlotNumber,
    },
    toPosition: {
      pageNumber: moveData.toPageNumber,
      slotInPage: moveData.toSlotInPage,
      overallSlotNumber: moveData.toOverallSlotNumber,
    },
    moveType: moveData.moveType, // 'move' or 'swap'
    timestamp: new Date().toISOString(),
  };

  const movedCards = [...existing.movedCards];

  if (moveData.moveType === "swap" && moveData.targetCard) {
    // Handle swap - need to update or add both cards
    const targetExistingIndex = movedCards.findIndex(
      (move) => move.cardId === moveData.targetCard.cardId
    );

    // Update or add source card movement
    if (existingMoveIndex >= 0) {
      movedCards[existingMoveIndex] = moveEntry;
    } else {
      movedCards.push(moveEntry);
    }

    // Update or add target card movement
    const targetMoveEntry = {
      moveId: `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardId: moveData.targetCard.cardId,
      cardName: moveData.targetCard.cardName,
      fromPosition: {
        pageNumber: moveData.targetCard.fromPageNumber,
        slotInPage: moveData.targetCard.fromSlotInPage,
        overallSlotNumber: moveData.targetCard.fromOverallSlotNumber,
      },
      toPosition: {
        pageNumber: moveData.targetCard.toPageNumber,
        slotInPage: moveData.targetCard.toSlotInPage,
        overallSlotNumber: moveData.targetCard.toOverallSlotNumber,
      },
      moveType: "swap",
      swapPairId: moveEntry.moveId,
      timestamp: new Date().toISOString(),
    };

    if (targetExistingIndex >= 0) {
      movedCards[targetExistingIndex] = targetMoveEntry;
    } else {
      movedCards.push(targetMoveEntry);
    }
  } else {
    // Simple move - update existing or add new
    if (existingMoveIndex >= 0) {
      // Update existing movement for this card
      movedCards[existingMoveIndex] = moveEntry;
    } else {
      // Add new movement
      movedCards.push(moveEntry);
    }
  }

  const updated = {
    ...existing,
    movedCards,
  };

  savePendingChanges(binderId, updated);
  return { success: true, moveId: moveEntry.moveId };
};

/**
 * Get all pending card movements
 */
export const getPendingCardMoves = (binderId) => {
  const changes = getPendingChanges(binderId);
  return changes?.movedCards || [];
};

/**
 * Get all pending page moves
 */
export const getPendingPageMoves = (binderId) => {
  const changes = getPendingChanges(binderId);
  return changes?.pageMoves || [];
};

/**
 * Clear a specific card movement from pending changes
 */
export const removeCardMoveFromPending = (binderId, moveId) => {
  const existing = getPendingChanges(binderId);
  if (!existing) return false;

  const updated = {
    ...existing,
    movedCards: existing.movedCards.filter((move) => move.moveId !== moveId),
  };

  return savePendingChanges(binderId, updated);
};

/**
 * Get summary of pending changes
 */
export const getPendingChangesSummary = (binderId) => {
  const changes = getPendingChanges(binderId);
  if (!changes) {
    return {
      totalChanges: 0,
      addedCards: 0,
      removedCards: 0,
      updatedCards: 0,
      movedCards: 0,
      pageMoves: 0,
    };
  }

  const addedCards = changes.addedCards?.length || 0;
  const removedCards = changes.removedCardIds?.length || 0;
  const updatedCards = changes.updatedCards?.length || 0;
  const movedCards = changes.movedCards?.length || 0;
  const pageMoves = changes.pageMoves?.length || 0;

  return {
    totalChanges:
      addedCards + removedCards + updatedCards + movedCards + pageMoves,
    addedCards,
    removedCards,
    updatedCards,
    movedCards,
    pageMoves,
    lastModified: changes.lastModified,
  };
};

/**
 * Clear all pending changes for all binders (useful for debugging/reset)
 */
export const clearAllPendingChanges = () => {
  try {
    const keys = Object.keys(localStorage);
    const binderKeys = keys.filter((key) => key.startsWith(STORAGE_KEY_PREFIX));

    binderKeys.forEach((key) => localStorage.removeItem(key));

    return {
      success: true,
      clearedCount: binderKeys.length,
    };
  } catch (error) {
    console.error("Error clearing all pending changes:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = () => {
  try {
    const keys = Object.keys(localStorage);
    const binderKeys = keys.filter((key) => key.startsWith(STORAGE_KEY_PREFIX));

    let totalSize = 0;
    let totalCards = 0;

    binderKeys.forEach((key) => {
      const data = localStorage.getItem(key);
      totalSize += data.length;

      try {
        const parsed = JSON.parse(data);
        totalCards += parsed.addedCards?.length || 0;
      } catch (e) {
        // Skip invalid entries
      }
    });

    return {
      bindersWithPendingChanges: binderKeys.length,
      totalPendingCards: totalCards,
      approximateSize: `${(totalSize / 1024).toFixed(2)} KB`,
      version: STORAGE_VERSION,
    };
  } catch (error) {
    console.error("Error getting storage info:", error);
    return null;
  }
};
