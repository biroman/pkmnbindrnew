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

// Move PasswordField outside the main component to prevent recreation
const PasswordField = ({
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleShow,
  error,
  id,
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
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
    {error && <FormMessage>{error}</FormMessage>}
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

    if (newPassword && newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
  }, [newPassword, confirmPassword]);

  // Validation functions
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const validatePasswordMatch = (password, confirm) => {
    if (password !== confirm) return "Passwords do not match";
    return null;
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    const currentPasswordError = validatePassword(currentPassword);
    const newPasswordError = validatePassword(newPassword);
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
          message: "Password changed successfully!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setValidationErrors({});
      } else {
        setPasswordAlert({
          type: "error",
          message: result.error || "Failed to change password",
        });
      }
    } catch (error) {
      setPasswordAlert({
        type: "error",
        message: "An unexpected error occurred",
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
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isChangingPassword}
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                Object.keys(validationErrors).length > 0
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
