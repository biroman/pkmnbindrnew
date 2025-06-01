/**
 * SmartRoute Component
 *
 * Intelligently routes users based on authentication status:
 * - Authenticated users → Dashboard (full app experience)
 * - Anonymous users → Binder (direct access to core creation tool)
 */

import { useAuth } from "../../contexts/AuthContext";
import WelcomeDashboard from "../dashboard/WelcomeDashboard";
import { Navigate } from "react-router-dom";

const SmartRoute = () => {
  const { currentUser, loading } = useAuth();

  // Show nothing while loading (AppRoute handles loading state)
  if (loading) {
    return null;
  }

  // Authenticated users see the dashboard
  if (currentUser) {
    return <WelcomeDashboard />;
  }

  // Anonymous users are redirected to binder creation page
  return <Navigate to="/app/binder" replace />;
};

export default SmartRoute;
