import AccountInformation from "../AccountInformation";

const ProfileSection = ({
  currentUser,
  userProfile,
  updateUserFirestoreProfile,
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update your personal information and display preferences
        </p>
      </div>

      <AccountInformation
        currentUser={currentUser}
        userProfile={userProfile}
        updateUserFirestoreProfile={updateUserFirestoreProfile}
      />
    </div>
  );
};

export default ProfileSection;
