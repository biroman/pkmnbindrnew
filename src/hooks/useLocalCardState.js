import { useState, useCallback, useEffect, useRef } from "react";
import { getPendingCardMoves } from "../utils/localBinderStorage";

/**
 * Hook to manage local card state with pending movements
 * Provides immediate UI updates for card movements before Firebase sync
 */
export const useLocalCardState = (savedCards = [], binderId) => {
  const [localCards, setLocalCards] = useState([]);
  const [pendingMovesVersion, setPendingMovesVersion] = useState(0);
  const savedCardsRef = useRef(savedCards);

  // Keep the ref updated with latest saved cards
  savedCardsRef.current = savedCards;

  // Function to apply pending movements to cards
  const applyPendingMovements = useCallback(
    (cards) => {
      if (!binderId || !cards.length) {
        return cards;
      }

      const pendingMoves = getPendingCardMoves(binderId);

      if (pendingMoves.length === 0) {
        return cards;
      }

      return cards.map((card) => {
        const pendingMove = pendingMoves.find(
          (move) => move.cardId === card.id
        );

        if (pendingMove) {
          return {
            ...card,
            pageNumber: pendingMove.toPosition.pageNumber,
            slotInPage: pendingMove.toPosition.slotInPage,
            overallSlotNumber: pendingMove.toPosition.overallSlotNumber,
            isPendingMove: true,
          };
        }

        return card;
      });
    },
    [binderId]
  );

  // Update local cards when pending moves change
  useEffect(() => {
    const currentSavedCards = savedCardsRef.current;
    console.log(
      "useLocalCardState: updating with",
      currentSavedCards.length,
      "saved cards, version:",
      pendingMovesVersion
    );
    const updatedCards = applyPendingMovements(currentSavedCards);
    console.log(
      "useLocalCardState: after applying movements:",
      updatedCards.length,
      "cards"
    );
    setLocalCards(updatedCards);
  }, [applyPendingMovements, pendingMovesVersion]); // Removed savedCards

  // Separate effect to handle when savedCards actually loads for the first time
  useEffect(() => {
    const currentSavedCards = savedCardsRef.current;

    // Only update if we have actual cards and current local cards is empty
    if (currentSavedCards.length > 0 && localCards.length === 0) {
      console.log(
        "useLocalCardState: initial load detected, applying",
        currentSavedCards.length,
        "cards"
      );
      const updatedCards = applyPendingMovements(currentSavedCards);
      setLocalCards(updatedCards);
    }
  }, [savedCards.length, applyPendingMovements, localCards.length]); // Depend on length, not the array itself

  // Function to manually trigger update (used by event listeners)
  const refreshLocalCards = useCallback(() => {
    if (!binderId) return;

    // Increment version to force re-render
    setPendingMovesVersion((prev) => prev + 1);
  }, [binderId]);

  // Listen for storage events and custom card move events to update when new movements are added
  useEffect(() => {
    if (!binderId) return;

    const handleStorageChange = (event) => {
      if (event.key === `pokemon_binder_pending_${binderId}`) {
        refreshLocalCards();
      }
    };

    const handleCardMoved = (event) => {
      if (event.detail.binderId === binderId) {
        refreshLocalCards();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cardMoved", handleCardMoved);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cardMoved", handleCardMoved);
    };
  }, [binderId, refreshLocalCards]);

  // Get cards for a specific page with local movements applied
  const getCardsForPage = useCallback(
    (pageNumber) => {
      return localCards.filter((card) => card.pageNumber === pageNumber);
    },
    [localCards]
  );

  // Check if a card is in a specific slot
  const getCardInSlot = useCallback(
    (pageNumber, slotInPage) => {
      return (
        localCards.find(
          (card) =>
            card.pageNumber === pageNumber && card.slotInPage === slotInPage
        ) || null
      );
    },
    [localCards]
  );

  // Immediately update local state when a move happens (optimistic update)
  const applyLocalMove = useCallback((sourceCard, targetPosition) => {
    setLocalCards((prevCards) => {
      return prevCards.map((card) => {
        if (card.id === sourceCard.id) {
          return {
            ...card,
            pageNumber: targetPosition.pageNumber,
            slotInPage: targetPosition.slotInPage,
            overallSlotNumber: targetPosition.overallSlotNumber,
            isPendingMove: true,
          };
        }
        return card;
      });
    });
  }, []);

  // Immediately update local state for a swap (optimistic update)
  const applyLocalSwap = useCallback(
    (sourceCard, targetCard, sourceTarget, targetTarget) => {
      setLocalCards((prevCards) => {
        return prevCards.map((card) => {
          if (card.id === sourceCard.id) {
            return {
              ...card,
              pageNumber: sourceTarget.pageNumber,
              slotInPage: sourceTarget.slotInPage,
              overallSlotNumber: sourceTarget.overallSlotNumber,
              isPendingMove: true,
            };
          }
          if (card.id === targetCard.id) {
            return {
              ...card,
              pageNumber: targetTarget.pageNumber,
              slotInPage: targetTarget.slotInPage,
              overallSlotNumber: targetTarget.overallSlotNumber,
              isPendingMove: true,
            };
          }
          return card;
        });
      });
    },
    []
  );

  // Clear all pending movements (called after successful sync)
  const clearPendingMoves = useCallback(() => {
    setLocalCards((prevCards) => {
      return prevCards.map((card) => ({
        ...card,
        isPendingMove: false,
      }));
    });
  }, []);

  return {
    localCards,
    getCardsForPage,
    getCardInSlot,
    applyLocalMove,
    applyLocalSwap,
    clearPendingMoves,
  };
};
