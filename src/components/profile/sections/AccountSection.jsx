import { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
  Mail,
  CreditCard,
  Activity,
  BarChart3,
  Clock,
  Globe,
  Save,
  Edit3,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
} from "../../ui";

const AccountSection = ({
  currentUser,
  userProfile,
  updateUserFirestoreProfile,
  isEmailVerified,
  isOwner,
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";

    let date;
    if (timestamp?.seconds) {
      // Firestore timestamp format
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp?.toDate) {
      // Firestore timestamp object with toDate method
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // Already a Date object
      date = timestamp;
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      // String or number timestamp
      date = new Date(timestamp);
    } else {
      return "Unknown";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";

    let date;
    if (timestamp?.seconds) {
      // Firestore timestamp format
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp?.toDate) {
      // Firestore timestamp object with toDate method
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // Already a Date object
      date = timestamp;
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      // String or number timestamp
      date = new Date(timestamp);
    } else {
      return "Unknown";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown";
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAccountAge = () => {
    if (!userProfile?.createdAt) return "Unknown";

    let created;
    const timestamp = userProfile.createdAt;

    if (timestamp?.seconds) {
      // Firestore timestamp format
      created = new Date(timestamp.seconds * 1000);
    } else if (timestamp?.toDate) {
      // Firestore timestamp object with toDate method
      created = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // Already a Date object
      created = timestamp;
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      // String or number timestamp
      created = new Date(timestamp);
    } else {
      return "Unknown";
    }

    // Check if date is valid
    if (isNaN(created.getTime())) {
      return "Unknown";
    }

    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months === 1 ? "" : "s"}`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} year${years === 1 ? "" : "s"}`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your personal information and account details
          </p>
        </div>

        {/* Profile Alert */}
        {profileAlert && <Alert alert={profileAlert} />}

        {/* Profile Information - Editable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                Profile Information
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
          <CardContent className="space-y-4">
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
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {currentUser?.email}
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    {isEmailVerified() ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isEmailVerified()
                        ? "Email verified"
                        : "Email verification pending"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Type
              </label>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {isOwner() ? (
                  <>
                    <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Owner
                    </span>
                    <Tooltip>
                      <TooltipContent>
                        <p>Full system access and administrative privileges</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Standard User
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Member Since
                </label>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {userProfile?.createdAt
                        ? formatDate(userProfile.createdAt)
                        : "Just now"}
                    </span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {userProfile?.createdAt
                          ? getAccountAge()
                          : "New account"}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Account age:{" "}
                        {userProfile?.createdAt
                          ? getAccountAge()
                          : "New account"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Login
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {userProfile?.lastLoginAt
                      ? formatTime(userProfile.lastLoginAt)
                      : "Current session"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collection Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                Collection Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Binders
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {userProfile?.totalBinders || 0}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Cards
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {userProfile?.totalCards || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AccountSection;
