import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getBindersForUser,
  getUserActivity,
  addBinder,
  updateBinder,
  deleteBinder,
} from "../services/firestore";
import { useCacheInvalidation } from "./useCacheInvalidation";

// ===== USER PROFILE HOOKS =====

export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes - reasonable for profile data
  });
};

export const useUpdateUserProfile = () => {
  const { invalidateUserProfile, invalidateAdminData } = useCacheInvalidation();

  return useMutation({
    mutationFn: ({ userId, updates }) => updateUserProfile(userId, updates),
    onSuccess: (data, { userId }) => {
      // Invalidate user profile
      invalidateUserProfile(userId);

      // If this is an admin update, invalidate admin data too
      invalidateAdminData();
    },
  });
};

// ===== USER PREFERENCES HOOKS =====

export const useUserPreferences = (userId) => {
  return useQuery({
    queryKey: ["userPreferences", userId],
    queryFn: () => getUserPreferences(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes - preferences change less often
  });
};

export const useUpdateUserPreferences = () => {
  const { invalidateUserPreferences, invalidateUserProfile } =
    useCacheInvalidation();

  return useMutation({
    mutationFn: ({ userId, preferences }) =>
      updateUserPreferences(userId, preferences),
    onSuccess: (data, { userId }) => {
      // Invalidate preferences and profile (preferences are part of profile)
      invalidateUserPreferences(userId);
      invalidateUserProfile(userId);
    },
  });
};

// ===== USER BINDERS HOOKS =====

export const useUserBinders = (userId, options = {}) => {
  return useQuery({
    queryKey: ["userBinders", userId, options],
    queryFn: () => getBindersForUser(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes - binders change more frequently
  });
};

export const useAddBinder = () => {
  const {
    invalidateAllBinderData,
    invalidateAdminData,
    optimisticallyAddToList,
    optimisticallyRemoveFromList,
    queryClient,
  } = useCacheInvalidation();

  return useMutation({
    mutationFn: ({ userId, binderData }) => addBinder(userId, binderData),
    onMutate: async ({ userId, binderData }) => {
      // Optimistically add the new binder to the list
      const tempId = `temp-${Date.now()}`;
      const optimisticBinder = {
        id: tempId,
        ...binderData,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalCardsInBinder: 0,
        ownerId: userId,
      };

      optimisticallyAddToList(["userBinders", userId, {}], optimisticBinder);

      return { tempId };
    },
    onSuccess: (data, { userId, binderData }, context) => {
      // Replace temp binder with real one if successful
      if (data.success && data.binderId && context?.tempId) {
        queryClient.setQueryData(["userBinders", userId, {}], (oldData) => {
          if (!oldData?.binders) return oldData;
          return {
            ...oldData,
            binders: oldData.binders.map((binder) =>
              binder.id === context.tempId
                ? { ...binder, id: data.binderId }
                : binder
            ),
          };
        });
      }

      // Comprehensive invalidation for new binder
      invalidateAllBinderData(userId, data.binderId);
      invalidateAdminData();
    },
    onError: (error, { userId }, context) => {
      // Remove optimistic update on error
      if (context?.tempId) {
        optimisticallyRemoveFromList(
          ["userBinders", userId, {}],
          context.tempId
        );
      }
    },
  });
};

export const useUpdateBinder = () => {
  const {
    invalidateAllBinderData,
    optimisticallyUpdateInList,
    invalidateUserBinders,
  } = useCacheInvalidation();

  return useMutation({
    mutationFn: ({ userId, binderId, updates }) =>
      updateBinder(userId, binderId, updates),
    onMutate: async ({ userId, binderId, updates }) => {
      // Optimistically update the binder
      optimisticallyUpdateInList(
        ["userBinders", userId, {}],
        binderId,
        updates
      );
    },
    onSuccess: (data, { userId, binderId }) => {
      // Comprehensive invalidation for updated binder
      invalidateAllBinderData(userId, binderId);
    },
    onError: (error, { userId }) => {
      // On error, invalidate to get fresh data
      invalidateUserBinders(userId);
    },
  });
};

export const useDeleteBinder = () => {
  const {
    invalidateAllBinderData,
    invalidateAdminData,
    optimisticallyRemoveFromList,
    invalidateUserBinders,
  } = useCacheInvalidation();

  return useMutation({
    mutationFn: ({ userId, binderId }) => deleteBinder(userId, binderId),
    onMutate: async ({ userId, binderId }) => {
      // Optimistically remove the binder
      optimisticallyRemoveFromList(["userBinders", userId, {}], binderId);
    },
    onSuccess: (data, { userId, binderId }) => {
      // Comprehensive invalidation for deleted binder
      invalidateAllBinderData(userId, binderId);
      invalidateAdminData();
    },
    onError: (error, { userId }) => {
      // On error, invalidate to restore correct data
      invalidateUserBinders(userId);
    },
  });
};

// ===== USER ACTIVITY HOOKS =====

export const useUserActivity = (userId, limitCount = 10) => {
  return useQuery({
    queryKey: ["userActivity", userId, limitCount],
    queryFn: () => getUserActivity(userId, limitCount),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minute - activity should be fairly fresh
  });
};
