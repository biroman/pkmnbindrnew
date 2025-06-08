import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { getAllCardsInBinder } from "../services/firestore";
import {
  getLocalBinderState,
  initializeLocalBinderState,
  getAllLocalCards,
  getLocalCardsForPage,
  moveCardInLocalBinder,
  moveCardsInLocalBinder,
  addCardsToLocalBinder,
  needsSync,
  saveLocalBinderState,
} from "../utils/localBinderStorage";

/**
 * Hook to manage local binder state as source of truth
 * Simplified approach: Local storage contains ALL cards, including reverse holos
 * No more complex processing - what's in local storage IS what's displayed
 */
export const useLocalCardState = (
  firebaseCards = [],
  binderId,
  preferences = {}
) => {
  const { currentUser } = useAuth();
  const [localCards, setLocalCards] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if local storage is empty and we need to fetch all cards from Firebase
  const localState = getLocalBinderState(binderId);
  const isLocalEmpty =
    !localState || !localState.cards || localState.cards.length === 0;
  const needsAllCards = Boolean(isLocalEmpty && binderId && currentUser?.uid);

  // Fetch ALL cards from Firebase if local storage is empty (incognito scenario)
  const { data: allFirebaseCardsResult } = useQuery({
    queryKey: ["allBinderCards", binderId, currentUser?.uid],
    queryFn: async () => {
      console.log("🔥 FETCHING ALL CARDS for initialization:", binderId);
      return getAllCardsInBinder(currentUser.uid, binderId);
    },
    enabled: needsAllCards,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Use all cards from Firebase if available, otherwise use visible cards
  const cardsForInitialization =
    needsAllCards && allFirebaseCardsResult?.success
      ? allFirebaseCardsResult.data || []
      : firebaseCards;

  // Initialize local state when Firebase data loads for the first time
  useEffect(() => {
    if (!binderId) return;

    console.log("Initializing local state with cards:", {
      binderId,
      cardsCount: cardsForInitialization.length,
      isLocalEmpty,
      needsAllCards,
      source: needsAllCards ? "getAllCardsInBinder" : "useBinderState",
    });

    // Initialize from Firebase data if needed
    // Pass the full preferences object which includes pageCount, binderName, etc.
    initializeLocalBinderState(binderId, cardsForInitialization, preferences);

    // Load cards from local storage
    const cards = getAllLocalCards(binderId);
    setLocalCards(cards);
  }, [
    binderId,
    cardsForInitialization.length,
    preferences.showReverseHolos,
    preferences.pageCount,
    preferences.updatedAt,
    preferences.lastModified,
  ]);

  // Function to refresh local cards from local storage
  const refreshLocalCards = useCallback(() => {
    if (!binderId) return;

    console.log("Refreshing local cards for binderId:", binderId);
    const cards = getAllLocalCards(binderId);
    console.log("Got cards from local storage:", cards.length);

    setLocalCards(cards);
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
        refreshLocalCards();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localBinderUpdate", handleLocalBinderUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localBinderUpdate", handleLocalBinderUpdate);
    };
  }, [binderId, refreshLocalCards]);

  // Handle reverse holo toggle - directly modify local storage
  useEffect(() => {
    if (!binderId) return;

    const toggleReverseHolos = () => {
      const localState = getLocalBinderState(binderId);
      if (!localState) return;

      const showReverseHolos = preferences.showReverseHolos;
      const currentCards = localState.cards || [];

      if (showReverseHolos) {
        // Check if we already have reverse holos (avoid double processing)
        const hasReverseHolos = currentCards.some(
          (card) => card.isReverseHolo || card.id.includes("_reverse")
        );

        if (hasReverseHolos) {
          console.log("Reverse holos already present, skipping processing");
          return;
        }

        console.log("Adding reverse holos using clean rebuild approach");

        // Step 1: Gather all cards from entire binder into single ordered list
        const allOriginalCards = currentCards
          .filter(
            (card) => !card.isReverseHolo && !card.id.includes("_reverse")
          )
          .sort((a, b) => {
            if (a.pageNumber !== b.pageNumber) {
              return a.pageNumber - b.pageNumber;
            }
            return a.slotInPage - b.slotInPage;
          });

        console.log(
          `Step 1: Gathered ${allOriginalCards.length} original cards`
        );

        // Step 2: Create new expanded list with reverse holos
        const expandedList = [];
        for (const card of allOriginalCards) {
          // Store original position for restoration later
          const cardWithOriginalPos = {
            ...card,
            _originalPosition: {
              pageNumber: card.pageNumber,
              slotInPage: card.slotInPage,
              overallSlotNumber: card.overallSlotNumber,
            },
          };

          // Add the original card
          expandedList.push(cardWithOriginalPos);

          // If eligible for reverse holo, add it right after
          if (isEligibleForReverseHolo(card)) {
            const reverseCard = {
              ...card,
              id: `${card.id}_reverse`,
              isReverseHolo: true,
            };

            // Ensure cardData has reverse holo flag
            if (reverseCard.cardData) {
              reverseCard.cardData = {
                ...reverseCard.cardData,
                isReverseHolo: true,
              };
            }

            expandedList.push(reverseCard);
          }
        }

        console.log(
          `Step 2: Created expanded list with ${expandedList.length} cards`
        );

        // Step 3: Wipe pages clean and Step 4: Pour back into pages and slots
        const { totalSlots } = parseGridSize(preferences.gridSize || "3x3");
        const finalCards = [];
        let currentSlot = 1;
        let currentPage = 1;

        for (const card of expandedList) {
          const repositionedCard = {
            ...card,
            pageNumber: currentPage,
            slotInPage: currentSlot,
            overallSlotNumber: (currentPage - 1) * totalSlots + currentSlot,
          };

          finalCards.push(repositionedCard);

          // Move to next slot
          currentSlot++;
          if (currentSlot > totalSlots) {
            currentSlot = 1;
            currentPage++;
          }
        }

        console.log(
          `Step 3 & 4: Repositioned all cards across ${currentPage} pages`
        );

        // Save the new card arrangement
        saveLocalBinderState(binderId, {
          ...localState,
          cards: finalCards,
        });
      } else {
        // Remove reverse holos and restore original positions
        const originalCards = currentCards.filter(
          (card) => !card.isReverseHolo && !card.id.includes("_reverse")
        );

        // Restore cards to their original positions if stored, otherwise keep current position
        const restoredCards = originalCards.map((card) => {
          if (card._originalPosition) {
            // Restore to original position
            const { _originalPosition, ...cardWithoutOriginalPosition } = card;
            return {
              ...cardWithoutOriginalPosition,
              pageNumber: _originalPosition.pageNumber,
              slotInPage: _originalPosition.slotInPage,
              overallSlotNumber: _originalPosition.overallSlotNumber,
            };
          } else {
            // Keep current position if no original position stored
            return card;
          }
        });

        // Save the restored cards
        saveLocalBinderState(binderId, {
          ...localState,
          cards: restoredCards,
        });
      }

      // Refresh the UI
      refreshLocalCards();
    };

    toggleReverseHolos();
  }, [
    preferences.showReverseHolos,
    preferences.gridSize,
    binderId,
    refreshLocalCards,
  ]);

  // Get cards for a specific page
  const getCardsForPage = useCallback(
    (pageNumber) => {
      return getLocalCardsForPage(binderId, pageNumber);
    },
    [binderId]
  );

  // Get card in a specific slot
  const getCardInSlot = useCallback(
    (pageNumber, slotInPage) => {
      return localCards.find(
        (card) =>
          card.pageNumber === pageNumber && card.slotInPage === slotInPage
      );
    },
    [localCards]
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

  // Move multiple cards immediately in local storage
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

// Helper function to check if card is eligible for reverse holo
const isEligibleForReverseHolo = (card) => {
  if (!card) return false;

  const rarity = card.cardData?.rarity || card.rarity;
  if (!rarity) return false;

  const REVERSE_HOLO_RARITIES = ["Common", "Uncommon", "Rare"];
  return REVERSE_HOLO_RARITIES.includes(rarity);
};

// Helper function to parse grid size
const parseGridSize = (gridSize) => {
  const [cols, rows] = gridSize.split("x").map(Number);
  return {
    cols,
    rows,
    totalSlots: cols * rows,
  };
};
