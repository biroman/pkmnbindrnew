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
  Cog,
  DollarSign,
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
import SystemConfiguration from "../SystemConfiguration";
import { CostMonitoringDashboard } from "../CostMonitoringDashboard";

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
      id: "cost-monitoring",
      name: "Cost Monitoring",
      icon: DollarSign,
      description: "Monitor Firebase usage and costs",
    },
    {
      id: "users",
      name: "User Management",
      icon: Users,
      description: "Manage users and permissions",
    },
    {
      id: "configuration",
      name: "System Config",
      icon: Cog,
      description: "Configure user limits, features, and system settings",
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
        <nav className="flex space-x-2 mb-6 p-1 bg-gray-100 items-center justify-center dark:bg-gray-700 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-md text-xs font-medium transition-all ${
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

          {activeTab === "cost-monitoring" && <CostMonitoringDashboard />}

          {activeTab === "users" && <UserManagement />}

          {activeTab === "configuration" && <SystemConfiguration />}

          {activeTab === "maintenance" && (
            <AdminDashboard
              currentUser={currentUser}
              userProfile={userProfile}
              isOwner={isOwner}
              showOnlyMaintenance={true}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AdminSection;
