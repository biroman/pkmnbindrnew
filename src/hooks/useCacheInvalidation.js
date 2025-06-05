import { useQueryClient } from "@tanstack/react-query";

/**
 * Centralized cache invalidation patterns for all mutations
 * This ensures consistent cache management across the application
 */

export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();

  // ===== USER-RELATED INVALIDATIONS =====

  const invalidateUserProfile = (userId) => {
    queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
  };

  const invalidateUserPreferences = (userId) => {
    queryClient.invalidateQueries({ queryKey: ["userPreferences", userId] });
  };

  const invalidateUserActivity = (userId) => {
    queryClient.invalidateQueries({ queryKey: ["userActivity", userId] });
  };

  // ===== BINDER-RELATED INVALIDATIONS =====

  const invalidateUserBinders = (userId) => {
    queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
  };

  const invalidateBinderCards = (binderId) => {
    queryClient.invalidateQueries({ queryKey: ["binderCards", binderId] });
  };

  const invalidateBinderPreferences = (binderId) => {
    queryClient.invalidateQueries({
      queryKey: ["binderPreferences", binderId],
    });
  };

  const invalidateSpecificBinder = (userId, binderId) => {
    queryClient.invalidateQueries({ queryKey: ["binder", userId, binderId] });
  };

  // ===== COLLECTION-RELATED INVALIDATIONS =====

  const invalidateUserCollections = (userId) => {
    queryClient.invalidateQueries({ queryKey: ["userCollections", userId] });
  };

  const invalidateUserWishlist = (userId) => {
    queryClient.invalidateQueries({ queryKey: ["userWishlist", userId] });
  };

  // ===== ADMIN-RELATED INVALIDATIONS =====

  const invalidateAdminStats = () => {
    queryClient.invalidateQueries({ queryKey: ["adminStats"] });
  };

  const invalidateAdminUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
  };

  // ===== COMPREHENSIVE INVALIDATION PATTERNS =====

  /**
   * Invalidate all user-related data when user profile changes
   */
  const invalidateAllUserData = (userId) => {
    invalidateUserProfile(userId);
    invalidateUserPreferences(userId);
    invalidateUserBinders(userId);
    invalidateUserCollections(userId);
    invalidateUserWishlist(userId);
    invalidateUserActivity(userId);
  };

  /**
   * Invalidate all binder-related data when binder changes
   */
  const invalidateAllBinderData = (userId, binderId) => {
    invalidateUserBinders(userId);
    invalidateBinderCards(binderId);
    invalidateBinderPreferences(binderId);
    invalidateSpecificBinder(userId, binderId);
    invalidateUserProfile(userId); // For totals
  };

  /**
   * Invalidate card-related data when cards change
   */
  const invalidateCardData = (userId, binderId) => {
    invalidateBinderCards(binderId);
    invalidateBinderPreferences(binderId); // For totalCardsInBinder
    invalidateUserProfile(userId); // For totals
    invalidateUserBinders(userId); // For binder metadata
  };

  /**
   * Invalidate admin data when users change
   */
  const invalidateAdminData = () => {
    invalidateAdminStats();
    invalidateAdminUsers();
  };

  // ===== OPTIMISTIC UPDATE HELPERS =====

  /**
   * Optimistically add item to a list query
   */
  const optimisticallyAddToList = (queryKey, newItem) => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (
        !oldData?.data &&
        !oldData?.binders &&
        !oldData?.collections &&
        !oldData?.wishlist
      ) {
        // Handle different response formats
        return { success: true, data: [newItem] };
      }

      // Handle userBinders response format
      if (oldData.binders) {
        return {
          ...oldData,
          binders: [newItem, ...oldData.binders],
        };
      }

      // Handle collections response format
      if (oldData.collections) {
        return {
          ...oldData,
          collections: [newItem, ...oldData.collections],
        };
      }

      // Handle wishlist response format
      if (oldData.wishlist) {
        return {
          ...oldData,
          wishlist: [newItem, ...oldData.wishlist],
        };
      }

      // Handle generic data array format
      if (oldData.data) {
        return {
          ...oldData,
          data: [newItem, ...oldData.data],
        };
      }

      return oldData;
    });
  };

  /**
   * Optimistically update item in a list query
   */
  const optimisticallyUpdateInList = (queryKey, itemId, updates) => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const updateInArray = (array) => {
        return array.map((item) =>
          item.id === itemId
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        );
      };

      // Handle different response formats
      if (oldData.binders) {
        return { ...oldData, binders: updateInArray(oldData.binders) };
      }
      if (oldData.collections) {
        return { ...oldData, collections: updateInArray(oldData.collections) };
      }
      if (oldData.wishlist) {
        return { ...oldData, wishlist: updateInArray(oldData.wishlist) };
      }
      if (oldData.data) {
        return { ...oldData, data: updateInArray(oldData.data) };
      }

      return oldData;
    });
  };

  /**
   * Optimistically remove item from a list query
   */
  const optimisticallyRemoveFromList = (queryKey, itemId) => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const filterArray = (array) => array.filter((item) => item.id !== itemId);

      // Handle different response formats
      if (oldData.binders) {
        return { ...oldData, binders: filterArray(oldData.binders) };
      }
      if (oldData.collections) {
        return { ...oldData, collections: filterArray(oldData.collections) };
      }
      if (oldData.wishlist) {
        return { ...oldData, wishlist: filterArray(oldData.wishlist) };
      }
      if (oldData.data) {
        return { ...oldData, data: filterArray(oldData.data) };
      }

      return oldData;
    });
  };

  return {
    // Individual invalidations
    invalidateUserProfile,
    invalidateUserPreferences,
    invalidateUserActivity,
    invalidateUserBinders,
    invalidateBinderCards,
    invalidateBinderPreferences,
    invalidateSpecificBinder,
    invalidateUserCollections,
    invalidateUserWishlist,
    invalidateAdminStats,
    invalidateAdminUsers,

    // Comprehensive invalidations
    invalidateAllUserData,
    invalidateAllBinderData,
    invalidateCardData,
    invalidateAdminData,

    // Optimistic updates
    optimisticallyAddToList,
    optimisticallyUpdateInList,
    optimisticallyRemoveFromList,

    // Direct access to queryClient for custom patterns
    queryClient,
  };
};
