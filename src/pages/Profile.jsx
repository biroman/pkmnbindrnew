import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { currentUser, userProfile } = useAuth();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile & Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Account Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {userProfile?.displayName ||
                      currentUser?.displayName ||
                      "Not set"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {userProfile?.email || currentUser?.email}
                  </p>
                </div>

                {userProfile?.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Member Since
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(
                        userProfile.createdAt.seconds * 1000
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Collection Stats
              </h2>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userProfile?.totalCards || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Cards
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${userProfile?.totalValue || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Collection Value
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings will be added later */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Settings Panel Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your preferences, theme, currency, and privacy settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
