/**
 * Security Monitoring for Profile Picture Uploads
 *
 * This module provides client-side security monitoring to detect
 * and prevent suspicious upload patterns before they reach the server.
 */

// Track upload attempts per user
const uploadAttempts = new Map();
const MAX_DAILY_UPLOADS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get user's upload statistics for today
 */
const getUserStats = (userId) => {
  const today = new Date().toDateString();
  const userKey = `${userId}_${today}`;

  return (
    uploadAttempts.get(userKey) || {
      successful: 0,
      failed: 0,
      lastFailure: null,
      locked: false,
    }
  );
};

/**
 * Update user's upload statistics
 */
const updateUserStats = (userId, isSuccess, error = null) => {
  const today = new Date().toDateString();
  const userKey = `${userId}_${today}`;
  const stats = getUserStats(userId);

  if (isSuccess) {
    stats.successful++;
  } else {
    stats.failed++;
    stats.lastFailure = Date.now();

    // Lock user if too many failures
    if (stats.failed >= MAX_FAILED_ATTEMPTS) {
      stats.locked = true;
    }
  }

  uploadAttempts.set(userKey, stats);
};

/**
 * Check if user is locked out due to suspicious activity
 */
export const checkUserLockout = (userId) => {
  const stats = getUserStats(userId);

  if (stats.locked && stats.lastFailure) {
    const timeSinceLastFailure = Date.now() - stats.lastFailure;

    if (timeSinceLastFailure < LOCKOUT_DURATION) {
      const remainingTime = Math.ceil(
        (LOCKOUT_DURATION - timeSinceLastFailure) / 60000
      );
      return {
        locked: true,
        error: `Account temporarily locked due to suspicious activity. Try again in ${remainingTime} minutes.`,
      };
    } else {
      // Unlock user after cooldown period
      stats.locked = false;
      stats.failed = 0;
      uploadAttempts.set(`${userId}_${new Date().toDateString()}`, stats);
    }
  }

  return { locked: false };
};

/**
 * Check if user has exceeded daily upload limits
 */
export const checkDailyLimits = (userId) => {
  const stats = getUserStats(userId);

  if (stats.successful >= MAX_DAILY_UPLOADS) {
    return {
      exceeded: true,
      error: `Daily upload limit of ${MAX_DAILY_UPLOADS} reached. Try again tomorrow.`,
    };
  }

  return { exceeded: false };
};

/**
 * Validate file for potential security threats
 */
export const validateFileForThreats = (file) => {
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(php|js|html|exe|bat|cmd|sh)$/i,
    /script/i,
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+=/i, // event handlers
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        threat: true,
        error: "File name contains potentially dangerous content",
      };
    }
  }

  // Check file size for bomb attacks (extremely large files)
  if (file.size > 50 * 1024 * 1024) {
    // 50MB absolute max
    return {
      threat: true,
      error: "File size exceeds security limits",
    };
  }

  return { threat: false };
};

/**
 * Record upload attempt and update security statistics
 */
export const recordUploadAttempt = (userId, success, error = null) => {
  updateUserStats(userId, success, error);

  // Log security events (in production, send to monitoring service)
  if (!success) {
    console.warn(`Upload security event for user ${userId}:`, {
      error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }
};

/**
 * Get user's current security status
 */
export const getUserSecurityStatus = (userId) => {
  const stats = getUserStats(userId);

  return {
    uploadsToday: stats.successful,
    failedAttempts: stats.failed,
    dailyLimitRemaining: Math.max(0, MAX_DAILY_UPLOADS - stats.successful),
    isLocked: stats.locked,
    canUpload: !stats.locked && stats.successful < MAX_DAILY_UPLOADS,
  };
};
