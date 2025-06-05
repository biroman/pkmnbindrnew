import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  getUserProfile,
  getBindersForUser,
  getUserPreferences,
  getUserActivity,
  getAdminStats,
} from "../services/firestore";

// ===== SMART USER DATA PREFETCHING =====

export const usePrefetchUserData = (userId) => {
  const queryClient = useQueryClient();

  const prefetchUserProfile = useCallback(async () => {
    if (!userId) return;

    await queryClient.prefetchQuery({
      queryKey: ["userProfile", userId],
      queryFn: () => getUserProfile(userId),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  }, [userId, queryClient]);

  const prefetchUserPreferences = useCallback(async () => {
    if (!userId) return;

    await queryClient.prefetchQuery({
      queryKey: ["userPreferences", userId],
      queryFn: () => getUserPreferences(userId),
      staleTime: 1000 * 60 * 15, // 15 minutes
    });
  }, [userId, queryClient]);

  const prefetchUserBinders = useCallback(
    async (options = { limit: 10 }) => {
      if (!userId) return;

      await queryClient.prefetchQuery({
        queryKey: ["userBinders", userId, options],
        queryFn: () => getBindersForUser(userId),
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    },
    [userId, queryClient]
  );

  const prefetchUserActivity = useCallback(
    async (limitCount = 10) => {
      if (!userId) return;

      await queryClient.prefetchQuery({
        queryKey: ["userActivity", userId, limitCount],
        queryFn: () => getUserActivity(userId, limitCount),
        staleTime: 1000 * 60 * 2, // 2 minutes
      });
    },
    [userId, queryClient]
  );

  // Prefetch core user data on login/mount
  useEffect(() => {
    if (userId) {
      Promise.all([
        prefetchUserProfile(),
        prefetchUserPreferences(),
        prefetchUserBinders(),
        prefetchUserActivity(),
      ]);
    }
  }, [
    userId,
    prefetchUserProfile,
    prefetchUserPreferences,
    prefetchUserBinders,
    prefetchUserActivity,
  ]);

  return {
    prefetchUserProfile,
    prefetchUserPreferences,
    prefetchUserBinders,
    prefetchUserActivity,
  };
};

// ===== ROUTE-BASED PREFETCHING =====

export const useRoutePrefetching = (userId, userRole) => {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Prefetch data based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    const prefetchForRoute = async () => {
      if (!userId) return;

      switch (true) {
        case currentPath.includes("/app/dashboard"):
          // Prefetch profile and recent binders for dashboard
          await Promise.all([
            queryClient.prefetchQuery({
              queryKey: ["userProfile", userId],
              queryFn: () => getUserProfile(userId),
            }),
            queryClient.prefetchQuery({
              queryKey: ["userBinders", userId, { limit: 5 }],
              queryFn: () => getBindersForUser(userId, { limit: 5 }),
            }),
            queryClient.prefetchQuery({
              queryKey: ["userActivity", userId, 5],
              queryFn: () => getUserActivity(userId, 5),
            }),
          ]);
          break;

        case currentPath.includes("/app/collections"):
          // Prefetch more binders for collections page
          await queryClient.prefetchQuery({
            queryKey: ["userBinders", userId, { limit: 20 }],
            queryFn: () => getBindersForUser(userId, { limit: 20 }),
          });
          break;

        case currentPath.includes("/app/profile"):
          // Prefetch user preferences and profile
          await Promise.all([
            queryClient.prefetchQuery({
              queryKey: ["userProfile", userId],
              queryFn: () => getUserProfile(userId),
            }),
            queryClient.prefetchQuery({
              queryKey: ["userPreferences", userId],
              queryFn: () => getUserPreferences(userId),
            }),
          ]);
          break;

        case currentPath.includes("/app/stats") && userRole === "owner":
          // Prefetch admin stats for owners
          await queryClient.prefetchQuery({
            queryKey: ["adminStats"],
            queryFn: getAdminStats,
          });
          break;

        default:
          // General prefetch for common data
          await queryClient.prefetchQuery({
            queryKey: ["userProfile", userId],
            queryFn: () => getUserProfile(userId),
          });
      }
    };

    prefetchForRoute();
  }, [location.pathname, userId, userRole, queryClient]);
};

// ===== HOVER-BASED PREFETCHING =====

export const useHoverPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchOnHover = useCallback(
    async (queryKey, queryFn, options = {}) => {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 1000 * 60 * 5,
        ...options,
      });
    },
    [queryClient]
  );

  return { prefetchOnHover };
};

