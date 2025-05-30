import { useState, useEffect } from "react";
import { Mail, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

const EmailVerification = ({
  isEmailVerified,
  sendVerificationEmail,
  refreshUser,
}) => {
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  const [verificationAlert, setVerificationAlert] = useState(null);

  // Cooldown timers
  useEffect(() => {
    let emailTimer;
    let refreshTimer;

    if (emailCooldown > 0) {
      emailTimer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
    }

    if (refreshCooldown > 0) {
      refreshTimer = setTimeout(
        () => setRefreshCooldown(refreshCooldown - 1),
        1000
      );
    }

    return () => {
      if (emailTimer) clearTimeout(emailTimer);
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [emailCooldown, refreshCooldown]);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (verificationAlert) {
      const timer = setTimeout(() => setVerificationAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [verificationAlert]);

  // Handle email verification
  const handleSendVerification = async () => {
    if (emailCooldown > 0) return;

    setIsSendingVerification(true);
    setVerificationAlert(null);

    try {
      const result = await sendVerificationEmail();
      if (result.success) {
        setVerificationAlert({
          type: "success",
          message: "Verification email sent! Check your inbox.",
        });
        setEmailCooldown(60); // 60 second cooldown
      } else {
        setVerificationAlert({
          type: "error",
          message: result.error || "Failed to send verification email",
        });
      }
    } catch (error) {
      setVerificationAlert({
        type: "error",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Handle refresh verification status
  const handleRefreshVerification = async () => {
    if (refreshCooldown > 0) return;

    setIsRefreshing(true);
    setVerificationAlert(null);

    try {
      const result = await refreshUser();
      if (result.success) {
        if (isEmailVerified()) {
          setVerificationAlert({
            type: "success",
            message: "Email verification confirmed!",
          });
        } else {
          setVerificationAlert({
            type: "info",
            message:
              "Email is still not verified. Please check your inbox and click the verification link.",
          });
        }
        setRefreshCooldown(10); // 10 second cooldown
      }
    } catch (error) {
      console.error("Refresh verification error:", error);
      setVerificationAlert({
        type: "error",
        message:
          error.message ||
          "Failed to refresh verification status. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Don't show component if email is already verified
  if (isEmailVerified()) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Email Verification
        </h2>
      </div>

      <Alert alert={verificationAlert} />

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Email Verification Status
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your email is not verified
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleSendVerification}
              loading={isSendingVerification}
              disabled={isSendingVerification || emailCooldown > 0}
              size="sm"
              variant="outline"
            >
              {emailCooldown > 0 ? `Wait ${emailCooldown}s` : "Resend Email"}
            </Button>
            <Button
              onClick={handleRefreshVerification}
              loading={isRefreshing}
              disabled={isRefreshing || refreshCooldown > 0}
              size="sm"
              variant="ghost"
              title={
                refreshCooldown > 0
                  ? `Wait ${refreshCooldown} seconds before refreshing again`
                  : "Refresh verification status"
              }
            >
              <RefreshCw className="h-4 w-4" />
              {refreshCooldown > 0 && (
                <span className="ml-1 text-xs">{refreshCooldown}s</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
