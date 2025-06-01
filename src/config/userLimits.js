/**
 * User Limits Configuration
 *
 * Defines the limitations and capabilities for different user types.
 * These limits encourage user registration while still providing value to anonymous users.
 */

// Configuration flags for easy limit management
export const LIMIT_ENFORCEMENT = {
  // Set to false to disable specific limits for guests
  ENFORCE_BINDER_LIMITS: false, // Currently disabled - guests have unlimited binders
  ENFORCE_CARD_LIMITS: false, // Currently disabled - guests have unlimited cards per binder
  ENFORCE_STORAGE_WARNINGS: true, // Keep storage warnings active
  ENFORCE_FEATURE_LOCKS: true, // Keep premium features locked for guests

  // Easy toggle for future limit enforcement
  STRICT_MODE: false, // Set to true to enforce all limits
};

export const USER_LIMITS = {
  GUEST: {
    // Binder limits - Currently unlimited (stored locally)
    maxBinders: LIMIT_ENFORCEMENT.ENFORCE_BINDER_LIMITS
      ? 3
      : Number.MAX_SAFE_INTEGER,
    maxCardsPerBinder: LIMIT_ENFORCEMENT.ENFORCE_CARD_LIMITS
      ? 50
      : Number.MAX_SAFE_INTEGER,

    // Legacy limits (for easy restoration if needed)
    _legacyLimits: {
      maxBinders: 3,
      maxCardsPerBinder: 50,
    },

    // Feature access - These remain restricted for guests
    canShare: false,
    canExport: false,
    canSync: false,
    canImport: false,
    canCreateSharedLinks: false,

    // Advanced features - Restricted for guests
    canUseSetCompletion: false,
    canTrackMissingCards: false,
    canCreateCustomLayouts: false,
    canUseBulkOperations: false,

    // UI preferences
    showUpgradeBanner: true,
    showFeatureLockMessages: true,
    showLimitWarnings: LIMIT_ENFORCEMENT.ENFORCE_STORAGE_WARNINGS, // Only show storage warnings

    // Storage
    storageType: "local",
    dataRetention: "session", // Data may be lost on browser clear

    // Performance
    cacheTTL: 1 * 60 * 60 * 1000, // 1 hour cache for API data

    // Messaging
    upgradePrompts: {
      onLimitReached:
        LIMIT_ENFORCEMENT.ENFORCE_BINDER_LIMITS ||
        LIMIT_ENFORCEMENT.ENFORCE_CARD_LIMITS,
      onFeatureAttempt: true,
      onShareAttempt: true,
      onExportAttempt: true,
    },
  },

  REGISTERED: {
    // Binder limits (generous but not unlimited)
    maxBinders: 25,
    maxCardsPerBinder: 400,

    // Feature access
    canShare: true,
    canExport: true,
    canSync: true,
    canImport: true,
    canCreateSharedLinks: true,

    // Advanced features
    canUseSetCompletion: true,
    canTrackMissingCards: true,
    canCreateCustomLayouts: true,
    canUseBulkOperations: true,

    // UI preferences
    showUpgradeBanner: false,
    showFeatureLockMessages: false,
    showLimitWarnings: false,

    // Storage
    storageType: "cloud",
    dataRetention: "permanent",

    // Performance
    cacheTTL: 24 * 60 * 60 * 1000, // 24 hour cache for API data

    // Messaging
    upgradePrompts: {
      onLimitReached: false,
      onFeatureAttempt: false,
      onShareAttempt: false,
      onExportAttempt: false,
    },
  },
};

/**
 * Feature flags for gradual rollout
 */
