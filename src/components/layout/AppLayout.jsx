import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "../navigation/Sidebar";

const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - spans full width */}
      <Header
        onToggleMobileSidebar={toggleMobileSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div
            className={`flex flex-col transition-all duration-300 ${
              isDesktopSidebarCollapsed ? "w-16" : "w-64"
            }`}
          >
            <Sidebar
              isCollapsed={isDesktopSidebarCollapsed}
              onToggleCollapse={toggleDesktopSidebar}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Page content */}
          <main
            className="relative overflow-hidden"
            style={{ height: "calc(100vh - 4rem)" }}
          >
            <div className="absolute inset-0 overflow-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar backdrop - only show when open */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={closeMobileSidebar}
          ></div>

          {/* Mobile sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transform transition-transform">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <Sidebar onNavigate={closeMobileSidebar} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
