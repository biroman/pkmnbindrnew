/**
 * StorageWarningBanner Component
 *
 * Shows local storage usage warnings for anonymous users and promotes
 * cloud storage benefits of registration.
 */

import { useState } from "react";
import { Database, X, Cloud, AlertTriangle, HardDrive } from "lucide-react";
import { useUserLimits } from "../../hooks/useUserLimits";
import { Alert, AlertDescription, Button, Badge } from "../ui";
import { useNavigate } from "react-router-dom";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const StorageWarningBanner = ({
  binderCount = 0,
  totalCardCount = 0,
  cacheCount = 0,
  className = "",
  onDismiss = null,
}) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const { isGuest, getStorageEstimate } = useUserLimits();

  // Don't show for registered users or if dismissed
  if (!isGuest || isDismissed) {
    return null;
  }

  // Add safety check for getStorageEstimate
  let storageEstimate;
  try {
    storageEstimate = getStorageEstimate?.(
      binderCount,
      totalCardCount,
      cacheCount
    );
  } catch (error) {
    console.warn("Error getting storage estimate:", error);
    return null;
  }

  // Don't show if no storage estimate or usage is very low
  if (!storageEstimate || storageEstimate.percentage < 25) {
    return null;
  }

  const { usage, limit, percentage, warning, formattedUsage, formattedLimit } =
    storageEstimate;

  // Additional safety checks for the values
  if (typeof percentage !== "number" || percentage < 0) {
    console.warn("Invalid storage percentage:", percentage);
    return null;
  }

  const handleSignUp = () => {
    navigate("/auth?mode=signup");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Determine warning level and styling
  const getWarningLevel = () => {
    if (percentage >= 90) {
      return {
        level: "critical",
        color: "red",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-800 dark:text-red-200",
        iconColor: "text-red-600 dark:text-red-400",
        badgeVariant: "destructive",
      };
    } else if (percentage >= 70) {
      return {
        level: "high",
        color: "amber",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
        textColor: "text-amber-800 dark:text-amber-200",
        iconColor: "text-amber-600 dark:text-amber-400",
        badgeVariant: "secondary",
      };
    } else {
      return {
        level: "medium",
        color: "blue",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-800 dark:text-blue-200",
        iconColor: "text-blue-600 dark:text-blue-400",
        badgeVariant: "secondary",
      };
    }
  };

  const warningLevel = getWarningLevel();

  return (
    <Alert
      className={`${warningLevel.bgColor} ${warningLevel.borderColor} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex items-center space-x-2">
            {warningLevel.level === "critical" ? (
              <AlertTriangle
                className={`h-5 w-5 ${warningLevel.iconColor} mt-0.5`}
              />
            ) : (
              <HardDrive
                className={`h-5 w-5 ${warningLevel.iconColor} mt-0.5`}
              />
            )}
            <Badge variant={warningLevel.badgeVariant} className="text-xs">
              {percentage}% Full
            </Badge>
          </div>

          <div className="flex-1">
            <AlertDescription>
              <div className="space-y-3">
                {/* Main Warning Message */}
                <div>
                  <p className={`font-medium ${warningLevel.textColor}`}>
                    {warningLevel.level === "critical"
                      ? "Local Storage Nearly Full"
                      : "Local Storage Usage Warning"}
                  </p>
                  <p
                    className={`text-sm ${warningLevel.textColor} opacity-90 mt-1`}
                  >
                    Using {formattedUsage || "N/A"} of {formattedLimit || "N/A"}{" "}
                    local browser storage
                    {warningLevel.level === "critical" &&
                      ". Your data may be at risk of being lost."}
                  </p>
                </div>

                {/* Storage Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className={`${warningLevel.textColor} opacity-75`}>
                    📁 {binderCount} binders
                  </div>
                  <div className={`${warningLevel.textColor} opacity-75`}>
                    🃏 {totalCardCount} cards
                  </div>
                  <div className={`${warningLevel.textColor} opacity-75`}>
                    💾 {cacheCount} cached items
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      warningLevel.level === "critical"
                        ? "bg-red-500"
                        : warningLevel.level === "high"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {/* Cloud Storage Benefits */}
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Cloud className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p
                        className={`text-sm font-medium ${warningLevel.textColor}`}
                      >
                        Unlimited Cloud Storage Available
                      </p>
                      <p
                        className={`text-xs ${warningLevel.textColor} opacity-80 mt-1`}
                      >
                        Sign up for free cloud storage with automatic backup and
                        sync across devices. Never worry about browser storage
                        limits again.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleSignUp}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Cloud className="h-4 w-4 mr-2" />
                    Get Cloud Storage
                  </Button>
                  <span
                    className={`text-xs ${warningLevel.textColor} opacity-75`}
                  >
                    Free forever • No credit card required
                  </span>
                </div>
              </div>
            </AlertDescription>
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={`${warningLevel.iconColor} hover:opacity-75 p-1 ml-2`}
            aria-label="Dismiss storage warning"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  );
};

export default StorageWarningBanner;
