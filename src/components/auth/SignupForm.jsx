import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
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

  const { signup, signinWithGoogle } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  return (
    <Card variant="elevated" className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create account
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Join us and start your journey
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Display name"
          name="displayName"
          type="text"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="Enter your display name"
          required
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          helperText="Must be at least 6 characters"
          required
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
        />

        <Button type="submit" loading={loading} className="w-full">
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
    </Card>
  );
};

export default SignupForm;
