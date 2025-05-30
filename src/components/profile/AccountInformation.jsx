import { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

const AccountInformation = ({
  currentUser,
  userProfile,
  updateUserFirestoreProfile,
}) => {
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);

  // Initialize display name
  useEffect(() => {
    setDisplayName(userProfile?.displayName || currentUser?.displayName || "");
  }, [userProfile, currentUser]);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (profileAlert) {
      const timer = setTimeout(() => setProfileAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [profileAlert]);

  // Validation function
  const validateDisplayName = (name) => {
    if (!name.trim()) return "Display name is required";
    if (name.length < 2) return "Display name must be at least 2 characters";
    if (name.length > 30) return "Display name must be less than 30 characters";
    if (!/^[a-zA-Z0-9\s_-]+$/.test(name))
      return "Display name can only contain letters, numbers, spaces, underscores, and dashes";
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

  return (
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
                (userProfile?.displayName || currentUser?.displayName || "")
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
  );
};

export default AccountInformation;
