import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

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
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome back, {displayName}!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
          Ready to organize your Pokemon collection? Your digital binder awaits!
        </p>
        {userProfile && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Member since{" "}
            {new Date(
              userProfile.createdAt?.seconds * 1000
            ).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {totalCards.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Pokemon Cards
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              0
            </div>
            <div className="text-gray-600 dark:text-gray-400">Collections</div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {completionPercentage}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Pokedex Complete
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              0
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Favorite Cards
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              0
            </div>
            <div className="text-gray-600 dark:text-gray-400">Rare Cards</div>
          </div>
        </Card>

        <Card variant="elevated" className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quick Actions - Takes 2/3 width on large screens */}
        <div className="xl:col-span-2">
          <Card variant="elevated" className="p-8 h-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link to="/add-card">
                <Button variant="primary" className="h-20 flex-col w-full">
                  <span className="text-2xl mb-1">📱</span>
                  Add Cards
                </Button>
              </Link>

              <Link to="/collection">
                <Button variant="secondary" className="h-20 flex-col w-full">
                  <span className="text-2xl mb-1">📚</span>
                  View Collection
                </Button>
              </Link>

              <Link to="/collection">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <span className="text-2xl mb-1">🔍</span>
                  Search Cards
                </Button>
              </Link>

              <Link to="/stats">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <span className="text-2xl mb-1">📊</span>
                  Statistics
                </Button>
              </Link>

              <Link to="/collection">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <span className="text-2xl mb-1">⭐</span>
                  Favorites
                </Button>
              </Link>

              <Link to="/collection">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <span className="text-2xl mb-1">💎</span>
                  Rare Cards
                </Button>
              </Link>

              <Link to="/stats">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <span className="text-2xl mb-1">📈</span>
                  Price Tracker
                </Button>
              </Link>

              <Link to="/wishlist">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <span className="text-2xl mb-1">🎯</span>
                  Wishlist
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Activity - Takes 1/3 width on large screens */}
        <div className="xl:col-span-1">
          <Card variant="elevated" className="p-8 h-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎒</div>
              {totalCards === 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Your journey starts here! Add your first Pokemon card to
                    begin.
                  </p>
                  <Link to="/add-card">
                    <Button variant="primary" size="sm">
                      Add Your First Card
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                    Collection Growing!
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
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
