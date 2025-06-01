import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  confirmPasswordReset,
  applyActionCode,
  checkActionCode,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
import { validateStrongPassword } from "../../utils/passwordValidation";
import PasswordStrengthIndicator from "../common/PasswordStrengthIndicator";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Alert, AlertDescription } from "../ui/Alert";
import ThemeToggle from "../ui/ThemeToggle";
import {
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";

const AuthAction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [actionData, setActionData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password reset specific state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const mode = searchParams.get("mode");
  const actionCode = searchParams.get("oobCode");
  const continueUrl = searchParams.get("continueUrl");

  useEffect(() => {
    const handleAuthAction = async () => {
      if (!mode || !actionCode) {
        setError("Invalid or missing authentication parameters.");
        setLoading(false);
        return;
      }

      try {
        const info = await checkActionCode(auth, actionCode);
        setActionData(info);
        setLoading(false);
      } catch (error) {
        console.error("Auth action error:", error);
        setError(getFriendlyErrorMessage(error));
        setLoading(false);
      }
    };

    handleAuthAction();
  }, [mode, actionCode]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    const passwordError = validateStrongPassword(newPassword);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    setProcessing(true);
    setError("");
    setValidationError("");

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setSuccess(
        "Password reset successful! You can now sign in with your new password."
      );
    } catch (error) {
      console.error("Password reset error:", error);
      setError(getFriendlyErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  const handleEmailVerification = async () => {
    setProcessing(true);
    setError("");

    try {
      await applyActionCode(auth, actionCode);
      setSuccess(
        "Email verified successfully! You can now access all features."
      );
    } catch (error) {
      console.error("Email verification error:", error);
      setError(getFriendlyErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/auth");
  };

  const handleGoToDashboard = () => {
    navigate("/app/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-500">
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card variant="elevated" className="w-full max-w-md mx-auto p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verifying Request
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we process your authentication request...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-500">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md mx-auto p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img
                src="/logo.png"
                alt="Pokemon Binder Logo"
                className="h-16 w-16 mx-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>

            {mode === "resetPassword" && (
              <>
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Choose a new secure password for your account
                </p>
              </>
            )}

            {mode === "verifyEmail" && (
              <>
                <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Verify Email
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Confirm your email address to activate your account
                </p>
              </>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <Alert variant="success" className="mb-6">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <AlertDescription className="flex-1">
                  {success}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <AlertDescription className="flex-1">{error}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Content based on mode and state */}
          {!error && !success && mode === "resetPassword" && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {actionData?.data?.email && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Resetting password for:{" "}
                    <span className="font-semibold">
                      {actionData.data.email}
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {newPassword && (
                  <PasswordStrengthIndicator password={newPassword} />
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <AlertDescription className="flex-1">
                      {validationError}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <Button
                type="submit"
                loading={processing}
                className="w-full"
                disabled={!newPassword || !confirmPassword || processing}
              >
                {processing ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          )}

          {!error && !success && mode === "verifyEmail" && (
            <div className="space-y-6">
              {actionData?.data?.email && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Verifying email:{" "}
                    <span className="font-semibold">
                      {actionData.data.email}
                    </span>
                  </p>
                </div>
              )}

              <Button
                onClick={handleEmailVerification}
                loading={processing}
                className="w-full"
                disabled={processing}
              >
                {processing ? "Verifying Email..." : "Verify Email Address"}
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {success && (
              <Button onClick={handleGoToDashboard} className="w-full">
                Continue to Dashboard
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleGoToLogin}
              className="w-full flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Secure authentication powered by Firebase
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthAction;
