import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Generic mutation hook with common invalidation patterns
 * @param {Function} mutationFn - The mutation function
 * @param {Object} options - Configuration options
 * @returns {Object} Mutation result
 */
export const useGenericMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  const {
    invalidateQueries = [],
    optimisticUpdate,
    onSuccessCallback,
    onErrorCallback,
    ...mutationOptions
  } = options;

  return useMutation({
    mutationFn,
    onMutate: optimisticUpdate
      ? async (variables) => {
          // Cancel outgoing refetches
          await Promise.all(
            invalidateQueries.map((queryKey) =>
              queryClient.cancelQueries({ queryKey })
            )
          );

          // Get previous data for rollback
          const previousData = {};
          invalidateQueries.forEach((queryKey) => {
            previousData[JSON.stringify(queryKey)] =
              queryClient.getQueryData(queryKey);
          });

          // Apply optimistic update
          if (optimisticUpdate.update) {
            optimisticUpdate.update(queryClient, variables);
          }

          return { previousData };
        }
      : undefined,
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Custom success callback
      if (onSuccessCallback) {
        onSuccessCallback(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousData) {
        Object.entries(context.previousData).forEach(([key, data]) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
      }

      // Custom error callback
      if (onErrorCallback) {
        onErrorCallback(error, variables, context);
      }
    },
    onSettled: () => {
      // Final invalidation to ensure consistency
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    },
    ...mutationOptions,
  });
};

/**
 * Create/Add mutation pattern (for adding new items)
 * @param {Function} addFn - Function to add the item
 * @param {string} entityName - Name of entity (e.g., 'binder', 'user')
 * @param {string} userId - User ID for cache keys
 * @returns {Object} Mutation result
 */
export const useAddMutation = (addFn, entityName, userId) => {
  return useGenericMutation(({ data }) => addFn(userId, data), {
    invalidateQueries: [
      [
        `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
        userId,
      ],
      ["userProfile", userId],
    ],
    optimisticUpdate: {
      update: (queryClient, { data }) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticItem = {
          id: tempId,
          ...data,
          addedAt: new Date(),
          updatedAt: new Date(),
        };

        // Add to list
        queryClient.setQueryData(
          [
            `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
            userId,
            {},
          ],
          (old) => {
            if (!old?.data) return { success: true, data: [optimisticItem] };
            return {
              ...old,
              data: [optimisticItem, ...old.data],
            };
          }
        );

        // Update profile totals
        queryClient.setQueryData(["userProfile", userId], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              [`total${
                entityName.charAt(0).toUpperCase() + entityName.slice(1)
              }s`]:
                (old.data[
                  `total${
                    entityName.charAt(0).toUpperCase() + entityName.slice(1)
                  }s`
                ] || 0) + 1,
            },
          };
        });
      },
    },
  });
};

/**
 * Update mutation pattern (for updating existing items)
 * @param {Function} updateFn - Function to update the item
 * @param {string} entityName - Name of entity
 * @param {string} userId - User ID for cache keys
 * @returns {Object} Mutation result
 */
