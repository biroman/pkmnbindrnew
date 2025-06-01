import { useState } from "react";
import { Mail, X, RefreshCw } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Alert, AlertDescription, Button } from "../ui";

const EmailVerificationBanner = ({ className = "" }) => {
  const { currentUser, isEmailVerified, sendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is verified or dismissed
  if (!currentUser || isEmailVerified() || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage("");

    try {
      const result = await sendVerificationEmail();
      if (result.success) {
        setResendMessage("Verification email sent! Check your inbox.");
      } else {
        setResendMessage(result.error || "Failed to send verification email.");
      }
    } catch (error) {
      setResendMessage("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert
      className={`border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <AlertDescription>
              <div className="space-y-2">
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  Please verify your email address
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  We sent a verification email to{" "}
                  <span className="font-semibold">{currentUser.email}</span>.
                  Verify your email to unlock all features including creating
                  binders and sharing collections.
                </p>
                {resendMessage && (
                  <p
                    className={`text-sm font-medium ${
                      resendMessage.includes("sent")
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {resendMessage}
                  </p>
                )}
                <div className="flex items-center space-x-3 pt-1">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    size="sm"
                    variant="outline"
                    className="text-amber-800 border-amber-300 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-600 dark:hover:bg-amber-800"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Email
                      </>
                    )}
                  </Button>
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Check your spam folder too
                  </span>
                </div>
              </div>
            </AlertDescription>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200 p-1"
          aria-label="Dismiss verification reminder"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
};

export default EmailVerificationBanner;
