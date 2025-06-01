import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Don't show anything while loading - let the initial HTML loader handle this
  if (loading) {
    return null;
  }

  // Redirect to dashboard if already authenticated
  // Preserve the intended destination from state, or default to dashboard
  if (currentUser) {
    const from = location.state?.from?.pathname || "/app/dashboard";
    return <Navigate to={from} replace />;
  }

  // Render public content if not authenticated
  return children;
};

export default PublicRoute;
