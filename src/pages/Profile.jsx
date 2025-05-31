import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SettingsNavigation from "../components/profile/SettingsNavigation";
import ProfileSection from "../components/profile/sections/ProfileSection";
import SecuritySection from "../components/profile/sections/SecuritySection";
import AccountSection from "../components/profile/sections/AccountSection";
import AdminSection from "../components/profile/sections/AdminSection";
import BinderPreferencesSection from "../components/profile/sections/BinderPreferencesSection";
import PrivacySharingSection from "../components/profile/sections/PrivacySharingSection";

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
      case "binder-preferences":
        return <BinderPreferencesSection />;
      case "privacy-sharing":
        return <PrivacySharingSection />;
      case "display-themes":
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Display & Themes
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Customize appearance and binder themes
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <p className="text-center text-blue-600 dark:text-blue-400">
                🎨 Theme customization coming soon!
              </p>
              <p className="text-center text-sm text-blue-500 dark:text-blue-300 mt-2">
                Choose custom binder themes, card backgrounds, and visual
                effects.
              </p>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Email and in-app notification preferences
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <p className="text-center text-green-600 dark:text-green-400">
                🔔 Notification settings coming soon!
              </p>
              <p className="text-center text-sm text-green-500 dark:text-green-300 mt-2">
                Control notifications for binder interactions, price updates,
                and system messages.
              </p>
            </div>
          </div>
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
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings Not Found
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                The requested settings section could not be found.
              </p>
            </div>
          </div>
        );
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
