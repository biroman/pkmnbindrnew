import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  onSnapshot,
  doc,
  collection,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  getUserProfile,
  getUserBinders,
  getUserPreferences,
  getBindersForUser,
} from "../services/firestore";

// Helper to get user document reference
const getUserDocRef = (userId) => doc(db, "users", userId);
const getUserSubcollection = (userId, subcollection) =>
  collection(db, "users", userId, subcollection);

// ===== REAL-TIME USER PROFILE =====

export const useRealtimeUserProfile = (userId) => {
  const queryClient = useQueryClient();

  // Set up real-time listener
  useEffect(() => {
    if (!userId) return;

    const userDocRef = getUserDocRef(userId);

    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const data = { success: true, data: doc.data() };
          queryClient.setQueryData(["userProfile", userId], data);
        }
      },
      (error) => {
        console.error("Real-time user profile error:", error);
        queryClient.setQueryData(["userProfile", userId], {
          success: false,
          error: error.message,
        });
      }
    );

    return unsubscribe;
  }, [userId, queryClient]);

  // Initial query with TanStack Query
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: Infinity, // Never stale since real-time updates
  });
};

// ===== REAL-TIME USER PREFERENCES =====

export const useRealtimeUserPreferences = (userId) => {
  const queryClient = useQueryClient();

  // Set up real-time listener for preferences
  useEffect(() => {
    if (!userId) return;

    const userDocRef = getUserDocRef(userId);

    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const preferences = userData.settings?.binderPreferences || {};

          const defaultPreferences = {
            gridSize: "3x3",
            sortingDirection: true,
            autoSave: true,
          };

          const data = {
            success: true,
            data: { ...defaultPreferences, ...preferences },
          };

          queryClient.setQueryData(["userPreferences", userId], data);
        }
      },
      (error) => {
        console.error("Real-time user preferences error:", error);
      }
    );

    return unsubscribe;
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ["userPreferences", userId],
    queryFn: () => getUserPreferences(userId),
    enabled: !!userId,
    staleTime: Infinity, // Never stale since real-time updates
  });
};

// ===== REAL-TIME USER BINDERS =====

export const useRealtimeUserBinders = (userId, options = {}) => {
  const queryClient = useQueryClient();

  // Set up real-time listener for binders
  useEffect(() => {
    if (!userId) return;

    const bindersRef = getUserSubcollection(userId, "binders");
    let q = query(bindersRef, orderBy("addedAt", "desc"));

    // Apply filters if provided
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const binders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const data = { success: true, data: binders };
        queryClient.setQueryData(["userBinders", userId, options], data);
      },
      (error) => {
        console.error("Real-time user binders error:", error);
        queryClient.setQueryData(["userBinders", userId, options], {
          success: false,
          error: error.message,
        });
      }
    );

    return unsubscribe;
  }, [userId, options, queryClient]);

  return useQuery({
    queryKey: ["userBindersRealtime", userId, options],
    queryFn: () => getBindersForUser(userId),
    enabled: !!userId,
    refetchInterval: options.refetchInterval || false,
    staleTime: Infinity, // Never stale since real-time updates
  });
};

// ===== REAL-TIME USER ACTIVITY =====

export const useRealtimeUserActivity = (userId, limitCount = 10) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const activityRef = getUserSubcollection(userId, "activity");
    const q = query(
      activityRef,
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const activities = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const data = { success: true, data: activities };
        queryClient.setQueryData(["userActivity", userId, limitCount], data);
      },
      (error) => {
        console.error("Real-time user activity error:", error);
      }
    );

    return unsubscribe;
  }, [userId, limitCount, queryClient]);

  return useQuery({
    queryKey: ["userActivity", userId, limitCount],
    queryFn: async () => {
      // Fallback function if needed
      const { getUserActivity } = await import("../services/firestore");
      return getUserActivity(userId, limitCount);
    },
    enabled: !!userId,
    staleTime: Infinity,
  });
};
