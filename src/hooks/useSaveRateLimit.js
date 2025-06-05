import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  checkSaveRateLimit,
  recordSaveOperation,
  getSaveOperationStats,
  getSaveRateLimits,
} from "../services/costProtection";

export const useSaveRateLimit = () => {
  const { currentUser, isUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState({
    allowed: true,
    remainingMinute: 999,
    remainingHour: 999,
    nextAllowedTime: null,
    error: null,
  });
  const [saveStats, setSaveStats] = useState({
    savesInLastMinute: 0,
    savesInLastHour: 0,
    lastSaveTime: null,
    totalSaves: 0,
  });
  const [rateLimitSettings, setRateLimitSettings] = useState(null);

  // Determine user type
  const userType = currentUser && isUser() ? "registered" : "guest";
  const userId = currentUser?.uid || "anonymous";

  // Load rate limit settings
  const loadRateLimitSettings = useCallback(async () => {
    try {
      const settings = await getSaveRateLimits();
      setRateLimitSettings(settings);
    } catch (error) {
      console.error("Error loading rate limit settings:", error);
    }
  }, []);

  // Check rate limit status
  const checkRateLimit = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const result = await checkSaveRateLimit(userId, userType);

      setRateLimitStatus({
        allowed: result.allowed,
        remainingMinute: result.remainingMinute || 0,
        remainingHour: result.remainingHour || 0,
        nextAllowedTime: result.nextAllowedTime,
        error: result.error || null,
        rateLimitType: result.rateLimitType || null,
      });

      return result;
    } catch (error) {
      console.error("Error checking rate limit:", error);
      setRateLimitStatus({
        allowed: true, // Allow on error
        remainingMinute: 999,
        remainingHour: 999,
        nextAllowedTime: null,
        error: "Could not verify rate limits",
      });
      return { success: false, allowed: true, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [userId, userType]);

  // Record save operation
  const recordSave = useCallback(async () => {
    if (!userId) return { success: false, error: "No user ID" };

    try {
      const result = await recordSaveOperation(userId);

      // Refresh stats after recording
      await loadSaveStats();
      await checkRateLimit();

      return result;
    } catch (error) {
      console.error("Error recording save operation:", error);
      return { success: false, error: error.message };
    }
  }, [userId, checkRateLimit]);

  // Load save statistics
  const loadSaveStats = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await getSaveOperationStats(userId);
      if (result.success) {
        setSaveStats(result.data);
      }
    } catch (error) {
      console.error("Error loading save stats:", error);
    }
  }, [userId]);

  // Wrapper for save operations with rate limiting
  const performSave = useCallback(
    async (saveFunction, ...args) => {
      try {
        setIsLoading(true);

        // Check rate limit before saving
        const rateLimitCheck = await checkRateLimit();

        if (!rateLimitCheck.allowed) {
          return {
            success: false,
            error: rateLimitCheck.error,
            rateLimited: true,
            rateLimitType: rateLimitCheck.rateLimitType,
          };
        }

        // Perform the actual save operation
        const saveResult = await saveFunction(...args);

        if (saveResult.success) {
          // Record the save operation for rate limiting
          await recordSave();
        }

        return {
          ...saveResult,
          rateLimited: false,
        };
      } catch (error) {
        console.error("Error in performSave:", error);
        return {
          success: false,
          error: error.message,
          rateLimited: false,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [checkRateLimit, recordSave]
  );

  // Get remaining time until next save allowed
  const getRemainingCooldownTime = useCallback(() => {
    if (!rateLimitStatus.nextAllowedTime) return 0;

    const remaining = rateLimitStatus.nextAllowedTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }, [rateLimitStatus.nextAllowedTime]);

  // Load initial data
  useEffect(() => {
    loadRateLimitSettings();
    loadSaveStats();
    checkRateLimit();
  }, [loadRateLimitSettings, loadSaveStats, checkRateLimit]);

  // Auto-refresh rate limit status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkRateLimit();
      loadSaveStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkRateLimit, loadSaveStats]);

  return {
    // Status
    isLoading,
    rateLimitStatus,
    saveStats,
    rateLimitSettings,
    userType,

    // Functions
    performSave,
    checkRateLimit,
    loadSaveStats,
    recordSave,
    getRemainingCooldownTime,

    // Computed values
    canSave: rateLimitStatus.allowed && !isLoading,
    isRateLimited: !rateLimitStatus.allowed,
    remainingCooldownSeconds: getRemainingCooldownTime(),
  };
};
