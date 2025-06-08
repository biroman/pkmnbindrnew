import { parseGridSize } from "./gridUtils";
import { getAllLocalCards } from "./localBinderStorage";

/**
 * Simple function to calculate available slots count
 * @param {string} binderId - The binder ID
 * @param {string} gridSize - Grid size (e.g., "4x4")
 * @param {Array} savedCards - Already saved cards from Firebase
 * @param {number} totalPages - Total pages in the binder
 * @returns {number} Number of available slots
 */
export const getAvailableSlotsCount = (
  binderId,
  gridSize,
  savedCards = [],
  totalPages = 1
) => {
  const { totalSlots: slotsPerPage } = parseGridSize(gridSize);
  const localCards = getAllLocalCards(binderId);

  // Calculate actual max page number based on book-style layout
  const actualMaxPage = totalPages === 1 ? 1 : 1 + (totalPages - 1) * 2;
  const totalAvailableSlots = actualMaxPage * slotsPerPage;

  // Create a set of all occupied positions to avoid double-counting
  const occupiedSlots = new Set();

  // Add saved cards
  savedCards.forEach((card) => {
    if (card.pageNumber && card.slotInPage) {
      occupiedSlots.add(`${card.pageNumber}-${card.slotInPage}`);
    }
  });

  // Add local cards
  localCards.forEach((card) => {
    if (card.pageNumber && card.slotInPage) {
      occupiedSlots.add(`${card.pageNumber}-${card.slotInPage}`);
    }
  });

  return Math.max(0, totalAvailableSlots - occupiedSlots.size);
};

/**
 * Utility functions for managing card slot assignments in binders
 */

/**
 * Calculate the next available slots for adding cards to a binder
 * @param {string} binderId - The binder ID
 * @param {number} count - Number of slots needed
 * @param {number} currentPage - Current page being viewed
 * @param {string} gridSize - Grid size (e.g., "3x3")
 * @param {Array} savedCards - Already saved cards from Firebase
 * @param {number} totalPages - Total pages in the binder
 * @param {number} startFromSlot - Optional: start searching from this slot number
 * @returns {Array} Array of slot assignments { pageNumber, slotInPage }
 */
export const getNextAvailableSlots = (
  binderId,
  count,
  currentPage,
  gridSize,
  savedCards = [],
  totalPages = 1,
  startFromSlot = null
) => {
  const { totalSlots: slotsPerPage } = parseGridSize(gridSize);

  // Get all cards (local + saved) to check what's occupied
  const localCards = getAllLocalCards(binderId);
  const allCards = [...savedCards, ...localCards];

  // Simple calculation: if we just need to know if we have enough slots
  // Calculate actual max page number based on book-style layout
  const actualMaxPage = totalPages === 1 ? 1 : 1 + (totalPages - 1) * 2;
  const totalAvailableSlots = actualMaxPage * slotsPerPage;
  const occupiedSlotsCount = allCards.length;
  const availableSlotsCount = totalAvailableSlots - occupiedSlotsCount;

  // If we just need the count (for SlotLimitModal), return early
  if (availableSlotsCount < count) {
    // Return empty array to indicate not enough slots
    return [];
  }

  // If we need specific slot assignments, find them
  const occupiedSlots = new Set();
  allCards.forEach((card) => {
    if (card.pageNumber && card.slotInPage) {
      occupiedSlots.add(`${card.pageNumber}-${card.slotInPage}`);
    }
  });

  const availableSlots = [];

  // Determine starting position
  let page, slot;
  if (startFromSlot) {
    const startPosition = getPageAndSlotFromSlotNumber(startFromSlot, gridSize);
    page = startPosition.pageNumber;
    slot = startPosition.slotInPage;
  } else {
    page = currentPage;
    slot = 1;
  }

  // Find specific available slots
  while (availableSlots.length < count && page <= actualMaxPage) {
    const slotKey = `${page}-${slot}`;

    if (!occupiedSlots.has(slotKey)) {
      availableSlots.push({
        pageNumber: page,
        slotInPage: slot,
        overallSlotNumber: (page - 1) * slotsPerPage + slot,
      });
    }

    slot++;
    if (slot > slotsPerPage) {
      slot = 1;
      page++;
    }
  }

  return availableSlots;
};

/**
 * Get page number and slot in page from overall slot number
 * @param {number} slotNumber - Overall slot number (1-based)
 * @param {string} gridSize - Grid size (e.g., "3x3")
 * @returns {Object} { pageNumber, slotInPage }
 */
export const getPageAndSlotFromSlotNumber = (slotNumber, gridSize) => {
  const { totalSlots: slotsPerPage } = parseGridSize(gridSize);

  const pageNumber = Math.ceil(slotNumber / slotsPerPage);
  const slotInPage = ((slotNumber - 1) % slotsPerPage) + 1;

  return { pageNumber, slotInPage };
};

/**
 * Get overall slot number from page number and slot in page
 * @param {number} pageNumber - Page number (1-based)
 * @param {number} slotInPage - Slot in page (1-based)
 * @param {string} gridSize - Grid size (e.g., "3x3")
 * @returns {number} Overall slot number
 */
export const getSlotNumberFromPageAndSlot = (
  pageNumber,
  slotInPage,
  gridSize
) => {
  const { totalSlots: slotsPerPage } = parseGridSize(gridSize);
  return (pageNumber - 1) * slotsPerPage + slotInPage;
};

/**
 * Check if a specific slot is available
 * @param {number} pageNumber - Page number
 * @param {number} slotInPage - Slot in page
 * @param {string} binderId - Binder ID
 * @param {Array} savedCards - Saved cards (optional, for backwards compatibility)
 * @returns {boolean} True if slot is available
 */
export const isSlotAvailable = (
  pageNumber,
  slotInPage,
  binderId,
  savedCards = []
) => {
  // Get all local cards from the new system
  const localCards = getAllLocalCards(binderId);

  // Check saved cards (from Firebase)
  const hasSavedCard = savedCards.some(
    (card) => card.pageNumber === pageNumber && card.slotInPage === slotInPage
  );

  // Check local cards (from local storage)
  const hasLocalCard = localCards.some(
    (card) => card.pageNumber === pageNumber && card.slotInPage === slotInPage
  );

  return !hasSavedCard && !hasLocalCard;
};

/**
 * Get the starting slot number for a specific page in a spread layout
 * @param {number} currentPage - Current page/spread number
 * @param {string} pageType - "left" or "right" or "single"
 * @param {string} gridSize - Grid size
 * @returns {number} Starting slot number for the page
 */
export const getStartingSlotForPage = (currentPage, pageType, gridSize) => {
  const { totalSlots: slotsPerPage } = parseGridSize(gridSize);

  if (currentPage === 1) {
    // First spread: empty cover (left) + page 1 (right)
    return pageType === "right" ? 1 : 0; // Cover page has no slots
  } else {
    // Subsequent spreads: normal two-page layout
    const leftPageNumber = (currentPage - 1) * 2;
    const rightPageNumber = leftPageNumber + 1;

    if (pageType === "left") {
      return (leftPageNumber - 1) * slotsPerPage + 1;
    } else {
      return (rightPageNumber - 1) * slotsPerPage + 1;
    }
  }
};
