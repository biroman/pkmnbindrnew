import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardContent,
  Input,
  Button,
  Alert,
  AlertDescription,
  FormField,
  Label,
  FormMessage,
  FormDescription,
} from "../ui";
import GoogleSignInButton from "./GoogleSignInButton";
import AuthDivider from "./AuthDivider";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

const SignupForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const { signup, signinWithGoogle } = useAuth();

  // Real-time validation
  useEffect(() => {
    const errors = {};

    if (touchedFields.displayName && !formData.displayName.trim()) {
      errors.displayName = "Display name is required";
    }

    if (touchedFields.email && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (touchedFields.password && formData.password) {
      if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }

    if (touchedFields.confirmPassword && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
  }, [formData, touchedFields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (fieldName) => {
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const validateForm = () => {
    if (
      !formData.displayName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Please fill in all fields";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched for validation display
    setTouchedFields({
      displayName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");
      setLoading(true);
      await signup(formData.email, formData.password, formData.displayName);
    } catch (error) {
      setError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signinWithGoogle();
    } catch (error) {
      setError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    Object.keys(validationErrors).length === 0 &&
    formData.displayName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword;

  return (
    <Card variant="elevated" className="w-full max-w-md mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join us and start your journey
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField>
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              onBlur={() => handleBlur("displayName")}
              placeholder="Enter your display name"
              className={validationErrors.displayName ? "border-red-500" : ""}
              required
            />
            {validationErrors.displayName && (
              <FormMessage>{validationErrors.displayName}</FormMessage>
            )}
          </FormField>

          <FormField>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              placeholder="Enter your email"
              className={validationErrors.email ? "border-red-500" : ""}
              required
            />
            {validationErrors.email && (
              <FormMessage>{validationErrors.email}</FormMessage>
            )}
          </FormField>

          <FormField>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              placeholder="Create a password"
              className={validationErrors.password ? "border-red-500" : ""}
              required
            />
            <FormDescription>Must be at least 6 characters</FormDescription>
            {validationErrors.password && (
              <FormMessage>{validationErrors.password}</FormMessage>
            )}
          </FormField>

          <FormField>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="Confirm your password"
              className={
                validationErrors.confirmPassword ? "border-red-500" : ""
              }
              required
            />
            {validationErrors.confirmPassword && (
              <FormMessage>{validationErrors.confirmPassword}</FormMessage>
            )}
          </FormField>

          <Button
            type="submit"
            loading={loading}
            disabled={loading || !isFormValid}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <AuthDivider />

        <GoogleSignInButton
          onGoogleSignIn={handleGoogleSignIn}
          loading={loading}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <button
              onClick={onToggleMode}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
