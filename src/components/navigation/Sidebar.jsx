import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "🏠",
      description: "Overview & quick actions",
    },
    {
      name: "My Collection",
      href: "/collection",
      icon: "📚",
      description: "Browse your cards",
    },
    {
      name: "Add Cards",
      href: "/add-card",
      icon: "➕",
      description: "Add new cards",
    },
    {
      name: "Collections",
      href: "/collections",
      icon: "📁",
      description: "Organize your binders",
    },
    {
      name: "Wishlist",
      href: "/wishlist",
      icon: "🎯",
      description: "Cards you want",
    },
    {
      name: "Statistics",
      href: "/stats",
      icon: "📊",
      description: "Collection insights",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: "👤",
      description: "Account settings",
    },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavClick = () => {
    // Close mobile sidebar when navigation item is clicked
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } flex flex-col h-full`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
          )}
          {/* Only show collapse button on desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="text-lg">{isCollapsed ? "→" : "←"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              }`
            }
            title={isCollapsed ? item.name : ""}
          >
            <span className="text-xl mr-3 flex-shrink-0">{item.icon}</span>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </p>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
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
