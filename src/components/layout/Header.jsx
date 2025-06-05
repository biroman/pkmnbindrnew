import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import Button from "../ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui";
import {
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Settings,
  ChevronDown,
  User,
  Home,
  BarChart3,
  Folder,
  Plus,
  LogIn,
  UserPlus,
  Lock,
  UserX,
  Cloud,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, NavLink, Link } from "react-router-dom";
import { useUserLimits } from "../../hooks/useUserLimits";
import { useQuery } from "@tanstack/react-query";
import { getBindersForUser } from "../../services/firestore";

const Header = () => {
  const { currentUser, userProfile, logout, loading, isOwner } = useAuth();
  const { canCreateBinder, limits } = useUserLimits();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch current binder count to check limits
  const { data: bindersData } = useQuery({
    queryKey: ["userBinders", currentUser?.uid],
    queryFn: () => {
      if (!currentUser?.uid) {
        return Promise.resolve({ success: false, binders: [] });
      }
      return getBindersForUser(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
  });

  const currentBinderCount = bindersData?.binders?.length || 0;
  const canCreate = canCreateBinder(currentBinderCount);
  const isAtLimit = !canCreate && limits.maxBinders !== Number.MAX_SAFE_INTEGER;

  // Check if user is on binder page
  const isOnBinderPage = location.pathname.startsWith("/app/binder");

  // Primary action for all users
  const primaryAction = {
    name: currentUser ? "Create Binder" : "Start Creating",
    href: "/app/binder/new",
    icon: Plus,
    isPrimary: true,
  };

  // All navigation items (some restricted for anonymous users)
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/app/dashboard",
      icon: Home,
      authOnly: true,
      tooltip: "Sign up to access your personal dashboard",
    },
    {
      name: "My Binders",
      href: "/app/collections",
      icon: Folder,
      authOnly: true,
      tooltip: "Sign up to manage multiple binders and collections",
    },
    {
      name: "Statistics",
      href: "/app/stats",
      icon: BarChart3,
      authOnly: true,
      tooltip: "Sign up to get your own collection statistics",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      navigate("/under-development");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate("/app/profile");
  };

  const handleSignIn = () => {
    navigate("/auth?mode=login");
  };

  const handleSignUp = () => {
    navigate("/auth?mode=signup");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName =
    userProfile?.displayName || currentUser?.displayName || "User";
  const email = userProfile?.email || currentUser?.email || "";
  const photoURL = userProfile?.photoURL || currentUser?.photoURL;

  return (
    <TooltipProvider>
      <header className="w-full bg-white dark:bg-gray-800 shadow-[inset_0_-1px_0_0_rgb(229_231_235)] dark:shadow-[inset_0_-1px_0_0_rgb(75_85_99)] transition-colors duration-200 relative z-50">
        <div className="w-full flex justify-between items-center h-16">
          {/* Left side - Logo + Title */}
          <div className="flex items-center">
            {/* Mobile hamburger menu - for navigation */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden ml-4 mr-2 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle mobile navigation"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo + Title */}
            <div className="flex items-center ml-2 lg:ml-6">
              <div className="flex-shrink-0 mr-3">
                <img
                  src="/logo.png"
                  alt="Pokemon Binder Logo"
                  className="h-7 w-7 lg:h-20 lg:w-20 object-contain"
                  onError={(e) => {
                    // Fallback to ShieldCheck icon if logo fails to load
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "block";
                  }}
                />
                <ShieldCheck className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400 hidden" />
              </div>
            </div>
          </div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Primary Action with Guest Info */}
            <div className="flex items-center space-x-2">
              {/* Create Binder Button with Limit Checking */}
              {isAtLimit ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold bg-gray-400 text-gray-600 cursor-not-allowed transition-colors duration-200 shadow-sm">
                      <Plus className="h-4 w-4" />
                      <span>{primaryAction.name}</span>
                      <Lock className="h-3 w-3 ml-1" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="center"
                    className="z-50 max-w-xs"
                    sideOffset={5}
                  >
                    <p className="text-sm select-none">
                      Binder limit reached ({currentBinderCount}/
                      {limits.maxBinders}).
                      <br />
                      {currentUser
                        ? "Consider organizing your existing binders."
                        : "Sign up for more binders!"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <NavLink
                  to={primaryAction.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm ${
                    location.pathname === primaryAction.href
                      ? "bg-blue-700"
                      : "hover:bg-blue-700"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>{primaryAction.name}</span>
                </NavLink>
              )}

              {/* Subtle Guest Mode Info Badge */}
              {!currentUser && (
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md cursor-help">
                        <UserX className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                          Guest mode
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      className="z-50 max-w-xs"
                      sideOffset={5}
                    >
                      <p className="text-sm select-none">
                        Your binder is saved locally on this device.
                        <br />
                        <Link to="/auth?mode=signup" className="text-blue-400">
                          Sign up
                        </Link>{" "}
                        to sync across devices and share with friends.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* All Navigation Items */}
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              const isDisabled = item.authOnly && !currentUser;

              const navItem = (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isDisabled
                      ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isDisabled && <Lock className="h-3 w-3 ml-1 opacity-50" />}
                </NavLink>
              );

              // Wrap disabled items with tooltip
              if (isDisabled && item.tooltip) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                    <TooltipContent>
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navItem;
            })}
          </nav>

          {/* Right side - Theme toggle + User Profile/Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4 px-4 sm:px-6 lg:px-8">
            <ThemeToggle size="sm" />

            {/* Authenticated User - Profile Dropdown */}
            {currentUser && !loading && (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Button */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="User menu"
                >
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
                  {/* Dropdown indicator - hidden on mobile */}
                  <ChevronDown
                    className={`hidden sm:block h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isOwner()
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleSettingsClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Anonymous User - Auth Buttons */}
            {!currentUser && !loading && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={handleSignUp}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            )}

            {/* Loading State */}
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <nav className="px-4 py-2 space-y-1">
              {/* Primary Action with Guest Info */}
              <div className="space-y-2">
                {/* Create Binder Button with Limit Checking - Mobile */}
                {isAtLimit ? (
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold bg-gray-400 text-gray-600 cursor-not-allowed transition-colors duration-200 shadow-sm">
                    <Plus className="h-5 w-5" />
                    <span>{primaryAction.name}</span>
                    <Lock className="h-3 w-3 ml-1" />
                  </div>
                ) : (
                  <NavLink
                    to={primaryAction.href}
                    onClick={(e) => {
                      if (e.target.tagName === "A") {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm ${
                      location.pathname === primaryAction.href
                        ? "bg-blue-700"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    <Plus className="h-5 w-5" />
                    <span>{primaryAction.name}</span>
                  </NavLink>
                )}

                {/* Mobile Guest Mode Info */}
                {!currentUser && (
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md">
                      <UserX className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        Guest mode • Sign up for cloud sync
                      </span>
                    </div>
                  </div>
                )}

                {/* Mobile Limit Info */}
                {isAtLimit && (
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
                      <Lock className="h-3 w-3 text-red-600 dark:text-red-400" />
                      <span className="text-xs text-red-700 dark:text-red-300 font-medium">
                        Binder limit reached ({currentBinderCount}/
                        {limits.maxBinders})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* All Navigation Items */}
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.href;
                const isDisabled = item.authOnly && !currentUser;

                const navItem = (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                      } else {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isDisabled
                        ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                    {isDisabled && <Lock className="h-3 w-3 ml-1 opacity-50" />}
                  </NavLink>
                );

                // Wrap disabled items with tooltip
                if (isDisabled && item.tooltip) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                      <TooltipContent>
                        <p>{item.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return navItem;
              })}

              {/* Mobile Auth Buttons for Anonymous Users */}
              {!currentUser && !loading && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      handleSignIn();
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 w-full"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      handleSignUp();
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 w-full"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </TooltipProvider>
  );
};

export default Header;
