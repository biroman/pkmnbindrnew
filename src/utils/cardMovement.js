import { getPageAndSlotFromSlotNumber } from "./slotAssignment";
import { addCardMoveToPending } from "./localBinderStorage";

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

    const moveData = {
      cardId: sourceCard.id,
      cardName: sourceCard.name,
      fromPageNumber: sourceCard.pageNumber,
      fromSlotInPage: sourceCard.slotInPage,
      fromOverallSlotNumber: sourceCard.overallSlotNumber,
      toPageNumber: pageNumber,
      toSlotInPage: slotInPage,
      toOverallSlotNumber: targetSlot,
      moveType: "move",
    };

    const result = addCardMoveToPending(binderId, moveData);

    if (result.success) {
      return {
        success: true,
        moveId: result.moveId,
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

    const moveData = {
      cardId: sourceCard.id,
      cardName: sourceCard.name,
      fromPageNumber: sourceCard.pageNumber,
      fromSlotInPage: sourceCard.slotInPage,
      fromOverallSlotNumber: sourceCard.overallSlotNumber,
      toPageNumber: targetPosition.pageNumber,
      toSlotInPage: targetPosition.slotInPage,
      toOverallSlotNumber: targetSlot,
      moveType: "swap",
      targetCard: {
        cardId: targetCard.id,
        cardName: targetCard.name,
        fromPageNumber: targetCard.pageNumber,
        fromSlotInPage: targetCard.slotInPage,
        fromOverallSlotNumber: targetCard.overallSlotNumber,
        toPageNumber: sourcePosition.pageNumber,
        toSlotInPage: sourcePosition.slotInPage,
        toOverallSlotNumber: sourceSlot,
      },
    };

    const result = addCardMoveToPending(binderId, moveData);

    if (result.success) {
      return {
        success: true,
        moveId: result.moveId,
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
    }

    return result;
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
 * @returns {Object} Validation result
 */
export const validateCardMove = (sourceInfo, targetInfo, allCards) => {
  // Can't drop on the same slot
  if (sourceInfo.slot === targetInfo.slot) {
    return { isValid: false, reason: "Cannot drop on the same slot" };
  }

  // Can only drag cards, not empty slots
  if (sourceInfo.type !== "card") {
    return { isValid: false, reason: "Can only drag cards" };
  }

  // Find the source card
  const sourceCard = allCards.find((card) => card.id === sourceInfo.cardId);
  if (!sourceCard) {
    return { isValid: false, reason: "Source card not found" };
  }

  // If target is a card, validate swap
  if (targetInfo.type === "card") {
    const targetCard = allCards.find((card) => card.id === targetInfo.cardId);
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
