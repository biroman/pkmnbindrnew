import { useState, useEffect, useCallback } from "react";
import { Save, Clock, AlertTriangle, Loader2 } from "lucide-react";
import Button from "./Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import Badge from "./Badge";
import { useSaveRateLimit } from "../../hooks/useSaveRateLimit";

/**
 * SaveButton Component
 *
 * A smart save button that includes rate limiting, cooldown indicators,
 * and user-friendly feedback about save restrictions.
 *
 * Usage Examples:
 *
 * Basic usage:
 * <SaveButton onClick={handleSave}>Save Changes</SaveButton>
 *
 * With stats display:
 * <SaveButton onClick={handleSave} showStats={true}>Save Binder</SaveButton>
 *
 * Custom styling:
 * <SaveButton
 *   onClick={handleSave}
 *   variant="outline"
 *   size="sm"
 *   className="w-full"
 * >
 *   Quick Save
 * </SaveButton>
 */
export const SaveButton = ({
  onClick,
  children = "Save",
  disabled = false,
  loading = false,
  variant = "default",
  size = "default",
  className = "",
  showStats = false,
  ...props
}) => {
  const {
    canSave,
    isRateLimited,
    remainingCooldownSeconds,
    rateLimitStatus,
    saveStats,
    rateLimitSettings,
    userType,
    performSave,
    isLoading: rateLimitLoading,
    checkRateLimit,
  } = useSaveRateLimit();

  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle cooldown countdown
  useEffect(() => {
    if (remainingCooldownSeconds > 0) {
      setCooldownTimer(remainingCooldownSeconds);

      const interval = setInterval(() => {
        setCooldownTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Trigger rate limit check when cooldown ends
            checkRateLimit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCooldownTimer(0);
    }
  }, [remainingCooldownSeconds, checkRateLimit]);

  // More aggressive real-time updates
  useEffect(() => {
    if (
      rateLimitSettings?.enforceSaveRateLimits &&
      (isRateLimited || cooldownTimer > 0)
    ) {
      const interval = setInterval(() => {
        checkRateLimit();
      }, 1000); // Check every second for immediate updates

      return () => clearInterval(interval);
    }
  }, [isRateLimited, cooldownTimer, rateLimitSettings, checkRateLimit]);

  // Determine if button should be disabled (moved before handleSave)
  const isButtonDisabled =
    disabled ||
    loading ||
    isProcessing ||
    rateLimitLoading ||
    cooldownTimer > 0 ||
    (rateLimitSettings?.enforceSaveRateLimits && (!canSave || isRateLimited));

  // Handle save with rate limiting
  const handleSave = useCallback(
    async (e) => {
      // Prevent double-clicks and multiple submissions
      if (isProcessing || !onClick || isButtonDisabled) return;

      e.preventDefault();
      e.stopPropagation();

      setIsProcessing(true);

      try {
        let result;

        if (rateLimitSettings?.enforceSaveRateLimits) {
          // Use rate-limited save
          result = await performSave(onClick);
        } else {
          // Direct save without rate limiting
          result = await onClick();
        }

        // Force a rate limit check after save
        setTimeout(() => {
          checkRateLimit();
        }, 100);

        return result;
      } catch (error) {
        console.error("Error in save operation:", error);
        return { success: false, error: error.message };
      } finally {
        // Add small delay to prevent rapid clicking
        setTimeout(() => {
          setIsProcessing(false);
        }, 500);
      }
    },
    [
      onClick,
      performSave,
      rateLimitSettings,
      isProcessing,
      isButtonDisabled,
      checkRateLimit,
    ]
  );

  // Get button text based on state
  const getButtonText = () => {
    if (loading || rateLimitLoading || isProcessing) return "Saving...";
    if (cooldownTimer > 0) return `Wait ${cooldownTimer}s`;
    if (isRateLimited) return "Rate Limited";
    return children;
  };

  // Get button icon based on state
  const getButtonIcon = () => {
    if (loading || rateLimitLoading || isProcessing)
      return <Loader2 className="h-4 w-4 animate-spin" />;
    if (cooldownTimer > 0) return <Clock className="h-4 w-4" />;
    if (isRateLimited) return <Clock className="h-4 w-4" />;
    return <Save className="h-4 w-4" />;
  };

  // Get tooltip content
  const getTooltipContent = () => {
    if (!rateLimitSettings?.enforceSaveRateLimits) {
      return "Rate limiting disabled";
    }

    if (cooldownTimer > 0) {
      return `Please wait ${cooldownTimer} seconds before saving again`;
    }

    if (isRateLimited) {
      const limitType =
        rateLimitStatus.rateLimitType === "minute" ? "minute" : "hour";
      return `Rate limit reached (${limitType}). Please wait before trying again.`;
    }

    if (canSave) {
      return `Available: ${rateLimitStatus.remainingMinute}/min, ${rateLimitStatus.remainingHour}/hour`;
    }

    return "Save operation";
  };

  // Get button variant and styling based on state
  const getButtonVariant = () => {
    // Always use secondary (gray) for disabled states
    if (isRateLimited || cooldownTimer > 0) return "secondary";
    return variant;
  };

  const getButtonClassName = () => {
    let buttonClassName = `relative ${className}`;

    // Add disabled styling for rate limited or cooldown states
    if (isRateLimited || cooldownTimer > 0) {
      buttonClassName += " opacity-60 cursor-not-allowed";
    }

    return buttonClassName;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleSave}
          disabled={isButtonDisabled}
          variant={getButtonVariant()}
          size={size}
          className={getButtonClassName()}
          {...props}
        >
          {getButtonIcon()}
          <span className="ml-2">{getButtonText()}</span>

          {/* Simple cooldown progress indicator */}
          {cooldownTimer > 0 && (
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-1000"
              style={{
                width: `${
                  ((remainingCooldownSeconds - cooldownTimer) /
                    remainingCooldownSeconds) *
                  100
                }%`,
              }}
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p>{getTooltipContent()}</p>
          {showStats && rateLimitSettings?.enforceSaveRateLimits && (
            <div className="text-xs text-gray-500 border-t pt-1">
              <p>
                Recent saves: {saveStats.savesInLastMinute}/min,{" "}
                {saveStats.savesInLastHour}/hour
              </p>
              <p>User type: {userType}</p>
              {cooldownTimer > 0 && (
                <p className="text-blue-600">
                  Cooldown: {cooldownTimer}s remaining
                </p>
              )}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
