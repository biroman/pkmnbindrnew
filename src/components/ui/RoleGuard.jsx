import { useAuth } from "../../contexts/AuthContext";

const RoleGuard = ({
  children,
  allowedRoles = [],
  requiredRole = null,
  requireOwner = false,
  fallback = null,
}) => {
  const { getUserRole, isOwner } = useAuth();

  const currentRole = getUserRole();

  // Check if user has required permissions
  const hasPermission = () => {
    // If requireOwner is true, only owners can see the content
    if (requireOwner) {
      return isOwner();
    }

    // If requiredRole is specified, check for exact role match
    if (requiredRole) {
      return currentRole === requiredRole;
    }

    // If allowedRoles array is provided, check if user's role is in the array
    if (allowedRoles.length > 0) {
      return allowedRoles.includes(currentRole);
    }

    // Default: allow all authenticated users
    return true;
  };

  // Render children if user has permission, otherwise render fallback
  return hasPermission() ? children : fallback;
};

export default RoleGuard;
