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
  Backpack,
  Package,
} from "lucide-react";

const WelcomeDashboard = () => {
  const { currentUser, userProfile } = useAuth();

  // Calculate display values from userProfile
  const displayName =
    userProfile?.displayName || currentUser?.displayName || "Trainer";
  const totalCards = userProfile?.totalCards || 0;
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

  // Calculate completion percentage (placeholder for now)
  const completionPercentage =
    totalCards > 0 ? Math.min(Math.round((totalCards / 1010) * 100), 100) : 0; // 1010 total Pokemon in Gen 1-9

  return (
    <div className="w-full min-h-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
          Welcome back, {displayName}!
        </h1>
        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto px-4">
          Ready to organize your Pokemon collection? Your digital binder awaits!
        </p>
        {userProfile && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1 sm:mt-2">
            Member since{" "}
            {new Date(
              userProfile.createdAt?.seconds * 1000
            ).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
        <Card variant="elevated" className="p-3 sm:p-6">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
              {totalCards.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Pokemon Cards
            </div>
          </div>
        </Card>

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
              {completionPercentage}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Pokedex Complete
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Quick Actions - Takes 2/3 width on large screens */}
        <div className="xl:col-span-2">
          <Card variant="elevated" className="p-4 sm:p-8 h-full">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link to="/add-card">
                <Button
                  variant="primary"
                  className="h-16 sm:h-20 flex-col w-full text-xs sm:text-sm"
                >
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  Add Cards
                </Button>
              </Link>

              <Link to="/collection">
                <Button
                  variant="secondary"
                  className="h-16 sm:h-20 flex-col w-full text-xs sm:text-sm"
                >
                  <Library className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  View Collection
                </Button>
              </Link>

              <Link to="/collection">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col w-full text-xs sm:text-sm"
                >
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  Search Cards
                </Button>
              </Link>

              <Link to="/stats">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col w-full text-xs sm:text-sm"
                >
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  Statistics
                </Button>
              </Link>

              <Link to="/collection">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col w-full text-xs sm:text-sm"
                >
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  Favorites
                </Button>
              </Link>

              <Link to="/collection">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col w-full text-xs sm:text-sm"
                >
                  <Gem className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  Rare Cards
                </Button>
              </Link>

              <Link to="/stats">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col w-full text-xs sm:text-sm"
                >
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  Price Tracker
                </Button>
              </Link>

              <Link to="/wishlist">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col w-full text-xs sm:text-sm"
                >
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  Wishlist
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Activity - Takes 1/3 width on large screens */}
        <div className="xl:col-span-1">
          <Card variant="elevated" className="p-4 sm:p-8 h-full">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Recent Activity
            </h2>
            <div className="text-center py-4 sm:py-8">
              <Backpack className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              {totalCards === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm sm:text-lg text-gray-500 dark:text-gray-400">
                    Your journey starts here! Add your first Pokemon card to
                    begin.
                  </p>
                  <Link to="/add-card">
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      Add Your First Card
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium">
                    Collection Growing!
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    You have {totalCards} card{totalCards !== 1 ? "s" : ""}{" "}
                    worth {formatCurrency(totalValue)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
