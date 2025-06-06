import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import {
  getLocalBinderState,
  setSyncStatus,
  needsSync,
  revertToFirebaseState,
} from "../utils/localBinderStorage";
import {
  updateBinder,
  bulkAddCardsToBinder,
  batchUpdateCardMovements,
} from "../services/firestore";

/**
 * Hook to sync local binder state to Firebase
 * Replaces the old pending changes system with a complete state sync
 */
export const useBinderSync = (binderId) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync complete local state to Firebase
  const syncToFirebase = useCallback(async () => {
    if (!binderId || !currentUser?.uid) {
      return { success: false, error: "Missing required parameters" };
    }

    const localState = getLocalBinderState(binderId);
    if (!localState) {
      return { success: false, error: "No local state found" };
    }

    if (!needsSync(binderId)) {
      return { success: true, message: "No changes to sync" };
    }

    setIsSyncing(true);

    let newCards = [];
    let existingCardMoves = [];

    try {
      console.log("Syncing complete binder state to Firebase...");
      console.log("Local state:", localState);

      // Update binder preferences if they exist
      if (
        localState.preferences &&
        Object.keys(localState.preferences).length > 0
      ) {
        console.log("Updating binder preferences...");
        const preferencesResult = await updateBinder(
          currentUser.uid,
          binderId,
          localState.preferences
        );

        if (!preferencesResult.success) {
          throw new Error(
            preferencesResult.error || "Failed to update binder preferences"
          );
        }
      }

      // Sync all cards - distinguish between new cards and position updates
      if (localState.cards && localState.cards.length > 0) {
        console.log(`Syncing ${localState.cards.length} cards...`);

        // Separate new cards from existing cards based on ID patterns
        // New cards have complex IDs like "sv10-13_1749239586254_8w1jkho1x"
        // Existing cards have Firebase document IDs (simple alphanumeric)

        localState.cards.forEach((card) => {
          // Check if this looks like a new card (has underscore and timestamp)
          if (card.id.includes("_") && card.id.match(/_\d{13}_/)) {
            // This is a new card that needs to be added to Firebase
            // Extract the original card data and ensure required fields are present
            const originalCard = card.cardData || card;

            console.log("Processing new card for Firebase:", {
              cardId: card.id,
              originalCard,
              hasCardApiId: !!originalCard.cardApiId,
              hasId: !!originalCard.id,
              hasName: !!originalCard.name,
              hasImage: !!originalCard.image,
              hasImages: !!originalCard.images,
              imagesStructure: originalCard.images,
            });

            // Build clean card data without undefined values
            const cleanCardData = {
              // Required fields for Firebase validation
              cardApiId: originalCard.cardApiId || originalCard.id, // Use original ID as cardApiId if missing
              name: originalCard.name,

              // Position information (required for binder)
              pageNumber: card.pageNumber,
              slotInPage: card.slotInPage,
              overallSlotNumber: card.overallSlotNumber,

              // Include value with default
              value: originalCard.value || 0,
            };

            // Add optional fields only if they exist and are not undefined
            if (originalCard.set !== undefined)
              cleanCardData.set = originalCard.set;
            if (originalCard.series !== undefined)
              cleanCardData.series = originalCard.series;

            // Handle image data - Pokemon TCG API uses images.large and images.small
            if (originalCard.image !== undefined) {
              cleanCardData.image = originalCard.image;
            } else if (originalCard.images?.large) {
              cleanCardData.image = originalCard.images.large;
            } else if (originalCard.images?.small) {
              cleanCardData.image = originalCard.images.small;
            }

            // Also store the full images object if it exists
            if (originalCard.images !== undefined)
              cleanCardData.images = originalCard.images;
            if (originalCard.rarity !== undefined)
              cleanCardData.rarity = originalCard.rarity;
            if (originalCard.supertype !== undefined)
              cleanCardData.supertype = originalCard.supertype;
            if (originalCard.subtypes !== undefined)
              cleanCardData.subtypes = originalCard.subtypes;
            if (originalCard.number !== undefined)
              cleanCardData.number = originalCard.number;
            if (originalCard.artist !== undefined)
              cleanCardData.artist = originalCard.artist;
            if (originalCard.hp !== undefined)
              cleanCardData.hp = originalCard.hp;
            if (originalCard.types !== undefined)
              cleanCardData.types = originalCard.types;
            if (originalCard.evolvesFrom !== undefined)
              cleanCardData.evolvesFrom = originalCard.evolvesFrom;
            if (originalCard.attacks !== undefined)
              cleanCardData.attacks = originalCard.attacks;
            if (originalCard.weaknesses !== undefined)
              cleanCardData.weaknesses = originalCard.weaknesses;
            if (originalCard.resistances !== undefined)
              cleanCardData.resistances = originalCard.resistances;
            if (originalCard.retreatCost !== undefined)
              cleanCardData.retreatCost = originalCard.retreatCost;
            if (originalCard.convertedRetreatCost !== undefined)
              cleanCardData.convertedRetreatCost =
                originalCard.convertedRetreatCost;
            if (originalCard.rules !== undefined)
              cleanCardData.rules = originalCard.rules;
            if (originalCard.flavorText !== undefined)
              cleanCardData.flavorText = originalCard.flavorText;
            if (originalCard.nationalPokedexNumbers !== undefined)
              cleanCardData.nationalPokedexNumbers =
                originalCard.nationalPokedexNumbers;
            if (originalCard.legalities !== undefined)
              cleanCardData.legalities = originalCard.legalities;
            if (originalCard.tcgplayer !== undefined)
              cleanCardData.tcgplayer = originalCard.tcgplayer;
            if (originalCard.cardmarket !== undefined)
              cleanCardData.cardmarket = originalCard.cardmarket;

            console.log("Clean card data for Firebase:", cleanCardData);
            newCards.push(cleanCardData);
          } else {
            // This is an existing card that may have moved
            existingCardMoves.push({
              cardId: card.id,
              toPosition: {
                pageNumber: card.pageNumber,
                slotInPage: card.slotInPage,
                overallSlotNumber: card.overallSlotNumber,
              },
            });
          }
        });

        console.log(
          `Found ${newCards.length} new cards and ${existingCardMoves.length} existing card positions to sync`
        );

        // Add new cards first
        if (newCards.length > 0) {
          console.log("Adding new cards to Firebase...");
          const addResult = await bulkAddCardsToBinder(
            currentUser.uid,
            binderId,
            newCards
          );

          if (!addResult.success) {
            throw new Error(addResult.error || "Failed to add new cards");
          }

          console.log(`Successfully added ${addResult.addedCount} new cards`);
        }

        // Update positions for existing cards
        if (existingCardMoves.length > 0) {
          console.log("Updating positions for existing cards...");
          const moveResult = await batchUpdateCardMovements(
            currentUser.uid,
            binderId,
            existingCardMoves
          );

          if (!moveResult.success) {
            throw new Error(
              moveResult.error || "Failed to update card positions"
            );
          }

          console.log(
            `Successfully updated ${existingCardMoves.length} card positions`
          );
        }
      }

      // Invalidate relevant queries to refresh the UI
      console.log("Invalidating cache to refresh binder view...");

      await queryClient.invalidateQueries({
        queryKey: ["binderCards", binderId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["binder", binderId, currentUser.uid],
      });

      // Mark as synced
      setSyncStatus(binderId, {
        needsSync: false,
        lastSynced: new Date().toISOString(),
      });

      console.log("Firebase sync completed successfully");

      const totalSynced =
        (newCards?.length || 0) + (existingCardMoves?.length || 0);
      return {
        success: true,
        message: `Successfully synced ${totalSynced} cards to Firebase`,
        newCardsAdded: newCards?.length || 0,
        cardPositionsUpdated: existingCardMoves?.length || 0,
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
  }, [binderId, currentUser?.uid, queryClient]);

  // Revert local changes back to Firebase state
  const revertToFirebase = useCallback(async () => {
    if (!binderId || !currentUser?.uid) {
      return { success: false, error: "Missing required parameters" };
    }

    try {
      console.log("Reverting local changes to Firebase state...");

      // Invalidate and refetch fresh data from Firebase
      await queryClient.invalidateQueries({
        queryKey: ["binderCards", binderId],
      });

      // Get all cached Firebase data (need to search through all page ranges)
      const queryCache = queryClient.getQueryCache();
      const allQueries = queryCache.getAll();

      // Find all queries that match our binder
      const binderQueries = allQueries.filter((query) => {
        const key = query.queryKey;
        return (
          Array.isArray(key) &&
          key[0] === "binderCards" &&
          key[1] === binderId &&
          key[2] === currentUser.uid
        );
      });

      console.log(`Found ${binderQueries.length} cached binder queries`);

      // Collect all cards from all page ranges
      let allFirebaseCards = [];
      binderQueries.forEach((query) => {
        const data = query.state.data;
        if (data?.success && data?.cards) {
          allFirebaseCards.push(...data.cards);
          console.log(
            `Added ${data.cards.length} cards from page range ${query.queryKey[3]}`
          );
        }
      });

      // Remove duplicates (same card might be in multiple page range queries)
      const uniqueCards = Array.from(
        new Map(allFirebaseCards.map((card) => [card.id, card])).values()
      );

      console.log(`Total unique Firebase cards found: ${uniqueCards.length}`);

      const firebaseCards = uniqueCards;
      console.log(
        `Reverting to ${firebaseCards.length} cards from Firebase cache`
      );

      // Revert local storage to Firebase state
      revertToFirebaseState(binderId, firebaseCards, {});

      // Force multiple refresh events to ensure UI updates
      const dispatchRefreshEvent = () => {
        window.dispatchEvent(
          new CustomEvent("localBinderUpdate", {
            detail: { binderId, type: "revert" },
          })
        );
      };

      // Dispatch immediately
      dispatchRefreshEvent();

      // Also dispatch a storage event to trigger storage listeners
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `pokemon_binder_${binderId}`,
          newValue: JSON.stringify({ timestamp: Date.now() }),
        })
      );

      // Dispatch again after a small delay to handle any timing issues
      setTimeout(dispatchRefreshEvent, 50);
      setTimeout(dispatchRefreshEvent, 100);

      // Also invalidate React Query cache to force rerender
      await queryClient.invalidateQueries({
        queryKey: ["binderCards", binderId],
      });

      console.log("Successfully reverted to Firebase state");
      return { success: true, message: "All changes reverted successfully" };
    } catch (error) {
      console.error("Error reverting to Firebase state:", error);
      return {
        success: false,
        error: error.message || "Failed to revert changes",
      };
    }
  }, [binderId, currentUser?.uid, queryClient]);

  // Check if sync is needed
  const hasUnsyncedChanges = useCallback(() => {
    return needsSync(binderId);
  }, [binderId]);

  // Get sync status
  const getSyncInfo = useCallback(() => {
    const localState = getLocalBinderState(binderId);
    return {
      hasChanges: needsSync(binderId),
      lastModified: localState?.lastModified,
      cardCount: localState?.cards?.length || 0,
    };
  }, [binderId]);

  return {
    // State
    isSyncing,
    hasUnsyncedChanges: hasUnsyncedChanges(),

    // Functions
    syncToFirebase,
    revertToFirebase,
    getSyncInfo,
  };
};
