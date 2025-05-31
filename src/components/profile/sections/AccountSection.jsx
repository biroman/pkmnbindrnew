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
} from "../../ui";

const AccountSection = ({
  currentUser,
  userProfile,
  isEmailVerified,
  isOwner,
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp.seconds * 1000);
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
    const created = new Date(userProfile.createdAt.seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account Information
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View your account details, membership status, and activity
          </p>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                Profile Information
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
                          <p>
                            Full system access and administrative privileges
                          </p>
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

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile?.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(userProfile.createdAt)}
                      </span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getAccountAge()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Account age: {getAccountAge()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}

              {userProfile?.lastLoginAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Activity
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatTime(userProfile.lastLoginAt)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Status
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {isEmailVerified() ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Verified Account
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        Verification Pending
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Binders
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userProfile?.totalBinders || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Value
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${userProfile?.totalValue || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Activity Score
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userProfile?.activityScore || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
              Technical Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center justify-center p-0.5">
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                        {currentUser?.uid}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to copy User ID</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Provider
                </label>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    Email & Password
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AccountSection;
