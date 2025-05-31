import { useState } from "react";
import {
  BarChart3,
  Users,
  Database,
  Settings,
  MoreVertical,
  Download,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui";
import AdminDashboard from "../AdminDashboard";
import UserManagement from "../UserManagement";

const AdminSection = ({ currentUser, userProfile, isOwner }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      id: "overview",
      name: "System Overview",
      icon: BarChart3,
      description: "View system statistics and health metrics",
    },
    {
      id: "users",
      name: "User Management",
      icon: Users,
      description: "Manage users and permissions",
    },
    {
      id: "maintenance",
      name: "System Maintenance",
      icon: Database,
      description: "Database and system operations",
    },
  ];

  const handleExportData = () => {
    console.log("Exporting system data...");
    // TODO: Implement data export
  };

  const handleSystemRefresh = () => {
    console.log("Refreshing system...");
    // TODO: Implement system refresh
  };

  const handleViewLogs = () => {
    console.log("Opening system logs...");
    // TODO: Implement log viewer
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Administration
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage system settings, monitor users, and access owner-only
              features
            </p>
          </div>

          {/* Admin Actions Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Actions
                    <MoreVertical className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Access admin tools and system operations</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>System Operations</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleSystemRefresh}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh System
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportData}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Monitoring</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleViewLogs}
                className="flex items-center"
              >
                <Activity className="h-4 w-4 mr-2" />
                View System Logs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Enhanced Tab Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="flex space-x-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200 dark:border-purple-800"
                            : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.name}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tab.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>

            {/* Tab Content with improved spacing */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
              {activeTab === "overview" && (
                <AdminDashboard
                  currentUser={currentUser}
                  userProfile={userProfile}
                  isOwner={isOwner}
                  showOnlyContent={true}
                />
              )}

              {activeTab === "users" && <UserManagement />}

              {activeTab === "maintenance" && (
                <AdminDashboard
                  currentUser={currentUser}
                  userProfile={userProfile}
                  isOwner={isOwner}
                  showOnlyMaintenance={true}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    1,234
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Sessions
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    89
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    System Health
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    Healthy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminSection;
