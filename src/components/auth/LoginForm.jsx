import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Alert, AlertDescription } from "../ui/Alert";
import GoogleSignInButton from "./GoogleSignInButton";
import AuthDivider from "./AuthDivider";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
import { AlertTriangle, Eye, EyeOff, Mail, X } from "lucide-react";

const ForgotPasswordModal = ({ isOpen, onClose, onSendReset }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await onSendReset(email);
      setMessage(
        "Password reset email sent! Check your inbox and spam folder."
      );
      setEmail("");
    } catch (error) {
      setError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setMessage("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reset Password
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          {message && (
            <Alert variant="success" className="mb-4">
              <div className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <AlertDescription className="flex-1">
                  {message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <AlertDescription className="flex-1">{error}</AlertDescription>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email address
              </label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mb-4"
                disabled={loading}
                autoFocus
                maxLength={100}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const LoginForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const { signin, signinWithGoogle, resetPassword } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error when user starts typing
    if (error) {
      setError("");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      setError("Please fill in all fields correctly");
      return;
    }

    try {
      setError("");
      setFieldErrors({});
      setLoading(true);
      await signin(formData.email, formData.password);
    } catch (error) {
      // Log detailed error info in development only
      if (import.meta.env.DEV) {
        console.error("Login error:", error);
      }
      const friendlyMessage = getFriendlyErrorMessage(error);
      setError(friendlyMessage);

      // Highlight fields based on error type
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setFieldErrors({
          email: " ", // Space to trigger error styling without message
          password: " ", // Space to trigger error styling without message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setFieldErrors({});
      setLoading(true);
      await signinWithGoogle();
    } catch (error) {
      // Log detailed error info in development only
      if (import.meta.env.DEV) {
        console.error("Google sign-in error:", error);
      }
      setError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    await resetPassword(email);
  };

  return (
    <>
      <Card variant="elevated" className="w-full max-w-md mx-auto p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <AlertDescription className="flex-1">{error}</AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={
                fieldErrors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }
              maxLength={100}
              required
              autoComplete="email"
            />
            {fieldErrors.email && fieldErrors.email.trim() && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={
                  fieldErrors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500 pr-10"
                    : "pr-10"
                }
                maxLength={128}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && fieldErrors.password.trim() && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <AuthDivider />

        <GoogleSignInButton
          onGoogleSignIn={handleGoogleSignIn}
          loading={loading}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={onToggleMode}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </Card>

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onSendReset={handleForgotPassword}
      />
    </>
  );
};

export default LoginForm;
