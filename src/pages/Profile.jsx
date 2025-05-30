import { useAuth } from "../contexts/AuthContext";
import AccountInformation from "../components/profile/AccountInformation";
import EmailVerification from "../components/profile/EmailVerification";
import SecuritySettings from "../components/profile/SecuritySettings";
import AdminDashboard from "../components/profile/AdminDashboard";
import AccountDetails from "../components/profile/AccountDetails";

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
            <AccountInformation
              currentUser={currentUser}
              userProfile={userProfile}
              updateUserFirestoreProfile={updateUserFirestoreProfile}
            />

            {/* Email Verification */}
            <EmailVerification
              isEmailVerified={isEmailVerified}
              sendVerificationEmail={sendVerificationEmail}
              refreshUser={refreshUser}
            />

            {/* Security Settings */}
            <SecuritySettings changePassword={changePassword} />

            {/* Owner-Only Admin Section */}
            <AdminDashboard
              currentUser={currentUser}
              userProfile={userProfile}
              isOwner={isOwner}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Details */}
            <AccountDetails
              currentUser={currentUser}
              userProfile={userProfile}
              isEmailVerified={isEmailVerified}
              isOwner={isOwner}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
