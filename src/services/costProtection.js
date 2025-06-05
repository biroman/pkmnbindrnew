/**
 * Cost Protection Service
 * Monitors Firebase usage and implements cost protection measures
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COST_PROTECTION_CONFIG = {
  // Budget thresholds (in USD)
  BUDGET_LIMITS: {
    DAILY: 10,
    WEEKLY: 50,
    MONTHLY: 200,
  },

  // Service costs (approximate Firebase pricing)
  SERVICE_COSTS: {
    FIRESTORE_READ: 0.0006 / 100000, // $0.06 per 100K reads
    FIRESTORE_WRITE: 0.0018 / 100000, // $0.18 per 100K writes
    FIRESTORE_DELETE: 0.0002 / 100000, // $0.02 per 100K deletes
    STORAGE_GB: 0.026, // $0.026 per GB per month
    FUNCTION_INVOCATION: 0.0000004, // $0.40 per million invocations
  },

  // Rate limits to prevent abuse
  RATE_LIMITS: {
    READS_PER_MINUTE: 1000,
    WRITES_PER_MINUTE: 100,
    DELETES_PER_MINUTE: 50,
    FUNCTIONS_PER_MINUTE: 200,
    SAVES_PER_MINUTE: 10,
    SAVES_PER_HOUR: 60,
  },

  // Emergency shutdown thresholds
  // Note: Automatic triggering based on hourly counts from the removed trackOperation is disabled.
  // Emergency mode is now primarily manual or via other future aggregate checks.
  EMERGENCY_THRESHOLDS: {
    READS_PER_HOUR: 50000,
    WRITES_PER_HOUR: 5000,
    COST_PER_HOUR: 5, // $5/hour = $120/day
  },

  // Default rate limiting settings (can be overridden by admin)
  DEFAULT_SAVE_RATE_LIMITS: {
    guestSavesPerMinute: 3,
    guestSavesPerHour: 15,
    registeredSavesPerMinute: 10,
    registeredSavesPerHour: 60,
    cooldownSeconds: 2, // Minimum time between saves
  },
};

/**
 * Get current usage statistics
 * Note: With trackOperation removed, this data will not be updated with live granular counts.
 * It will reflect the last known state or initial state after a reset.
 */
