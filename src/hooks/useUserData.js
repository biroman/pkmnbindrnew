import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  getUserBinders,
  getUserActivity,
  addBinder,
  updateBinder,
  deleteBinder,
} from "../services/firestore";

// ===== USER PROFILE HOOKS =====

export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }) => updateUserProfile(userId, updates),
    onSuccess: (data, { userId }) => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

// ===== USER PREFERENCES HOOKS =====

export const useUserPreferences = (userId) => {
  return useQuery({
    queryKey: ["userPreferences", userId],
    queryFn: () => getUserPreferences(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 15, // 15 minutes (preferences change less often)
  });
};

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, preferences }) =>
      updateUserPreferences(userId, preferences),
    onSuccess: (data, { userId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["userPreferences", userId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

// ===== USER BINDERS HOOKS =====

export const useUserBinders = (userId, options = {}) => {
  return useQuery({
    queryKey: ["userBinders", userId, options],
    queryFn: () => getUserBinders(userId, options),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddBinder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, binderData }) => addBinder(userId, binderData),
    onSuccess: (data, { userId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

export const useUpdateBinder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, binderId, updates }) =>
      updateBinder(userId, binderId, updates),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
    },
  });
};

export const useDeleteBinder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, binderId }) => deleteBinder(userId, binderId),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

// ===== USER ACTIVITY HOOKS =====

export const useUserActivity = (userId, limitCount = 10) => {
  return useQuery({
    queryKey: ["userActivity", userId, limitCount],
    queryFn: () => getUserActivity(userId, limitCount),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
