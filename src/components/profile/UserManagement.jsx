import { useState, useEffect } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
  Mail,
  Activity,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { getAllUsers } from "../../services/firestore";
import { useAuth } from "../../contexts/AuthContext";

const UserManagement = () => {
  const { currentUser, userProfile, isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Load users
  const loadUsers = async () => {
    // Don't try to load if user isn't authenticated or isn't owner
    if (!currentUser || !userProfile || !isOwner()) {
      setError("Authentication required or insufficient permissions");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading users...", {
        currentUser: !!currentUser,
        userProfile: !!userProfile,
        isOwner: isOwner(),
      });

      const result = await getAllUsers(100); // Get up to 100 users

      console.log("getAllUsers result:", result);

      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
        setError(null);
        console.log("Users loaded successfully:", result.data.length);
      } else {
        setError(result.error || "Failed to load users");
        console.error("Failed to load users:", result.error);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load - wait for auth to be ready
  useEffect(() => {
    if (currentUser && userProfile && isOwner()) {
      loadUsers();
    }
  }, [currentUser, userProfile, isOwner]);

  // Filter and search users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "displayName":
          aValue = a.displayName || "";
          bValue = b.displayName || "";
          break;
        case "email":
          aValue = a.email || "";
          bValue = b.email || "";
          break;
        case "lastLoginAt":
          aValue = a.lastLoginAt?.seconds || 0;
          bValue = b.lastLoginAt?.seconds || 0;
          break;
        case "createdAt":
        default:
          aValue = a.createdAt?.seconds || 0;
          bValue = b.createdAt?.seconds || 0;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortBy, sortOrder]);

  // Get user status (online/offline based on last login)
  const getUserStatus = (user) => {
    if (!user.lastLoginAt) return "never";

    const lastLogin = new Date(user.lastLoginAt.seconds * 1000);
    const now = new Date();
    const diffInMinutes = (now - lastLogin) / (1000 * 60);

    if (diffInMinutes < 5) return "online";
    if (diffInMinutes < 30) return "recently";
    return "offline";
  };

  // Format last login time
  const formatLastLogin = (user) => {
    if (!user.lastLoginAt) return "Never logged in";

    const lastLogin = new Date(user.lastLoginAt.seconds * 1000);
    const now = new Date();
    const diffInMinutes = (now - lastLogin) / (1000 * 60);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;

    return (
      lastLogin.toLocaleDateString() + " at " + lastLogin.toLocaleTimeString()
    );
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status) {
      case "online":
        return {
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 dark:bg-green-900/30",
          icon: <Activity className="h-3 w-3" />,
          text: "Online",
        };
      case "recently":
        return {
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          icon: <Clock className="h-3 w-3" />,
          text: "Recently Active",
        };
      case "offline":
        return {
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-900/30",
          icon: <Clock className="h-3 w-3" />,
          text: "Offline",
        };
      case "never":
        return {
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 dark:bg-red-900/30",
          icon: <AlertTriangle className="h-3 w-3" />,
          text: "Never Logged In",
        };
      default:
        return {
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-100 dark:bg-gray-900/30",
          icon: <Clock className="h-3 w-3" />,
          text: "Unknown",
        };
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Management
          </h2>
        </div>
        <Button
          onClick={loadUsers}
          loading={isLoading}
          size="sm"
          variant="outline"
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt">Sort by Registration Date</option>
          <option value="lastLoginAt">Sort by Last Login</option>
          <option value="displayName">Sort by Name</option>
          <option value="email">Sort by Email</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* User Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        {error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error: {error}
            </p>
            <Button
              onClick={loadUsers}
              size="sm"
              variant="outline"
              className="mt-2 text-xs"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error && !users.length ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-2">
            Failed to load users
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={loadUsers} size="sm" variant="outline">
            Retry
          </Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "No users found matching your search."
              : "No users found."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const status = getUserStatus(user);
            const statusDisplay = getStatusDisplay(status);

            return (
              <div
                key={user.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* User Avatar/Icon */}
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      {user.role === "owner" ? (
                        <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.displayName || "No display name"}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined{" "}
                          {new Date(
                            user.createdAt?.seconds * 1000
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Stats */}
                  <div className="flex items-center space-x-4">
                    {/* User Stats */}
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.totalBinders || 0} binders • $
                        {user.totalValue || 0} value
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last login: {formatLastLogin(user)}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusDisplay.bg}`}
                    >
                      {statusDisplay.icon}
                      <span
                        className={`text-xs font-medium ${statusDisplay.color}`}
                      >
                        {statusDisplay.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default UserManagement;
