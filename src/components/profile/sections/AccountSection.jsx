import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HexColorPicker } from "react-colorful";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import Button from "../../ui/Button";
import { Input, Label } from "../../ui/Input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/Tooltip";
import {
  Edit3,
  Save,
  User,
  Mail,
  Globe,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  Camera,
  Sparkles,
  X,
  Check,
} from "lucide-react";
import ProfilePictureUpload from "../ProfilePictureUpload";

const AccountSection = ({
  currentUser,
  userProfile,
  updateUserFirestoreProfile,
  isEmailVerified,
  isOwner,
}) => {
  // Profile states
  const [profileAlert, setProfileAlert] = useState(null);
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || currentUser?.displayName || ""
  );
  const [editDisplayName, setEditDisplayName] = useState(displayName);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Display name rate limiting
  const [displayNameChanges, setDisplayNameChanges] = useState([]);

  // Customization states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileBgType, setProfileBgType] = useState(
    userProfile?.profileBgType || "gradient"
  );
  const [profileBgColor, setProfileBgColor] = useState(
    userProfile?.profileBgColor || "#3b82f6"
  );
  const [profileBgGradient, setProfileBgGradient] = useState(
    userProfile?.profileBgGradient || ["#3b82f6", "#8b5cf6"]
  );
  const [showColorPicker, setShowColorPicker] = useState({
    bg: false,
  });
  const [isUpdatingCustomization, setIsUpdatingCustomization] = useState(false);

  // Update states when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || currentUser?.displayName || "");
      setEditDisplayName(
        userProfile.displayName || currentUser?.displayName || ""
      );
    }

    // Initialize customization values from userProfile
    if (userProfile) {
      setProfileBgType(userProfile.profileBgType || "gradient");
      setProfileBgColor(userProfile.profileBgColor || "#3b82f6");
      setProfileBgGradient(
        userProfile.profileBgGradient || ["#3b82f6", "#8b5cf6"]
      );
    }
  }, [userProfile, currentUser]);

  // Generate consistent user number from UID
  const getUserNumber = useCallback(() => {
    if (!currentUser?.uid) return 999;

    let hash = 0;
    for (let i = 0; i < currentUser.uid.length; i++) {
      const char = currentUser.uid.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    // Convert to positive number and limit to 1-1000 range
    const userNumber = Math.abs(hash % 1000) + 1;
    return userNumber;
  }, [currentUser?.uid]);

  // User badge system
  const getUserBadges = useCallback(() => {
    const badges = [];

    // Early User Badge (first 100 users)
    const userNumber = getUserNumber();
    if (userNumber <= 100) {
      badges.push({
        id: "early-user",
        name: "Early User",
        display: `#${userNumber}`,
        description: `One of the first ${
          userNumber <= 10 ? "10" : "100"
        } users to join`,
        icon: "🚀",
        color: userNumber <= 10 ? "bg-yellow-500" : "bg-blue-500",
        textColor: "text-white",
      });
    }

    return badges;
  }, [getUserNumber]);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (profileAlert) {
      const timer = setTimeout(() => {
        setProfileAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [profileAlert]);

  // Clean up old display name changes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      setDisplayNameChanges((prev) =>
        prev.filter((timestamp) => timestamp > fiveMinutesAgo)
      );
    }, 60000); // Clean up every minute

    return () => clearInterval(interval);
  }, []);

  // Display name validation and rate limiting
  const recentDisplayNameChanges = useMemo(() => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    return displayNameChanges.filter((timestamp) => timestamp > fiveMinutesAgo);
  }, [displayNameChanges]);

  const checkDisplayNameRateLimit = useCallback(() => {
    return recentDisplayNameChanges.length >= 2;
  }, [recentDisplayNameChanges]);

  const trackDisplayNameChange = useCallback(() => {
    const now = Date.now();
    setDisplayNameChanges((prev) => [...prev, now]);
  }, []);

  const getTimeUntilNextChange = useCallback(() => {
    if (recentDisplayNameChanges.length === 0) return 0;

    const oldestChange = Math.min(...recentDisplayNameChanges);
    const fiveMinutesLater = oldestChange + 5 * 60 * 1000;
    const now = Date.now();

    return Math.max(0, Math.ceil((fiveMinutesLater - now) / 1000));
  }, [recentDisplayNameChanges]);

  const validateDisplayName = useCallback((name) => {
    if (!name || name.trim().length === 0) return "Display name is required";
    if (name.trim().length < 2)
      return "Display name must be at least 2 characters";
    if (name.trim().length > 30)
      return "Display name must be less than 30 characters";
    if (!/^[a-zA-Z0-9\s._-]+$/.test(name.trim()))
      return "Display name can only contain letters, numbers, spaces, dots, hyphens, and underscores";
    return null;
  }, []);

  // Handle profile updates (name + customization)
  const handleSaveProfile = async () => {
    setIsUpdatingCustomization(true);
    setProfileAlert(null);

    try {
      // Validate display name if it was changed
      if (editDisplayName !== displayName) {
        const nameError = validateDisplayName(editDisplayName);
        if (nameError) {
          setProfileAlert({ type: "error", message: nameError });
          setIsUpdatingCustomization(false);
          return;
        }

        // Check rate limit for display name
        if (checkDisplayNameRateLimit()) {
          const timeLeft = getTimeUntilNextChange();
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          const timeStr =
            minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

          setProfileAlert({
            type: "error",
            message: `Rate limit exceeded. You can change your display name again in ${timeStr}. (Max 2 changes per 5 minutes)`,
          });
          setIsUpdatingCustomization(false);
          return;
        }
      }

      const profileData = {
        profileBgType,
        profileBgColor,
        profileBgGradient,
      };

      // Add display name if it was changed
      if (editDisplayName !== displayName) {
        profileData.displayName = editDisplayName;
        profileData.displayNameLastChangedAt = new Date();
      }

      const result = await updateUserFirestoreProfile(profileData);
      if (result.success) {
        // Track display name change if it was updated
        if (editDisplayName !== displayName) {
          trackDisplayNameChange();
          setDisplayName(editDisplayName);
        }

        setProfileAlert({
          type: "success",
          message: "Profile updated successfully!",
        });
        setShowEditProfile(false);
      } else {
        setProfileAlert({
          type: "error",
          message: result.error || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setProfileAlert({
        type: "error",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsUpdatingCustomization(false);
    }
  };

  const getProfileBackground = useCallback(() => {
    if (profileBgType === "solid") {
      return profileBgColor;
    } else {
      return `linear-gradient(135deg, ${profileBgGradient[0]}, ${profileBgGradient[1]})`;
    }
  }, [profileBgType, profileBgColor, profileBgGradient]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";

    try {
      let date;
      if (timestamp?.toDate) {
        // Firestore timestamp
        date = timestamp.toDate();
      } else if (timestamp?.seconds) {
        // Firestore timestamp object
        date = new Date(timestamp.seconds * 1000);
      } else if (
        typeof timestamp === "string" ||
        typeof timestamp === "number"
      ) {
        // Regular timestamp
        date = new Date(timestamp);
      } else {
        return "Unknown";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Unknown";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";

    try {
      let date;
      if (timestamp?.toDate) {
        // Firestore timestamp
        date = timestamp.toDate();
      } else if (timestamp?.seconds) {
        // Firestore timestamp object
        date = new Date(timestamp.seconds * 1000);
      } else if (
        typeof timestamp === "string" ||
        typeof timestamp === "number"
      ) {
        // Regular timestamp
        date = new Date(timestamp);
      } else {
        return "Unknown";
      }

      const now = new Date();
      const diffInMs = now - date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60)
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
      if (diffInHours < 24)
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      if (diffInDays < 7)
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch (error) {
      console.error("Time formatting error:", error);
      return "Unknown";
    }
  };

  const getAccountAge = () => {
    if (!currentUser?.metadata?.creationTime) return "Unknown";

    try {
      const createdAt = new Date(currentUser.metadata.creationTime);
      const now = new Date();
      const diffInMs = now - createdAt;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays < 1) return "Less than a day";
      if (diffInDays < 30)
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
      if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return `${months} month${months > 1 ? "s" : ""}`;
      } else {
        const years = Math.floor(diffInDays / 365);
        return `${years} year${years > 1 ? "s" : ""}`;
      }
    } catch (error) {
      console.error("Account age calculation error:", error);
      return "Unknown";
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Profile Alert */}
        {profileAlert && (
          <div
            className={`p-4 rounded-lg border-l-4 ${
              profileAlert.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{profileAlert.message}</p>
              <button
                onClick={() => setProfileAlert(null)}
                className="text-current opacity-50 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Edit3 className="h-5 w-5" />
                Edit Profile
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  All Settings
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Display Name */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Display Name</Label>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      maxLength={30}
                      className="w-full"
                    />

                    {/* Validation & Rate Limit Messages */}
                    {editDisplayName &&
                      validateDisplayName(editDisplayName) && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {validateDisplayName(editDisplayName)}
                        </p>
                      )}
                    {checkDisplayNameRateLimit() && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Rate limit: {displayNameChanges.length}/2 changes used.
                        {getTimeUntilNextChange() > 0 && (
                          <span className="ml-1">
                            Reset in {Math.floor(getTimeUntilNextChange() / 60)}
                            m {getTimeUntilNextChange() % 60}s
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Profile Picture</Label>
                  <div className="flex flex-col items-center">
                    <ProfilePictureUpload
                      currentUser={currentUser}
                      userProfile={userProfile}
                      updateUserFirestoreProfile={updateUserFirestoreProfile}
                      onUploadSuccess={(url) => {
                        setProfileAlert({
                          type: "success",
                          message: url
                            ? "Profile picture updated successfully!"
                            : "Profile picture removed successfully!",
                        });
                      }}
                      onUploadError={(error) => {
                        setProfileAlert({
                          type: "error",
                          message: error,
                        });
                      }}
                      size="default"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Background Customization */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Profile Background
                </Label>
                <div className="space-y-4">
                  {/* Background Type Toggle */}
                  <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setProfileBgType("gradient")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        profileBgType === "gradient"
                          ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      Gradient
                    </button>
                    <button
                      onClick={() => setProfileBgType("solid")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        profileBgType === "solid"
                          ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      Solid
                    </button>
                  </div>

                  {/* Color Pickers */}
                  {profileBgType === "gradient" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Start Color</Label>
                        <div className="space-y-2">
                          <button
                            onClick={() =>
                              setShowColorPicker((prev) => ({
                                ...prev,
                                gradient1: !prev.gradient1,
                              }))
                            }
                            className="w-full h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm transition-transform hover:scale-105"
                            style={{ backgroundColor: profileBgGradient[0] }}
                          />
                          {showColorPicker.gradient1 && (
                            <div className="relative">
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() =>
                                  setShowColorPicker((prev) => ({
                                    ...prev,
                                    gradient1: false,
                                  }))
                                }
                              />
                              <div className="absolute z-20 mt-2">
                                <HexColorPicker
                                  color={profileBgGradient[0]}
                                  onChange={(color) =>
                                    setProfileBgGradient([
                                      color,
                                      profileBgGradient[1],
                                    ])
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">End Color</Label>
                        <div className="space-y-2">
                          <button
                            onClick={() =>
                              setShowColorPicker((prev) => ({
                                ...prev,
                                gradient2: !prev.gradient2,
                              }))
                            }
                            className="w-full h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm transition-transform hover:scale-105"
                            style={{ backgroundColor: profileBgGradient[1] }}
                          />
                          {showColorPicker.gradient2 && (
                            <div className="relative">
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() =>
                                  setShowColorPicker((prev) => ({
                                    ...prev,
                                    gradient2: false,
                                  }))
                                }
                              />
                              <div className="absolute z-20 mt-2">
                                <HexColorPicker
                                  color={profileBgGradient[1]}
                                  onChange={(color) =>
                                    setProfileBgGradient([
                                      profileBgGradient[0],
                                      color,
                                    ])
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs">Background Color</Label>
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            setShowColorPicker((prev) => ({
                              ...prev,
                              bg: !prev.bg,
                            }))
                          }
                          className="w-full h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm transition-transform hover:scale-105"
                          style={{ backgroundColor: profileBgColor }}
                        />
                        {showColorPicker.bg && (
                          <div className="relative">
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() =>
                                setShowColorPicker((prev) => ({
                                  ...prev,
                                  bg: false,
                                }))
                              }
                            />
                            <div className="absolute z-20 mt-2">
                              <HexColorPicker
                                color={profileBgColor}
                                onChange={setProfileBgColor}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Live Preview */}
                  <div className="space-y-2">
                    <Label className="text-xs">Preview</Label>
                    <div
                      className="h-20 rounded-lg border border-gray-200 dark:border-gray-600 relative overflow-hidden"
                      style={{ background: getProfileBackground() }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      <div className="absolute bottom-2 left-3 text-white font-semibold text-sm drop-shadow">
                        {editDisplayName || "Your Name"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isUpdatingCustomization}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUpdatingCustomization ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Overview Card */}
        <div className="relative">
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
            <CardContent className="p-0">
              <div className="relative">
                {/* Custom Background */}
                <div
                  className="absolute inset-0 opacity-90"
                  style={{ background: getProfileBackground() }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                {/* Edit Profile Button - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    onClick={() => setShowEditProfile(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <div className="relative p-8">
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Profile Picture - Display Only */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg ring-4 ring-white/20">
                        {userProfile?.photoURL || currentUser?.photoURL ? (
                          <img
                            src={userProfile?.photoURL || currentUser?.photoURL}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}

                        {/* Initials Fallback */}
                        <div
                          className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 ${
                            userProfile?.photoURL || currentUser?.photoURL
                              ? "hidden"
                              : "flex"
                          }`}
                        >
                          {(
                            userProfile?.displayName ||
                            currentUser?.displayName ||
                            currentUser?.email ||
                            "U"
                          )
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                          {displayName || "User"}
                        </h2>

                        {/* User Badges */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {getUserBadges().map((badge) => (
                            <Tooltip key={badge.id}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge.color} ${badge.textColor} shadow-lg`}
                                >
                                  <span className="mr-1">{badge.icon}</span>
                                  {badge.display}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{badge.name}</p>
                                <p className="text-xs opacity-90">
                                  {badge.description}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      {/* Account Status */}
                      <div className="flex justify-center">
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium backdrop-blur ${
                            isEmailVerified && isEmailVerified()
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {isEmailVerified && isEmailVerified() ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verified Account
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Pending Verification
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your profile details
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="relative p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <User className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Display Name
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {displayName || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {currentUser?.email}
                      </p>
                    </div>
                  </div>

                  {/* Email Status Indicator */}
                  <div className="flex items-center">
                    {isEmailVerified && isEmailVerified() ? (
                      <div className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          Verified
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                        <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 mr-1" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                          Pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account Status
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your account information
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Account ID
                      </p>
                      <p className="text-xs font-mono text-gray-600 dark:text-gray-300 mt-1 truncate max-w-[200px]">
                        {currentUser?.uid}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Last Activity
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {userProfile?.lastLoginAt
                          ? formatTime(userProfile.lastLoginAt)
                          : "Just now"}
                      </p>
                    </div>
                  </div>
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
