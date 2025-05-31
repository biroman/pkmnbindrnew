import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  Plus,
  Library,
  Search,
  BarChart3,
  Star,
  Gem,
  TrendingUp,
  Target,
  Package,
  PlusCircle,
} from "lucide-react";

const WelcomeDashboard = () => {
  const { currentUser, userProfile } = useAuth();

  // Calculate display values from userProfile
  const displayName =
    userProfile?.displayName || currentUser?.displayName || "Trainer";
  const totalBinders = userProfile?.totalBinders || 0;
  const totalValue = userProfile?.totalValue || 0;
  const currency = userProfile?.settings?.currency || "USD";

  // Format currency value
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Quick actions data
  const quickActions = [
    {
      title: "Add New Binder",
      description: "Add a new Pokemon binder to your collection",
      icon: <PlusCircle className="h-6 w-6" />,
      action: () => console.log("Add binder"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Collection",
      description: "Browse your entire binder collection",
      icon: <Library className="h-6 w-6" />,
      action: () => console.log("View collection"),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Search Binders",
      description: "Find specific binders in your collection",
      icon: <Search className="h-6 w-6" />,
      action: () => console.log("Search binders"),
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Statistics",
      description: "Analyze your collection statistics",
      icon: <BarChart3 className="h-6 w-6" />,
      action: () => console.log("View statistics"),
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      title: "Favorites",
      description: "View your favorite binders",
      icon: <Star className="h-6 w-6" />,
      action: () => console.log("View favorites"),
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      title: "Rare Binders",
      description: "Find rare and unique binders",
      icon: <Gem className="h-6 w-6" />,
      action: () => console.log("View rare binders"),
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Price Tracker",
      description: "Track binder prices and trends",
      icon: <TrendingUp className="h-6 w-6" />,
      action: () => console.log("Track price"),
      color: "bg-teal-500 hover:bg-teal-600",
    },
    {
      title: "Wishlist",
      description: "Manage your wishlist of binders",
      icon: <Target className="h-6 w-6" />,
      action: () => console.log("View wishlist"),
      color: "bg-red-500 hover:bg-red-600",
    },
  ];

  // Collection progress calculation (example: progress towards a goal)
  const collectionProgress =
    totalBinders > 0
      ? Math.min(Math.round((totalBinders / 100) * 100), 100)
      : 0; // Example: goal of 100 binders

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-blue-100 dark:text-blue-200">
              Ready to manage your Pokemon binder collection?
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {totalBinders.toLocaleString()}
            </div>
            <div className="text-blue-100 dark:text-blue-200 text-sm">
              Total Binders
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Binders
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBinders}
              </p>
            </div>
          </div>
        </div>

        <Card variant="elevated" className="p-3 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1 sm:mb-2">
              0
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Collections
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="p-3 sm:p-6 col-span-2 sm:col-span-1"
        >
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1 sm:mb-2">
              {collectionProgress}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Collection Progress
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-3 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1 sm:mb-2">
              0
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Favorite Cards
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-3 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1 sm:mb-2">
              0
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Rare Cards
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="p-3 sm:p-6 col-span-2 sm:col-span-1"
        >
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1 sm:mb-2">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Total Value
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity or Collection Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Collection Overview
            </h2>
            {totalBinders === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Start Your Collection
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                  You haven't added any Pokemon binders yet. Start building your
                  collection today!
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Add Your First Binder
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Collection Progress
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {collectionProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${collectionProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have {totalBinders} binder{totalBinders !== 1 ? "s" : ""}{" "}
                  in your collection worth ${totalValue.toLocaleString()}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* ... existing sidebar content ... */}
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