export const getCurrentUsage = async () => {
  try {
    const usageRef = doc(db, "systemMonitoring", "currentUsage");
    const usageDoc = await getDoc(usageRef);

    if (usageDoc.exists()) {
      return { success: true, data: usageDoc.data() };
    }

    // Initialize if doesn't exist
    const initialUsage = {
      reads: { count: 0, cost: 0, lastReset: serverTimestamp() },
      writes: { count: 0, cost: 0, lastReset: serverTimestamp() },
      deletes: { count: 0, cost: 0, lastReset: serverTimestamp() },
      storage: { sizeGB: 0, cost: 0, lastCheck: serverTimestamp() },
      totalCost: 0,
      emergencyMode: false,
      lastUpdated: serverTimestamp(),
    };

    await setDoc(usageRef, initialUsage);
    return { success: true, data: initialUsage };
  } catch (error) {
    console.error("Error getting current usage:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if service is in emergency mode
 */
export const isEmergencyMode = async () => {
  try {
    const usageRef = doc(db, "systemMonitoring", "currentUsage");
    const usageDoc = await getDoc(usageRef);

    if (usageDoc.exists()) {
      return usageDoc.data().emergencyMode || false;
    }

    return false;
  } catch (error) {
    console.error("Error checking emergency mode:", error);
    return false;
  }
};

/**
 * Disable emergency mode (admin only)
 */
export const disableEmergencyMode = async () => {
  try {
    const usageRef = doc(db, "systemMonitoring", "currentUsage");
    await updateDoc(usageRef, {
      emergencyMode: false,
      emergencyDisabledAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error disabling emergency mode:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get cost estimates for operations
 */
export const estimateOperationCost = (operationType, count) => {
  const unitCost = COST_PROTECTION_CONFIG.SERVICE_COSTS[operationType];
  return unitCost ? unitCost * count : 0;
};

/**
 * Validate operation against rate limits
 */
export const validateRateLimit = async (userId, operationType) => {
  // Enhanced rate limiting with cost awareness
  const isEmergency = await isEmergencyMode();

  if (isEmergency) {
    return {
      success: false,
      error: "Service temporarily limited due to cost protection measures.",
    };
  }

  // Check user-specific rate limits (implement user-level tracking)
  // This is a placeholder for more sophisticated rate limiting

  return { success: true };
};

/**
 * Reset daily/weekly/monthly counters
 */
export const resetUsageCounters = async (period = "daily") => {
  try {
    const usageRef = doc(db, "systemMonitoring", "currentUsage");
    const resetData = {
      [`${period}Reset`]: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    };

    if (period === "daily") {
      resetData.reads = { count: 0, cost: 0, lastReset: serverTimestamp() };
      resetData.writes = { count: 0, cost: 0, lastReset: serverTimestamp() };
      resetData.deletes = { count: 0, cost: 0, lastReset: serverTimestamp() };
      resetData.totalCost = 0;
    }

    await updateDoc(usageRef, resetData);
    return { success: true };
  } catch (error) {
    console.error("Error resetting usage counters:", error);
    return { success: false, error: error.message };
  }
};

/**
 * DEVELOPMENT/TESTING UTILITIES
 * These functions are for testing cost protection features
 */

/**
 * Simulate high usage to test emergency mode (DEV ONLY)
 */
export const simulateHighUsage = async () => {
  try {
    const usageRef = doc(db, "systemMonitoring", "currentUsage");

    // Simulate high read/write counts that would trigger emergency mode
    const simulatedUsage = {
      reads: {
        count: 60000, // Above 50K threshold
        cost: (60000 * 0.0006) / 100000,
        hourlyCount: 60000,
        lastReset: serverTimestamp(),
      },
      writes: {
        count: 6000, // Above 5K threshold
        cost: (6000 * 0.0018) / 100000,
        hourlyCount: 6000,
        lastReset: serverTimestamp(),
      },
      deletes: {
        count: 100,
        cost: (100 * 0.0002) / 100000,
        lastReset: serverTimestamp(),
      },
      totalCost: 15, // Above $5 hourly threshold
      hourlyCost: 15,
      emergencyMode: false, // Will be triggered on next operation
      lastUpdated: serverTimestamp(),
    };

    await setDoc(usageRef, simulatedUsage);

    console.log(
      "✅ High usage simulated. Next operation should trigger emergency mode."
    );
    return { success: true };
  } catch (error) {
    console.error("Error simulating high usage:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Force emergency mode activation (DEV ONLY)
 */
export const forceEmergencyMode = async () => {
  try {
    const usageRef = doc(db, "systemMonitoring", "currentUsage");
    await updateDoc(usageRef, {
      emergencyMode: true,
      emergencyTriggeredAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });

    console.log("🚨 Emergency mode force activated!");
    return { success: true };
  } catch (error) {
    console.error("Error forcing emergency mode:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Test cost tracking with incremental operations
 */
export const testIncrementalCosts = async (operations = 10) => {
  try {
    console.log(`🧪 Testing ${operations} incremental operations...`);

    for (let i = 0; i < operations; i++) {
      await trackOperation("FIRESTORE_READ", 1000); // Track 1000 reads
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
      console.log(`Operation ${i + 1}/${operations} tracked`);
    }

    console.log("✅ Incremental cost testing completed");
    return { success: true };
  } catch (error) {
    console.error("Error in incremental testing:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Reset all usage data (DEV ONLY)
 */
export const resetAllUsageData = async () => {
  try {
    const usageRef = doc(db, "systemMonitoring", "currentUsage");
    const resetData = {
      reads: {
        count: 0,
        cost: 0,
        hourlyCount: 0,
        lastReset: serverTimestamp(),
      },
      writes: {
        count: 0,
        cost: 0,
        hourlyCount: 0,
        lastReset: serverTimestamp(),
      },
      deletes: { count: 0, cost: 0, lastReset: serverTimestamp() },
      totalCost: 0,
      hourlyCost: 0,
      emergencyMode: false,
      lastUpdated: serverTimestamp(),
    };

    await setDoc(usageRef, resetData);
    console.log("🔄 All usage data reset to zero");
    return { success: true };
  } catch (error) {
    console.error("Error resetting usage data:", error);
    return { success: false, error: error.message };
  }
};

// ===== SAVE OPERATION RATE LIMITING =====

// In-memory cache for save operation tracking
const saveOperationCache = new Map();
const SAVE_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Helper to clean expired cache entries
const cleanSaveCache = () => {
  const now = Date.now();
  for (const [key, data] of saveOperationCache.entries()) {
    if (now - data.timestamp > SAVE_CACHE_EXPIRY) {
      saveOperationCache.delete(key);
    }
  }
};

// Get save rate limits from Firebase or defaults
export const getSaveRateLimits = async () => {
  try {
    const systemConfigRef = doc(db, "systemConfiguration", "limits");
    const systemConfigDoc = await getDoc(systemConfigRef);

    if (systemConfigDoc.exists()) {
      const data = systemConfigDoc.data();
      return {
        guestSavesPerMinute:
          data.guestSavesPerMinute ||
          COST_PROTECTION_CONFIG.DEFAULT_SAVE_RATE_LIMITS.guestSavesPerMinute,
        guestSavesPerHour:
          data.guestSavesPerHour ||
          COST_PROTECTION_CONFIG.DEFAULT_SAVE_RATE_LIMITS.guestSavesPerHour,
        registeredSavesPerMinute:
          data.registeredSavesPerMinute ||
          COST_PROTECTION_CONFIG.DEFAULT_SAVE_RATE_LIMITS
            .registeredSavesPerMinute,
        registeredSavesPerHour:
          data.registeredSavesPerHour ||
          COST_PROTECTION_CONFIG.DEFAULT_SAVE_RATE_LIMITS
            .registeredSavesPerHour,
        cooldownSeconds:
          data.saveCooldownSeconds ||
          COST_PROTECTION_CONFIG.DEFAULT_SAVE_RATE_LIMITS.cooldownSeconds,
        enforceSaveRateLimits: data.enforceSaveRateLimits || false,
      };
    }

    return {
      ...COST_PROTECTION_CONFIG.DEFAULT_SAVE_RATE_LIMITS,
      enforceSaveRateLimits: false,
    };
  } catch (error) {
    console.error("Error getting save rate limits:", error);
    // Return defaults on error
    return {
      ...COST_PROTECTION_CONFIG.DEFAULT_SAVE_RATE_LIMITS,
      enforceSaveRateLimits: false,
    };
  }
};

// Check if save operation is allowed for user
export const checkSaveRateLimit = async (userId, userType = "registered") => {
  try {
    cleanSaveCache(); // Clean expired entries

    const limits = await getSaveRateLimits();

    // If rate limiting is disabled, allow all saves
    if (!limits.enforceSaveRateLimits) {
      return {
        success: true,
        allowed: true,
        remainingMinute: 999,
        remainingHour: 999,
        nextAllowedTime: null,
      };
    }

    const now = Date.now();
    const cacheKey = `save_${userId}`;
    const userSaveData = saveOperationCache.get(cacheKey) || {
      saves: [],
      lastSave: 0,
      timestamp: now,
    };

    // Check cooldown period
    const timeSinceLastSave = now - userSaveData.lastSave;
    const cooldownMs = limits.cooldownSeconds * 1000;

    if (timeSinceLastSave < cooldownMs) {
      const nextAllowedTime = userSaveData.lastSave + cooldownMs;
      return {
        success: false,
        allowed: false,
        error: `Please wait ${Math.ceil(
          (nextAllowedTime - now) / 1000
        )} seconds before saving again`,
        nextAllowedTime,
        rateLimitType: "cooldown",
      };
    }

    // Determine user limits
    const maxPerMinute =
      userType === "guest"
        ? limits.guestSavesPerMinute
        : limits.registeredSavesPerMinute;
    const maxPerHour =
      userType === "guest"
        ? limits.guestSavesPerHour
        : limits.registeredSavesPerHour;

    // Count saves in last minute and hour
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    const savesInLastMinute = userSaveData.saves.filter(
      (saveTime) => saveTime > oneMinuteAgo
    ).length;
    const savesInLastHour = userSaveData.saves.filter(
      (saveTime) => saveTime > oneHourAgo
    ).length;

    // Check limits
    if (savesInLastMinute >= maxPerMinute) {
      return {
        success: false,
        allowed: false,
        error: `Rate limit exceeded: ${maxPerMinute} saves per minute for ${userType} users`,
        rateLimitType: "minute",
        remainingMinute: 0,
        remainingHour: Math.max(0, maxPerHour - savesInLastHour),
      };
    }

    if (savesInLastHour >= maxPerHour) {
      return {
        success: false,
        allowed: false,
        error: `Rate limit exceeded: ${maxPerHour} saves per hour for ${userType} users`,
        rateLimitType: "hour",
        remainingMinute: Math.max(0, maxPerMinute - savesInLastMinute),
        remainingHour: 0,
      };
    }

    return {
      success: true,
      allowed: true,
      remainingMinute: Math.max(0, maxPerMinute - savesInLastMinute - 1), // -1 for current save
      remainingHour: Math.max(0, maxPerHour - savesInLastHour - 1),
      nextAllowedTime: null,
    };
  } catch (error) {
    console.error("Error checking save rate limit:", error);
    // On error, allow the operation but log it
    return {
      success: true,
      allowed: true,
      error: "Could not verify rate limits",
    };
  }
};

// Record a save operation
export const recordSaveOperation = async (userId) => {
  try {
    cleanSaveCache();

    const now = Date.now();
    const cacheKey = `save_${userId}`;
    const userSaveData = saveOperationCache.get(cacheKey) || {
      saves: [],
      lastSave: 0,
      timestamp: now,
    };

    // Add current save to the list
    userSaveData.saves.push(now);
    userSaveData.lastSave = now;
    userSaveData.timestamp = now;

    // Keep only saves from last hour to prevent memory bloat
    const oneHourAgo = now - 60 * 60 * 1000;
    userSaveData.saves = userSaveData.saves.filter(
      (saveTime) => saveTime > oneHourAgo
    );

    // Update cache
    saveOperationCache.set(cacheKey, userSaveData);

    return { success: true };
  } catch (error) {
    console.error("Error recording save operation:", error);
    return { success: false, error: error.message };
  }
};

// Get save operation statistics for user
export const getSaveOperationStats = async (userId) => {
  try {
    cleanSaveCache();

    const cacheKey = `save_${userId}`;
    const userSaveData = saveOperationCache.get(cacheKey);

    if (!userSaveData) {
      return {
        success: true,
        data: {
          savesInLastMinute: 0,
          savesInLastHour: 0,
          lastSaveTime: null,
          totalSaves: 0,
        },
      };
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    const savesInLastMinute = userSaveData.saves.filter(
      (saveTime) => saveTime > oneMinuteAgo
    ).length;
    const savesInLastHour = userSaveData.saves.filter(
      (saveTime) => saveTime > oneHourAgo
    ).length;

    return {
      success: true,
      data: {
        savesInLastMinute,
        savesInLastHour,
        lastSaveTime:
          userSaveData.lastSave > 0 ? new Date(userSaveData.lastSave) : null,
        totalSaves: userSaveData.saves.length,
      },
    };
  } catch (error) {
    console.error("Error getting save operation stats:", error);
    return { success: false, error: error.message };
  }
};
