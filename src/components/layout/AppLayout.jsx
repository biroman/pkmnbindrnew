import { Outlet } from "react-router-dom";
import Header from "./Header";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - spans full width with navigation */}
      <Header />

      {/* Main content */}
      <main
        className="relative overflow-hidden"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        <div className="absolute inset-0 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
