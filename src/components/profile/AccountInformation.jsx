import { useState, useEffect } from "react";
import { User, Save, Edit3, Mail, Calendar } from "lucide-react";
import {
  Input,
  Button,
  Alert,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui";

const AccountInformation = ({
  currentUser,
  userProfile,
  updateUserFirestoreProfile,
}) => {
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        setIsDialogOpen(false);
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

  const formatJoinDate = (createdAt) => {
    if (!createdAt) return "Unknown";
    const date = new Date(createdAt.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center text-gray-900 dark:text-white">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Account Information
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit your profile information</p>
                </TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleUpdateProfile}>
                  <DialogHeader>
                    <DialogTitle>Edit Profile Information</DialogTitle>
                    <DialogDescription>
                      Update your display name and other profile details.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    {profileAlert && <Alert alert={profileAlert} />}

                    <div className="space-y-4">
                      <Input
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        maxLength={30}
                        helperText="2-30 characters. Letters, numbers, spaces, underscores, and dashes only."
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setProfileAlert(null);
                        setDisplayName(
                          userProfile?.displayName ||
                            currentUser?.displayName ||
                            ""
                        );
                      }}
                    >
                      Cancel
                    </Button>
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
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {userProfile?.displayName ||
                      currentUser?.displayName ||
                      "Not set"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {currentUser?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              {userProfile?.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatJoinDate(userProfile.createdAt)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                    {currentUser?.uid}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default AccountInformation;
