import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import {
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Calendar,
  Save,
  RefreshCw,
} from "lucide-react";

const Profile = () => {
  const {
    currentUser,
    userProfile,
    updateUserFirestoreProfile,
    changePassword,
    sendVerificationEmail,
    isEmailVerified,
    refreshUser,
  } = useAuth();

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cooldown states
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [refreshCooldown, setRefreshCooldown] = useState(0);

  // Alert states
  const [profileAlert, setProfileAlert] = useState(null);
  const [passwordAlert, setPasswordAlert] = useState(null);
  const [verificationAlert, setVerificationAlert] = useState(null);

  // Initialize display name
  useEffect(() => {
    setDisplayName(userProfile?.displayName || currentUser?.displayName || "");
  }, [userProfile, currentUser]);

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
    const timers = [];
    if (profileAlert) {
      timers.push(setTimeout(() => setProfileAlert(null), 5000));
    }
    if (passwordAlert) {
      timers.push(setTimeout(() => setPasswordAlert(null), 5000));
    }
    if (verificationAlert) {
      timers.push(setTimeout(() => setVerificationAlert(null), 5000));
    }
    return () => timers.forEach(clearTimeout);
  }, [profileAlert, passwordAlert, verificationAlert]);

  // Validation functions
  const validateDisplayName = (name) => {
    if (!name.trim()) return "Display name is required";
    if (name.length < 2) return "Display name must be at least 2 characters";
    if (name.length > 30) return "Display name must be less than 30 characters";
    if (!/^[a-zA-Z0-9\s_-]+$/.test(name))
      return "Display name can only contain letters, numbers, spaces, underscores, and dashes";
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const validatePasswordMatch = (password, confirm) => {
    if (password !== confirm) return "Passwords do not match";
    return null;
  };

  // Handle display name update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const nameError = validateDisplayName(displayName);
    if (nameError) {
      setProfileAlert({ type: "error", message: nameError });
      return;
    }

    if (
      displayName ===
      (userProfile?.displayName || currentUser?.displayName || "")
    ) {
      setProfileAlert({ type: "info", message: "No changes detected" });
      return;
    }

    setIsUpdatingProfile(true);
    setProfileAlert(null);

    try {
      const result = await updateUserFirestoreProfile({ displayName });
      if (result.success) {
        setProfileAlert({
          type: "success",
          message: "Display name updated successfully!",
        });
      } else {
        setProfileAlert({
          type: "error",
          message: result.error || "Failed to update display name",
        });
      }
    } catch (error) {
      setProfileAlert({
        type: "error",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
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

  // Alert component
  const Alert = ({ alert, onClose }) => {
    if (!alert) return null;

    const bgColor = {
      success:
        "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    }[alert.type];

    const textColor = {
      success: "text-green-800 dark:text-green-200",
      error: "text-red-800 dark:text-red-200",
      info: "text-blue-800 dark:text-blue-200",
    }[alert.type];

    const icon = {
      success: <CheckCircle className="h-4 w-4" />,
      error: <AlertTriangle className="h-4 w-4" />,
      info: <Shield className="h-4 w-4" />,
    }[alert.type];

    return (
      <div className={`border rounded-lg p-3 ${bgColor}`}>
        <div className={`flex items-center ${textColor}`}>
          {icon}
          <span className="ml-2 text-sm">{alert.message}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your account settings, security, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Account Information
                </h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Alert alert={profileAlert} />

                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={30}
                  helperText="2-30 characters. Letters, numbers, spaces, underscores, and dashes only."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {currentUser?.email}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={isUpdatingProfile}
                    disabled={
                      !displayName.trim() ||
                      displayName ===
                        (userProfile?.displayName ||
                          currentUser?.displayName ||
                          "")
                    }
                    className="flex items-center"
                  >
                    {isUpdatingProfile ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Email Verification */}
            {!isEmailVerified() && (
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
                      {isEmailVerified() ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Email Verification Status
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isEmailVerified()
                            ? "Your email is verified"
                            : "Your email is not verified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!isEmailVerified() && (
                        <Button
                          onClick={handleSendVerification}
                          loading={isSendingVerification}
                          disabled={isSendingVerification || emailCooldown > 0}
                          size="sm"
                          variant="outline"
                        >
                          {emailCooldown > 0
                            ? `Wait ${emailCooldown}s`
                            : "Resend Email"}
                        </Button>
                      )}
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
                          <span className="ml-1 text-xs">
                            {refreshCooldown}s
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
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
                    disabled={
                      !currentPassword || !newPassword || !confirmPassword
                    }
                    className="flex items-center"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Details
                </h2>
              </div>

              <div className="space-y-3">
                {userProfile?.createdAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Member Since
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(
                        userProfile.createdAt.seconds * 1000
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Account Type
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    Standard User
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Verification Status
                  </label>
                  <div className="mt-1 flex items-center">
                    {isEmailVerified() ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-sm text-amber-600 dark:text-amber-400">
                          Pending
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
