import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

const SecuritySettings = ({ changePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (passwordAlert) {
      const timer = setTimeout(() => setPasswordAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordAlert]);

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Security Settings
        </h2>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <Alert alert={passwordAlert} />

        <div className="relative">
          <Input
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            helperText="Minimum 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isChangingPassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            className="flex items-center"
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
