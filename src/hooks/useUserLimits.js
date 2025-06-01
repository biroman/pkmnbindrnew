/**
 * useUserLimits Hook
 *
 * Provides easy access to user limits, validation, and warning checks.
 * This hook is used throughout the app to enforce limits and show appropriate messaging.
 */

import { useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserLimits,
  isFeatureAvailable,
  getLimitMessage,
  checkLimitWarnings,
  STORAGE_ESTIMATES,
  UPGRADE_INCENTIVES,
  WARNING_THRESHOLDS,
} from "../config/userLimits";

export const useUserLimits = () => {
  const { user } = useAuth();

  // Get current user limits
  const limits = useMemo(() => getUserLimits(user), [user]);

  // User type information
  const userInfo = useMemo(
    () => ({
      isGuest: !user,
      isRegistered: !!user,
      userType: user ? "registered" : "guest",
    }),
    [user]
  );

  // Limit checking functions
  const canCreateBinder = useCallback(
    (currentBinderCount) => {
      return currentBinderCount < limits.maxBinders;
    },
    [limits.maxBinders]
  );

  const canAddCard = useCallback(
    (currentCardCount) => {
      return currentCardCount < limits.maxCardsPerBinder;
    },
    [limits.maxCardsPerBinder]
  );

  const canUseFeature = useCallback(
    (featureName) => {
      return isFeatureAvailable(featureName, user);
    },
    [user]
  );

  // Get remaining capacity
  const getRemainingCapacity = useCallback(
    (type, currentCount) => {
      const limit =
        type === "binders" ? limits.maxBinders : limits.maxCardsPerBinder;
      return Math.max(0, limit - currentCount);
    },
    [limits]
  );

  // Get usage percentage
  const getUsagePercentage = useCallback(
    (type, currentCount) => {
      const limit =
        type === "binders" ? limits.maxBinders : limits.maxCardsPerBinder;
      return Math.round((currentCount / limit) * 100);
    },
    [limits]
  );

  // Check if approaching limits
  const isApproachingLimit = useCallback(
    (type, currentCount, threshold = null) => {
      const defaultThreshold =
        type === "binders"
          ? WARNING_THRESHOLDS.BINDER_WARNING
          : WARNING_THRESHOLDS.CARD_WARNING;

      const usedThreshold = threshold || defaultThreshold;
      return getUsagePercentage(type, currentCount) >= usedThreshold;
    },
    [getUsagePercentage]
  );

  // Get appropriate warning message
  const getWarningMessage = useCallback(
    (type, currentCount) => {
      const percentage = getUsagePercentage(type, currentCount);
      const limit =
        type === "binders" ? limits.maxBinders : limits.maxCardsPerBinder;

      if (percentage >= 100) {
        return getLimitMessage(
          type === "binders" ? "BINDER_LIMIT_REACHED" : "CARD_LIMIT_REACHED",
          userInfo.userType
        );
      } else if (
        percentage >=
        WARNING_THRESHOLDS[
          type === "binders" ? "BINDER_WARNING" : "CARD_WARNING"
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
      return getLimitMessage("FEATURE_LOCKED")[messageKey];
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
      return checkLimitWarnings(user, binderCount, cardCounts);
    },
    [user]
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
          }
          break;

        case "addCard":
          if (!canAddCard(currentCounts.cards)) {
            result.allowed = false;
            result.reason = getWarningMessage("cards", currentCounts.cards);
            result.upgradeIncentive = getUpgradeIncentives("onCardLimit");
          } else if (isApproachingLimit("cards", currentCounts.cards)) {
            result.warning = getWarningMessage("cards", currentCounts.cards);
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
 * Helper function to format bytes
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
  } = useUserLimits();

  return {
    canCreate: canCreateBinder(currentBinderCount),
    remaining: getRemainingCapacity("binders", currentBinderCount),
    usagePercentage: getUsagePercentage("binders", currentBinderCount),
    isApproaching: isApproachingLimit("binders", currentBinderCount),
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
  } = useUserLimits();

  return {
    canAdd: canAddCard(currentCardCount),
    remaining: getRemainingCapacity("cards", currentCardCount),
    usagePercentage: getUsagePercentage("cards", currentCardCount),
    isApproaching: isApproachingLimit("cards", currentCardCount),
    warningMessage: getWarningMessage("cards", currentCardCount),
    validation: validateAction("addCard", { cards: currentCardCount }),
  };
};

export default useUserLimits;
