# PROJECT CATALOG - Pokemon Binder App

## 🔧 AUTHENTICATION & USER MANAGEMENT

### **AuthContext (`src/contexts/AuthContext.jsx`)**

**Purpose**: Central authentication state management and user session handling

**Key Functions**:

- `useAuth()` - Main hook to access auth context
- `currentUser` - Firebase Auth user object
- `userProfile` - Firestore user profile data
- `isOwner()` - Check if user has owner role
- `isUser()` - Check if user has user role
- `hasRole(role)` - Check specific role
- `canPerformAction(action)` - Permission checking
- `getUserRole()` - Get current user's role
- `signup()` - User registration
- `signin()` - User login
- `logout()` - User logout
- `isEmailVerified()` - Check email verification status
- `sendVerificationEmail()` - Send verification email
- `deleteAccount()` - Delete user account

**Role System**:

- `owner` - Full admin access (determined by VITE_OWNER_EMAIL env var)
- `user` - Standard user access

**Connected To**: All protected routes, user data hooks, admin functionality

---

### **useUserData Hook (`src/hooks/useUserData.js`)**

**Purpose**: TanStack Query hooks for user profile and data management

**Key Hooks**:

- `useUserProfile(userId)` - Get user profile data
- `useUpdateUserProfile()` - Update user profile
- `useUserPreferences(userId)` - Get user preferences
- `useUpdateUserPreferences()` - Update user preferences
- `useUserBinders(userId)` - Get user's binders
- `useAddBinder()` - Add new binder
- `useUpdateBinder()` - Update binder
- `useDeleteBinder()` - Delete binder
- `useUserActivity(userId)` - Get user activity log

**Cache Management**: Automatic cache invalidation and refetching on mutations

---

### **useUserLimits Hook (`src/hooks/useUserLimits.js`)**

**Purpose**: Manage user limits, validation, and upgrade messaging

**Key Functions**:

- `canCreateBinder(currentCount)` - Check if user can create more binders
- `canAddCard(currentCount)` - Check if user can add more cards
- `canUseFeature(featureName)` - Check feature availability
- `getRemainingCapacity(type, currentCount)` - Get remaining slots
- `getUsagePercentage(type, currentCount)` - Get usage percentage
- `isApproachingLimit(type, currentCount)` - Check if near limits
- `getWarningMessage(type, currentCount)` - Get limit warning messages
- `getFeatureLockMessage(featureName)` - Get feature restriction messages

**User Types**:

- Guest users: Limited functionality
- Registered users: Full functionality

---

## 🗄️ DATA LAYER & SERVICES

### **Firestore Service (`src/services/firestore.js`)**

**Purpose**: Central Firebase Firestore operations and data management

**User Operations**:

- `createUserProfile(userId, userData)` - Create new user profile
- `getUserProfile(userId)` - Get user profile
- `updateUserProfile(userId, updates)` - Update user profile
- `updateUserPreferences(userId, preferences)` - Update user preferences
- `getUserPreferences(userId)` - Get user preferences

**Binder Operations**:

- `addBinder(userId, binderData)` - Add new binder
- `getUserBinders(userId, options)` - Get user's binders
- `updateBinder(userId, binderId, updates)` - Update binder
- `deleteBinder(userId, binderId)` - Delete binder

**Collection Operations**:

- `createCollection(userId, collectionData)` - Create collection
- `getUserCollections(userId)` - Get user collections
- `addToWishlist(userId, binderData)` - Add to wishlist
- `getUserWishlist(userId)` - Get wishlist
- `getUserActivity(userId, limitCount)` - Get activity log

**Admin Operations**:

- `getAdminStats()` - Get system statistics
- `getAllUsers(limitCount)` - Get all users (admin)
- `deleteUserAccount(userId)` - Delete user account
- `migrateUserRoles()` - Admin role migration

---

### **useAdminData Hook (`src/hooks/useAdminData.js`)**

**Purpose**: Admin-specific data management with real-time updates

**Key Hooks**:

- `useAdminStats()` - Get system statistics with caching
- `useAdminUsers(limitCount)` - Get users list with real-time updates
- `useDeleteUser()` - Delete user with cache updates
- `useBulkUserOperations()` - Bulk user operations
- `useSystemHealth()` - System health monitoring

**Real-time Features**: Firestore listeners for live admin data updates

---

## 🎨 UI COMPONENTS

### **UI Building Blocks (`src/components/ui/`)**

**Purpose**: Reusable UI components with Tailwind + Radix UI

**Core Components**:

