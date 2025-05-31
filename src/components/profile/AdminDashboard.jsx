import { useState, useEffect } from "react";
import {
  Crown,
  BarChart3,
  DollarSign,
  Settings,
  RefreshCw,
  Users,
  TrendingUp,
  Activity,
  Database,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import Button from "../ui/Button";
import RoleGuard from "../ui/RoleGuard";
import UserManagement from "./UserManagement";
import { getAdminStats, migrateUserRoles } from "../../services/firestore";

const AdminDashboard = ({
  currentUser,
  userProfile,
  isOwner,
  showOnlyContent,
  showOnlyMaintenance,
}) => {
  const [adminStats, setAdminStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  // Load admin stats if user is owner
  useEffect(() => {
    const loadAdminStats = async () => {
      // Wait for both currentUser and userProfile to be loaded
      if (!currentUser || !userProfile) return;

      // Only proceed if user is owner and we haven't loaded stats yet
      if (isOwner() && !adminStats && !isLoadingStats) {
        setIsLoadingStats(true);

        // Add a small delay to ensure Firestore rules are ready
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          const result = await getAdminStats();
          if (result.success) {
            setAdminStats(result.data);
          } else {
            console.error("Failed to load admin stats:", result.error);
            // Retry once after another delay
            setTimeout(async () => {
              try {
                const retryResult = await getAdminStats();
                if (retryResult.success) {
                  setAdminStats(retryResult.data);
                }
              } catch (retryError) {
                console.error("Retry failed:", retryError);
              }
            }, 2000);
          }
        } catch (error) {
          console.error("Error loading admin stats:", error);
          // Retry once after another delay
          setTimeout(async () => {
            try {
              const retryResult = await getAdminStats();
              if (retryResult.success) {
                setAdminStats(retryResult.data);
              }
            } catch (retryError) {
              console.error("Retry failed:", retryError);
            }
          }, 2000);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    loadAdminStats();
  }, [currentUser, userProfile, isOwner, adminStats, isLoadingStats]);

  const handleRefreshStats = () => {
    setAdminStats(null);
    setIsLoadingStats(false);
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrateUserRoles();
      setMigrationResult(result);

      // Refresh stats and user list after migration
      if (result.success) {
        handleRefreshStats();
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        error: error.message || "Migration failed",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // If showing only maintenance content
  if (showOnlyMaintenance) {
    return (
      <div className="space-y-4">
        {/* Database Migration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Maintenance
          </h3>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  User Role Migration
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Some users created before the role system was implemented may
                  be missing the required role field. This can cause issues with
                  permissions and user management.
                </p>
                <div className="mt-3">
                  <Button
                    onClick={handleMigration}
                    loading={isMigrating}
                    size="sm"
                    variant="outline"
                    className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-600 dark:hover:bg-amber-900/30"
                  >
                    {isMigrating
                      ? "Running Migration..."
                      : "Run User Role Migration"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {migrationResult && (
            <div
              className={`p-4 rounded-lg border ${
                migrationResult.success
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  migrationResult.success
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {migrationResult.success
                  ? `Migration completed successfully! Updated ${migrationResult.updatedCount} users.`
                  : `Migration failed: ${migrationResult.error}`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If showing only content (overview), render just the system statistics
  if (showOnlyContent) {
    return (
      <div className="space-y-4">
        {/* System Statistics */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            System Statistics
          </h3>

          {isLoadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : adminStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                <div className="font-semibold text-gray-900 dark:text-white text-lg">
                  {adminStats.totalUsers}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Total Users
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <div className="font-semibold text-gray-900 dark:text-white text-lg">
                  {adminStats.newUsersThisMonth}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  New This Month
                </div>
              </div>

              <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                <div className="font-semibold text-gray-900 dark:text-white text-lg">
                  {adminStats.activeUsers}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Active (7d)
                </div>
              </div>

              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <div className="font-semibold text-gray-900 dark:text-white text-lg">
                  {adminStats.totalBindersAcrossUsers}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Total Binders
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              Failed to load statistics
            </div>
          )}

          {adminStats && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Binders Across Platform:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {adminStats.totalBindersAcrossUsers}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">
                  System Health:
                </span>
                <div className="flex items-center">
                  <span
                    className={`font-semibold ${
                      adminStats.systemHealth === "Excellent"
                        ? "text-green-600 dark:text-green-400"
                        : adminStats.systemHealth === "Good"
                        ? "text-blue-600 dark:text-blue-400"
                        : adminStats.systemHealth === "Fair"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : adminStats.systemHealth === "Poor"
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {adminStats.systemHealth}
                  </span>
                  {adminStats.healthDetails && (
                    <div className="ml-2 group relative">
                      <Settings className="h-3 w-3 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="space-y-1">
                          <div>
                            Response Time:{" "}
                            {adminStats.healthDetails.responseTime}
                          </div>
                          <div>
                            Activity Rate:{" "}
                            {adminStats.healthDetails.activityRate}
                          </div>
                          <div>
                            Data Rate: {adminStats.healthDetails.dataRate}
                          </div>
                          <div className="pt-1 border-t border-gray-700">
                            {adminStats.healthDetails.issues.map(
                              (issue, idx) => (
                                <div key={idx}>• {issue}</div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {adminStats.responseTime && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Database Response:
                  </span>
                  <span
                    className={`font-semibold ${
                      adminStats.responseTime < 1000
                        ? "text-green-600 dark:text-green-400"
                        : adminStats.responseTime < 2000
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {adminStats.responseTime}ms
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handleRefreshStats}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Owner Access:</strong> You have full administrative
            privileges for this application. Use these powers responsibly!
          </p>
        </div>
      </div>
    );
  }

  // If neither prop is set, return the old full component (for backwards compatibility)
  return (
    <RoleGuard requireOwner>
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border-2 border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-center mb-6">
          <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Owner Administration
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* System Statistics */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                System Statistics
              </h3>

              {isLoadingStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : adminStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                      {adminStats.totalUsers}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Total Users
                    </div>
                  </div>

                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                      {adminStats.newUsersThisMonth}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      New This Month
                    </div>
                  </div>

                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                      {adminStats.activeUsers}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Active (7d)
                    </div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <div className="font-semibold text-gray-900 dark:text-white text-lg">
                      {adminStats.totalBindersAcrossUsers}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Total Binders
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Failed to load statistics
                </div>
              )}

              {adminStats && (
                <div className="mt-4 pt-4 border-t border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Binders Across Platform:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {adminStats.totalBindersAcrossUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      System Health:
                    </span>
                    <div className="flex items-center">
                      <span
                        className={`font-semibold ${
                          adminStats.systemHealth === "Excellent"
                            ? "text-green-600 dark:text-green-400"
                            : adminStats.systemHealth === "Good"
                            ? "text-blue-600 dark:text-blue-400"
                            : adminStats.systemHealth === "Fair"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : adminStats.systemHealth === "Poor"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {adminStats.systemHealth}
                      </span>
                      {adminStats.healthDetails && (
                        <div className="ml-2 group relative">
                          <Settings className="h-3 w-3 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="space-y-1">
                              <div>
                                Response Time:{" "}
                                {adminStats.healthDetails.responseTime}
                              </div>
                              <div>
                                Activity Rate:{" "}
                                {adminStats.healthDetails.activityRate}
                              </div>
                              <div>
                                Data Rate: {adminStats.healthDetails.dataRate}
                              </div>
                              <div className="pt-1 border-t border-gray-700">
                                {adminStats.healthDetails.issues.map(
                                  (issue, idx) => (
                                    <div key={idx}>• {issue}</div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {adminStats.responseTime && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Database Response:
                      </span>
                      <span
                        className={`font-semibold ${
                          adminStats.responseTime < 1000
                            ? "text-green-600 dark:text-green-400"
                            : adminStats.responseTime < 2000
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {adminStats.responseTime}ms
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" size="sm" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={handleRefreshStats}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Stats
              </Button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Owner Access:</strong> You have full administrative
                privileges for this application. Use these powers responsibly!
              </p>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-purple-200/50 dark:border-purple-700/50">
            <UserManagement />
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="space-y-4">
            {/* Database Migration */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Database Maintenance
              </h3>

              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        User Role Migration
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Some users created before the role system was
                        implemented may be missing the required role field. This
                        can cause issues with permissions and user management.
                      </p>
                      <div className="mt-3">
                        <Button
                          onClick={handleMigration}
                          loading={isMigrating}
                          size="sm"
                          variant="outline"
                          className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-600 dark:hover:bg-amber-900/30"
                        >
                          {isMigrating
                            ? "Running Migration..."
                            : "Run User Role Migration"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {migrationResult && (
                  <div
                    className={`p-4 rounded-lg border ${
                      migrationResult.success
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        migrationResult.success
                          ? "text-green-800 dark:text-green-200"
                          : "text-red-800 dark:text-red-200"
                      }`}
                    >
                      {migrationResult.success
                        ? `Migration completed successfully! Updated ${migrationResult.updatedCount} users.`
                        : `Migration failed: ${migrationResult.error}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default AdminDashboard;
