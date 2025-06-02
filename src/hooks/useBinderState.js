import { useState, useCallback, useMemo } from "react";
import { parseGridSize } from "../utils/gridUtils";

/**
 * Hook for managing complete binder state
 * @param {string} binderId - Unique binder identifier
 * @param {string} gridSize - Grid size preference
 * @param {Object} options - Additional options
 */
export const useBinderState = (binderId, gridSize = "3x3", options = {}) => {
  const {
    defaultPages = 10, // Default number of page spreads
    autoSave = true,
  } = options;

  const { totalSlots } = parseGridSize(gridSize);
  const slotsPerSpread = totalSlots * 2; // Both pages in a spread

  // State
  const [currentPageSpread, setCurrentPageSpread] = useState(1);
  const [cards, setCards] = useState({}); // { slotNumber: cardData }
  const [totalPageSpreads, setTotalPageSpreads] = useState(defaultPages);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Calculate current page numbers
  const currentPages = useMemo(() => {
    const leftPage = (currentPageSpread - 1) * 2 + 1;
    const rightPage = leftPage + 1;
    return { left: leftPage, right: rightPage };
  }, [currentPageSpread]);

  // Calculate slot ranges for current spread
  const currentSlotRange = useMemo(() => {
    const startSlot = (currentPageSpread - 1) * slotsPerSpread + 1;
    const endSlot = startSlot + slotsPerSpread - 1;
    const leftPageStart = startSlot;
    const leftPageEnd = startSlot + totalSlots - 1;
    const rightPageStart = leftPageEnd + 1;
    const rightPageEnd = endSlot;

    return {
      total: { start: startSlot, end: endSlot },
      leftPage: { start: leftPageStart, end: leftPageEnd },
      rightPage: { start: rightPageStart, end: rightPageEnd },
    };
  }, [currentPageSpread, slotsPerSpread, totalSlots]);

  // Navigation functions
  const goToPageSpread = useCallback(
    (pageSpread) => {
      if (pageSpread >= 1 && pageSpread <= totalPageSpreads) {
        setCurrentPageSpread(pageSpread);
      }
    },
    [totalPageSpreads]
  );

  const nextPageSpread = useCallback(() => {
    if (currentPageSpread < totalPageSpreads) {
      setCurrentPageSpread((prev) => prev + 1);
    }
  }, [currentPageSpread, totalPageSpreads]);

  const previousPageSpread = useCallback(() => {
    if (currentPageSpread > 1) {
      setCurrentPageSpread((prev) => prev - 1);
    }
  }, [currentPageSpread]);

  // Card management functions
  const addCard = useCallback((slotNumber, cardData) => {
    setCards((prev) => ({
      ...prev,
      [slotNumber]: {
        ...cardData,
        slotNumber,
        addedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const removeCard = useCallback((slotNumber) => {
    setCards((prev) => {
      const newCards = { ...prev };
      delete newCards[slotNumber];
      return newCards;
    });
  }, []);

  const moveCard = useCallback((fromSlot, toSlot) => {
    setCards((prev) => {
      const cardToMove = prev[fromSlot];
      if (!cardToMove) return prev;

      const newCards = { ...prev };

      // Remove from old slot
      delete newCards[fromSlot];

      // Add to new slot (if not occupied)
      if (!newCards[toSlot]) {
        newCards[toSlot] = {
          ...cardToMove,
          slotNumber: toSlot,
          movedAt: new Date().toISOString(),
        };
      }

      return newCards;
    });
  }, []);

  const swapCards = useCallback((slot1, slot2) => {
    setCards((prev) => {
      const card1 = prev[slot1];
      const card2 = prev[slot2];

      const newCards = { ...prev };

      if (card1) {
        newCards[slot2] = { ...card1, slotNumber: slot2 };
      } else {
        delete newCards[slot2];
      }

      if (card2) {
        newCards[slot1] = { ...card2, slotNumber: slot1 };
      } else {
        delete newCards[slot1];
      }

      return newCards;
    });
  }, []);

  // Utility functions
  const getCard = useCallback(
    (slotNumber) => {
      return cards[slotNumber] || null;
    },
    [cards]
  );

  const isSlotEmpty = useCallback(
    (slotNumber) => {
      return !cards[slotNumber];
    },
    [cards]
  );

  const getCurrentSpreadCards = useCallback(() => {
    const spreadCards = {};
    for (
      let slot = currentSlotRange.total.start;
      slot <= currentSlotRange.total.end;
      slot++
    ) {
      if (cards[slot]) {
        spreadCards[slot] = cards[slot];
      }
    }
    return spreadCards;
  }, [cards, currentSlotRange]);

  const getTotalCards = useCallback(() => {
    return Object.keys(cards).length;
  }, [cards]);

  const getFilledSlots = useCallback(() => {
    return Object.keys(cards)
      .map(Number)
      .sort((a, b) => a - b);
  }, [cards]);

  // Add more pages if needed
  const addPageSpread = useCallback(() => {
    setTotalPageSpreads((prev) => prev + 1);
  }, []);

  const removeLastPageSpread = useCallback(() => {
    if (totalPageSpreads > 1) {
      // Remove cards from slots that would be deleted
      const slotsToRemove = [];
      const lastSpreadStart = (totalPageSpreads - 1) * slotsPerSpread + 1;
      const lastSpreadEnd = totalPageSpreads * slotsPerSpread;

      for (let slot = lastSpreadStart; slot <= lastSpreadEnd; slot++) {
        if (cards[slot]) {
          slotsToRemove.push(slot);
        }
      }

      if (slotsToRemove.length > 0) {
        setCards((prev) => {
          const newCards = { ...prev };
          slotsToRemove.forEach((slot) => delete newCards[slot]);
          return newCards;
        });
      }

      setTotalPageSpreads((prev) => prev - 1);

      // Move to previous spread if current one was deleted
      if (currentPageSpread >= totalPageSpreads) {
        setCurrentPageSpread(totalPageSpreads - 1);
      }
    }
  }, [totalPageSpreads, currentPageSpread, cards, slotsPerSpread]);

  return {
    // State
    currentPageSpread,
    totalPageSpreads,
    cards,
    isLoading,
    lastSaved,

    // Current context
    currentPages,
    currentSlotRange,

    // Navigation
    goToPageSpread,
    nextPageSpread,
    previousPageSpread,
    canGoNext: currentPageSpread < totalPageSpreads,
    canGoPrevious: currentPageSpread > 1,

    // Card management
    addCard,
    removeCard,
    moveCard,
    swapCards,
    getCard,
    isSlotEmpty,

    // Utilities
    getCurrentSpreadCards,
    getTotalCards,
    getFilledSlots,
    addPageSpread,
    removeLastPageSpread,

    // Stats
    totalSlots: totalPageSpreads * slotsPerSpread,
    filledSlots: getTotalCards(),
    emptySlots: totalPageSpreads * slotsPerSpread - getTotalCards(),
  };
};
