# Cache Invalidation Implementation

## Overview

This document outlines the comprehensive cache invalidation system implemented to ensure users always see up-to-date data after performing mutations (create, update, delete operations) while maintaining optimal performance through intelligent caching.

## Problem Solved

**Before**: Users could create a binder, navigate away, return 20 minutes later, and not see their new binder due to stale cached data with long `staleTime` values.

**After**: All mutations now properly invalidate related cached queries, ensuring users see their changes immediately when they navigate between pages, while still benefiting from caching for unchanged data.

## Key Files Created/Modified

### 1. `src/hooks/useCacheInvalidation.js` ✨ NEW

- **Purpose**: Centralized cache invalidation patterns for all mutations
- **Benefits**:
  - Consistent cache management across the application
  - Prevents duplication of invalidation logic
  - Provides optimistic update helpers
  - Easy to maintain and extend

### 2. `src/hooks/useAdminData.js` ⚡ SIMPLIFIED

- **Changes**: Removed aggressive caching for admin features since only the owner uses them
- **New Settings**:
  - `staleTime: 30 seconds` (was 15 minutes)
  - No auto-refresh interval (was 1 hour)
  - Faster, fresher data for administrative tasks

### 3. `src/hooks/useUserData.js` 🔄 ENHANCED

- **Changes**: All binder mutations now use centralized cache invalidation
- **Features**:
  - Optimistic updates for instant UI feedback
  - Comprehensive cache invalidation
  - Error handling with cache rollback
  - Admin data invalidation when needed

### 4. `src/hooks/useBinderState.js` 🎯 UPDATED

- **Changes**: Card operations now use centralized invalidation
- **Faster**: `staleTime` reduced to 30 seconds for card data
- **Comprehensive**: Invalidates all related queries when cards change

### 5. `src/hooks/useBinderPreferences.js` ⚙️ STREAMLINED

- **Changes**: Replaced manual cache operations with centralized system
- **Features**: Optimistic updates + comprehensive invalidation

### 6. `src/hooks/useCollectionsAndWishlist.js` ✨ NEW

- **Purpose**: Dedicated hooks for collections and wishlist operations
- **Features**: Full CRUD operations with optimistic updates

## Cache Invalidation Patterns

### Individual Invalidations

```javascript
const {
  invalidateUserProfile,
  invalidateUserBinders,
  invalidateBinderCards,
  invalidateUserCollections,
  invalidateUserWishlist,
  invalidateAdminStats,
} = useCacheInvalidation();
```

### Comprehensive Invalidations

```javascript
// When a binder is modified
invalidateAllBinderData(userId, binderId);

// When cards change
invalidateCardData(userId, binderId);

// When user profile changes
invalidateAllUserData(userId);

// When admin needs updates
invalidateAdminData();
```

### Optimistic Updates

```javascript
// Instantly show new item in UI
optimisticallyAddToList(queryKey, newItem);

// Instantly update item in UI
optimisticallyUpdateInList(queryKey, itemId, updates);

// Instantly remove item from UI
optimisticallyRemoveFromList(queryKey, itemId);
```

## Optimized Stale Times

| Data Type          | Stale Time | Reasoning                 |
| ------------------ | ---------- | ------------------------- |
| User Profile       | 5 minutes  | Changes infrequently      |
| User Preferences   | 10 minutes | Changes very infrequently |
| User Binders       | 2 minutes  | Changes frequently        |
| Binder Cards       | 30 seconds | Changes very frequently   |
| Binder Preferences | 2 minutes  | Changes frequently        |
| Collections        | 3 minutes  | Changes moderately        |
| Wishlist           | 3 minutes  | Changes moderately        |
| User Activity      | 1 minute   | Should be fairly fresh    |
| Admin Stats        | 30 seconds | Owner wants fresh data    |

## Benefits for Users

### ✅ Immediate Updates

- Create a binder → See it instantly in binder list
- Update binder preferences → Changes reflected immediately
- Add/remove cards → Binder updates in real-time
- Add to wishlist → Appears instantly

### ⚡ Fast Performance

- Cached data loads instantly
- Only fetches fresh data when needed
- Optimistic updates provide instant feedback
- Background refetches keep data current

### 🎯 Consistent Experience

- No more "missing" data after navigation
- Reliable state management
- Predictable behavior across all features

## Implementation Examples

### Adding a Binder

```javascript
// 1. User clicks "Create Binder"
// 2. Optimistic update: Binder appears instantly in list
// 3. Firebase request sent in background
// 4. On success: Replace temp binder with real binder ID
// 5. Invalidate all related queries for consistency
// 6. On error: Remove optimistic update, show error
```

### Updating Binder Preferences

```javascript
// 1. User changes page count from 10 to 15
// 2. Optimistic update: UI reflects change instantly
// 3. Firebase update sent in background
// 4. On success: Invalidate binder-related queries
// 5. On error: Revert optimistic update, show error
```

### Navigation Scenario (The Original Problem)

```javascript
// 1. User creates binder (optimistic update shows it)
// 2. User navigates to different page
// 3. User returns to binder list 20 minutes later
// 4. TanStack Query checks: "Is my binder list data stale?"
// 5. Answer: "Yes, it's older than 2 minutes"
// 6. Background fetch gets fresh data from Firebase
// 7. User sees updated list including their new binder
```

## Cost Optimization

### Reduced Firebase Reads

- **Smart Caching**: Only refetch when data is actually stale
- **Optimistic Updates**: Reduce need for immediate refetches
- **Targeted Invalidation**: Only invalidate relevant queries

### Improved User Experience

- **Instant Feedback**: Users don't wait for round-trips
- **Reliable State**: Data consistency across the app
- **Predictable Behavior**: Users can trust what they see

## Best Practices for Future Development

### 1. Always Use Centralized Invalidation

```javascript
// ❌ Don't do this
queryClient.invalidateQueries({ queryKey: ["userBinders", userId] });

// ✅ Do this instead
const { invalidateUserBinders } = useCacheInvalidation();
invalidateUserBinders(userId);
```

### 2. Include Optimistic Updates for Better UX

```javascript
const { optimisticallyAddToList } = useCacheInvalidation();

const addItemMutation = useMutation({
  onMutate: ({ newItem }) => {
    optimisticallyAddToList(queryKey, newItem);
  },
  onSuccess: () => {
    // Invalidate for consistency
    invalidateRelatedData();
  },
  onError: () => {
    // Rollback optimistic update
  },
});
```

### 3. Choose Appropriate Stale Times

- **Frequently changing data**: 30 seconds - 2 minutes
- **Moderately changing data**: 3-5 minutes
- **Rarely changing data**: 10+ minutes

### 4. Always Handle Errors

```javascript
onError: (error, variables, context) => {
  // Rollback optimistic updates
  if (context?.tempId) {
    removeOptimisticUpdate(context.tempId);
  }

  // Invalidate to ensure consistency
  invalidateRelatedData();
};
```

## Summary

This implementation ensures that:

1. **Users see their changes immediately** after any create/update/delete operation
2. **Performance remains optimal** through intelligent caching
3. **Firebase costs are minimized** by avoiding unnecessary fetches
4. **Code is maintainable** through centralized patterns
5. **Experience is consistent** across all features

The cache invalidation system resolves the original concern about users not seeing their changes after navigation while maintaining all the performance benefits of TanStack Query's caching system.
