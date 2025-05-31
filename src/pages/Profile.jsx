import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SettingsNavigation from "../components/profile/SettingsNavigation";
import ProfileSection from "../components/profile/sections/ProfileSection";
import SecuritySection from "../components/profile/sections/SecuritySection";
import AccountSection from "../components/profile/sections/AccountSection";
import AdminSection from "../components/profile/sections/AdminSection";

const Profile = () => {
  const {
    currentUser,
    userProfile,
    updateUserFirestoreProfile,
    changePassword,
    sendVerificationEmail,
    isEmailVerified,
    refreshUser,
    isOwner,
  } = useAuth();

  const [activeSection, setActiveSection] = useState("profile");

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            currentUser={currentUser}
            userProfile={userProfile}
            updateUserFirestoreProfile={updateUserFirestoreProfile}
          />
        );
      case "security":
        return (
          <SecuritySection
            changePassword={changePassword}
            isEmailVerified={isEmailVerified}
            sendVerificationEmail={sendVerificationEmail}
            refreshUser={refreshUser}
          />
        );
      case "account":
        return (
          <AccountSection
            currentUser={currentUser}
            userProfile={userProfile}
            isEmailVerified={isEmailVerified}
            isOwner={isOwner}
          />
        );
      case "admin":
        return (
          <AdminSection
            currentUser={currentUser}
            userProfile={userProfile}
            isOwner={isOwner}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <SettingsNavigation
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                  isOwner={isOwner}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
