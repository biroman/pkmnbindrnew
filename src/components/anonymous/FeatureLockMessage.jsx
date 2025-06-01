/**
 * FeatureLockMessage Component
 *
 * Inline message component that appears when users try to access
 * features that are locked for anonymous users. Shows subtle upgrade prompts.
 */

import { Lock, ArrowRight, Info } from "lucide-react";
import { useUserLimits } from "../../hooks/useUserLimits";
import { Alert, AlertDescription, Button } from "../ui";
import { useNavigate } from "react-router-dom";

const FeatureLockMessage = ({
  feature,
  customMessage = null,
  showUpgradeButton = true,
  variant = "default", // default, subtle, bordered
  className = "",
  onUpgradeClick = null,
}) => {
  const navigate = useNavigate();
  const { isGuest, getFeatureLockMessage } = useUserLimits();

  // Don't show for registered users
  if (!isGuest) {
    return null;
  }

  const message = customMessage || getFeatureLockMessage(feature);

  if (!message) {
    return null;
  }

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      navigate("/auth?mode=signup");
    }
  };

  // Different visual variants
  const getVariantStyles = () => {
    switch (variant) {
      case "subtle":
        return {
          container:
            "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
          icon: "text-gray-500 dark:text-gray-400",
          text: "text-gray-700 dark:text-gray-300",
          button:
            "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm underline",
        };
      case "bordered":
        return {
          container:
            "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
          text: "text-blue-800 dark:text-blue-200",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      default:
        return {
          container:
            "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
          icon: "text-amber-600 dark:text-amber-400",
          text: "text-amber-800 dark:text-amber-200",
          button: "bg-amber-600 hover:bg-amber-700 text-white",
        };
    }
  };

  const styles = getVariantStyles();

  if (variant === "subtle") {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-lg border ${styles.container} ${className}`}
      >
        <div className="flex items-center space-x-2">
          <Lock className={`h-4 w-4 ${styles.icon}`} />
          <span className={`text-sm ${styles.text}`}>{message}</span>
        </div>
        {showUpgradeButton && (
          <button
            onClick={handleUpgradeClick}
            className={`${styles.button} transition-colors`}
          >
            Sign up
          </button>
        )}
      </div>
    );
  }

  return (
    <Alert className={`${styles.container} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Lock className={`h-5 w-5 ${styles.icon} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <AlertDescription>
              <div className="space-y-3">
                <p className={`${styles.text} font-medium`}>
                  Feature Locked for Guest Users
                </p>
                <p className={`text-sm ${styles.text} opacity-90`}>{message}</p>
                {showUpgradeButton && (
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={handleUpgradeClick}
                      size="sm"
                      className={styles.button}
                    >
                      Sign Up Free
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    <span className={`text-xs ${styles.text} opacity-75`}>
                      Takes less than 30 seconds
                    </span>
                  </div>
                )}
              </div>
            </AlertDescription>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default FeatureLockMessage;
