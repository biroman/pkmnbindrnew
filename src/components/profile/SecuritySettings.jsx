import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import {
  Input,
  Button,
  Alert,
  AlertDescription,
  FormField,
  Label,
  FormMessage,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui";
import {
  getPasswordRequirements,
  validateStrongPassword,
  isPasswordValid,
} from "../../utils/passwordValidation";
import PasswordStrengthIndicator from "../common/PasswordStrengthIndicator";
import { useEmailVerificationRestrictions } from "../../hooks/useEmailVerificationRestrictions";

// Enhanced password field with strength indicator
const PasswordField = ({
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleShow,
  error,
  id,
  showStrength = false,
  disabled = false,
}) => (
  <FormField>
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onToggleShow}
        disabled={disabled}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
    {error && <FormMessage>{error}</FormMessage>}
    {showStrength && <PasswordStrengthIndicator password={value} />}
  </FormField>
);

const SecuritySettings = ({ changePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const { isFeatureRestricted, getRestrictionMessage } =
    useEmailVerificationRestrictions();
  const isPasswordChangeRestricted = isFeatureRestricted("changePassword");

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (passwordAlert) {
      const timer = setTimeout(() => setPasswordAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordAlert]);

  // Real-time validation
  useEffect(() => {
    const errors = {};

    if (newPassword) {
      const passwordError = validateStrongPassword(newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      }
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
  }, [newPassword, confirmPassword]);

  // Basic validation functions
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    return null;
  };

  const validatePasswordMatch = (password, confirm) => {
    if (password !== confirm) return "Passwords do not match";
    return null;
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (isPasswordChangeRestricted) {
      setPasswordAlert({
        type: "error",
        message: getRestrictionMessage("changePassword"),
      });
      return;
    }

    const currentPasswordError = validatePassword(currentPassword);
    const newPasswordError = validateStrongPassword(newPassword);
    const matchError = validatePasswordMatch(newPassword, confirmPassword);

    if (currentPasswordError) {
      setPasswordAlert({ type: "error", message: currentPasswordError });
      return;
    }
    if (newPasswordError) {
      setPasswordAlert({ type: "error", message: newPasswordError });
      return;
    }
    if (matchError) {
      setPasswordAlert({ type: "error", message: matchError });
      return;
    }

    setIsChangingPassword(true);
    setPasswordAlert(null);

    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setPasswordAlert({
          type: "success",
          message:
            "Password changed successfully! Your new strong password is now active.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setValidationErrors({});
      } else {
        // Handle specific error cases with additional context
        let errorMessage = result.error;

        if (result.error.includes("Current password is incorrect")) {
          errorMessage =
            "Current password is incorrect. Please double-check your current password and try again.";
        } else if (result.error.includes("New password is too weak")) {
          errorMessage =
            "New password is too weak. Please ensure it meets all the security requirements above.";
        }

        setPasswordAlert({
          type: "error",
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordAlert({
        type: "error",
        message:
          "An unexpected error occurred while changing your password. Please try again.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          Password Security
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPasswordChangeRestricted && (
          <Alert variant="warning" className="mb-6">
            <AlertDescription>
              ⚠️ {getRestrictionMessage("changePassword")}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleChangePassword} className="space-y-6">
          {passwordAlert && (
            <Alert
              variant={
                passwordAlert.type === "error" ? "destructive" : "success"
              }
            >
              <AlertDescription>{passwordAlert.message}</AlertDescription>
            </Alert>
          )}

          <PasswordField
            id="current-password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            showPassword={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            disabled={isPasswordChangeRestricted}
          />

          <PasswordField
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            showPassword={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
            error={validationErrors.newPassword}
            showStrength={true}
            disabled={isPasswordChangeRestricted}
          />

          <PasswordField
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            error={validationErrors.confirmPassword}
            disabled={isPasswordChangeRestricted}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isChangingPassword}
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                !isPasswordValid(newPassword) ||
                Object.keys(validationErrors).length > 0 ||
                isPasswordChangeRestricted
              }
              className="flex items-center"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
