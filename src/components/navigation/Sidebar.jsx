import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const Sidebar = ({ onNavigate, isCollapsed, onToggleCollapse }) => {
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
              Sidebar
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

      {/* Content Area - Available for future features */}
      <div className="flex-1 p-4">
        {!sidebarCollapsed ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">Available for future features</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        )}
      </div>

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
