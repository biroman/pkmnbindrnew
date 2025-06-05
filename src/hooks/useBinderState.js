import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { parseGridSize } from "../utils/gridUtils";
import {
  getCardsForPages,
  addCardToBinder,
  updateCardInBinder,
  removeCardFromBinder,
  // getAllCardsInBinder, // If needed for other features
} from "../services/firestore";
import { useCacheInvalidation } from "./useCacheInvalidation";

/**
 * Hook for managing the state of cards within a specific binder, connected to Firestore.
 * @param {string} binderId - The ID of the binder.
 * @param {object} binderPreferences - The preferences object for this binder (contains gridSize, pageCount, etc.).
 * @param {number} currentPage - The current single page number being viewed (1-indexed).
 */
export const useBinderState = (binderId, binderPreferences, currentPage) => {
  const { currentUser } = useAuth();
  const { invalidateCardData } = useCacheInvalidation();

  const { gridSize = "3x3", pageCount = 1 } = binderPreferences || {};
  const { totalSlots: slotsPerPage } = parseGridSize(gridSize);

  // Determine the actual page numbers visible in the current spread
  let visiblePageNumbers = [];
  if (pageCount > 0 && currentPage > 0) {
    if (currentPage === 1) {
      // First spread usually shows only actual page 1 on the right
      visiblePageNumbers = [1];
    } else {
      // Subsequent spreads: left page is (spreadNum - 1) * 2, right is left + 1
      const leftActualPage = (currentPage - 1) * 2;
      const rightActualPage = leftActualPage + 1;

      if (leftActualPage <= pageCount) {
        visiblePageNumbers.push(leftActualPage);
      }
      if (rightActualPage <= pageCount) {
        visiblePageNumbers.push(rightActualPage);
      }
    }
    // Ensure no duplicates and pages are valid
    visiblePageNumbers = [...new Set(visiblePageNumbers)].filter((p) => p > 0);
  }

  // **OPTIMIZED**: Calculate a range of pages to fetch (current + adjacent) to reduce requests
  const pageRange = useMemo(() => {
    if (!pageCount || pageCount <= 0) return [];

    // Fetch a window of pages around the current view to reduce Firebase requests
    const windowSize = 4; // Fetch 4 pages at a time (2 before, current spread, 1 after)
    const minPage = Math.max(1, Math.min(...visiblePageNumbers) - 1);
    const maxPage = Math.min(pageCount, Math.max(...visiblePageNumbers) + 1);

    const rangeTofetch = [];
    for (
      let i = minPage;
      i <= maxPage && rangeTofetch.length < windowSize;
      i++
    ) {
      rangeTofetch.push(i);
    }

    return rangeTofetch;
  }, [visiblePageNumbers, pageCount]);

  const {
    data: queryResult, // Rename to avoid conflict with error, isLoading from hook itself
    isLoading,
    error,
    refetch,
  } = useQuery({
    // **OPTIMIZED**: Use page range in query key to cache broader page ranges
    queryKey: [
      "binderCards",
      binderId,
      currentUser?.uid,
      pageRange.join(","), // Only changes when we need to fetch different page ranges
    ],
    queryFn: async () => {
      if (!currentUser?.uid || !binderId || pageRange.length === 0) {
        return { success: true, cards: [], error: null };
      }
      if (!binderPreferences || typeof pageCount !== "number") {
        console.warn(
          "useBinderState: Preferences (or pageCount) not fully loaded. Skipping card fetch."
        );
        return { success: true, cards: [], error: "Preferences not loaded" };
      }

      console.log(
        `🔥 OPTIMIZED: Fetching cards for binder ${binderId}, page range: ${pageRange} (visible: ${visiblePageNumbers})`
      );
      return getCardsForPages(currentUser.uid, binderId, pageRange);
    },
    enabled:
      !!currentUser?.uid &&
      !!binderId &&
      pageRange.length > 0 &&
      !!binderPreferences &&
      typeof pageCount === "number",
    staleTime: 1000 * 60 * 5, // **OPTIMIZED**: 5 minutes - aggressive caching
    gcTime: 1000 * 60 * 10, // **OPTIMIZED**: Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // **OPTIMIZED**: Don't refetch on window focus
    refetchOnMount: false, // **OPTIMIZED**: Don't refetch on remount if data exists
    // keepPreviousData: true, // Consider for smoother transitions if needed
  });

  // **OPTIMIZED**: Filter fetched cards to only show cards for currently visible pages
  const allFetchedCards = queryResult?.success ? queryResult.cards || [] : [];
  const visibleCards = allFetchedCards.filter((card) =>
    visiblePageNumbers.includes(card.pageNumber)
  );
  const fetchError = queryResult?.error || error; // Combine query error with service error

  // Mutations with comprehensive cache invalidation
  const mutationOptions = {
    onSuccess: () => {
      // Use centralized cache invalidation for card operations
      invalidateCardData(currentUser.uid, binderId);
    },
  };

  const addCardMutation = useMutation({
    mutationFn: (cardData) =>
      addCardToBinder(currentUser.uid, binderId, cardData),
    ...mutationOptions,
  });

  const removeCardMutation = useMutation({
    mutationFn: (cardEntryId) =>
      removeCardFromBinder(currentUser.uid, binderId, cardEntryId),
    ...mutationOptions,
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ cardEntryId, updates }) =>
      updateCardInBinder(currentUser.uid, binderId, cardEntryId, updates),
    ...mutationOptions,
  });

  // Assign cards to their respective pages for the spread
  // This assumes `currentPage` aligns with the logic in `getVisiblePageNumbers`
  let cardsOnPage1 = [];
  let cardsOnPage2 = [];

  if (visiblePageNumbers.length > 0) {
    if (currentPage === 1) {
      cardsOnPage1 = visibleCards.filter((card) => card.pageNumber === 1);
    } else {
      const leftActualPage = (currentPage - 1) * 2;
      const rightActualPage = leftActualPage + 1;
      cardsOnPage1 = visibleCards.filter(
        (card) => card.pageNumber === leftActualPage
      );
      cardsOnPage2 = visibleCards.filter(
        (card) => card.pageNumber === rightActualPage
      );
    }
  }

  // Helper to get card in a specific slot (pageNumber is actual page, not spread number)
  const getCardInSlot = (actualPageNumber, slotInPage) => {
    return (
      allFetchedCards.find(
        // Use allFetchedCards (broader range) for slot checking
        (card) =>
          card.pageNumber === actualPageNumber && card.slotInPage === slotInPage
      ) || null
    );
  };

  const isSlotEmpty = (actualPageNumber, slotInPage) => {
    return !getCardInSlot(actualPageNumber, slotInPage);
  };

  // Recalculate totalSlots based on actual pageCount from preferences
  const totalPossibleSlots = pageCount * slotsPerPage;

  return {
    cardsOnPage1,
    cardsOnPage2,
    allVisibleCards: visibleCards, // **OPTIMIZED**: Return only visible cards, not the broader range
    isLoading,
    error: fetchError,
    refetchCards: refetch,
    addCard: addCardMutation.mutateAsync,
    removeCard: removeCardMutation.mutateAsync,
    moveCard: updateCardMutation.mutateAsync,
    getCardInSlot,
    isSlotEmpty,
    isAddingCard: addCardMutation.isLoading,
    isRemovingCard: removeCardMutation.isLoading,
    isUpdatingCard: updateCardMutation.isLoading,
    slotsPerPage,
    totalPossibleSlots, // Total slots in the entire binder based on pageCount
  };
};