// ===== PREDICTIVE PREFETCHING =====

export const usePredictivePrefetching = (userId) => {
  const queryClient = useQueryClient();

  // Prefetch based on user behavior patterns
  const prefetchBasedOnUsage = useCallback(async () => {
    if (!userId) return;

    const userProfile = queryClient.getQueryData(["userProfile", userId]);
    const userActivity = queryClient.getQueryData(["userActivity", userId, 10]);

    if (!userProfile?.data || !userActivity?.data) return;

    const recentActivity = userActivity.data.slice(0, 5);
    const hasRecentBinderActivity = recentActivity.some(
      (activity) =>
        activity.type === "binder_added" || activity.type === "binder_removed"
    );

    // If user has been active with binders, prefetch more binder data
    if (hasRecentBinderActivity) {
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ["userBinders", userId, { limit: 50 }],
          queryFn: () => getBindersForUser(userId, { limit: 50 }),
        }),
        queryClient.prefetchQuery({
          queryKey: ["userBinders", userId, { isFavorite: true }],
          queryFn: () => getBindersForUser(userId, { isFavorite: true }),
        }),
      ]);
    }

    // If user is a power user (many binders), prefetch more data
    if (userProfile.data.totalBinders > 20) {
      await queryClient.prefetchQuery({
        queryKey: ["userActivity", userId, 25],
        queryFn: () => getUserActivity(userId, 25),
      });
    }
  }, [userId, queryClient]);

  return { prefetchBasedOnUsage };
};

// ===== INTELLIGENT BACKGROUND PREFETCHING =====

export const useBackgroundPrefetching = (userId, isOwner) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Background prefetching with low priority
    const backgroundPrefetch = async () => {
      // Use requestIdleCallback for non-critical prefetching
      if (window.requestIdleCallback) {
        window.requestIdleCallback(async () => {
          try {
            // Skip wishlist and collections prefetching since they're not implemented
            console.log(
              "Background prefetching skipped - features not implemented yet"
            );

            // Only prefetch admin data for owners
            if (isOwner) {
              await queryClient.prefetchQuery({
                queryKey: ["adminStats"],
                queryFn: getAdminStats,
                staleTime: 1000 * 60 * 5,
              });
            }
          } catch (error) {
            console.log("Background prefetch failed (non-critical):", error);
          }
        });
      }
    };

    // Delay background prefetching to not interfere with critical operations
    const timer = setTimeout(backgroundPrefetch, 2000);
    return () => clearTimeout(timer);
  }, [userId, isOwner, queryClient]);
};

// ===== NETWORK-AWARE PREFETCHING =====

export const useNetworkAwarePrefetching = () => {
  const queryClient = useQueryClient();

  const getNetworkInfo = useCallback(() => {
    if ("connection" in navigator) {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        saveData: connection.saveData,
      };
    }
    return { effectiveType: "4g", downlink: 10, saveData: false };
  }, []);

  const shouldPrefetch = useCallback(() => {
    const { effectiveType, saveData, downlink } = getNetworkInfo();

    // Don't prefetch on slow connections or if user prefers to save data
    if (saveData || effectiveType === "slow-2g" || effectiveType === "2g") {
      return false;
    }

    // Limit prefetching on 3g
    if (effectiveType === "3g" && downlink < 1.5) {
      return false;
    }

    return true;
  }, [getNetworkInfo]);

  const smartPrefetch = useCallback(
    async (queryKey, queryFn, options = {}) => {
      if (!shouldPrefetch()) {
        console.log("Skipping prefetch due to network conditions");
        return;
      }

      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        ...options,
      });
    },
    [shouldPrefetch, queryClient]
  );

  return { smartPrefetch, shouldPrefetch, getNetworkInfo };
};
