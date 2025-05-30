import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import Button from "../ui/Button";
import { Menu, X, LogOut } from "lucide-react";

const Header = ({ onToggleMobileSidebar, isMobileSidebarOpen }) => {
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
          {/* Left side - Mobile hamburger + Logo */}
          <div className="flex items-center">
            {/* Mobile hamburger menu */}
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle mobile menu"
            >
              {isMobileSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <h1 className="ml-2 lg:ml-0 text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Pokemon Binder
            </h1>
          </div>

          {/* Right side - Theme toggle + User section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle size="sm" />

            {currentUser && !loading && (
              <div className="flex items-center space-x-3">
                {/* User info - hidden on very small screens */}
                <div className="hidden sm:block text-right">
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

                {/* Profile image/avatar */}
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

                {/* Sign out button - show icon on mobile, text on desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:flex"
                >
                  Sign Out
                </Button>

                {/* Mobile sign out - just icon */}
                <button
                  onClick={handleLogout}
                  className="sm:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
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
