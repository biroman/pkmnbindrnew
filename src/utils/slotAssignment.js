import { parseGridSize } from "./gridUtils";
import { getAllLocalCards } from "./localBinderStorage";

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
 * @returns {Array} Array of slot assignments { pageNumber, slotInPage }
 */
export const getNextAvailableSlots = (
  binderId,
  count,
  currentPage,
  gridSize,
  savedCards = [],
  totalPages = 1
) => {
  const { totalSlots: slotsPerPage } = parseGridSize(gridSize);

  // Get all local cards (this includes both saved and pending cards in the new system)
  const localCards = getAllLocalCards(binderId);

  // Create a set of occupied slots for fast lookup
  const occupiedSlots = new Set();

  // Mark saved card slots as occupied (from Firebase)
  savedCards.forEach((card) => {
    if (card.pageNumber && card.slotInPage) {
      occupiedSlots.add(`${card.pageNumber}-${card.slotInPage}`);
    }
  });

  // Mark local card slots as occupied (from local storage)
  localCards.forEach((card) => {
    if (card.pageNumber && card.slotInPage) {
      occupiedSlots.add(`${card.pageNumber}-${card.slotInPage}`);
    }
  });

  const availableSlots = [];

  // Start from current page and work forward
  let page = currentPage;
  let slot = 1;

  while (availableSlots.length < count && page <= totalPages) {
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
