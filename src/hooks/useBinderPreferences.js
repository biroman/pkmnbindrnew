import { useUserPreferences, useUpdateUserPreferences } from "./useUserData";
import { useAuth } from "../contexts/AuthContext";
import { useState, useCallback, useEffect } from "react";

/**
 * Hook to get and manage binder preferences with local state and manual saving
 * @returns {Object} Binder preferences with local state, save/revert functions, and dirty tracking
 */
export const useBinderPreferences = () => {
  const { currentUser } = useAuth();
  const {
    data: preferencesData,
    isLoading,
    error,
  } = useUserPreferences(currentUser?.uid);

  const updatePreferencesMutation = useUpdateUserPreferences();

  // Default preferences for guests or when data is unavailable
  const defaultPreferences = {
    gridSize: "3x3",
    sortingDirection: true, // true = ascending
    autoSave: true,
    theme: "light",
    pageCount: 10, // Default number of pages in binder
  };

  // Get saved preferences (from Firebase or defaults)
  const savedPreferences = preferencesData?.success
    ? { ...defaultPreferences, ...preferencesData.data }
    : defaultPreferences;

  // Local state for current (unsaved) preferences
  const [localPreferences, setLocalPreferences] = useState(savedPreferences);

  // Track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Update local state when saved preferences change (from Firebase)
  useEffect(() => {
    // Remove currentPage from savedPreferences to prevent it from being tracked
    const { currentPage, ...prefsWithoutPage } = savedPreferences;
    setLocalPreferences(prefsWithoutPage);
    setIsDirty(false);
  }, [JSON.stringify(savedPreferences)]);

  // For guest users, return local state management only
  if (!currentUser) {
    const updateLocalPreferences = useCallback(
      (updates) => {
        setLocalPreferences((prev) => {
          const newPrefs = { ...prev, ...updates };
          setIsDirty(
            JSON.stringify(newPrefs) !== JSON.stringify(savedPreferences)
          );
          return newPrefs;
        });
      },
      [savedPreferences]
    );

    const savePreferences = useCallback(() => {
      // For guests, we can't save to Firebase, so just mark as clean
      setIsDirty(false);
    }, []);

    const revertPreferences = useCallback(() => {
      setLocalPreferences(savedPreferences);
      setIsDirty(false);
    }, [savedPreferences]);

    return {
      preferences: localPreferences,
      isLoading: false,
      error: null,
      isGuest: true,
      isDirty,
      updatePreferences: updateLocalPreferences,
      savePreferences,
      revertPreferences,
      isSaving: false,
    };
  }

  // Update local preferences (does not save to Firebase)
  const updateLocalPreferences = useCallback(
    (updates) => {
      setLocalPreferences((prev) => {
        const newPrefs = { ...prev, ...updates };
        setIsDirty(
          JSON.stringify(newPrefs) !== JSON.stringify(savedPreferences)
        );
        return newPrefs;
      });
    },
    [savedPreferences]
  );

  // Save local preferences to Firebase
  const savePreferences = useCallback(async () => {
    if (!isDirty) return;

    try {
      await updatePreferencesMutation.mutateAsync({
        userId: currentUser.uid,
        preferences: localPreferences,
      });
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      throw error;
    }
  }, [currentUser?.uid, localPreferences, isDirty, updatePreferencesMutation]);

  // Revert local changes to last saved state
  const revertPreferences = useCallback(() => {
    setLocalPreferences(savedPreferences);
    setIsDirty(false);
  }, [savedPreferences]);

  return {
    preferences: localPreferences,
    isLoading,
    error: error || (!preferencesData?.success ? preferencesData?.error : null),
    isGuest: false,
    isDirty,
    updatePreferences: updateLocalPreferences,
    savePreferences,
    revertPreferences,
    isSaving: updatePreferencesMutation.isPending,
  };
};
