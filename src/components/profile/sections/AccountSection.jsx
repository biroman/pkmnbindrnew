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
} from "lucide-react";

const AccountSection = ({
  currentUser,
  userProfile,
  isEmailVerified,
  isOwner,
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Information
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          View your account details, membership status, and activity
        </p>
      </div>

      {/* Account Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Account Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {userProfile?.displayName ||
                  currentUser?.displayName ||
                  "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex-1">
                  {currentUser?.email}
                </p>
                <div className="flex items-center">
                  {isEmailVerified() ? (
                    <div className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Verified
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 mr-1" />
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Unverified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Type
              </label>
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {isOwner() ? (
                  <>
                    <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Owner
                    </span>
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
          </div>

          {/* Account Stats */}
          <div className="space-y-4">
            {userProfile?.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Member Since
                </label>
                <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(
                      userProfile.createdAt.seconds * 1000
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Collection Stats
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Binders
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.totalBinders || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Value
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${userProfile?.totalValue || 0}
                  </span>
                </div>
              </div>
            </div>

            {userProfile?.lastLoginAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Activity
                </label>
                <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(
                      userProfile.lastLoginAt.seconds * 1000
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Status
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div
              className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isEmailVerified()
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
              }`}
            >
              {isEmailVerified() ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Email Status
            </h3>
            <p
              className={`text-xs mt-1 ${
                isEmailVerified()
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {isEmailVerified() ? "Verified" : "Pending Verification"}
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="mx-auto w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Account Status
            </h3>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Active
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="mx-auto w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Security Level
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Standard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSection;
