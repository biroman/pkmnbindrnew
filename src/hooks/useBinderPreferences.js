import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { getBinder, updateBinder } from "../services/firestore"; // Fixed import
import { useCacheInvalidation } from "./useCacheInvalidation";

/**
 * Hook to get and manage preferences for a specific binder.
 * @param {string} binderId - The ID of the binder whose preferences are being managed.
 * @returns {Object} Binder preferences, loading/error states, save/revert functions, and dirty tracking.
 */
export const useBinderPreferences = (binderId) => {
  const { currentUser } = useAuth();
  const { invalidateAllBinderData, optimisticallyUpdateInList } =
    useCacheInvalidation();
  const [saveError, setSaveError] = useState(null);

  // Query key for this specific binder
  const binderQueryKey = ["binder", binderId, currentUser?.uid];

  // Fetch the specific binder data
  const {
    data: binderDocument,
    isLoading: isLoadingBinder,
    error: binderError,
  } = useQuery({
    queryKey: binderQueryKey,
    queryFn: async () => {
      if (!currentUser?.uid || !binderId) return null;
      const result = await getBinder(currentUser.uid, binderId);
      if (result.success) return result.data;
      throw new Error(result.error || "Failed to fetch binder data");
    },
    enabled: !!currentUser?.uid && !!binderId, // Only run if userId and binderId are available
    staleTime: 1000 * 60 * 2, // 2 minutes - preferences change more frequently
  });

  // Mutation for updating the binder with centralized cache invalidation
  const updateBinderMutation = useMutation({
    mutationFn: (variables) =>
      updateBinder(variables.userId, variables.binderId, variables.preferences),
    onMutate: async (variables) => {
      // Optimistically update the binder in the userBinders list
      optimisticallyUpdateInList(
        ["userBinders", variables.userId, {}],
        variables.binderId,
        variables.preferences
      );
    },
    onSuccess: (data, variables) => {
      // Clear any previous save errors on successful save
      setSaveError(null);

      // Use centralized cache invalidation for comprehensive updates
      invalidateAllBinderData(variables.userId, variables.binderId);

      setIsDirty(false); // Mark as clean after successful save
    },
    onError: (error, variables) => {
      console.error("Failed to save binder preferences:", error);

      // Handle server-side validation errors
      if (error.message && error.message.includes("Page limit")) {
        setSaveError(`Page Limit Error: ${error.message}`);

        // Revert page count if it was a page limit error
        if (variables.preferences.pageCount !== undefined) {
          setLocalPreferences((prev) => ({
            ...prev,
            pageCount: savedPreferences.pageCount, // Revert to saved value
          }));
          setIsDirty(false); // Reset dirty state since we reverted
        }
      } else {
        setSaveError(error.message || "Failed to save binder preferences");
      }

      // On error, invalidate to restore correct data
      invalidateAllBinderData(variables.userId, variables.binderId);
    },
  });

  // Default preferences (used as a fallback or for initial state if binderDocument is loading)
  const defaultPreferences = {
    binderName: "Untitled Binder",
    pageCount: 10,
    gridSize: "3x3",
    showReverseHolos: false,
    hideMissingCards: false,
    missingCards: [],
    sortBy: "slot",
    sortDirection: "asc",
    // Add other relevant fields that are part of the binder document but managed here
  };

  // Extract preferences from the fetched binder document or use defaults
  const savedPreferences = binderDocument
    ? {
        binderName: binderDocument.binderName || defaultPreferences.binderName,
        pageCount: binderDocument.pageCount ?? defaultPreferences.pageCount,
        gridSize: binderDocument.gridSize || defaultPreferences.gridSize,
        showReverseHolos:
          binderDocument.showReverseHolos ??
          defaultPreferences.showReverseHolos,
        hideMissingCards:
          binderDocument.hideMissingCards ??
          defaultPreferences.hideMissingCards,
        missingCards:
          binderDocument.missingCards || defaultPreferences.missingCards,
        sortBy: binderDocument.sortBy || defaultPreferences.sortBy,
        sortDirection:
          binderDocument.sortDirection || defaultPreferences.sortDirection,
        // Include other fields from binderDocument that are considered preferences
      }
    : defaultPreferences;

  const [localPreferences, setLocalPreferences] = useState(savedPreferences);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalPreferences(savedPreferences);
    setIsDirty(false); // Reset dirty state when fetched data changes
  }, [binderDocument]); // Deep comparison might be needed if savedPreferences is complex or use JSON.stringify if simple enough

  // Guest user handling (simplified, as preferences are now binder-specific)
  if (!currentUser) {
    // For guests, modifications are only local and cannot be saved.
    // This part might need more thought if guests can interact with a temporary binder state.
    return {
      preferences: localPreferences,
      isLoading: false,
      error: null,
      saveError: null, // Guests don't have save errors
      isGuest: true,
      isDirty: false, // Guests can't make it "dirty" in terms of saving
      updatePreferences: (updates) =>
        setLocalPreferences((prev) => ({ ...prev, ...updates })),
      savePreferences: async () => {
        /* console.log("Guest cannot save"); */ Promise.resolve();
      },
      revertPreferences: () => setLocalPreferences(savedPreferences),
      clearSaveError: () => {}, // No-op for guests
      isSaving: false,
    };
  }

  const updatePreferences = useCallback(
    (updates) => {
      // Clear any previous save errors when user makes changes
      setSaveError(null);

      setLocalPreferences((prev) => {
        const newPrefs = { ...prev, ...updates };
        // Compare newPrefs with savedPreferences (derived from binderDocument)
        const currentSaved = binderDocument
          ? {
              binderName:
                binderDocument.binderName || defaultPreferences.binderName,
              pageCount:
                binderDocument.pageCount ?? defaultPreferences.pageCount,
              gridSize: binderDocument.gridSize || defaultPreferences.gridSize,
              showReverseHolos:
                binderDocument.showReverseHolos ??
                defaultPreferences.showReverseHolos,
              hideMissingCards:
                binderDocument.hideMissingCards ??
                defaultPreferences.hideMissingCards,
              missingCards:
                binderDocument.missingCards || defaultPreferences.missingCards,
              sortBy: binderDocument.sortBy || defaultPreferences.sortBy,
              sortDirection:
                binderDocument.sortDirection ||
                defaultPreferences.sortDirection,
            }
          : defaultPreferences;
        setIsDirty(JSON.stringify(newPrefs) !== JSON.stringify(currentSaved));
        return newPrefs;
      });
    },
    [binderDocument, defaultPreferences]
  );

  const savePreferences = useCallback(async () => {
    if (!isDirty || !currentUser?.uid || !binderId) return;

    // Construct the object to save, only including fields that are part of binder settings
    const preferencesToSave = {
      binderName: localPreferences.binderName,
      pageCount: localPreferences.pageCount,
      gridSize: localPreferences.gridSize,
      showReverseHolos: localPreferences.showReverseHolos,
      hideMissingCards: localPreferences.hideMissingCards,
      missingCards: localPreferences.missingCards,
      sortBy: localPreferences.sortBy,
      sortDirection: localPreferences.sortDirection,
    };

    try {
      await updateBinderMutation.mutateAsync({
        userId: currentUser.uid,
        binderId,
        preferences: preferencesToSave,
      });
    } catch (error) {
      // Error handling is already done in the mutation's onError callback
      console.error("Error in savePreferences:", error);
    }
  }, [
    isDirty,
    currentUser?.uid,
    binderId,
    localPreferences,
    updateBinderMutation,
  ]);

  const revertPreferences = useCallback(() => {
    setLocalPreferences(savedPreferences);
    setIsDirty(false);
    setSaveError(null); // Clear any save errors when reverting
  }, [savedPreferences]);

  const clearSaveError = useCallback(() => {
    setSaveError(null);
  }, []);

  return {
    preferences: localPreferences,
    isLoading: isLoadingBinder,
    error: binderError,
    saveError,
    isGuest: false,
    isDirty,
    updatePreferences,
    savePreferences,
    revertPreferences,
    clearSaveError,
    isSaving: updateBinderMutation.isLoading,
  };
};
