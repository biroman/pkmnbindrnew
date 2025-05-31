import {
  Calendar,
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const AccountDetails = ({
  currentUser,
  userProfile,
  isEmailVerified,
  isOwner,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Account Details
        </h2>
      </div>

      <div className="space-y-3">
        {userProfile?.createdAt && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Member Since
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(
                userProfile.createdAt.seconds * 1000
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Account Type
          </label>
          <div className="mt-1 flex items-center">
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

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Verification Status
          </label>
          <div className="mt-1 flex items-center">
            {isEmailVerified() ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  Verified
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Pending
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