- `Button.jsx` - Button component with variants
- `Input.jsx` - Form input component
- `Dialog.jsx` - Modal dialog component
- `Card.jsx` - Card container component
- `Alert.jsx` - Alert/notification component
- `Badge.jsx` - Badge component
- `Tooltip.jsx` - Tooltip component
- `Switch.jsx` - Toggle switch component
- `Select.jsx` - Dropdown select component
- `Tabs.jsx` - Tab navigation component
- `ThemeToggle.jsx` - Dark/light theme toggle
- `RoleGuard.jsx` - Role-based component protection

---

### **Authentication Components (`src/components/auth/`)**

- `Auth.jsx` - Main auth page wrapper
- `LoginForm.jsx` - Login form with validation
- `SignupForm.jsx` - Registration form
- `AuthAction.jsx` - Handle email verification, password reset
- `GoogleSignInButton.jsx` - Google OAuth button
- `AuthDivider.jsx` - UI separator for auth forms

---

### **Binder Components (`src/components/binder/`)**

- `BinderSpread.jsx` - Two-page binder spread view
- `BinderGrid.jsx` - Grid layout for cards
- `BinderCardSlot.jsx` - Individual card slot component
- `BinderNavigation.jsx` - Page navigation controls

---

### **Navigation (`src/components/navigation/`)**

- `Sidebar.jsx` - App sidebar navigation

---

## 🔄 STATE MANAGEMENT HOOKS

### **useBinderState Hook (`src/hooks/useBinderState.js`)**

**Purpose**: Complete binder state management for card organization

**Key Features**:

- Page spread navigation (left/right page pairs)
- Card placement and movement
- Slot management and validation
- Grid size support (3x3, 4x4, etc.)

**Key Functions**:

- `goToPageSpread(pageSpread)` - Navigate to specific page spread
- `nextPageSpread()` / `previousPageSpread()` - Navigate pages
- `addCard(slotNumber, cardData)` - Add card to slot
- `removeCard(slotNumber)` - Remove card from slot
- `moveCard(fromSlot, toSlot)` - Move card between slots
- `swapCards(slot1, slot2)` - Swap two cards
- `getCurrentSpreadCards()` - Get cards on current spread
- `isSlotEmpty(slotNumber)` - Check if slot is empty

---

### **useBinderPreferences Hook (`src/hooks/useBinderPreferences.js`)**

**Purpose**: Manage user preferences for binder display and behavior

**Key Functions**:

- Grid size preferences (3x3, 4x4, 5x5)
- Sorting preferences
- Auto-save settings
- Animation preferences
- Display preferences

---

### **usePageLimits Hook (`src/hooks/usePageLimits.js`)**

**Purpose**: Calculate page and slot limits based on grid configuration

---

### **useGridDimensions Hook (`src/hooks/useGridDimensions.js`)**

**Purpose**: Calculate responsive grid dimensions for different screen sizes

---

### **useWindowSize Hook (`src/hooks/useWindowSize.js`)**

**Purpose**: Track window size changes for responsive behavior

---

## 🔄 PERFORMANCE & OPTIMIZATION

### **useOptimizedBinders Hook (`src/hooks/useOptimizedBinders.js`)**

**Purpose**: Optimized data fetching and caching for binders

---

### **useInfiniteData Hook (`src/hooks/useInfiniteData.js`)**

**Purpose**: Infinite scrolling and pagination for large datasets

---

### **usePrefetching Hook (`src/hooks/usePrefetching.js`)**

**Purpose**: Intelligent data prefetching for improved UX

---

### **usePerformanceMonitoring Hook (`src/hooks/usePerformanceMonitoring.js`)**

**Purpose**: Monitor app performance and user interactions

---

### **useMutationPatterns Hook (`src/hooks/useMutationPatterns.js`)**

**Purpose**: Standardized mutation patterns with optimistic updates

---

### **useAsyncOperation Hook (`src/hooks/useAsyncOperation.js`)**

**Purpose**: Generic async operation management with loading states

---

### **useRealtimeData Hook (`src/hooks/useRealtimeData.js`)**

**Purpose**: Real-time data synchronization with Firestore

---

## 🚨 RESTRICTIONS & VALIDATION

### **useEmailVerificationRestrictions Hook (`src/hooks/useEmailVerificationRestrictions.js`)**

**Purpose**: Enforce email verification requirements for certain actions

**Key Functions**:

- Check verification status
- Block actions for unverified users
- Show verification prompts
- Handle verification workflows

---

## 🎭 THEME & ANIMATION

