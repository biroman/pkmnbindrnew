/**
 * useUserLimits Hook
 *
 * Provides easy access to user limits, validation, and warning checks.
 * This hook is used throughout the app to enforce limits and show appropriate messaging.
 */

import { useMemo, useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  getUserLimits as getLocalUserLimits,
  isFeatureAvailable,
  getLimitMessage,
  checkLimitWarnings,
  STORAGE_ESTIMATES,
  UPGRADE_INCENTIVES,
  WARNING_THRESHOLDS,
  USER_LIMITS as LOCAL_USER_LIMITS,
} from "../config/userLimits";

/**
 * Hook to get system limits from Firebase
 * Similar to usePageLimits but for all user limits
 */
export const useSystemLimits = () => {
  const [systemLimits, setSystemLimits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const configRef = doc(db, "systemConfiguration", "limits");

    const unsubscribe = onSnapshot(
      configRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setSystemLimits({
            guest: {
              maxBinders: data.guestMaxBinders,
              maxCardsPerBinder: data.guestMaxCardsPerBinder,
              maxPages: data.guestMaxPages,
            },
            registered: {
              maxBinders: data.registeredMaxBinders,
              maxCardsPerBinder: data.registeredMaxCardsPerBinder,
              maxPages: data.registeredMaxPages,
            },
            enforcement: {
              ENFORCE_BINDER_LIMITS: data.enforceBinnerLimits,
              ENFORCE_CARD_LIMITS: data.enforceCardLimits,
              ENFORCE_STORAGE_WARNINGS: data.enforceStorageWarnings,
              ENFORCE_FEATURE_LOCKS: data.enforceFeatureLocks,
              STRICT_MODE: data.strictMode,
            },
            warningThresholds: data.warningThresholds,
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching system limits:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { systemLimits, isLoading };
};

/**
 * Helper function to format bytes
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const useUserLimits = () => {
  const { currentUser } = useAuth();
  const { systemLimits, isLoading: systemLimitsLoading } = useSystemLimits();

  // Get current user limits - prefer Firebase system limits over local config
  const limits = useMemo(() => {
    if (systemLimitsLoading) {
      // While loading, use local config as fallback
      return getLocalUserLimits(currentUser);
    }

    if (systemLimits) {
      // Use Firebase system limits if available
      const userType = currentUser ? "registered" : "guest";
      const systemUserLimits = systemLimits[userType];
      const localLimits = getLocalUserLimits(currentUser);

      // Merge system limits with local config (Firebase takes precedence for numeric limits)
      return {
        ...localLimits,
        maxBinders: systemUserLimits?.maxBinders ?? localLimits.maxBinders,
        maxCardsPerBinder:
          systemUserLimits?.maxCardsPerBinder ?? localLimits.maxCardsPerBinder,
        maxPages: systemUserLimits?.maxPages ?? localLimits.maxPages,
      };
    }

    // Fallback to local config
    return getLocalUserLimits(currentUser);
  }, [currentUser, systemLimits, systemLimitsLoading]);

  // User type information
  const userInfo = useMemo(
    () => ({
      isGuest: !currentUser,
      isRegistered: !!currentUser,
      userType: currentUser ? "registered" : "guest",
    }),
    [currentUser]
  );

  // Limit checking functions
  const canCreateBinder = useCallback(
    (currentBinderCount) => {
      // If limits are effectively unlimited, always allow
      if (limits.maxBinders === Number.MAX_SAFE_INTEGER) {
        return true;
      }
      return currentBinderCount < limits.maxBinders;
    },
    [limits.maxBinders]
  );

  const canAddCard = useCallback(
    (currentCardCount) => {
      // If limits are effectively unlimited, always allow
      if (limits.maxCardsPerBinder === Number.MAX_SAFE_INTEGER) {
        return true;
      }
      return currentCardCount < limits.maxCardsPerBinder;
    },
    [limits.maxCardsPerBinder]
  );

  const canAddPage = useCallback(
    (currentPageCount) => {
      // If limits are effectively unlimited, always allow
      if (limits.maxPages === Number.MAX_SAFE_INTEGER) {
        return true;
      }
      return currentPageCount < limits.maxPages;
    },
    [limits.maxPages]
  );

  const canUseFeature = useCallback(
    (featureName) => {
      return isFeatureAvailable(featureName, currentUser);
    },
    [currentUser]
  );

  // Get remaining capacity
  const getRemainingCapacity = useCallback(
    (type, currentCount) => {
      const limit =
        type === "binders"
          ? limits.maxBinders
          : type === "cards"
          ? limits.maxCardsPerBinder
          : type === "pages"
          ? limits.maxPages
          : null;

      // If unlimited, return a large number for display purposes
      if (limit === Number.MAX_SAFE_INTEGER) {
        return Number.MAX_SAFE_INTEGER;
      }

      return Math.max(0, limit - currentCount);
    },
    [limits]
  );

  // Get usage percentage
  const getUsagePercentage = useCallback(
    (type, currentCount) => {
      const limit =
        type === "binders"
          ? limits.maxBinders
          : type === "cards"
          ? limits.maxCardsPerBinder
          : type === "pages"
          ? limits.maxPages
          : null;

      // If unlimited, always return 0% usage
      if (limit === Number.MAX_SAFE_INTEGER) {
        return 0;
      }

      return Math.round((currentCount / limit) * 100);
    },
    [limits]
  );

  // Check if approaching limits
  const isApproachingLimit = useCallback(
    (type, currentCount, threshold = null) => {
      const limit =
        type === "binders"
          ? limits.maxBinders
          : type === "cards"
          ? limits.maxCardsPerBinder
          : type === "pages"
          ? limits.maxPages
          : null;

      // If unlimited, never approaching limit
      if (limit === Number.MAX_SAFE_INTEGER) {
        return false;
      }

      const defaultThreshold =
        type === "binders"
          ? WARNING_THRESHOLDS.BINDER_WARNING
          : type === "cards"
          ? WARNING_THRESHOLDS.CARD_WARNING
          : type === "pages"
          ? WARNING_THRESHOLDS.BINDER_WARNING // Use binder warning threshold for pages
          : WARNING_THRESHOLDS.BINDER_WARNING;

      const usedThreshold = threshold || defaultThreshold;
      return getUsagePercentage(type, currentCount) >= usedThreshold;
    },
    [getUsagePercentage, limits]
  );

  // Get appropriate warning message
  const getWarningMessage = useCallback(
    (type, currentCount) => {
      const limit =
        type === "binders"
          ? limits.maxBinders
          : type === "cards"
          ? limits.maxCardsPerBinder
          : type === "pages"
          ? limits.maxPages
          : null;

      // If unlimited, no warning messages for capacity
      if (limit === Number.MAX_SAFE_INTEGER) {
        return null;
      }

      const percentage = getUsagePercentage(type, currentCount);

      if (percentage >= 100) {
        const limitReachedKey =
          type === "binders"
            ? "BINDER_LIMIT_REACHED"
            : type === "cards"
            ? "CARD_LIMIT_REACHED"
            : type === "pages"
            ? "PAGE_LIMIT_REACHED"
            : "BINDER_LIMIT_REACHED";

        return getLimitMessage(limitReachedKey, userInfo.userType);
      } else if (
        percentage >=
        WARNING_THRESHOLDS[
          type === "binders"
            ? "BINDER_WARNING"
            : type === "cards"
            ? "CARD_WARNING"
            : "BINDER_WARNING" // Use binder warning for pages
        ]
      ) {
        return `You're using ${percentage}% of your ${type} limit (${currentCount}/${limit})`;
      }

      return null;
    },
    [getUsagePercentage, limits, userInfo.userType]
  );

  // Get feature lock message
  const getFeatureLockMessage = useCallback(
    (featureName) => {
      if (canUseFeature(featureName)) return null;

      const featureMap = {
        canShare: "sharing",
        canExport: "export",
        canUseSetCompletion: "setCompletion",
        canUseBulkOperations: "bulkOps",
      };

      const messageKey = featureMap[featureName] || featureName;

      // Add safety checks for LIMIT_MESSAGES.FEATURE_LOCKED
      try {
        const featureLockMessages = getLimitMessage("FEATURE_LOCKED");
        if (featureLockMessages && typeof featureLockMessages === "object") {
          return (
            featureLockMessages[messageKey] ||
            `Feature '${featureName}' requires registration.`
          );
        }
        return `Feature '${featureName}' requires registration.`;
      } catch (error) {
        console.warn("Error getting feature lock message:", error);
        return `Feature '${featureName}' requires registration.`;
      }
    },
    [canUseFeature]
  );

  // Get upgrade incentives based on context
  const getUpgradeIncentives = useCallback(
    (context = null) => {
      if (userInfo.isRegistered) return null;

      if (context && UPGRADE_INCENTIVES.CONTEXTUAL_INCENTIVES[context]) {
        return {
          benefits: UPGRADE_INCENTIVES.CONTEXTUAL_INCENTIVES[context],
          cta: UPGRADE_INCENTIVES.CTA_TEXT.contextual,
        };
      }

      return {
        benefits: UPGRADE_INCENTIVES.PRIMARY_BENEFITS,
        cta: UPGRADE_INCENTIVES.CTA_TEXT.primary,
      };
    },
    [userInfo.isRegistered]
  );

  // Storage estimation for guest users
  const getStorageEstimate = useCallback(
    (binderCount, totalCardCount, cacheCount = 0) => {
      if (userInfo.isRegistered) return null;

      const usage = STORAGE_ESTIMATES.getStorageUsage(
        binderCount,
        totalCardCount,
        cacheCount
      );
      const warning = STORAGE_ESTIMATES.getStorageWarning(usage);

      return {
        usage,
        limit: STORAGE_ESTIMATES.INDEXEDDB_LIMIT,
        percentage: Math.round(
          (usage / STORAGE_ESTIMATES.INDEXEDDB_LIMIT) * 100
        ),
        warning,
        formattedUsage: formatBytes(usage),
        formattedLimit: formatBytes(STORAGE_ESTIMATES.INDEXEDDB_LIMIT),
      };
    },
    [userInfo.isRegistered]
  );

  // Comprehensive limit check
  const checkAllLimits = useCallback(
    (binderCount, cardCounts = {}) => {
      return checkLimitWarnings(currentUser, binderCount, cardCounts);
    },
    [currentUser]
  );

  // Validation helpers
  const validateAction = useCallback(
    (action, currentCounts) => {
      const result = {
        allowed: true,
        reason: null,
        warning: null,
        upgradeIncentive: null,
      };

      switch (action) {
        case "createBinder":
          if (!canCreateBinder(currentCounts.binders)) {
            result.allowed = false;
            result.reason = getWarningMessage("binders", currentCounts.binders);
            result.upgradeIncentive = getUpgradeIncentives("onBinderLimit");
          } else if (isApproachingLimit("binders", currentCounts.binders)) {
            result.warning = getWarningMessage(
              "binders",
              currentCounts.binders
            );
          } else if (
            userInfo.isGuest &&
            currentCounts.binders > 0 &&
            currentCounts.binders % 5 === 0
          ) {
            // For guests with unlimited binders, show upgrade prompts every 5 binders
            result.upgradeIncentive = getUpgradeIncentives("onStorageFull");
          }
          break;

        case "addCard":
          if (!canAddCard(currentCounts.cards)) {
            result.allowed = false;
            result.reason = getWarningMessage("cards", currentCounts.cards);
            result.upgradeIncentive = getUpgradeIncentives("onCardLimit");
          } else if (isApproachingLimit("cards", currentCounts.cards)) {
            result.warning = getWarningMessage("cards", currentCounts.cards);
          } else if (
            userInfo.isGuest &&
            currentCounts.cards > 0 &&
            currentCounts.cards % 20 === 0
          ) {
            // For guests with unlimited cards, show upgrade prompts every 20 cards
            result.upgradeIncentive = getUpgradeIncentives("onStorageFull");
          }
          break;

        case "share":
          if (!canUseFeature("canShare")) {
            result.allowed = false;
            result.reason = getFeatureLockMessage("canShare");
            result.upgradeIncentive = getUpgradeIncentives("onShareAttempt");
          }
          break;

        case "export":
          if (!canUseFeature("canExport")) {
            result.allowed = false;
            result.reason = getFeatureLockMessage("canExport");
            result.upgradeIncentive = getUpgradeIncentives("onExportAttempt");
          }
          break;

        default:
          console.warn(`Unknown action: ${action}`);
      }

      return result;
    },
    [
      canCreateBinder,
      canAddCard,
      canUseFeature,
      getWarningMessage,
      getFeatureLockMessage,
      getUpgradeIncentives,
      isApproachingLimit,
      userInfo.isGuest,
    ]
  );

  return {
    // User information
    ...userInfo,

    // Current limits
    limits,

    // Capacity checks
    canCreateBinder,
    canAddCard,
    canAddPage,
    canUseFeature,

    // Usage information
    getRemainingCapacity,
    getUsagePercentage,
    isApproachingLimit,

    // Messaging
    getWarningMessage,
    getFeatureLockMessage,
    getUpgradeIncentives,

    // Storage (guest users only)
    getStorageEstimate,

    // Comprehensive validation
    checkAllLimits,
    validateAction,

    // UI state helpers
    shouldShowUpgradeBanner: limits.showUpgradeBanner,
    shouldShowLimitWarnings: limits.showLimitWarnings,
    shouldShowFeatureLocks: limits.showFeatureLockMessages,
  };
};

/**
 * Hook for specific limit checks
 */
export const useBinderLimits = (currentBinderCount) => {
  const {
    canCreateBinder,
    getRemainingCapacity,
    getUsagePercentage,
    isApproachingLimit,
    getWarningMessage,
    validateAction,
    limits,
  } = useUserLimits();

  const isUnlimited = limits.maxBinders === Number.MAX_SAFE_INTEGER;

  return {
    canCreate: canCreateBinder(currentBinderCount),
    remaining: isUnlimited
      ? "Unlimited"
      : getRemainingCapacity("binders", currentBinderCount),
    usagePercentage: getUsagePercentage("binders", currentBinderCount),
    isApproaching: isApproachingLimit("binders", currentBinderCount),
    isUnlimited,
    warningMessage: getWarningMessage("binders", currentBinderCount),
    validation: validateAction("createBinder", { binders: currentBinderCount }),
  };
};

/**
 * Hook for card-specific limit checks
 */
export const useCardLimits = (currentCardCount) => {
  const {
    canAddCard,
    getRemainingCapacity,
    getUsagePercentage,
    isApproachingLimit,
    getWarningMessage,
    validateAction,
    limits,
  } = useUserLimits();

  const isUnlimited = limits.maxCardsPerBinder === Number.MAX_SAFE_INTEGER;

  return {
    canAdd: canAddCard(currentCardCount),
    remaining: isUnlimited
      ? "Unlimited"
      : getRemainingCapacity("cards", currentCardCount),
    usagePercentage: getUsagePercentage("cards", currentCardCount),
    isApproaching: isApproachingLimit("cards", currentCardCount),
    isUnlimited,
    warningMessage: getWarningMessage("cards", currentCardCount),
    validation: validateAction("addCard", { cards: currentCardCount }),
  };
};

/**
 * Hook for page-specific limit checks
 */
export const usePageLimits = (currentPageCount) => {
  const {
    canAddPage,
    getRemainingCapacity,
    getUsagePercentage,
    isApproachingLimit,
    getWarningMessage,
    limits,
    userType,
  } = useUserLimits();

  const isUnlimited = limits.maxPages === Number.MAX_SAFE_INTEGER;

  // Generate a user-friendly reason for page limits
  const getPageLimitReason = () => {
    if (userType === "guest") {
      return "To keep our servers running smoothly and provide the best experience for everyone, we limit the number of pages per binder for guest users. Create a free account to unlock higher limits!";
    } else {
      return "To ensure optimal performance and manage server costs, we limit the number of pages per binder. This helps us keep the service free and fast for all users.";
    }
  };

  return {
    canAdd: canAddPage(currentPageCount),
    remaining: isUnlimited
      ? "Unlimited"
      : getRemainingCapacity("pages", currentPageCount),
    usagePercentage: getUsagePercentage("pages", currentPageCount),
    isApproaching: isApproachingLimit("pages", currentPageCount),
    isUnlimited,
    warningMessage: getWarningMessage("pages", currentPageCount),
    limitReason: getPageLimitReason(),
    maxPages: limits.maxPages,
    isAtLimit: !canAddPage(currentPageCount),
  };
};

export default useUserLimits;