export const FEATURE_FLAGS = {
  // Phase 1 features
  ANONYMOUS_BINDERS: true,
  LOCAL_STORAGE: true,
  BASIC_CARD_MANAGEMENT: true,

  // Phase 2 features
  POKEMON_API_INTEGRATION: false, // Will be enabled in Phase 2
  SET_COMPLETION_TRACKING: false,
  ADVANCED_SEARCH: false,

  // Phase 3 features
  DRAG_AND_DROP: false, // Will be enabled in Phase 3
  BULK_OPERATIONS: false,
  CUSTOM_LAYOUTS: false,
  EXPORT_FUNCTIONALITY: false,

  // Phase 4 features
  DATA_MIGRATION: false, // Will be enabled in Phase 4
  ACCOUNT_SYNC: false,

  // Phase 5 features
  SHARING: false, // Will be enabled in Phase 5
  COLLABORATION: false,

  // Experimental features
  REAL_TIME_SYNC: false,
  OFFLINE_MODE: false,
  PWA_FEATURES: false,
};

/**
 * Limit validation messages
 */
export const LIMIT_MESSAGES = {
  BINDER_LIMIT_REACHED: {
    guest: LIMIT_ENFORCEMENT.ENFORCE_BINDER_LIMITS
      ? "You've reached the limit of 3 binders for guest users. Sign up to create up to 25 binders!"
      : "Local storage is getting full. Sign up for unlimited cloud storage and sync across devices!",
    registered:
      "You've reached your binder limit of 25. Consider organizing your existing binders.",
  },

  CARD_LIMIT_REACHED: {
    guest: LIMIT_ENFORCEMENT.ENFORCE_CARD_LIMITS
      ? "This binder has reached the 50 card limit for guest users. Sign up for binders with up to 400 cards!"
      : "This binder is getting large. Sign up for cloud storage and better organization features!",
    registered:
      "This binder has reached the 400 card limit. Consider creating a new binder for additional cards.",
  },

  FEATURE_LOCKED: {
    sharing:
      "Sharing is available for registered users. Sign up to share your binders with friends!",
    export:
      "Export functionality is available for registered users. Sign up to export your collection!",
    setCompletion:
      "Set completion tracking is available for registered users. Sign up to track your progress!",
    bulkOps:
      "Bulk operations are available for registered users. Sign up for advanced collection management!",
  },
};

/**
 * Warning thresholds (percentage of limit reached)
 */
export const WARNING_THRESHOLDS = {
  BINDER_WARNING: 80, // Warn at 80% of binder limit
  CARD_WARNING: 90, // Warn at 90% of card limit

  STORAGE_WARNING: 85, // Warn at 85% of storage quota
  API_WARNING: 90, // Warn at 90% of API rate limit
};

/**
 * Upgrade incentives configuration
 */
export const UPGRADE_INCENTIVES = {
  // Primary benefits shown in banners - Updated for unlimited local storage
  PRIMARY_BENEFITS: [
    "Unlimited cloud storage",
    "Sync across all devices",
    "Share collections with friends",
    "Export card lists",
    "Advanced organization tools",
    "Set completion tracking",
  ],

  // Context-specific incentives - Updated messaging
  CONTEXTUAL_INCENTIVES: {
    onBinderLimit: [
      "Unlimited cloud storage",
      "Sync across devices",
      "Never lose your data",
    ],
    onCardLimit: [
      "Advanced organization tools",
      "Cloud backup & sync",
      "Better collection management",
    ],
    onShareAttempt: [
      "Share binders with friends",
      "Generate shareable links",
      "View-only access control",
    ],
    onExportAttempt: [
      "Export as card lists",
      "Multiple export formats",
      "Print-friendly layouts",
    ],
    onStorageFull: [
      "Unlimited cloud storage",
      "Automatic device sync",
      "Never worry about storage limits",
    ],
  },

  // Call-to-action buttons
  CTA_TEXT: {
    primary: "Get Cloud Storage",
    secondary: "Learn More",
    contextual: "Upgrade Now",
  },
};

/**
 * Storage quota estimates (for guest users)
 */
