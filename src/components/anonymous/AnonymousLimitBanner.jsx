/**
 * AnonymousLimitBanner Component
 *
 * Shows current usage and upgrade incentives for anonymous users.
 * Focuses on cloud storage and sharing benefits rather than capacity limits.
 */

import { useState } from "react";
import { Info, X, Users, Database, Cloud, CheckCircle } from "lucide-react";
import { useUserLimits } from "../../hooks/useUserLimits";
import { Card, CardContent, Button, Badge } from "../ui";
import { useNavigate } from "react-router-dom";

const AnonymousLimitBanner = ({
  currentBinderCount = 0,
  currentCardCount = 0,
  className = "",
  compact = false,
  onDismiss = null,
}) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const {
    isGuest,
    limits,
    getUsagePercentage,
    getRemainingCapacity,
    getUpgradeIncentives,
    shouldShowUpgradeBanner,
  } = useUserLimits();

  // Don't show for registered users or if dismissed
  if (!isGuest || !shouldShowUpgradeBanner || isDismissed) {
    return null;
  }

  const isUnlimitedBinders = limits.maxBinders === Number.MAX_SAFE_INTEGER;
  const isUnlimitedCards = limits.maxCardsPerBinder === Number.MAX_SAFE_INTEGER;
  const upgradeIncentives = getUpgradeIncentives();

  const handleSignUp = () => {
    navigate("/auth?mode=signup");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (compact) {
    return (
      <Card
        className={`border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 ${className}`}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Guest: {currentBinderCount} binders (local storage)
              </span>
              <Badge variant="outline" className="text-xs">
                No cloud sync
              </Badge>
            </div>
            <Button
              onClick={handleSignUp}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Cloud Storage
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800 ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Welcome, Guest User!
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You're using local storage mode - upgrade for cloud sync &
                  sharing
                </p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Binders Created
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {currentBinderCount}{" "}
                    {isUnlimitedBinders && "(Unlimited locally)"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Stored locally in your browser
                </p>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Local Storage Only
                  </span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  No sync • No sharing • Risk of data loss
                </p>
              </div>
            </div>

            {/* Upgrade Benefits */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Sign up for free to unlock:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {upgradeIncentives.benefits
                  .slice(0, 4)
                  .map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-blue-800 dark:text-blue-200">
                        {benefit}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSignUp}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Cloud className="h-4 w-4 mr-2" />
                Get Cloud Storage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth?mode=login")}
                className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/30"
              >
                Already have an account?
              </Button>
            </div>
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 p-1 ml-4"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousLimitBanner;
