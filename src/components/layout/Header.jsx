import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import Button from "../ui/Button";

const Header = () => {
  const { currentUser, userProfile, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const displayName =
    userProfile?.displayName || currentUser?.displayName || "User";
  const email = userProfile?.email || currentUser?.email || "";
  const photoURL = userProfile?.photoURL || currentUser?.photoURL;

  return (
    <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pokemon Binder
            </h1>
          </div>

          {/* User section */}
          <div className="flex items-center space-x-4">
            <ThemeToggle size="sm" />

            {currentUser && !loading && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {email}
                  </p>
                  {userProfile && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {userProfile.totalCards} cards
                    </p>
                  )}
                </div>

                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            )}

            {loading && (
              <div className="flex items-center space-x-3">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