### **ThemeContext (`src/contexts/ThemeContext.jsx`)**

**Purpose**: Dark/light theme management

---

### **AnimationContext (`src/contexts/AnimationContext.jsx`)**

**Purpose**: Animation preferences and performance settings

---

## 🗂️ ROUTING & PAGES

### **Router Configuration (`src/router/index.jsx`)**

**Route Types**:

- **Public Routes**: Redirect to dashboard if authenticated
- **Protected Routes**: Require authentication
- **App Routes**: Allow both authenticated and anonymous users
- **Smart Routes**: Different behavior based on auth status

**Page Loading Strategy**:

- **Eager Load**: Core pages (Collections, Binder, Dashboard)
- **Lazy Load**: Less frequent pages (Profile, Wishlist)

**Key Routes**:

- `/app/dashboard` - User dashboard
- `/app/collections` - Binder collection management
- `/app/binder/new` - Create new binder
- `/app/binder/:binderId` - View/edit specific binder
- `/app/profile` - User profile management
- `/auth` - Authentication pages

---

### **Route Protection Components**:

- `ProtectedRoute` - Requires authentication
- `PublicRoute` - Redirects if authenticated
- `AppRoute` - Allows both auth states
- `SmartRoute` - Conditional routing based on auth

---

## 📄 MAIN PAGES

### **Core Pages (`src/pages/`)**

- `Landing.jsx` - Marketing/landing page
- `BinderDashboard.jsx` - Binder management dashboard
- `BinderCreationWizard.jsx` - Step-by-step binder creation
- `Binder.jsx` - Individual binder viewer/editor
- `Collections.jsx` - Collection management
- `Profile.jsx` - User profile settings
- `Statistics.jsx` - User statistics and analytics
- `Wishlist.jsx` - User wishlist management

---

## 🛠️ UTILITIES

### **Validation (`src/utils/`)**

- `formValidation.js` - Form validation rules and helpers
- `passwordValidation.js` - Password strength validation
- `errorMessages.js` - User-friendly error message mapping

### **Grid Utilities (`src/utils/gridUtils.js`)**

- `parseGridSize(gridSize)` - Parse grid dimensions from string
- Grid calculation helpers
- Slot number calculations

### **Firebase Utilities**

- `firebaseSendEmailVerification.js` - Email verification helper

---

## 🔧 CONFIGURATION

### **Firebase Config (`src/config/firebase.js`)**

- Firebase app initialization
- Firestore database connection
- Authentication configuration

### **User Limits Config (`src/config/userLimits.js`)**

- Define limits for different user types
- Feature availability mapping
- Upgrade incentive messages

---

## 🏗️ KEY RELATIONSHIPS

### **Authentication Flow**:

1. `AuthContext` manages user state
2. `useAuth()` provides auth data to components
3. `RoleGuard` protects admin features
4. `isOwner()` controls admin access

### **Binder Management Flow**:

1. `useUserBinders()` fetches user's binders
2. `useBinderState()` manages individual binder state
3. `useBinderPreferences()` applies user preferences
4. `BinderSpread` renders the visual binder

### **Data Flow**:

1. `firestore.js` service handles all database operations
2. `useUserData` hooks provide React Query integration
3. Components use hooks for data fetching/mutations
4. Cache automatically updates across components

### **Limits & Restrictions**:

1. `useUserLimits()` checks user capabilities
2. `useEmailVerificationRestrictions()` enforces verification
3. Components conditionally render based on limits
4. Upgrade prompts guide users to registration

### **Admin Features**:

1. `isOwner()` from AuthContext enables admin access
2. `useAdminData()` provides admin-specific data
3. Real-time updates for admin dashboard
4. Bulk operations with optimistic updates

---

## 📋 ENVIRONMENT VARIABLES

**Required**:

- `VITE_OWNER_EMAIL` - Email address that gets owner role
- Firebase configuration variables

**Optional**:

- Feature flags
- Performance monitoring settings

---

## 🎯 MAIN WORKFLOWS

### **User Registration**:

`Auth.jsx` → `SignupForm.jsx` → `AuthContext.signup()` → `firestore.createUserProfile()`

### **Binder Creation**:

`BinderCreationWizard.jsx` → `useAddBinder()` → `firestore.addBinder()` → Cache updates

### **Card Management**:

`BinderSpread.jsx` → `useBinderState()` → Local state + auto-save → Firestore

### **Admin Operations**:

`AdminDashboard` → `useAdminData()` → `firestore.getAdminStats()` → Real-time updates
