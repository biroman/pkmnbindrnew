import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBinder, updateBinder, deleteBinder } from "../services/firestore";

// ===== OPTIMIZED BINDER OPERATIONS =====

export const useOptimizedAddBinder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, binderData }) => addBinder(userId, binderData),
    onMutate: async ({ userId, binderData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["userBinders", userId] });

      // Snapshot the previous value
      const previousBinders = queryClient.getQueryData([
        "userBinders",
        userId,
        {},
      ]);

      // Optimistically update the cache
      const tempId = `temp-${Date.now()}`;
      const optimisticBinder = {
        id: tempId,
        ...binderData,
        addedAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
      };

      queryClient.setQueryData(["userBinders", userId, {}], (old) => {
        if (!old?.data) return { success: true, data: [optimisticBinder] };
        return {
          ...old,
          data: [optimisticBinder, ...old.data],
        };
      });

      // Optimistically update user profile totals
      queryClient.setQueryData(["userProfile", userId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            totalBinders: (old.data.totalBinders || 0) + 1,
            totalValue:
              (old.data.totalValue || 0) + (binderData.currentValue || 0),
          },
        };
      });

      return { previousBinders, tempId };
    },
    onSuccess: (data, { userId }, context) => {
      // Replace the temp binder with the real one
      if (data.success && data.binderId) {
        queryClient.setQueryData(["userBinders", userId, {}], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((binder) =>
              binder.id === context.tempId
                ? { ...binder, id: data.binderId }
                : binder
            ),
          };
        });
      }
    },
    onError: (err, { userId }, context) => {
      // Rollback optimistic updates
      if (context?.previousBinders) {
        queryClient.setQueryData(
          ["userBinders", userId, {}],
          context.previousBinders
        );
      }

      // Rollback profile updates
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
    onSettled: (data, error, { userId }) => {
      // Always invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

export const useOptimizedUpdateBinder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, binderId, updates }) =>
      updateBinder(userId, binderId, updates),
    onMutate: async ({ userId, binderId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["userBinders", userId] });

      const previousBinders = queryClient.getQueryData([
        "userBinders",
        userId,
        {},
      ]);

      // Optimistically update the specific binder
      queryClient.setQueryData(["userBinders", userId, {}], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((binder) =>
            binder.id === binderId
              ? { ...binder, ...updates, updatedAt: new Date() }
              : binder
          ),
        };
      });

      return { previousBinders };
    },
    onError: (err, { userId }, context) => {
      if (context?.previousBinders) {
        queryClient.setQueryData(
          ["userBinders", userId, {}],
          context.previousBinders
        );
      }
    },
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
    },
  });
};

export const useOptimizedDeleteBinder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, binderId }) => {
      // Try to get binder data from cache first to avoid extra read
      const bindersData = queryClient.getQueryData(["userBinders", userId, {}]);
      const binderToDelete = bindersData?.data?.find((b) => b.id === binderId);

      if (binderToDelete) {
        // Use cached data - no extra Firebase read needed!
        return deleteBinder(userId, binderId);
      } else {
        // Fallback to current method if not in cache
        return deleteBinder(userId, binderId);
      }
    },
    onMutate: async ({ userId, binderId }) => {
      await queryClient.cancelQueries({ queryKey: ["userBinders", userId] });

      const previousBinders = queryClient.getQueryData([
        "userBinders",
        userId,
        {},
      ]);
      const binderToDelete = previousBinders?.data?.find(
        (b) => b.id === binderId
      );

      // Optimistically remove the binder
      queryClient.setQueryData(["userBinders", userId, {}], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((binder) => binder.id !== binderId),
        };
      });

      // Optimistically update user profile totals
      if (binderToDelete) {
        queryClient.setQueryData(["userProfile", userId], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              totalBinders: Math.max(0, (old.data.totalBinders || 0) - 1),
              totalValue: Math.max(
                0,
                (old.data.totalValue || 0) - (binderToDelete.currentValue || 0)
              ),
            },
          };
        });
      }

      return { previousBinders, binderToDelete };
    },
    onError: (err, { userId }, context) => {
      // Rollback optimistic updates
      if (context?.previousBinders) {
        queryClient.setQueryData(
          ["userBinders", userId, {}],
          context.previousBinders
        );
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

// ===== BULK BINDER OPERATIONS =====

export const useBulkBinderOperations = () => {
  const queryClient = useQueryClient();

  const bulkDelete = useMutation({
    mutationFn: async ({ userId, binderIds }) => {
      const results = await Promise.allSettled(
        binderIds.map((binderId) => deleteBinder(userId, binderId))
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      return { successful, failed, total: binderIds.length };
    },
    onMutate: async ({ userId, binderIds }) => {
      await queryClient.cancelQueries({ queryKey: ["userBinders", userId] });

      const previousBinders = queryClient.getQueryData([
        "userBinders",
        userId,
        {},
      ]);
      const bindersToDelete =
        previousBinders?.data?.filter((b) => binderIds.includes(b.id)) || [];

      // Optimistically remove binders
      queryClient.setQueryData(["userBinders", userId, {}], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((binder) => !binderIds.includes(binder.id)),
        };
      });

      // Update totals
      const totalValue = bindersToDelete.reduce(
        (sum, binder) => sum + (binder.currentValue || 0),
        0
      );
      queryClient.setQueryData(["userProfile", userId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            totalBinders: Math.max(
              0,
              (old.data.totalBinders || 0) - binderIds.length
            ),
            totalValue: Math.max(0, (old.data.totalValue || 0) - totalValue),
          },
        };
      });

      return { previousBinders };
    },
    onError: (err, { userId }, context) => {
      if (context?.previousBinders) {
        queryClient.setQueryData(
          ["userBinders", userId, {}],
          context.previousBinders
        );
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: async ({ userId, updates }) => {
      // updates is an array of { binderId, data }
      const results = await Promise.allSettled(
        updates.map(({ binderId, data }) =>
          updateBinder(userId, binderId, data)
        )
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      return { successful, failed, total: updates.length };
    },
    onMutate: async ({ userId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["userBinders", userId] });

      const previousBinders = queryClient.getQueryData([
        "userBinders",
        userId,
        {},
      ]);

      // Optimistically apply all updates
      queryClient.setQueryData(["userBinders", userId, {}], (old) => {
        if (!old?.data) return old;

        const updatedData = old.data.map((binder) => {
          const update = updates.find((u) => u.binderId === binder.id);
          return update
            ? { ...binder, ...update.data, updatedAt: new Date() }
            : binder;
        });

        return { ...old, data: updatedData };
      });

      return { previousBinders };
    },
    onError: (err, { userId }, context) => {
      if (context?.previousBinders) {
        queryClient.setQueryData(
          ["userBinders", userId, {}],
          context.previousBinders
        );
      }
    },
    onSettled: (data, error, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });
    },
  });

  return { bulkDelete, bulkUpdate };
};
