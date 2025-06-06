import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  useUserProfile,
  useUserBinders,
  useUserActivity,
} from "../../hooks/useUserData";
import { Card } from "../ui";
import Button from "../ui/Button";
import {
  Plus,
  Share2,
  Eye,
  BookOpen,
  Star,
  TrendingUp,
  Calendar,
  Users,
  Crown,
  Zap,
  Gift,
  Trophy,
} from "lucide-react";

const WelcomeDashboard = () => {
  const { currentUser } = useAuth();
  const { data: userProfile } = useUserProfile(currentUser?.uid);
  const { data: userBinders, isLoading: bindersLoading } = useUserBinders(
    currentUser?.uid,
    { limit: 5 }
  );
  const { data: userActivity, isLoading: activityLoading } = useUserActivity(
    currentUser?.uid,
    5
  );

  const displayName = userProfile?.data?.displayName || "Trainer";

  // Real user stats from profile
  const totalBinders = userProfile?.data?.totalBinders || 0;
  const totalCards = userProfile?.data?.totalCards || 0;
  const sharedBinders = userProfile?.data?.sharedBinders || 0;
  const views = userProfile?.data?.totalViews || 0;

  // Calculate real stats from actual data
  const recentBinders = userBinders?.data || [];
  const recentActivities = userActivity?.data || [];

  // Real calculated stats
  const realStats = {
    favoriteCards: recentBinders.filter((binder) => binder.isFavorite).length,
    rareCards: recentBinders.filter(
      (binder) =>
        binder.rarity === "Rare" ||
        binder.rarity === "Epic" ||
        binder.rarity === "Legendary"
    ).length,
    completedSets: recentBinders.filter((binder) => binder.isComplete).length,
    recentlyAdded: recentActivities.filter(
      (activity) =>
        activity.type === "binder_added" &&
        new Date(activity.timestamp?.toDate?.() || activity.timestamp) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  const quickActions = [
    {
      title: "Create New Binder",
      description: "Start organizing a new collection",
      icon: <Plus className="h-5 w-5" />,
      href: "/app/collections",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Add Cards",
      description: "Add cards to your collection",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/app/add-card",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Share Collection",
      description: "Share your binders with friends",
      icon: <Share2 className="h-5 w-5" />,
      href: "/app/collections",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "View Statistics",
      description: "Analyze your collection data",
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/app/stats",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 mt-16 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {totalCards.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Cards
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mx-auto mb-3">
              <Share2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {sharedBinders}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Shared Binders
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-3">
              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {views.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Views
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-md transition-shadow">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-fit mx-auto mb-3">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {realStats.favoriteCards}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Favorite Cards
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Collection Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    className={`${action.color} text-white p-5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg group block`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="group-hover:scale-110 transition-transform duration-200">
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {action.title}
                        </h3>
                        <p className="text-xs opacity-90 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Collection Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Collection Overview
                </h2>
                <Link
                  to="/app/collections"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>

              {totalBinders === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-4">
                    <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Start Your Pokemon Journey
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Create your first binder and start organizing your Pokemon
                    cards. Share your collection with friends and fellow
                    collectors!
                  </p>
                  <Link
                    to="/app/collections"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create First Binder</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {realStats.rareCards}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Rare Cards
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {realStats.completedSets}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Complete Sets
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {realStats.recentlyAdded}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Added This Week
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {views}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Profile Views
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Recent Activity & Featured */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        {activity.type === "binder_added" && (
                          <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                        {activity.type === "binder_shared" && (
                          <Share2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                        {activity.type === "profile_updated" && (
                          <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        )}
                        {![
                          "binder_added",
                          "binder_shared",
                          "profile_updated",
                        ].includes(activity.type) && (
                          <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description || activity.type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.timestamp
                            ? new Date(
                                activity.timestamp?.toDate?.() ||
                                  activity.timestamp
                              ).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Featured Binder */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Featured Collection
              </h3>
              {totalBinders === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create your first binder to see it featured here
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      My Champion Cards
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Your most viewed collection with rare Pokemon cards
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      142 views • 28 cards
                    </span>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
