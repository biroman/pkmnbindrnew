import { getPageAndSlotFromSlotNumber } from "./slotAssignment";
import { moveCardInLocalBinder } from "./localBinderStorage";
import { getAllLocalCards } from "./localBinderStorage";

/**
 * Utility functions for handling card movements in binders
 */

/**
 * Move a card from one slot to another (for empty target slots)
 * @param {string} userId - User ID
 * @param {string} binderId - Binder ID
 * @param {Object} sourceCard - The card being moved
 * @param {number} targetSlot - Target slot number
 * @param {string} gridSize - Grid size for calculations
 * @returns {Promise<Object>} Result object with success/error
 */
export const moveCardToSlot = (binderId, sourceCard, targetSlot, gridSize) => {
  try {
    const { pageNumber, slotInPage } = getPageAndSlotFromSlotNumber(
      targetSlot,
      gridSize
    );

    const newPosition = {
      pageNumber,
      slotInPage,
      overallSlotNumber: targetSlot,
    };

    const result = moveCardInLocalBinder(binderId, sourceCard.id, newPosition);

    if (result.success) {
      return {
        success: true,
        changes: [
          {
            type: "move",
            cardId: sourceCard.id,
            cardName: sourceCard.name,
            from: {
              pageNumber: sourceCard.pageNumber,
              slotInPage: sourceCard.slotInPage,
            },
            to: { pageNumber, slotInPage },
          },
        ],
      };
    }

    return result;
  } catch (error) {
    console.error("Error moving card to slot:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Swap two cards between slots
 * @param {string} userId - User ID
 * @param {string} binderId - Binder ID
 * @param {Object} sourceCard - The card being dragged
 * @param {Object} targetCard - The card in the target slot
 * @param {number} sourceSlot - Source slot number
 * @param {number} targetSlot - Target slot number
 * @param {string} gridSize - Grid size for calculations
 * @returns {Promise<Object>} Result object with success/error
 */
export const swapCards = (
  binderId,
  sourceCard,
  targetCard,
  sourceSlot,
  targetSlot,
  gridSize
) => {
  try {
    const sourcePosition = getPageAndSlotFromSlotNumber(sourceSlot, gridSize);
    const targetPosition = getPageAndSlotFromSlotNumber(targetSlot, gridSize);

    // Move source card to target position
    const sourceResult = moveCardInLocalBinder(binderId, sourceCard.id, {
      pageNumber: targetPosition.pageNumber,
      slotInPage: targetPosition.slotInPage,
      overallSlotNumber: targetSlot,
    });

    if (!sourceResult.success) {
      return sourceResult;
    }

    // Move target card to source position
    const targetResult = moveCardInLocalBinder(binderId, targetCard.id, {
      pageNumber: sourcePosition.pageNumber,
      slotInPage: sourcePosition.slotInPage,
      overallSlotNumber: sourceSlot,
    });

    if (!targetResult.success) {
      return targetResult;
    }

    return {
      success: true,
      changes: [
        {
          type: "swap",
          sourceCard: {
            id: sourceCard.id,
            name: sourceCard.name,
            from: {
              pageNumber: sourceCard.pageNumber,
              slotInPage: sourceCard.slotInPage,
            },
            to: {
              pageNumber: targetPosition.pageNumber,
              slotInPage: targetPosition.slotInPage,
            },
          },
          targetCard: {
            id: targetCard.id,
            name: targetCard.name,
            from: {
              pageNumber: targetCard.pageNumber,
              slotInPage: targetCard.slotInPage,
            },
            to: {
              pageNumber: sourcePosition.pageNumber,
              slotInPage: sourcePosition.slotInPage,
            },
          },
        },
      ],
    };
  } catch (error) {
    console.error("Error swapping cards:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate a unique drag ID for a card slot
 * @param {number} slot - Slot number
 * @param {Object} card - Card object (optional)
 * @returns {string} Unique drag ID
 */
export const generateDragId = (slot, card = null) => {
  if (card) {
    return `card-${card.id}-slot-${slot}`;
  }
  return `empty-slot-${slot}`;
};

/**
 * Parse drag ID to extract slot and card information
 * @param {string} dragId - Drag ID string
 * @returns {Object} Parsed information
 */
export const parseDragId = (dragId) => {
  if (dragId.startsWith("card-")) {
    // Handle card IDs that may contain dashes by looking for the '-slot-' delimiter
    const slotIndex = dragId.lastIndexOf("-slot-");
    if (slotIndex !== -1) {
      const cardId = dragId.substring(5, slotIndex); // Remove 'card-' prefix
      const slot = parseInt(dragId.substring(slotIndex + 6)); // Remove '-slot-' and parse number
      return { type: "card", cardId, slot };
    }

    // Fallback to old parsing if '-slot-' delimiter not found
    const parts = dragId.split("-");
    const cardId = parts[1];
    const slot = parseInt(parts[3]);
    return { type: "card", cardId, slot };
  } else if (dragId.startsWith("empty-slot-")) {
    const slot = parseInt(dragId.split("-")[2]);
    return { type: "empty", slot };
  }
  return { type: "unknown" };
};

/**
 * Validate if a card move is allowed
 * @param {Object} sourceInfo - Source drag information
 * @param {Object} targetInfo - Target drag information
 * @param {Array} allCards - All cards in the binder
 * @param {string} binderId - Binder ID (optional, for fallback lookup)
 * @returns {Object} Validation result
 */
export const validateCardMove = (
  sourceInfo,
  targetInfo,
  allCards,
  binderId = null
) => {
  // Can't drop on the same slot
  if (sourceInfo.slot === targetInfo.slot) {
    return { isValid: false, reason: "Cannot drop on the same slot" };
  }

  // Can only drag cards, not empty slots
  if (sourceInfo.type !== "card") {
    return { isValid: false, reason: "Can only drag cards" };
  }

  // Find the source card in the provided array
  let sourceCard = allCards.find((card) => card.id === sourceInfo.cardId);

  // If not found and we have a binderId, try getting fresh data from local storage
  if (!sourceCard && binderId) {
    console.log("Card not found in allCards, checking local storage...");
    const freshCards = getAllLocalCards(binderId);
    sourceCard = freshCards.find((card) => card.id === sourceInfo.cardId);

    if (sourceCard) {
      console.log("Found card in local storage:", sourceCard.id);
    }
  }

  if (!sourceCard) {
    return { isValid: false, reason: "Source card not found" };
  }

  // If target is a card, validate swap
  if (targetInfo.type === "card") {
    let targetCard = allCards.find((card) => card.id === targetInfo.cardId);

    // If not found and we have a binderId, try getting fresh data from local storage
    if (!targetCard && binderId) {
      const freshCards = getAllLocalCards(binderId);
      targetCard = freshCards.find((card) => card.id === targetInfo.cardId);
    }

    if (!targetCard) {
      return { isValid: false, reason: "Target card not found" };
    }
    return {
      isValid: true,
      action: "swap",
      sourceCard,
      targetCard,
    };
  }

  // If target is empty, validate move
  return {
    isValid: true,
    action: "move",
    sourceCard,
  };
};
