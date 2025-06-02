import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  useUserPreferences,
  useUpdateUserPreferences,
} from "../hooks/useUserData";

const AnimationContext = createContext();

/**
 * Animation preference levels
 */
export const ANIMATION_LEVELS = {
  NONE: "none", // No animations
  REDUCED: "reduced", // Essential animations only
  FULL: "full", // All animations
};

/**
 * AnimationProvider - Manages animation preferences
 * Respects system prefers-reduced-motion and allows user override
 * For logged-in users: stores in Firebase
 * For guests: stores in localStorage
 */
export const AnimationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(false);
  const [guestPreference, setGuestPreference] = useState(null); // For guest users

  // Get user preferences from Firebase (for logged-in users)
  const { data: userPreferencesData, isLoading: isLoadingPreferences } =
    useUserPreferences(currentUser?.uid);

  // Hook to update user preferences in Firebase
  const updateUserPreferencesMutation = useUpdateUserPreferences();

  // Detect system preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemPrefersReduced(mediaQuery.matches);

    const handleChange = (e) => {
      setSystemPrefersReduced(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Load guest preference from localStorage
  useEffect(() => {
    if (!currentUser) {
      const saved = localStorage.getItem("animationPreference");
      if (saved && Object.values(ANIMATION_LEVELS).includes(saved)) {
        setGuestPreference(saved);
      }
    }
  }, [currentUser]);

  // Get current user preference
  const getUserPreference = () => {
    if (currentUser) {
      // For logged-in users, get from Firebase
      return userPreferencesData?.success
        ? userPreferencesData.data.animationPreference
        : null;
    } else {
      // For guests, get from state (loaded from localStorage)
      return guestPreference;
    }
  };

  // Update preference function
  const updatePreference = async (level) => {
    if (currentUser) {
      // For logged-in users, save to Firebase
      try {
        await updateUserPreferencesMutation.mutateAsync({
          userId: currentUser.uid,
          preferences: { animationPreference: level },
        });
      } catch (error) {
        console.error("Failed to update animation preference:", error);
      }
    } else {
      // For guests, save to localStorage
      if (level === null) {
        localStorage.removeItem("animationPreference");
      } else {
        localStorage.setItem("animationPreference", level);
      }
      setGuestPreference(level);
    }
  };

  // Determine effective animation level
  const getEffectiveLevel = () => {
    const userPreference = getUserPreference();

    // User preference overrides system
    if (userPreference !== null) {
      return userPreference;
    }

    // Follow system preference
    return systemPrefersReduced
      ? ANIMATION_LEVELS.REDUCED
      : ANIMATION_LEVELS.FULL;
  };

  const effectiveLevel = getEffectiveLevel();
  const userPreference = getUserPreference();

  // Helper functions for easy conditional animations
  const shouldAnimate = (level = ANIMATION_LEVELS.FULL) => {
    switch (effectiveLevel) {
      case ANIMATION_LEVELS.NONE:
        return false;
      case ANIMATION_LEVELS.REDUCED:
        return level === ANIMATION_LEVELS.REDUCED;
      case ANIMATION_LEVELS.FULL:
        return true;
      default:
        return true;
    }
  };

  // Animation variants for Framer Motion
  const getVariants = (variants) => {
    if (!shouldAnimate()) {
      // Return static variants when animations are disabled
      return {
        initial: variants.animate || {},
        animate: variants.animate || {},
        exit: variants.animate || {},
      };
    }
    return variants;
  };

  // Transition settings
  const getTransition = (transition = {}) => {
    if (!shouldAnimate()) {
      return { duration: 0 };
    }
    return transition;
  };

  const value = {
    // Current state
    userPreference,
    systemPrefersReduced,
    effectiveLevel,
    isLoading: currentUser ? isLoadingPreferences : false,
    isGuest: !currentUser,

    // Actions
    updatePreference,

    // Helpers
    shouldAnimate,
    getVariants,
    getTransition,

    // Convenience booleans
    animationsEnabled: shouldAnimate(),
    reducedMotion: effectiveLevel === ANIMATION_LEVELS.REDUCED,
    fullAnimations: effectiveLevel === ANIMATION_LEVELS.FULL,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * Hook to use animation preferences
 */
export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimations must be used within AnimationProvider");
  }
  return context;
};

export default AnimationContext;
