import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  Library,
  Plus,
  Folder,
  Target,
  BarChart3,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const Sidebar = ({ onNavigate, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview & quick actions",
    },
    {
      name: "My Collection",
      href: "/collection",
      icon: Library,
      description: "Browse your cards",
    },
    {
      name: "Add Cards",
      href: "/add-card",
      icon: Plus,
      description: "Add new cards",
    },
    {
      name: "Collections",
      href: "/collections",
      icon: Folder,
      description: "Organize your binders",
    },
    {
      name: "Wishlist",
      href: "/wishlist",
      icon: Target,
      description: "Cards you want",
    },
    {
      name: "Statistics",
      href: "/stats",
      icon: BarChart3,
      description: "Collection insights",
    },
  ];

  const handleNavClick = () => {
    // Close mobile sidebar when navigation item is clicked
    if (onNavigate) {
      onNavigate();
    }
  };

  // Use prop for collapse state, fallback to false for mobile
  const sidebarCollapsed = isCollapsed || false;

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        sidebarCollapsed ? "w-16" : "w-64"
      } flex flex-col`}
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
          )}
          {/* Only show collapse button on desktop and when onToggleCollapse is provided */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                sidebarCollapsed ? "mx-auto" : ""
              }`}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 space-y-2 p-2`}>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group flex items-center text-sm font-medium rounded-lg transition-all duration-200 h-16 ${
                  sidebarCollapsed
                    ? `p-3 justify-center ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`
                    : `px-3 py-3 ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`
                }`
              }
              title={sidebarCollapsed ? item.name : ""}
            >
              <IconComponent
                className={`h-5 w-5 ${
                  sidebarCollapsed ? "" : "mr-3"
                } flex-shrink-0`}
              />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </p>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Pokemon Binder v1.0
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
