import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  getAdminStats,
  getAllUsers,
  deleteUserAccount,
} from "../services/firestore";

// ===== ADMIN STATS WITH CACHING =====

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
    staleTime: 1000 * 60 * 5, // 5 minutes - admin stats don't change frequently
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchInterval: 1000 * 60 * 10, // Auto-refresh every 10 minutes
  });
};

// ===== ADMIN USERS LIST WITH REAL-TIME =====

export const useAdminUsers = (limitCount = 50) => {
  const queryClient = useQueryClient();

  // Set up real-time listener for users collection
  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(limitCount));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const data = { success: true, data: users };
        queryClient.setQueryData(["adminUsers", limitCount], data);

        // Also update admin stats when users change
        queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      },
      (error) => {
        console.error("Real-time admin users error:", error);
        queryClient.setQueryData(["adminUsers", limitCount], {
          success: false,
          error: error.message,
        });
      }
    );

    return unsubscribe;
  }, [limitCount, queryClient]);

  return useQuery({
    queryKey: ["adminUsers", limitCount],
    queryFn: () => getAllUsers(limitCount),
    staleTime: Infinity, // Never stale since real-time updates
  });
};

// ===== ADMIN USER DELETION WITH CACHE UPDATES =====

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: (data, deletedUserId) => {
      // Remove user from admin users list
      queryClient.setQueryData(["adminUsers", 50], (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((user) => user.id !== deletedUserId),
        };
      });

      // Invalidate admin stats to reflect the change
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
    },
  });
};

// ===== BULK OPERATIONS WITH OPTIMISTIC UPDATES =====

export const useBulkUserOperations = () => {
  const queryClient = useQueryClient();

  const bulkDelete = useMutation({
    mutationFn: async (userIds) => {
      const results = await Promise.allSettled(
        userIds.map((userId) => deleteUserAccount(userId))
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      return { successful, failed, total: userIds.length };
    },
    onMutate: async (userIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["adminUsers"] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(["adminUsers", 50]);

      // Optimistically update to remove the users
      queryClient.setQueryData(["adminUsers", 50], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((user) => !userIds.includes(user.id)),
        };
      });

      return { previousUsers };
    },
    onError: (err, userIds, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["adminUsers", 50], context.previousUsers);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  return { bulkDelete };
};

// ===== SYSTEM HEALTH MONITORING =====

export const useSystemHealth = () => {
  const { data: adminStats, isLoading, error } = useAdminStats();

  const getHealthStatus = () => {
    if (!adminStats?.data) return { status: "Unknown", color: "gray" };

    const healthStatus = adminStats.data.systemHealth;

    const statusColors = {
      Excellent: "green",
      Good: "blue",
      Fair: "yellow",
      Poor: "orange",
      Critical: "red",
    };

    return {
      status: healthStatus,
      color: statusColors[healthStatus] || "gray",
      details: adminStats.data.healthDetails,
      responseTime: adminStats.data.responseTime,
    };
  };

  return {
    health: getHealthStatus(),
    isLoading,
    error,
    rawData: adminStats?.data,
  };
};
