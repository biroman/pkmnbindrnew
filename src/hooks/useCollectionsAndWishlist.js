import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getUserCollections,
  createCollection,
  getUserWishlist,
  addToWishlist,
} from "../services/firestore";
import { useCacheInvalidation } from "./useCacheInvalidation";

// ===== COLLECTIONS HOOKS =====

export const useUserCollections = (userId, options = {}) => {
  return useQuery({
    queryKey: ["userCollections", userId, options],
    queryFn: () => getUserCollections(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 3, // 3 minutes - collections change moderately
  });
};

export const useCreateCollection = () => {
  const {
    invalidateUserCollections,
    invalidateUserActivity,
    invalidateAdminData,
    optimisticallyAddToList,
    optimisticallyRemoveFromList,
    queryClient,
  } = useCacheInvalidation();

  return useMutation({
    mutationFn: ({ userId, collectionData }) =>
      createCollection(userId, collectionData),
    onMutate: async ({ userId, collectionData }) => {
      // Optimistically add the new collection to the list
      const tempId = `temp-${Date.now()}`;
      const optimisticCollection = {
        id: tempId,
        ...collectionData,
        cardCount: 0,
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      optimisticallyAddToList(
        ["userCollections", userId, {}],
        optimisticCollection
      );

      return { tempId };
    },
    onSuccess: (data, { userId }, context) => {
      // Replace temp collection with real one if successful
      if (data.success && data.collectionId && context?.tempId) {
        queryClient.setQueryData(["userCollections", userId, {}], (oldData) => {
          if (!oldData?.collections) return oldData;
          return {
            ...oldData,
            collections: oldData.collections.map((collection) =>
              collection.id === context.tempId
                ? { ...collection, id: data.collectionId }
                : collection
            ),
          };
        });
      }

      // Invalidate related queries
      invalidateUserCollections(userId);
      invalidateUserActivity(userId);
      invalidateAdminData();
    },
    onError: (error, { userId }, context) => {
      // Remove optimistic update on error
      if (context?.tempId) {
        optimisticallyRemoveFromList(
          ["userCollections", userId, {}],
          context.tempId
        );
      }
    },
  });
};

// ===== WISHLIST HOOKS =====

export const useUserWishlist = (userId, options = {}) => {
  return useQuery({
    queryKey: ["userWishlist", userId, options],
    queryFn: () => getUserWishlist(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 3, // 3 minutes - wishlist changes moderately
  });
};

export const useAddToWishlist = () => {
  const {
    invalidateUserWishlist,
    invalidateUserActivity,
    optimisticallyAddToList,
    optimisticallyRemoveFromList,
    queryClient,
  } = useCacheInvalidation();

  return useMutation({
    mutationFn: ({ userId, binderData }) => addToWishlist(userId, binderData),
    onMutate: async ({ userId, binderData }) => {
      // Optimistically add the new wishlist item
      const tempId = `temp-${Date.now()}`;
      const optimisticWishlistItem = {
        id: tempId,
        ...binderData,
        priority: "Medium",
        addedAt: new Date(),
      };

      optimisticallyAddToList(
        ["userWishlist", userId, {}],
        optimisticWishlistItem
      );

      return { tempId };
    },
    onSuccess: (data, { userId }, context) => {
      // Replace temp wishlist item with real one if successful
      if (data.success && data.wishlistId && context?.tempId) {
        queryClient.setQueryData(["userWishlist", userId, {}], (oldData) => {
          if (!oldData?.wishlist) return oldData;
          return {
            ...oldData,
            wishlist: oldData.wishlist.map((item) =>
              item.id === context.tempId
                ? { ...item, id: data.wishlistId }
                : item
            ),
          };
        });
      }

      // Invalidate related queries
      invalidateUserWishlist(userId);
      invalidateUserActivity(userId);
    },
    onError: (error, { userId }, context) => {
      // Remove optimistic update on error
      if (context?.tempId) {
        optimisticallyRemoveFromList(
          ["userWishlist", userId, {}],
          context.tempId
        );
      }
    },
  });
};
