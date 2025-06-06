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

/**
 * Hook to manage local binder state as source of truth
 * No more overlay - local storage IS the current state
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

    // Set local cards from local storage
    setLocalCards(localState.cards || []);
  }, [binderId, firebaseCards.length, preferences]); // Only depend on length to avoid infinite loops

  // Function to refresh local cards from local storage
  const refreshLocalCards = useCallback(() => {
    if (!binderId) return;

    console.log("Refreshing local cards for binderId:", binderId);
    const allCards = getAllLocalCards(binderId);
    console.log("Got cards from local storage:", allCards.length);
    setLocalCards(allCards);
    setRefreshTrigger((prev) => prev + 1);
  }, [binderId]);

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

  // Get cards for a specific page - always fetch fresh to ensure updates
  const getCardsForPage = useCallback(
    (pageNumber) => {
      const cards = getLocalCardsForPage(binderId, pageNumber);
      return cards;
    },
    [binderId, refreshTrigger] // Include refreshTrigger to ensure updates
  );

  // Check if a card is in a specific slot
  const getCardInSlot = useCallback(
    (pageNumber, slotInPage) => {
      const cards = getLocalCardsForPage(binderId, pageNumber);
      return cards.find((card) => card.slotInPage === slotInPage) || null;
    },
    [binderId, refreshTrigger]
  );

  // Move a single card immediately in local storage
  const moveCard = useCallback(
    (cardId, newPosition) => {
      const result = moveCardInLocalBinder(binderId, cardId, newPosition);
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
      const result = moveCardsInLocalBinder(binderId, cardUpdates);
      if (result.success) {
        refreshLocalCards();

        // Dispatch custom event for other components
        window.dispatchEvent(
          new CustomEvent("localBinderUpdate", {
            detail: {
              binderId,
              type: "pageMove",
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
      const result = addCardsToLocalBinder(binderId, cardsToAdd);
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
    // Data
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