export const useUpdateMutation = (updateFn, entityName, userId) => {
  return useGenericMutation(
    ({ itemId, updates }) => updateFn(userId, itemId, updates),
    {
      invalidateQueries: [
        [
          `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
          userId,
        ],
      ],
      optimisticUpdate: {
        update: (queryClient, { itemId, updates }) => {
          queryClient.setQueryData(
            [
              `user${
                entityName.charAt(0).toUpperCase() + entityName.slice(1)
              }s`,
              userId,
              {},
            ],
            (old) => {
              if (!old?.data) return old;
              return {
                ...old,
                data: old.data.map((item) =>
                  item.id === itemId
                    ? { ...item, ...updates, updatedAt: new Date() }
                    : item
                ),
              };
            }
          );
        },
      },
    }
  );
};

/**
 * Delete mutation pattern (for removing items)
 * @param {Function} deleteFn - Function to delete the item
 * @param {string} entityName - Name of entity
 * @param {string} userId - User ID for cache keys
 * @returns {Object} Mutation result
 */
export const useDeleteMutation = (deleteFn, entityName, userId) => {
  return useGenericMutation(({ itemId }) => deleteFn(userId, itemId), {
    invalidateQueries: [
      [
        `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
        userId,
      ],
      ["userProfile", userId],
    ],
    optimisticUpdate: {
      update: (queryClient, { itemId }) => {
        // Get item being deleted for profile updates
        const currentData = queryClient.getQueryData([
          `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
          userId,
          {},
        ]);
        const itemToDelete = currentData?.data?.find(
          (item) => item.id === itemId
        );

        // Remove from list
        queryClient.setQueryData(
          [
            `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
            userId,
            {},
          ],
          (old) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.filter((item) => item.id !== itemId),
            };
          }
        );

        // Update profile totals
        if (itemToDelete) {
          queryClient.setQueryData(["userProfile", userId], (old) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: {
                ...old.data,
                [`total${
                  entityName.charAt(0).toUpperCase() + entityName.slice(1)
                }s`]: Math.max(
                  0,
                  (old.data[
                    `total${
                      entityName.charAt(0).toUpperCase() + entityName.slice(1)
                    }s`
                  ] || 0) - 1
                ),
              },
            };
          });
        }
      },
    },
  });
};

/**
 * Bulk operations mutation pattern
 * @param {Function} bulkFn - Bulk operation function
 * @param {string} operation - Operation type ('delete', 'update')
 * @param {string} entityName - Name of entity
 * @param {string} userId - User ID for cache keys
 * @returns {Object} Mutation result
 */
export const useBulkMutation = (bulkFn, operation, entityName, userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkFn,
    onMutate: async (variables) => {
      const queryKey = [
        `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
        userId,
        {},
      ];
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      if (operation === "delete" && variables.itemIds) {
        // Optimistically remove items
        queryClient.setQueryData(queryKey, (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter(
              (item) => !variables.itemIds.includes(item.id)
            ),
          };
        });
      } else if (operation === "update" && variables.updates) {
        // Optimistically apply updates
        queryClient.setQueryData(queryKey, (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((item) => {
              const update = variables.updates.find(
                (u) => u.itemId === item.id
              );
              return update
                ? { ...item, ...update.data, updatedAt: new Date() }
                : item;
            }),
          };
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [
            `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
            userId,
            {},
          ],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [
          `user${entityName.charAt(0).toUpperCase() + entityName.slice(1)}s`,
          userId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

/**
 * Profile update mutation with specific patterns
 * @param {Function} updateProfileFn - Profile update function
 * @param {string} userId - User ID
 * @returns {Object} Mutation result
 */
export const useProfileUpdateMutation = (updateProfileFn, userId) => {
  return useGenericMutation((updates) => updateProfileFn(userId, updates), {
    invalidateQueries: [["userProfile", userId]],
    optimisticUpdate: {
      update: (queryClient, updates) => {
        queryClient.setQueryData(["userProfile", userId], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: { ...old.data, ...updates, updatedAt: new Date() },
          };
        });
      },
    },
  });
};

/**
 * Hook factory for creating entity-specific mutations
 * @param {string} entityName - Name of entity
 * @param {Object} serviceFunctions - Object with add, update, delete functions
 * @returns {Function} Hook factory function
 */
export const createEntityMutations = (entityName, serviceFunctions) => {
  return (userId) => {
    const add = useAddMutation(serviceFunctions.add, entityName, userId);
    const update = useUpdateMutation(
      serviceFunctions.update,
      entityName,
      userId
    );
    const remove = useDeleteMutation(
      serviceFunctions.delete,
      entityName,
      userId
    );

    return { add, update, remove };
  };
};

export default useGenericMutation;
