/**
 * AppRoute Component
 *
 * Allows both authenticated and anonymous users to access the main app.
 * Anonymous users get local storage features, authenticated users get cloud features.
 */

import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../ui";

const AppRoute = ({ children }) => {
  const { loading } = useAuth();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Allow both authenticated and anonymous users
  return children;
};

export default AppRoute;
