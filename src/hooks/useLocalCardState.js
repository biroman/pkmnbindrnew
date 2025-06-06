import { useState, useCallback, useEffect } from "react";
import {
  getLocalBinderState,
  initializeLocalBinderState,
  getAllLocalCards,
  getLocalCardsForPage,
  moveCardInLocalBinder,
  moveCardsInLocalBinder,
  addCardsToLocalBinder,
  needsSync,
} from "../utils/localBinderStorage";
import {
  processCardsWithReverseHolos,
  removeReverseHolos,
} from "../utils/reverseHoloProcessor";

/**
 * Hook to manage local binder state as source of truth
 * No more overlay - local storage IS the current state
 * Now includes reverse holo processing
 */
export const useLocalCardState = (
  firebaseCards = [],
  binderId,
  preferences = {}
) => {
  const [localCards, setLocalCards] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize local state when Firebase data loads for the first time
  useEffect(() => {
    if (!binderId) return;

    // Initialize from Firebase data if needed
    const localState = initializeLocalBinderState(
      binderId,
      firebaseCards,
      preferences
    );

    // Get raw cards from local storage (without reverse holos)
    const rawCards = localState.cards || [];

    // Process cards with reverse holo logic if enabled
    const processedCards = processCardsWithReverseHolos(
      rawCards,
      preferences.showReverseHolos,
      preferences.gridSize || "3x3"
    );

    // Set local cards from processed result
    setLocalCards(processedCards);
  }, [
    binderId,
    firebaseCards.length,
    preferences.showReverseHolos,
    preferences.gridSize,
  ]); // Include reverse holo preferences

  // Function to refresh local cards from local storage
  const refreshLocalCards = useCallback(() => {
    if (!binderId) return;

    console.log("Refreshing local cards for binderId:", binderId);
    const rawCards = getAllLocalCards(binderId);
    console.log("Got raw cards from local storage:", rawCards.length);

    // Process cards with reverse holo logic if enabled
    const processedCards = processCardsWithReverseHolos(
      rawCards,
      preferences.showReverseHolos,
      preferences.gridSize || "3x3"
    );

    console.log("Processed cards with reverse holos:", processedCards.length);
    setLocalCards(processedCards);
    setRefreshTrigger((prev) => prev + 1);
  }, [binderId, preferences.showReverseHolos, preferences.gridSize]);

  // Listen for storage events to update when local storage changes
  useEffect(() => {
    if (!binderId) return;

    const handleStorageChange = (event) => {
      if (event.key?.includes(`pokemon_binder_${binderId}`)) {
        refreshLocalCards();
      }
    };

    const handleLocalBinderUpdate = (event) => {
      console.log("LocalBinderUpdate event received:", {
        eventBinderId: event.detail?.binderId,
        currentBinderId: binderId,
        eventType: event.detail?.type,
      });

      if (event.detail?.binderId === binderId) {
        console.log("Event matches binderId, refreshing local cards...");

        // Force immediate refresh for revert events
        if (event.detail?.type === "revert") {
          console.log("Revert event detected, forcing immediate state update");

          // Get fresh data immediately
          const freshCards = getAllLocalCards(binderId);
          console.log("Setting fresh cards from revert:", freshCards.length);
          setLocalCards(freshCards);
          setRefreshTrigger((prev) => prev + 1);
        }

        refreshLocalCards();
      } else {
        console.log("Event binderId does not match, ignoring");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localBinderUpdate", handleLocalBinderUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localBinderUpdate", handleLocalBinderUpdate);
    };
  }, [binderId, refreshLocalCards]);

  // Listen for preference changes to reprocess cards
  useEffect(() => {
    if (binderId) {
      refreshLocalCards();
    }
  }, [preferences.showReverseHolos, preferences.gridSize, refreshLocalCards]);

  // Get cards for a specific page (processed with reverse holos)
  const getCardsForPage = useCallback(
    (pageNumber) => {
      if (!binderId) return [];

      console.log(
        `getCardsForPage called for binderId: ${binderId}, pageNumber: ${pageNumber}`
      );

      // Get ALL local cards first (not just for this page)
      const allRawCards = getAllLocalCards(binderId);

      // Process ALL cards with reverse holos if enabled
      const processedCards = processCardsWithReverseHolos(
        allRawCards,
        preferences.showReverseHolos,
        preferences.gridSize || "3x3"
      );

      // Filter for the specific page from processed cards
      const pageCards = processedCards.filter(
        (card) => card.pageNumber === pageNumber
      );

      return pageCards;
    },
    [
      binderId,
      refreshTrigger,
      preferences.showReverseHolos,
      preferences.gridSize,
    ] // Include refreshTrigger to ensure updates
  );

  // Check if a card is in a specific slot (processed cards)
  const getCardInSlot = useCallback(
    (pageNumber, slotInPage) => {
      const cards = getCardsForPage(pageNumber);
      return cards.find((card) => card.slotInPage === slotInPage) || null;
    },
    [getCardsForPage]
  );

  // Move a single card immediately in local storage
  // Note: When moving reverse holo cards, we need to handle them specially
  const moveCard = useCallback(
    (cardId, newPosition) => {
      // If moving a reverse holo card, we need to remove it from processing
      // and just work with the original card
      let actualCardId = cardId;
      if (cardId.includes("_reverse")) {
        // For reverse holo cards, we don't allow individual moves
        // They should move with their original card
        console.warn("Cannot move reverse holo cards individually");
        return {
          success: false,
          error: "Cannot move reverse holo cards individually",
        };
      }

      const result = moveCardInLocalBinder(binderId, actualCardId, newPosition);
      if (result.success) {
        refreshLocalCards();

        // Dispatch custom event for other components
        window.dispatchEvent(
          new CustomEvent("localBinderUpdate", {
            detail: { binderId, type: "cardMove" },
          })
        );
      }
      return result;
    },
    [binderId, refreshLocalCards]
  );

  // Move multiple cards immediately in local storage (for page reordering)
  const moveCards = useCallback(
    (cardUpdates) => {
      // Filter out reverse holo cards from updates since they're automatically generated
      const filteredUpdates = cardUpdates.filter(
        (update) => !update.cardId.includes("_reverse")
      );

      const result = moveCardsInLocalBinder(binderId, filteredUpdates);
      if (result.success) {
        refreshLocalCards();

        // Dispatch custom event for other components
        window.dispatchEvent(
          new CustomEvent("localBinderUpdate", {
            detail: {
              binderId,
              type: "cardsMove",
              updatedCount: result.updatedCount,
            },
          })
        );
      }
      return result;
    },
    [binderId, refreshLocalCards]
  );

  // Add cards immediately to local storage
  const addCards = useCallback(
    (cardsToAdd) => {
      // Remove any reverse holo variants from cards being added
      // since they'll be generated automatically
      const cleanedCards = removeReverseHolos(cardsToAdd);

      const result = addCardsToLocalBinder(binderId, cleanedCards);
      if (result.success) {
        refreshLocalCards();

        // Dispatch custom event for other components
        window.dispatchEvent(
          new CustomEvent("localBinderUpdate", {
            detail: {
              binderId,
              type: "cardsAdded",
              addedCount: result.addedCount,
            },
          })
        );
      }
      return result;
    },
    [binderId, refreshLocalCards]
  );

  // Check if changes need syncing
  const hasUnsyncedChanges = useCallback(() => {
    return needsSync(binderId);
  }, [binderId]);

  return {
    // Data - now includes processed cards with reverse holos
    localCards,

    // Functions
    getCardsForPage,
    getCardInSlot,
    moveCard,
    moveCards,
    addCards,
    refreshLocalCards,
    hasUnsyncedChanges,

    // State indicators
    needsSync: hasUnsyncedChanges(),
  };
};
