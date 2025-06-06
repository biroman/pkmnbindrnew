/**
 * Reverse Holo Processing Utility
 * Handles the shifting of cards to make space for reverse holo variants
 */

// Rarities that support reverse holo variants
const REVERSE_HOLO_RARITIES = ["Common", "Uncommon", "Rare"];

/**
 * Check if a card is eligible for reverse holo variant
 * @param {Object} card - Card object
 * @returns {boolean} True if card can have reverse holo variant
 */
export const isEligibleForReverseHolo = (card) => {
  if (!card) return false;

  // Check both card.cardData.rarity and card.rarity for flexibility
  const rarity = card.cardData?.rarity || card.rarity;

  if (!rarity) {
    console.log("No rarity found for card:", card);
    return false;
  }

  const isEligible = REVERSE_HOLO_RARITIES.includes(rarity);
  return isEligible;
};

/**
 * Create a reverse holo variant of a card
 * @param {Object} originalCard - Original card object
 * @returns {Object} Reverse holo variant of the card
 */
export const createReverseHoloVariant = (originalCard) => {
  const reverseHoloCard = {
    ...originalCard,
    id: `${originalCard.id}_reverse`,
    isReverseHolo: true,
  };

  // Ensure cardData is properly copied with reverse holo flag
  if (originalCard.cardData) {
    reverseHoloCard.cardData = {
      ...originalCard.cardData,
      isReverseHolo: true,
    };
  } else {
    // If no cardData wrapper, the card properties are directly on the card
    reverseHoloCard.isReverseHolo = true;
  }

  console.log("🌟 Created reverse holo variant:", {
    originalId: originalCard.id,
    reverseId: reverseHoloCard.id,
    hasCardData: !!reverseHoloCard.cardData,
    hasImages: !!(reverseHoloCard.cardData?.images || reverseHoloCard.images),
    cardName: reverseHoloCard.cardData?.name || reverseHoloCard.name,
  });

  return reverseHoloCard;
};

/**
 * Process cards to add reverse holo variants with shifting logic
 * When reverse holo is enabled, for each eligible card:
 * - Card A in slot 1 stays in slot 1
 * - Reverse holo copy of Card A goes to slot 2
 * - Card B (originally in slot 2) moves to slot 3
 * - Reverse holo copy of Card B goes to slot 4
 * - And so on...
 *
 * @param {Array} originalCards - Array of original cards
 * @param {boolean} showReverseHolos - Whether to show reverse holos
 * @param {string} gridSize - Grid size for slot calculations
 * @returns {Array} Processed cards with reverse holos inserted
 */
export const processCardsWithReverseHolos = (
  originalCards,
  showReverseHolos,
  gridSize
) => {
  console.log("🔄 Processing cards with reverse holos:", {
    showReverseHolos,
    originalCardsCount: originalCards?.length || 0,
    gridSize,
  });

  if (!showReverseHolos || !originalCards || originalCards.length === 0) {
    console.log("❌ No processing needed - reverse holos off or no cards");
    return originalCards;
  }

  // Sort cards by overall slot number to maintain proper order
  const sortedCards = [...originalCards].sort((a, b) => {
    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber;
    }
    return a.slotInPage - b.slotInPage;
  });

  console.log(
    "📋 Sorted cards for processing:",
    sortedCards.map((c) => ({
      id: c.id,
      name: c.cardData?.name || c.name,
      rarity: c.cardData?.rarity || c.rarity,
      page: c.pageNumber,
      slot: c.slotInPage,
    }))
  );

  const { totalSlots } = parseGridSize(gridSize);
  const processedCards = [];

  // Sequential slot assignment starting from slot 1
  let currentSlot = 1;
  let currentPage = 1;

  for (const originalCard of sortedCards) {
    // Skip if this is already a reverse holo (shouldn't happen but safety check)
    if (originalCard.isReverseHolo || originalCard.id.includes("_reverse")) {
      console.log("⏭️ Skipping reverse holo card:", originalCard.id);
      continue;
    }

    // Place the original card
    const cardCopy = {
      ...originalCard,
      pageNumber: currentPage,
      slotInPage: currentSlot,
      overallSlotNumber: (currentPage - 1) * totalSlots + currentSlot,
    };
    processedCards.push(cardCopy);

    console.log(
      `📍 Placed original card: ${
        cardCopy.cardData?.name || cardCopy.name
      } at Page ${currentPage}, Slot ${currentSlot}`
    );

    // Move to next slot
    currentSlot++;
    if (currentSlot > totalSlots) {
      console.log(
        `🔄 Page overflow! Moving from Page ${currentPage} to Page ${
          currentPage + 1
        }, Slot 1`
      );
      currentSlot = 1;
      currentPage++;
    }

    // If this card is eligible for reverse holo, add the variant
    if (isEligibleForReverseHolo(originalCard)) {
      const reverseHoloCard = createReverseHoloVariant(originalCard);

      // Place the reverse holo in the next available slot
      reverseHoloCard.pageNumber = currentPage;
      reverseHoloCard.slotInPage = currentSlot;
      reverseHoloCard.overallSlotNumber =
        (currentPage - 1) * totalSlots + currentSlot;

      processedCards.push(reverseHoloCard);
      console.log(
        `⭐ Placed reverse holo: ${
          reverseHoloCard.cardData?.name || reverseHoloCard.name
        } at Page ${currentPage}, Slot ${currentSlot}`
      );

      // Move to next slot
      currentSlot++;
      if (currentSlot > totalSlots) {
        console.log(
          `🔄 Page overflow after reverse holo! Moving from Page ${currentPage} to Page ${
            currentPage + 1
          }, Slot 1`
        );
        currentSlot = 1;
        currentPage++;
      }
    }
  }

  console.log("🎯 Final processed cards:", processedCards.length, "cards");
  console.log(
    "📊 Breakdown:",
    processedCards.map((c) => ({
      id: c.id,
      name: c.cardData?.name || c.name,
      isReverseHolo: c.isReverseHolo || false,
      page: c.pageNumber,
      slot: c.slotInPage,
    }))
  );

  return processedCards;
};

/**
 * Parse grid size to get dimensions
 * @param {string} gridSize - Grid size string like "3x3"
 * @returns {Object} Grid dimensions
 */
const parseGridSize = (gridSize) => {
  const [cols, rows] = gridSize.split("x").map(Number);
  return {
    cols,
    rows,
    totalSlots: cols * rows,
  };
};

/**
 * Remove reverse holo variants from cards
 * @param {Array} cards - Cards that may include reverse holos
 * @returns {Array} Cards without reverse holo variants
 */
export const removeReverseHolos = (cards) => {
  if (!cards) return [];

  return cards.filter(
    (card) => !card.isReverseHolo && !card.id.includes("_reverse")
  );
};

/**
 * Get the original card from a reverse holo variant
 * @param {Object} reverseHoloCard - Reverse holo card
 * @param {Array} allCards - All cards to search in
 * @returns {Object|null} Original card or null if not found
 */
export const getOriginalFromReverseHolo = (reverseHoloCard, allCards) => {
  if (!reverseHoloCard.isReverseHolo) return reverseHoloCard;

  const originalId = reverseHoloCard.id.replace("_reverse", "");
  return allCards.find((card) => card.id === originalId) || null;
};
