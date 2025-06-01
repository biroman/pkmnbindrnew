/**
 * UpgradePrompt Component
 *
 * Context-specific upgrade messaging that appears when users attempt
 * to use features that require registration or reach their limits.
 */

import { useState } from "react";
import {
  Lock,
  ArrowRight,
  X,
  Share2,
  Download,
  Database,
  Target,
  Layers,
  Crown,
  CheckCircle2,
} from "lucide-react";
import { useUserLimits } from "../../hooks/useUserLimits";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
} from "../ui";
import { useNavigate } from "react-router-dom";

const TRIGGER_ICONS = {
  sharing: Share2,
  export: Download,
  setCompletion: Target,
  bulkOps: Layers,
  onBinderLimit: Database,
  onCardLimit: Database,
  onShareAttempt: Share2,
  onExportAttempt: Download,
  default: Crown,
};

const UpgradePrompt = ({
  isOpen,
  onClose,
  trigger = null,
  title = null,
  message = null,
  className = "",
}) => {
  const navigate = useNavigate();
  const { isGuest, getUpgradeIncentives } = useUserLimits();
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Don't show for registered users
  if (!isGuest) {
    return null;
  }

  const upgradeIncentives = getUpgradeIncentives(trigger);
  const IconComponent = TRIGGER_ICONS[trigger] || TRIGGER_ICONS.default;

  // Default messages based on trigger
  const getDefaultContent = () => {
    switch (trigger) {
      case "onBinderLimit":
        return {
          title: "Binder Limit Reached",
          message:
            "You've reached the 3 binder limit for guest users. Sign up to create up to 25 binders and organize larger collections!",
        };
      case "onCardLimit":
        return {
          title: "Card Limit Reached",
          message:
            "This binder has reached the 50 card limit for guest users. Sign up for binders with up to 400 cards each!",
        };
      case "onShareAttempt":
        return {
          title: "Sharing Requires Account",
          message:
            "Create a free account to share your binders with friends and generate shareable links!",
        };
      case "onExportAttempt":
        return {
          title: "Export Requires Account",
          message:
            "Sign up to export your card lists in multiple formats and create print-friendly layouts!",
        };
      default:
        return {
          title: "Unlock Premium Features",
          message:
            "Sign up for free to unlock all features and remove limitations!",
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayTitle = title || defaultContent.title;
  const displayMessage = message || defaultContent.message;

  const handleSignUp = async () => {
    setIsSigningUp(true);
    try {
      navigate("/auth?mode=signup");
      onClose();
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogin = () => {
    navigate("/auth?mode=login");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-lg ${className}`}>
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-3 rounded-full">
              <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {displayTitle}
              </DialogTitle>
              <Badge variant="secondary" className="mt-1">
                <Lock className="h-3 w-3 mr-1" />
                Guest Account
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Message */}
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {displayMessage}
          </p>

          {/* Benefits List */}
          {upgradeIncentives && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                What you'll get with a free account:
              </h4>
              <div className="grid gap-2">
                {upgradeIncentives.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Security Note */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Database className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  Important: Your data is currently stored locally
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Guest data may be lost if you clear your browser or switch
                  devices. Sign up for permanent cloud storage and sync across
                  devices.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSignUp}
              disabled={isSigningUp}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {isSigningUp ? (
                "Redirecting..."
              ) : (
                <>
                  Create Free Account
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <Button
              onClick={handleLogin}
              variant="outline"
              className="flex-1 text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/30"
            >
              Already have account?
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePrompt;
