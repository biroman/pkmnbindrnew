import { useAuth } from "../contexts/AuthContext";

/**
 * Hook to manage email verification restrictions and feature access
 * @returns {Object} - Object containing verification status and restriction methods
 */
export const useEmailVerificationRestrictions = () => {
  const { currentUser, isEmailVerified } = useAuth();

  const isVerified = isEmailVerified();
  const isLoggedIn = !!currentUser;

  // Features that require email verification
  const restrictedFeatures = {
    createBinders: !isVerified,
    addCards: !isVerified,
    editCards: !isVerified,
    shareCollections: !isVerified,
    deleteAccount: !isVerified,
    changePassword: !isVerified,
  };

  // Features that are allowed for unverified users
  const allowedFeatures = {
    viewDashboard: true,
    viewProfile: true,
    viewSettings: true,
    sendVerificationEmail: true,
    logout: true,
    viewCollections: true, // Read-only access
  };

  /**
   * Check if a specific feature is restricted
   * @param {string} feature - The feature to check
   * @returns {boolean} - True if restricted, false if allowed
   */
  const isFeatureRestricted = (feature) => {
    return restrictedFeatures[feature] || false;
  };

  /**
   * Check if a specific feature is allowed
   * @param {string} feature - The feature to check
   * @returns {boolean} - True if allowed, false if restricted
   */
  const isFeatureAllowed = (feature) => {
    return allowedFeatures[feature] || false;
  };

  /**
   * Get restriction message for a feature
   * @param {string} feature - The feature to get message for
   * @returns {string} - User-friendly restriction message
   */
  const getRestrictionMessage = (feature) => {
    if (!isLoggedIn) {
      return "Please log in to access this feature.";
    }

    if (!isVerified) {
      const messages = {
        createBinders:
          "Please verify your email address to create new binders.",
        addCards:
          "Please verify your email address to add cards to your collection.",
        editCards: "Please verify your email address to edit your cards.",
        shareCollections:
          "Please verify your email address to share your collections.",
        deleteAccount:
          "Please verify your email address before deleting your account for security.",
        changePassword:
          "Please verify your email address before changing your password for security.",
      };

      return (
        messages[feature] ||
        "Please verify your email address to access this feature."
      );
    }

    return "";
  };

  /**
   * Get props for restricting buttons/links
   * @param {string} feature - The feature to restrict
   * @returns {Object} - Props object with disabled state and title
   */
  const getRestrictedProps = (feature) => {
    const isRestricted = isFeatureRestricted(feature);
    return {
      disabled: isRestricted,
      title: isRestricted ? getRestrictionMessage(feature) : "",
      className: isRestricted ? "opacity-50 cursor-not-allowed" : "",
    };
  };

  return {
    isVerified,
    isLoggedIn,
    restrictedFeatures,
    allowedFeatures,
    isFeatureRestricted,
    isFeatureAllowed,
    getRestrictionMessage,
    getRestrictedProps,
  };
};