export const STORAGE_ESTIMATES = {
  // Estimated storage per item (in bytes)
  BINDER_SIZE: 500, // Basic binder metadata
  CARD_SIZE: 1000, // Card data with image URL
  CACHE_ENTRY_SIZE: 2000, // Cached Pokemon TCG data

  // Browser limits (conservative estimates)
  INDEXEDDB_LIMIT: 50 * 1024 * 1024, // ~50MB
  LOCALSTORAGE_LIMIT: 5 * 1024 * 1024, // ~5MB

  // Warning calculations
  getStorageUsage: (binderCount, cardCount, cacheCount = 0) => {
    return (
      binderCount * STORAGE_ESTIMATES.BINDER_SIZE +
      cardCount * STORAGE_ESTIMATES.CARD_SIZE +
      cacheCount * STORAGE_ESTIMATES.CACHE_ENTRY_SIZE
    );
  },

  getStorageWarning: (currentUsage) => {
    const percentage = (currentUsage / STORAGE_ESTIMATES.INDEXEDDB_LIMIT) * 100;

    if (percentage > WARNING_THRESHOLDS.STORAGE_WARNING) {
      return {
        level: "high",
        message:
          "Storage is nearly full. Consider registering for unlimited cloud storage.",
        percentage: Math.round(percentage),
      };
    } else if (percentage > 50) {
      return {
        level: "medium",
        message: `Using ${Math.round(percentage)}% of local storage.`,
        percentage: Math.round(percentage),
      };
    }

    return null;
  },
};

/**
 * Helper function to get user limits based on authentication status
 */
export const getUserLimits = (user) => {
  return user ? USER_LIMITS.REGISTERED : USER_LIMITS.GUEST;
};

/**
 * Helper function to check if a feature is available for the user
 */
export const isFeatureAvailable = (featureName, user) => {
  const limits = getUserLimits(user);
  const isUserFeature = limits.hasOwnProperty(featureName);
  const isGlobalFeature = FEATURE_FLAGS.hasOwnProperty(featureName);

  if (isUserFeature) {
    return limits[featureName];
  }

  if (isGlobalFeature) {
    return FEATURE_FLAGS[featureName];
  }

  return false;
};

/**
 * Helper function to get appropriate limit message
 */
export const getLimitMessage = (limitType, userType = "guest") => {
  const messages = LIMIT_MESSAGES[limitType];
  return messages ? messages[userType] || messages.guest : null;
};

/**
 * Helper function to check if user is approaching limits
 */
export const checkLimitWarnings = (user, binderCount, cardCounts = {}) => {
  const limits = getUserLimits(user);
  const warnings = [];
  const isGuest = !user;

  // Only check binder limits if enforcement is enabled (or user is registered)
  if (
    !isGuest ||
    LIMIT_ENFORCEMENT.ENFORCE_BINDER_LIMITS ||
    LIMIT_ENFORCEMENT.STRICT_MODE
  ) {
    const binderPercentage = (binderCount / limits.maxBinders) * 100;
    if (binderPercentage >= WARNING_THRESHOLDS.BINDER_WARNING) {
      warnings.push({
        type: "binder",
        level: binderPercentage >= 100 ? "error" : "warning",
        current: binderCount,
        limit: limits.maxBinders,
        percentage: Math.round(binderPercentage),
        message:
          binderPercentage >= 100
            ? getLimitMessage(
                "BINDER_LIMIT_REACHED",
                user ? "registered" : "guest"
              )
            : `You're using ${Math.round(
                binderPercentage
              )}% of your binder limit`,
      });
    }
  }

  // Only check card limits if enforcement is enabled (or user is registered)
  if (
    !isGuest ||
    LIMIT_ENFORCEMENT.ENFORCE_CARD_LIMITS ||
    LIMIT_ENFORCEMENT.STRICT_MODE
  ) {
    Object.entries(cardCounts).forEach(([binderId, count]) => {
      const cardPercentage = (count / limits.maxCardsPerBinder) * 100;
      if (cardPercentage >= WARNING_THRESHOLDS.CARD_WARNING) {
        warnings.push({
          type: "card",
          binderId,
          level: cardPercentage >= 100 ? "error" : "warning",
          current: count,
          limit: limits.maxCardsPerBinder,
          percentage: Math.round(cardPercentage),
          message:
            cardPercentage >= 100
              ? getLimitMessage(
                  "CARD_LIMIT_REACHED",
                  user ? "registered" : "guest"
                )
              : `Binder ${binderId} is ${Math.round(cardPercentage)}% full`,
        });
      }
    });
  }

  return warnings;
};
