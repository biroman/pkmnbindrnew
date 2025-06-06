import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import {
  bulkAddCardsToBinder,
  batchUpdateCardMovements,
} from "../services/firestore";
import {
  getPendingChanges,
  getPendingChangesSummary,
  getPendingCardAdditions,
  getPendingCardMoves,
  getPendingPageMoves,
  hasPendingChanges,
  clearPendingChanges,
  removeCardFromPending,
} from "../utils/localBinderStorage";

/**
 * Hook to manage pending changes for a specific binder
 * Provides real-time updates and Firebase synchronization capabilities
 */
export const usePendingChanges = (binderId) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [pendingData, setPendingData] = useState(null);
  const [summary, setSummary] = useState({
    totalChanges: 0,
    addedCards: 0,
    removedCards: 0,
    updatedCards: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Function to refresh pending data from localStorage
  const refreshPendingData = useCallback(() => {
    if (!binderId) return;

    const changes = getPendingChanges(binderId);
    const changeSummary = getPendingChangesSummary(binderId);

    setPendingData(changes);
    setSummary(changeSummary);
  }, [binderId]);

  // Listen for localStorage changes (when cards are added from modal)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key?.includes(`pokemon_binder_pending_${binderId}`)) {
        refreshPendingData();
      }
    };

    // Listen for storage events (cross-tab communication)
    window.addEventListener("storage", handleStorageChange);

    // Also refresh on initial load and binderId change
    refreshPendingData();

    // Set up a periodic check for same-tab changes (since storage events don't fire for same-tab changes)
    const intervalId = setInterval(() => {
      refreshPendingData();
    }, 1000); // Check every second

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [binderId, refreshPendingData]);

  // Get pending card additions for display
  const pendingCards = getPendingCardAdditions(binderId);

  // Check if there are pending changes
  const hasChanges = hasPendingChanges(binderId);

  // Remove a specific pending card
  const removePendingCard = useCallback(
    (tempId) => {
      const success = removeCardFromPending(binderId, tempId);
      if (success) {
        refreshPendingData();
      }
      return success;
    },
    [binderId, refreshPendingData]
  );

  // Clear all pending changes
  const clearAllPending = useCallback(() => {
    const success = clearPendingChanges(binderId);
    if (success) {
      refreshPendingData();
    }
    return success;
  }, [binderId, refreshPendingData]);

  // Sync pending changes to Firebase
  const syncToFirebase = useCallback(async () => {
    if (!pendingData || !hasChanges || !currentUser?.uid)
      return { success: true, message: "No changes to sync" };

    setIsSyncing(true);

    try {
      console.log("Starting Firebase sync for binder:", binderId);
      console.log("Pending data:", pendingData);

      // Handle card additions using bulk operation
      if (pendingData.addedCards && pendingData.addedCards.length > 0) {
        console.log(
          `Syncing ${pendingData.addedCards.length} added cards to Firebase using bulk operation`
        );

        // Transform pending cards to the format expected by bulkAddCardsToBinder
        const cardsToAdd = pendingData.addedCards.map((pendingCard) => ({
          cardApiId: pendingCard.pokemonCardId,
          pageNumber: pendingCard.pageNumber,
          slotInPage: pendingCard.slotInPage,
          overallSlotNumber: pendingCard.overallSlotNumber,
          name: pendingCard.cardData.name,
          set: pendingCard.cardData.set || pendingCard.cardData.setId,
          setId: pendingCard.cardData.setId,
          number: pendingCard.cardData.number,
          rarity: pendingCard.cardData.rarity,
          images: pendingCard.cardData.images,
          tcgplayer: pendingCard.cardData.tcgplayer,
          artist: pendingCard.cardData.artist,
          cardmarket: pendingCard.cardData.cardmarket,
        }));

        console.log("Cards to add:", cardsToAdd);

        // Use the bulk operation for efficiency
        const result = await bulkAddCardsToBinder(
          currentUser.uid,
          binderId,
          cardsToAdd
        );

        if (!result.success) {
          throw new Error(result.error || "Failed to add cards to Firebase");
        }

        console.log(
          `Successfully bulk added ${result.addedCount} cards to Firebase`
        );
      }

      // Handle card movements using batch operation
      if (pendingData.movedCards && pendingData.movedCards.length > 0) {
        console.log(
          `Syncing ${pendingData.movedCards.length} card movements to Firebase using batch operation`
        );

        const result = await batchUpdateCardMovements(
          currentUser.uid,
          binderId,
          pendingData.movedCards
        );

        if (!result.success) {
          throw new Error(
            result.error || "Failed to update card movements in Firebase"
          );
        }

        console.log(
          `Successfully batch updated ${result.updatedCount} card movements in Firebase`
        );
      }

      // Handle page movements by converting them to individual card movements
      if (pendingData.pageMoves && pendingData.pageMoves.length > 0) {
        console.log(
          `Syncing ${pendingData.pageMoves.length} page movements to Firebase`
        );

        // Convert page moves to individual card movements
        const allCardMovements = pendingData.pageMoves.flatMap((pageMove) =>
          pageMove.affectedCards.map((card) => ({
            cardId: card.cardId,
            toPosition: {
              pageNumber: card.toPageNumber,
              slotInPage: card.toSlotInPage,
              overallSlotNumber: card.toOverallSlotNumber,
            },
          }))
        );

        if (allCardMovements.length > 0) {
          const result = await batchUpdateCardMovements(
            currentUser.uid,
            binderId,
            allCardMovements
          );

          if (!result.success) {
            throw new Error(
              result.error || "Failed to update page movements in Firebase"
            );
          }

          console.log(
            `Successfully batch updated ${result.updatedCount} card movements from page moves in Firebase`
          );
        }
      }

      // TODO: Handle card removals and updates when implemented
      // if (pendingData.removedCardIds && pendingData.removedCardIds.length > 0) {
      //   // Handle card removals
      // }
      // if (pendingData.updatedCards && pendingData.updatedCards.length > 0) {
      //   // Handle card updates
      // }

      // Invalidate relevant queries to refresh the binder view
      console.log("Invalidating cache to refresh binder view...");

      // Invalidate all binder cards queries for this binder
      await queryClient.invalidateQueries({
        queryKey: ["binderCards", binderId],
      });

      // Also invalidate binder info query if it exists
      await queryClient.invalidateQueries({
        queryKey: ["binder", binderId, currentUser.uid],
      });

      // After successful sync and cache invalidation, clear pending changes
      const clearResult = clearPendingChanges(binderId);
      if (!clearResult) {
        console.warn("Failed to clear pending changes after successful sync");
      }

      refreshPendingData();

      console.log("Firebase sync completed successfully");

      return {
        success: true,
        message: `Successfully synced ${summary.totalChanges} changes`,
      };
    } catch (error) {
      console.error("Error syncing to Firebase:", error);
      return {
        success: false,
        error: error.message || "Failed to sync changes",
      };
    } finally {
      setIsSyncing(false);
    }
  }, [
    pendingData,
    hasChanges,
    currentUser?.uid,
    binderId,
    summary.totalChanges,
    refreshPendingData,
    queryClient,
  ]);

  // Force refresh (useful for manual updates)
  const refresh = useCallback(() => {
    refreshPendingData();
  }, [refreshPendingData]);

  return {
    // Data
    pendingData,
    pendingCards,
    summary,
    hasChanges,

    // States
    isSyncing,

    // Actions
    removePendingCard,
    clearAllPending,
    syncToFirebase,
    refresh,
  };
};
