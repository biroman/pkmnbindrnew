import { useState } from "react";
import { BarChart3, Users, Database } from "lucide-react";
import AdminDashboard from "../AdminDashboard";
import UserManagement from "../UserManagement";

const AdminSection = ({ currentUser, userProfile, isOwner }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", name: "System Overview", icon: BarChart3 },
    { id: "users", name: "User Management", icon: Users },
    { id: "maintenance", name: "System Maintenance", icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Administration
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage system settings, monitor users, and access owner-only features
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
    </div>
  );
};

export default AdminSection;
