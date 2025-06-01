import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import { collection } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  getUserBinders,
  getUserActivity,
  getAllUsers,
} from "../services/firestore";

// Helper to get user subcollection reference
const getUserSubcollection = (userId, subcollection) =>
  collection(db, "users", userId, subcollection);

// ===== INFINITE USER BINDERS =====

export const useInfiniteUserBinders = (userId, options = {}) => {
  const {
    pageSize = 10,
    sortBy = "dateCreated",
    sortOrder = "desc",
    filters = {},
    enableVirtualScrolling = false,
  } = options;

  return useInfiniteQuery({
    queryKey: [
      "infiniteUserBinders",
      userId,
      pageSize,
      sortBy,
      sortOrder,
      filters,
    ],
    queryFn: async ({ pageParam = null }) => {
      if (!userId) {
        return {
          data: [],
          nextCursor: null,
          hasNextPage: false,
          totalCount: 0,
        };
      }

      try {
        // Try to get real binder data first
        const result = await getUserBinders(userId, {
          limit: pageSize,
          startAfter: pageParam,
          sortBy,
          sortOrder,
          ...filters,
        });

        return {
          data: result.data || [],
          nextCursor: result.nextCursor,
          hasNextPage: result.hasNextPage,
          totalCount: result.totalCount || 0,
        };
      } catch (error) {
        // If binders collection doesn't exist or there's an error, return empty data
        console.log("Binders collection not found or error:", error.message);
        return {
          data: [],
          nextCursor: null,
          hasNextPage: false,
          totalCount: 0,
        };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  });
};

// ===== INFINITE USER ACTIVITY =====

export const useInfiniteUserActivity = (userId, options = {}) => {
  const { pageSize = 15, filterTypes = [] } = options;

  return useInfiniteQuery({
    queryKey: ["infiniteUserActivity", userId, pageSize, filterTypes],
    queryFn: async ({ pageParam = null }) => {
      if (!userId) {
        return {
          data: [],
          nextCursor: null,
          hasNextPage: false,
        };
      }

      try {
        // Try to get real activity data first
        const result = await getUserActivity(userId, {
          limit: pageSize,
          startAfter: pageParam,
          filterTypes,
        });

        return {
          data: result.data || [],
          nextCursor: result.nextCursor,
          hasNextPage: result.hasNextPage,
        };
      } catch (error) {
        // If activity collection doesn't exist, return empty data
        console.log("Activity collection not found or error:", error.message);
        return {
          data: [],
          nextCursor: null,
          hasNextPage: false,
        };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: !!userId,
  });
};

// ===== INFINITE ADMIN USERS =====

export const useInfiniteAdminUsers = (options = {}) => {
  const {
    pageSize = 20,
    sortBy = "dateJoined",
    sortOrder = "desc",
    searchTerm = "",
    roleFilter = "",
    statusFilter = "",
  } = options;

  return useInfiniteQuery({
    queryKey: [
      "infiniteAdminUsers",
      pageSize,
      sortBy,
      sortOrder,
      searchTerm,
      roleFilter,
      statusFilter,
    ],
    queryFn: async ({ pageParam = null }) => {
      const result = await getAllUsers({
        limit: pageSize,
        startAfter: pageParam,
        sortBy,
        sortOrder,
        searchTerm,
        roleFilter,
        statusFilter,
      });

      return {
        data: result.data || [],
        nextCursor: result.nextCursor,
        hasNextPage: result.hasNextPage,
        totalCount: result.totalCount,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// ===== UTILITY HOOKS =====

// Flatten infinite query data into a single array
export const useInfiniteDataFlat = (infiniteQuery) => {
  return useMemo(() => {
    if (!infiniteQuery.data?.pages) return [];

    return infiniteQuery.data.pages.reduce((acc, page) => {
      return [...acc, ...(page.data || [])];
    }, []);
  }, [infiniteQuery.data?.pages]);
};

// Infinite scroll hook with intersection observer
export const useInfiniteScroll = (
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  options = {}
) => {
  const { threshold = 0.1, rootMargin = "0px" } = options;
  const [loadMoreRef, setLoadMoreRef] = useState(null);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    if (!loadMoreRef) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observer.observe(loadMoreRef);

    return () => {
      if (loadMoreRef) {
        observer.unobserve(loadMoreRef);
      }
      observer.disconnect();
    };
  }, [loadMoreRef, handleObserver, threshold, rootMargin]);

  return setLoadMoreRef;
};

// Virtual scrolling for infinite queries
export const useVirtualizedInfiniteQuery = (
  infiniteQuery,
  containerHeight = 400,
  itemHeight = 50
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const flatData = useInfiniteDataFlat(infiniteQuery);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 1, flatData.length);

    return {
      startIndex,
      endIndex,
      visibleItems: flatData.slice(startIndex, endIndex),
      totalHeight: flatData.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [scrollTop, flatData, itemHeight, containerHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Trigger loading more data when approaching the end
  useEffect(() => {
    const { endIndex } = visibleRange;
    if (
      endIndex >= flatData.length - 5 &&
      infiniteQuery.hasNextPage &&
      !infiniteQuery.isFetchingNextPage
    ) {
      infiniteQuery.fetchNextPage();
    }
  }, [visibleRange, flatData.length, infiniteQuery]);

  return {
    visibleRange,
    handleScroll,
    totalItems: flatData.length,
  };
};
