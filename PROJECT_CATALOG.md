# PROJECT CATALOG - Pokemon Binder App

## 📋 PROJECT OVERVIEW

The Pokemon Binder App is a comprehensive card collection management system built with React, Firebase, and modern web technologies. It allows users to organize, track, and manage their Pokemon card collections with features ranging from simple guest browsing to advanced administrative controls.

### **Key Features**

- 🃏 Digital binder creation and management
- 🔐 Authentication system with role-based access
- 📊 Real-time analytics and statistics
- 🎨 Customizable grid layouts and themes
- 📱 Responsive design for all devices
- 🔒 Server-side validation and security
- 🚀 Performance optimization and caching
- 👑 Advanced admin dashboard and system configuration

---

## 🔧 AUTHENTICATION & USER MANAGEMENT

### **AuthContext (`src/contexts/AuthContext.jsx`)**

**Purpose**: Central authentication state management and user session handling

**Core State Management**:

- `currentUser` - Firebase Auth user object (main user reference)
- `userProfile` - Firestore user profile data with extended information
- `loading` - Authentication loading state

**Authentication Methods**:

- `signup(email, password, displayName)` - User registration with profile creation
- `signin(email, password)` - Email/password authentication
- `signinWithGoogle()` - Google OAuth integration
- `logout()` - Sign out and cleanup
- `resetPassword(email)` - Password reset email

**Profile Management**:

- `updateUserProfileAuth(updates)` - Update Firebase Auth profile
- `updateUserFirestoreProfile(updates)` - Update Firestore profile data
- `changePassword(currentPassword, newPassword)` - Password change with re-auth
- `deleteAccount(currentPassword)` - Account deletion with data cleanup

**Email Verification**:

- `sendVerificationEmail(user)` - Send verification email
- `isEmailVerified()` - Check verification status
- `refreshUser()` - Refresh user state from Firebase

**Role & Permission System**:

- `isOwner()` - Check if user has owner privileges (based on VITE_OWNER_EMAIL)
- `isUser()` - Check standard user role
- `hasRole(role)` - Generic role checking
- `canPerformAction(action)` - Permission-based action validation
- `getUserRole()` - Get current user's role string

**Connected To**: All protected routes, admin features, user data hooks

---

### **useUserData Hook (`src/hooks/useUserData.js`)**

**Purpose**: TanStack Query hooks for user profile and data management

**Profile Hooks**:

- `useUserProfile(userId)` - Get user profile with caching
- `useUpdateUserProfile()` - Update profile with optimistic updates

**Preferences Hooks**:

- `useUserPreferences(userId)` - Get user preferences and settings
- `useUpdateUserPreferences()` - Update preferences with cache sync

**Binder Management Hooks**:

- `useUserBinders(userId)` - Get user's binders with pagination
- `useAddBinder()` - Create new binder with cache invalidation
- `useUpdateBinder()` - Update binder with optimistic updates
- `useDeleteBinder()` - Delete binder with cleanup and cache updates

**Activity Tracking**:

- `useUserActivity(userId)` - Get user activity log with real-time updates

**Cache Strategy**: Automatic cache invalidation, optimistic updates, and intelligent refetching

---

### **useUserLimits Hook (`src/hooks/useUserLimits.js`)**

**Purpose**: Comprehensive user limits, validation, and upgrade messaging system

**System Integration**:

- `useSystemLimits()` - Real-time Firebase system limits with `onSnapshot`
- Integrates with `systemConfiguration/limits` Firestore collection
- Falls back to local config when Firebase unavailable

**User Type Detection**:

- `isGuest` - Anonymous/guest user detection
- `isRegistered` - Authenticated user detection
- `userType` - "guest" or "registered" classification

**Limit Checking Functions**:

- `canCreateBinder(currentCount)` - Validate binder creation
- `canAddCard(currentCount)` - Validate card addition
- `canUseFeature(featureName)` - Feature availability checking
- `getRemainingCapacity(type, currentCount)` - Calculate remaining slots
- `getUsagePercentage(type, currentCount)` - Usage percentage calculation
- `isApproachingLimit(type, currentCount)` - Approaching limit detection

**Messaging & UX**:

- `getWarningMessage(type, currentCount)` - Context-aware limit warnings
- `getFeatureLockMessage(featureName)` - Feature restriction explanations
- `getUpgradeIncentives(context)` - Contextual upgrade prompts
- `getStorageEstimate()` - Local storage usage estimation for guests

**Validation Helpers**:

- `validateAction(action, currentCounts)` - Comprehensive action validation
- `checkAllLimits(binderCount, cardCounts)` - Multi-limit checking

**Specialized Hooks**:

- `useBinderLimits(count)` - Binder-specific limit checking
- `useCardLimits(count)` - Card-specific limit checking

---

## 🗄️ DATA LAYER & SERVICES

### **Firestore Service (`src/services/firestore.js`)**

**Purpose**: Comprehensive Firebase Firestore operations with security and validation

**User Operations**:

- `createUserProfile(userId, userData)` - Create user profile with role assignment
- `getUserProfile(userId)` - Retrieve user profile data
- `updateUserProfile(userId, updates)` - Update profile with timestamp tracking
- `updateUserPreferences(userId, preferences)` - Nested preference updates
- `getUserPreferences(userId)` - Retrieve preferences with defaults

**Binder Operations with Server-Side Validation**:

- `addBinder(userId, binderData)` - **NEW**: Server-side limit validation to prevent API bypassing
- `getBindersForUser(userId)` - Get user binders with ordering
- `getBinder(userId, binderId)` - Get specific binder data
- `updateBinder(userId, binderId, updates)` - Update binder with timestamp
- `deleteBinder(userId, binderId)` - Transaction-based deletion with card cleanup

**Card Subcollection Operations**:

- `addCardToBinder(userId, binderId, cardData)` - Add card with binder count update
- `updateCardInBinder(userId, binderId, cardEntryId, updates)` - Update card data
- `removeCardFromBinder(userId, binderId, cardEntryId)` - Remove with count decrement
- `getCardsForPages(userId, binderId, pageNumbers)` - Efficient page-based queries
- `getAllCardsInBinder(userId, binderId)` - Complete card retrieval

**Collection & Wishlist Operations**:

- `createCollection(userId, collectionData)` - Create collection with activity logging
- `getUserCollections(userId)` - Get collections with metadata
- `addToWishlist(userId, binderData)` - Wishlist management
- `getUserWishlist(userId)` - Retrieve wishlist items
- `getUserActivity(userId, limitCount)` - Activity log retrieval

**Admin Operations (Owner Only)**:

- `getAdminStats()` - System statistics with health monitoring
- `getAllUsers(limitCount)` - User management for admins
- `deleteUserAccount(userId)` - Complete account deletion with cleanup
- `migrateUserRoles()` - Role migration utilities

**Security Features**:

- Server-side limit validation prevents API bypassing
- Role-based access control for admin operations
- Transaction-based operations for data consistency
- Comprehensive error handling with user-friendly messages

---

### **useAdminData Hook (`src/hooks/useAdminData.js`)**

**Purpose**: Admin-specific data management with real-time capabilities

**Core Admin Hooks**:

- `useAdminStats()` - System statistics with intelligent caching
- `useAdminUsers(limitCount)` - User management with real-time updates
- `useDeleteUser()` - User deletion with cache synchronization
- `useBulkUserOperations()` - Batch user operations
- `useSystemHealth()` - Health monitoring and alerting

**Real-time Features**:

- Firestore `onSnapshot` listeners for live data
- Automatic cache updates for admin operations
- Performance monitoring integration

---

## 🎨 UI COMPONENTS & DESIGN SYSTEM

### **Core UI Building Blocks (`src/components/ui/`)**

**Purpose**: Reusable, accessible UI components built on Radix UI + Tailwind CSS

**Form Components**:

- `Button.jsx` - Multi-variant button system (primary, secondary, outline, ghost, danger)
- `Input.jsx` - Enhanced input with validation states and icons
- `Select.jsx` - Dropdown select with search and validation
- `Switch.jsx` - Toggle switches for settings
- `Slider.jsx` - Range sliders for numeric inputs

**Layout & Navigation**:

- `Card.jsx` - Flexible card containers with header/footer support
- `Tabs.jsx` - Tab navigation with keyboard support
- `Separator.jsx` - Visual dividers and spacers

**Feedback & Communication**:

- `Alert.jsx` - Status alerts with variants (info, warning, error, success)
- `AlertDialog.jsx` - Confirmation dialogs for destructive actions
- `Badge.jsx` - Status indicators with color variants (default, secondary, destructive, warning, outline)
- `Tooltip.jsx` - Contextual information tooltips

**Modal System**:

- `Dialog.jsx` - Base dialog primitive with animation support
- `Modal.jsx` - **UPDATED**: Enhanced modal wrapper with custom close button management
- `DropdownMenu.jsx` - Context menus and dropdown actions

**Theme & Accessibility**:

- `ThemeToggle.jsx` - Dark/light mode switcher with system preference detection
- `RoleGuard.jsx` - Component-level access control

**Enhanced Features**:

- All components support dark mode
- Keyboard navigation and ARIA compliance
- Responsive design patterns
- Animation and transition support

---

### **Modal System (`src/components/modals/`)**

**Purpose**: Specialized modal components for specific actions

**Current Modals**:

- `DeleteBinderModal.jsx` - **RECENTLY FIXED**: Confirmation dialog for binder deletion
  - Proper styling with danger button variant
  - Fixed padding and layout issues
  - Single close button (eliminated duplicate X issue)
  - Loading states and proper error handling

**Modal Infrastructure**:

- Built on Radix Dialog primitives
- Consistent styling and behavior
- Escape key and outside click handling
- Focus management and accessibility

---

### **Binder Components (`src/components/binder/`)**

**Purpose**: Card organization and display components

**Core Binder UI**:

- `BinderSpread.jsx` - Two-page spread view with realistic book layout
- `BinderGrid.jsx` - Flexible grid layouts (1x1, 2x2, 3x3, 3x4, 4x4)
- `BinderCardSlot.jsx` - Individual card slots with drag/drop support
- `BinderNavigation.jsx` - Page navigation with spread awareness

**Features**:

- Responsive grid systems
- Touch and mouse interaction support
- Card placement validation
- Visual feedback for user actions

---

### **Authentication Components (`src/components/auth/`)**

**Purpose**: Complete authentication user interface

**Auth Pages**:

- `Auth.jsx` - Main authentication page wrapper with mode switching
- `LoginForm.jsx` - Login form with validation and error handling
- `SignupForm.jsx` - Registration form with password strength validation
- `AuthAction.jsx` - Email verification and password reset handlers

**Social Authentication**:

- `GoogleSignInButton.jsx` - Google OAuth integration with proper branding
- `AuthDivider.jsx` - Visual separator for auth methods

**Features**:

- Real-time form validation
- Password strength indicators
- Social authentication integration
- Email verification workflows

---

## 🏗️ LAYOUT & NAVIGATION

### **Layout Components (`src/components/layout/`)**

#### **Header (`src/components/layout/Header.jsx`)**

**Purpose**: Main application navigation and user controls

**Navigation Features**:

- **UPDATED**: Smart "Create Binder" button with limit checking
  - Disabled state when at binder limit
  - Tooltip explanations for disabled state
  - Mobile and desktop support
- Responsive mobile menu with hamburger toggle
- Theme toggle integration
- User profile dropdown with role indicators

**User Status Indicators**:

- Guest mode badge with upgrade prompts
- Limit status indicators (approaching/reached)
- Authentication state management

**Mobile Optimization**:

- Collapsible navigation menu
- Touch-friendly interactive elements
- Responsive breakpoint handling

---

## 🔄 STATE MANAGEMENT & HOOKS

### **Binder State Management**

#### **useBinderState Hook (`src/hooks/useBinderState.js`)**

**Purpose**: Complete binder state management for card organization

**Page Management**:

- `goToPageSpread(pageSpread)` - Navigate to specific two-page spread
- `nextPageSpread()` / `previousPageSpread()` - Spread-aware navigation
- `getCurrentSpreadCards()` - Get cards for current two-page view

**Card Operations**:

- `addCard(slotNumber, cardData)` - Add card with validation
- `removeCard(slotNumber)` - Remove card from slot
- `moveCard(fromSlot, toSlot)` - Move card between slots
- `swapCards(slot1, slot2)` - Swap two cards
- `isSlotEmpty(slotNumber)` - Slot availability checking

**Grid Support**:

- Dynamic grid size handling (1x1 through 4x4)
- Slot number calculation and validation
- Page capacity management

---

#### **useBinderPreferences Hook (`src/hooks/useBinderPreferences.js`)**

**Purpose**: User preference management for binder display and behavior

**Preference Categories**:

- Grid size preferences with live preview
- Sorting and display options
- Auto-save configurations
- Animation and transition preferences

**Firebase Integration**:

- Real-time preference synchronization
- **FIXED**: Proper cache invalidation for binder list updates
- Optimistic updates for immediate UI response

---

### **Performance & Optimization Hooks**

#### **useOptimizedBinders Hook (`src/hooks/useOptimizedBinders.js`)**

**Purpose**: Advanced data fetching and caching optimization

**Caching Strategy**:

- Intelligent cache management with stale-while-revalidate
- Selective data fetching based on viewport
- Prefetching for anticipated user actions

**Performance Features**:

- Pagination and infinite scroll support
- Memory usage optimization
- Background synchronization

---

#### **useInfiniteData Hook (`src/hooks/useInfiniteData.js`)**

**Purpose**: Infinite scrolling and pagination for large datasets

**Features**:

- Virtual scrolling for large lists
- Incremental data loading
- Smooth scroll performance
- Memory management for large datasets

---

#### **usePrefetching Hook (`src/hooks/usePrefetching.js`)**

**Purpose**: Intelligent data prefetching for improved UX

**Prefetch Strategies**:

- Route-based prefetching
- User behavior prediction
- Cache warming for critical data
- Bandwidth-aware loading

---

#### **usePerformanceMonitoring Hook (`src/hooks/usePerformanceMonitoring.js`)**

**Purpose**: Application performance monitoring and optimization

**Monitoring Capabilities**:

- Render performance tracking
- User interaction metrics
- Memory usage monitoring
- Network performance analysis

---

#### **useMutationPatterns Hook (`src/hooks/useMutationPatterns.js`)**

**Purpose**: Standardized mutation patterns with optimistic updates

**Mutation Management**:

- Consistent error handling patterns
- Optimistic update strategies
- Rollback mechanisms for failed operations
- Loading state management

---

#### **useAsyncOperation Hook (`src/hooks/useAsyncOperation.js`)**

**Purpose**: Generic async operation management

**Features**:

- Loading state management
- Error boundary integration
- Retry mechanisms
- Operation cancellation

---

#### **useRealtimeData Hook (`src/hooks/useRealtimeData.js`)**

**Purpose**: Real-time data synchronization with Firestore

**Real-time Features**:

- `onSnapshot` listener management
- Automatic reconnection handling
- Offline state management
- Data consistency guarantees

---

### **Utility Hooks**

#### **usePageLimits Hook (`src/hooks/usePageLimits.js`)**

**Purpose**: Page limit calculation based on user type and system configuration

**Features**:

- Real-time Firebase system limit monitoring
- Guest vs registered user differentiation
- Dynamic limit updates from admin configuration

---

#### **useEmailVerificationRestrictions Hook (`src/hooks/useEmailVerificationRestrictions.js`)**

**Purpose**: Email verification requirement enforcement

**Verification Management**:

- Action blocking for unverified users
- Verification status checking
- Automated verification prompts
- Verification workflow handling

---

#### **Responsive & Layout Hooks**:

- `useWindowSize.js` - Window size tracking for responsive behavior
- `useGridDimensions.js` - Dynamic grid dimension calculation

---

## 🎭 THEME & ANIMATION SYSTEM

### **ThemeContext (`src/contexts/ThemeContext.jsx`)**

**Purpose**: Application-wide theme management

**Theme Features**:

- Dark/light mode switching
- System preference detection
- Persistent theme storage
- CSS custom property management

---

### **AnimationContext (`src/contexts/AnimationContext.jsx`)**

**Purpose**: Animation preferences and performance management

**Animation Control**:

- User animation preferences (enabled/disabled/system)
- Performance-based animation scaling
- Reduced motion respect for accessibility
- Smooth transition management

**Performance Integration**:

- FPS monitoring for animation quality
- Battery level awareness
- Device capability detection

---

## 🗂️ ROUTING & PAGE SYSTEM

### **Router Configuration (`src/router/index.jsx`)**

**Purpose**: Advanced routing with authentication and role-based access

**Route Types**:

- **Public Routes**: Redirect authenticated users to dashboard
- **Protected Routes**: Require authentication, redirect to login if needed
- **App Routes**: Allow both authenticated and anonymous access
- **Smart Routes**: Conditional behavior based on authentication state

**Loading Strategy**:

- **Eager Loading**: Core pages (Collections, Binder, Dashboard)
- **Lazy Loading**: Less frequent pages (Profile, Wishlist, Statistics)
- **Preloading**: Anticipated route preparation

**Route Protection**:

- `ProtectedRoute` - Authentication required
- `PublicRoute` - Redirect if already authenticated
- `AppRoute` - Universal access with state awareness
- `SmartRoute` - Dynamic routing based on user context

---

### **Page Components (`src/pages/`)**

#### **Core Application Pages**

**Binder Management**:

- `BinderCreationWizard.jsx` - **ENHANCED**: Multi-step binder creation with limit validation
  - Server-side limit checking with route protection
  - Visual grid size previews
  - Template-based creation workflow
  - Real-time limit warnings and upgrade prompts
- `BinderListPage.jsx` - **UPDATED**: Binder collection view with smart indicators
  - Real-time binder count and limit status
  - Color-coded usage indicators (gray/amber/red)
  - Guest user identification badges
  - Disabled button states with explanatory tooltips
- `Binder.jsx` - Individual binder viewer/editor with full card management
- `FullBinder.jsx` - Immersive full-screen binder experience

**Dashboard & Analytics**:

- `BinderDashboard.jsx` - User dashboard with statistics and quick actions
- `Collections.jsx` - Collection management and organization
- `Statistics.jsx` - User analytics and collection insights
- `Profile.jsx` - User profile management and settings

**Authentication & Onboarding**:

- `Landing.jsx` - Marketing landing page with feature showcase
- Authentication pages handled by Auth components

**Utility Pages**:

- `UnderDevelopment.jsx` - Feature preview and development status
- `NotFound.jsx` - 404 error handling with navigation
- `WorkspaceTest.jsx` - Development testing environment

---

## 🔧 CONFIGURATION & SETUP

### **Firebase Configuration (`src/config/firebase.js`)**

**Purpose**: Firebase service initialization and configuration

**Services Configured**:

- Firebase Authentication with providers
- Firestore database with security rules
- Performance monitoring integration

---

### **User Limits Configuration (`src/config/userLimits.js`)**

**Purpose**: Comprehensive user limitation and feature control system

**Limit Categories**:

- **Guest Users**: Limited functionality to encourage registration
- **Registered Users**: Full feature access with generous limits
- **Feature Availability**: Granular feature control by user type

**Enforcement Configuration**:

- `LIMIT_ENFORCEMENT` - Toggle limit enforcement globally
- `STRICT_MODE` - Enable strict validation mode
- Feature-specific enforcement flags

**Limit Types**:

- Binder creation limits
- Cards per binder limits
- Page count limits
- Feature access controls (sharing, export, etc.)

**Messaging System**:

- Contextual upgrade incentives
- Warning threshold configuration
- Feature lock explanations
- Storage usage estimation

---

## 🛡️ SECURITY & VALIDATION

### **Firestore Security Rules**

**Location**: `firestore.rules`

**Security Model**:

- **User Isolation**: Users can only access their own data
- **Role-Based Access**: Owner role for admin operations
- **Public Configuration**: System limits readable by all users
- **Subcollection Protection**: Complete data privacy

**Key Rules**:

```javascript
// User document access
allow read, write: if request.auth.uid == userId;

// Admin access for owners
allow read: if isOwner();

// System configuration
allow read: if true;  // Limits readable by all
allow write: if isOwner(); // Only owners can modify
```

---

### **Server-Side Validation**

**Implementation**: `src/services/firestore.js` - Comprehensive validation system

**Validation Architecture**:

**Core Validation Functions**:

- `validateBinderData()` - Complete binder data validation (names, descriptions, grid sizes, page counts)
- `validateUserProfileData()` - User profile data validation (display names, emails, bios, URLs)
- `validateCardData()` - Card data validation (names, positions, values, IDs)
- `validateFeatureAccess()` - Feature restriction enforcement for guest users
- `validateRateLimit()` - Basic rate limiting protection
- `validatePageLimits()` - Page count limit enforcement
- Server-side limit checking in all operations

**Comprehensive Limit Enforcement**:

**Binder Limits (`addBinder()` function)**:

- ✅ Real-time system limit checking from Firebase
- ✅ User type determination (guest vs registered)
- ✅ Limit enforcement based on admin configuration
- ✅ Data validation (name length, description length, grid size)
- ✅ Clear error messages for limit violations
- ✅ Prevention of API bypassing attempts

**Card Limits (`addCardToBinder()` function)**:

- ✅ **NEW: Complete server-side card limit validation**
- ✅ Real-time card count checking per binder
- ✅ User type-based limit enforcement (guest: 50, registered: 400)
- ✅ Card data validation (names, positions, values)
- ✅ Transaction-based operations for data consistency
- ✅ Prevention of manual API bypassing attempts

**Page Limits (Multiple functions)**:

- ✅ Comprehensive server-side page limit validation
- ✅ Enforced in `addBinder()`, `updateBinder()`, `updateUserPreferences()`
- ✅ Real-time system configuration checking
- ✅ User type determination and appropriate limits
- ✅ Automatic error handling with user-friendly feedback

**Data Validation Protection**:

- ✅ **NEW: Field length validation** (binder names max 100 chars, descriptions max 500 chars)
- ✅ **NEW: Type checking** (strings, numbers, booleans validation)
- ✅ **NEW: Format validation** (email formats, URL formats, grid sizes)
- ✅ **NEW: Range validation** (page counts 1-200, card values 0-999,999)
- ✅ **NEW: Required field validation** (card API IDs, user IDs, binder names)

**Feature Access Control**:

- ✅ **NEW: Guest feature restrictions** (sharing, export, bulk operations, advanced search)
- ✅ **NEW: Admin-configurable feature flags** from Firebase system configuration
- ✅ **NEW: Real-time feature access validation** before operation execution
- ✅ **NEW: User-friendly restriction messages** with upgrade prompts

**Rate Limiting (Basic Implementation)**:

- ✅ **NEW: Operation-specific rate limits** (addCard: 30/min, updateBinder: 10/min)
- ✅ **NEW: User type-based limits** (guests get 50% of registered user limits)
- ✅ **NEW: Extensible framework** for production rate limiting integration

**Security Model**:

- ✅ All validation happens server-side before data persistence
- ✅ No reliance on client-side validation for security
- ✅ Real-time configuration updates from admin panel
- ✅ Consistent enforcement across all entry points
- ✅ Comprehensive error handling with security-aware messages
- ✅ Protection against data injection and malformed requests

**Bypass Prevention**:

- ✅ **Binder Creation**: Server-side limit checking prevents manual API calls
- ✅ **Card Addition**: Complete validation before allowing card additions
- ✅ **Page Management**: All page count changes validated server-side
- ✅ **Feature Access**: Guest restrictions enforced regardless of client state
- ✅ **Data Integrity**: All field lengths and formats validated
- ✅ **Rate Limiting**: Basic protection against API abuse

---

### **Client-Side Validation**

**Components**: Form validation utilities and hooks

**Validation Areas**:

- Form input validation with real-time feedback
- Password strength requirements
- Email format and verification
- File upload validation
- Data consistency checking

---

## 🏢 ADMIN SYSTEM

### **Admin Dashboard (`src/components/profile/AdminDashboard.jsx`)**

**Purpose**: Comprehensive system administration interface

**Dashboard Sections**:

- **System Overview**: Real-time statistics and health monitoring
- **User Management**: User list, roles, and account operations
- **System Configuration**: Limit management and feature toggles
- **Performance Monitoring**: System health and performance metrics

**Real-time Features**:

- Live user activity monitoring
- System health indicators
- Performance metrics tracking
- Automatic refresh and updates

---

### **System Configuration (`src/components/profile/SystemConfiguration.jsx`)**

**Purpose**: Admin interface for system limits and feature management

**Configuration Categories**:

- **User Limits**: Binder, card, and page limits for different user types
- **Enforcement Settings**: Toggle limit enforcement globally
- **Warning Thresholds**: Configure when to show limit warnings
- **Feature Flags**: Enable/disable features by user type

**Real-time Sync**:

- Changes immediately reflected across all users
- Firebase Firestore `onSnapshot` for live updates
- Optimistic updates with error rollback

---

### **User Management (`src/components/profile/UserManagement.jsx`)**

**Purpose**: User administration and account management

**Management Features**:

- User list with filtering and search
- Role management and assignment
- Account deletion with data cleanup
- Bulk operations for user management
- Activity monitoring and statistics

---

## 📁 STORAGE & DATA MANAGEMENT

### **Storage Providers (`src/storage/`)**

**Purpose**: Abstracted storage layer supporting multiple backends

**Storage Types**:

- **Firebase Adapter**: Cloud storage for registered users
- **Local Storage Adapter**: Browser storage for guest users
- **Migration System**: Data migration between storage types

**Features**:

- Automatic storage type selection based on user authentication
- Data migration when users register
- Offline capability with local storage fallback
- Storage quota management and warnings

---

## 🛠️ UTILITIES & HELPERS

### **Grid Utilities (`src/utils/gridUtils.js`)**

**Purpose**: Grid calculation and layout utilities

**Grid Functions**:

- `parseGridSize(gridSize)` - Parse grid dimensions from strings
- Grid slot calculation and validation
- Page capacity calculations
- Responsive grid adjustments

---

### **Form Validation (`src/utils/formValidation.js`)**

**Purpose**: Comprehensive form validation system

**Validation Types**:

- Email format validation
- Password strength checking
- Required field validation
- Custom validation rules
- Real-time validation feedback

---

### **Error Handling (`src/utils/errorMessages.js`)**

**Purpose**: User-friendly error message system

**Error Categories**:

- Firebase Authentication errors
- Firestore operation errors
- Network and connectivity errors
- Validation errors
- User-facing error translations

---

## 🔄 KEY WORKFLOWS & DATA FLOW

### **User Registration Flow**

1. `Auth.jsx` renders `SignupForm.jsx`
2. Form validation with `formValidation.js`
3. `AuthContext.signup()` creates Firebase user
4. `firestore.createUserProfile()` creates Firestore profile
5. Email verification sent automatically
6. User redirected to dashboard with onboarding

### **Binder Creation Flow**

1. **Limit Check**: `useUserLimits()` validates current binder count
2. **Route Protection**: `BinderCreationWizard.jsx` enforces limits
3. **Template Selection**: User chooses from predefined templates
4. **Configuration**: Grid size, page count, and metadata setup
5. **Server Validation**: `firestore.addBinder()` performs server-side limit check
6. **Cache Update**: `useAddBinder()` invalidates and updates cache
7. **Navigation**: Redirect to new binder view

### **Real-time Data Synchronization**

1. `useRealtimeData()` establishes Firestore listeners
2. `onSnapshot` provides real-time updates
3. Cache automatically updated via TanStack Query
4. UI re-renders with new data
5. Optimistic updates for immediate feedback

### **Admin Configuration Changes**

1. Admin modifies limits in `SystemConfiguration.jsx`
2. Changes saved to `systemConfiguration/limits` collection
3. `useSystemLimits()` receives real-time update via `onSnapshot`
4. All connected components re-render with new limits
5. Users immediately see updated restrictions

### **Limit Enforcement Flow**

1. User attempts action (create binder, add card)
2. `useUserLimits()` checks current usage against Firebase limits
3. **Client-side**: UI disabled/enabled based on limits
4. **Server-side**: `firestore.js` validates limits before execution
5. Error messages displayed if limits exceeded
6. Upgrade prompts shown for guest users

---

## 📊 PERFORMANCE OPTIMIZATION

### **Caching Strategy**

- **TanStack Query**: Intelligent caching with stale-while-revalidate
- **Firebase Cache**: Offline persistence for Firestore
- **Image Caching**: Lazy loading and progressive enhancement
- **Route-based Code Splitting**: Minimal initial bundle size

### **Data Fetching Optimization**

- **Selective Fetching**: Only load required data
- **Pagination**: Infinite scroll for large datasets
- **Prefetching**: Anticipatory data loading
- **Background Sync**: Updates during idle time

### **Rendering Performance**

- **Virtual Scrolling**: Efficient large list rendering
- **Memo Optimization**: Prevent unnecessary re-renders
- **Lazy Components**: Code splitting at component level
- **Animation Optimization**: Hardware acceleration and reduced motion

---

## 🌍 ENVIRONMENT & DEPLOYMENT

### **Environment Variables**

**Required**:

- `VITE_OWNER_EMAIL` - Email for owner role assignment
- Firebase configuration variables
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.

**Optional**:

- Feature flag overrides
- Performance monitoring settings
- Debug mode configurations

### **Build Configuration**

- **Vite**: Modern build tool with HMR
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **PostCSS**: CSS processing and optimization

---

## 🔗 EXTERNAL INTEGRATIONS

### **Firebase Services**

- **Authentication**: Email/password, Google OAuth
- **Firestore**: NoSQL database with real-time updates
- **Security Rules**: Server-side access control
- **Performance Monitoring**: App performance tracking

### **Third-party Libraries**

- **React Router**: Client-side routing
- **TanStack Query**: Server state management
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

---

## 🚀 RECENT UPDATES & FIXES

### **Server-Side Security Enhancements**

- Added server-side limit validation in `addBinder()` function
- Prevents API bypassing of client-side restrictions
- Validates user type and applies appropriate limits
- Returns clear error messages for limit violations

### **Modal System Improvements**

- Fixed `DeleteBinderModal` styling and layout issues
- Eliminated duplicate close buttons
- Proper button variant usage (`danger` instead of `destructive`)
- Improved spacing and visual hierarchy

### **Navigation & UX Enhancements**

- Smart "Create Binder" button with limit-aware disabling
- Tooltip explanations for disabled states
- Mobile-responsive limit indicators
- Real-time binder count tracking

### **User Limits System Overhaul**

- **CRITICAL FIX**: Corrected `useUserLimits` hook to use `currentUser` instead of `user`
- Fixed guest user misclassification for authenticated users
- Proper Firebase system limits integration
- Real-time limit updates from admin configuration

### **Cache Management Improvements**

- Fixed binder list cache invalidation issues
- Optimistic updates for immediate UI feedback
- Reduced stale time for better responsiveness
- Strategic cache invalidation patterns

---

## 📊 FIREBASE DOCUMENT STRUCTURE

### **Firestore Database Architecture**

**Purpose**: Document the complete Firestore database schema and collection structure

**Database Pattern**: User-centric design with nested subcollections for data isolation and security

---

### **👤 User Documents (`users/{userId}`)**

**Purpose**: Central user profile and settings management

**Document Schema**:

```javascript
{
  // Basic Profile Information
  email: "user@example.com",
  displayName: "User Name",
  photoURL: "https://...",

  // Role & Permissions
  role: "user" | "owner",  // owner role set via VITE_OWNER_EMAIL

  // Statistics
  totalBinders: 5,
  totalValue: 1250.75,

  // Timestamps
  createdAt: Timestamp,
  lastLoginAt: Timestamp,

  // User Settings & Preferences
  settings: {
    theme: "light" | "dark",
    currency: "USD",
    publicProfile: false,
    animationPreference: null | "enabled" | "disabled",
    updatedAt: Timestamp,

    // Binder-specific preferences
    binderPreferences: {
      gridSize: "1x1" | "2x2" | "3x3" | "3x4" | "4x4",
      sortingDirection: true,  // true = ascending
      autoSave: true,
      createdAt: Timestamp,
      updatedAt: Timestamp
    }
  }
}
```

**Security Rules**:

- Users can only read/write their own document
- Owner role can read all user documents for admin purposes

---

### **📁 Binder Subcollection (`users/{userId}/binders/{binderId}`)**

**Purpose**: Individual binder metadata and configuration

**Document Schema**:

```javascript
{
  // Basic Information
  binderName: "My Pokemon Collection",
  description: "First generation Pokemon cards",

  // Configuration
  template: "custom" | "template-id",
  gridSize: "3x3",  // Grid layout preference
  maxPages: 20,     // Maximum pages in this binder

  // Statistics
  totalCardsInBinder: 45,
  totalValue: 150.50,
  currentPage: 1,

  // Page Management
  pageCount: 5,        // Current number of pages
  totalSlots: 180,     // Total available slots (pages * grid)

  // Metadata
  isPrivate: false,
  tags: ["generation-1", "rare"],
  category: "pokemon",

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastViewedAt: Timestamp
}
```

**Usage Patterns**:

- Each user can have multiple binders
- Binder count limited by user type (guest/registered)
- Optimistic updates for immediate UI feedback

---

### **🃏 Card Subcollection (`users/{userId}/binders/{binderId}/cards/{cardId}`)**

**Purpose**: Individual card data within binders

**Document Schema**:

```javascript
{
  // Card Identification
  cardId: "pokemon-charizard-4", // Unique card identifier
  name: "Charizard",
  setName: "Base Set",
  cardNumber: "4/102",

  // Position in Binder
  pageNumber: 2,           // Which page (1-based)
  slotInPage: 5,          // Position on page (0-based)
  overallSlotNumber: 14,   // Global slot across all pages

  // Card Details
  rarity: "Rare Holo",
  condition: "Near Mint",
  value: 150.00,
  imageUrl: "https://...",

  // Metadata
  notes: "First edition, great condition",
  acquiredDate: Timestamp,
  source: "pack" | "trade" | "purchase",

  // Timestamps
  addedAt: Timestamp,
  updatedAt: Timestamp
}
```

**Indexing Strategy**:

- Indexed by `pageNumber` for efficient page queries
- Indexed by `overallSlotNumber` for sorting
- Compound indexes for filtering by rarity/condition

---

### **📊 System Configuration (`systemConfiguration/limits`)**

**Purpose**: Global system limits and feature flags (admin-configurable)

**Document Schema**:

```javascript
{
  // Guest User Limits
  guestMaxBinders: 3,
  guestMaxCardsPerBinder: 50,
  guestMaxPages: 10,

  // Registered User Limits
  registeredMaxBinders: 25,
  registeredMaxCardsPerBinder: 400,
  registeredMaxPages: 50,

  // Limit Enforcement Flags
  enforceBinnerLimits: false,      // Global binder limit toggle
  enforceCardLimits: false,        // Global card limit toggle
  enforceStorageWarnings: true,    // Storage warning system
  enforceFeatureLocks: true,       // Feature restriction system
  strictMode: false,               // Strict validation mode

  // Warning Thresholds (percentages)
  warningThresholds: {
    BINDER_WARNING: 80,    // Warn at 80% of limit
    CARD_WARNING: 90,      // Warn at 90% of limit
    STORAGE_WARNING: 85,   // Local storage warning
    API_WARNING: 90        // API usage warning
  },

  // System Metadata
  lastUpdated: Timestamp,
  updatedBy: "admin@example.com"
}
```

**Access Control**:

- **Read**: All users (for limit checking)
- **Write**: Owner role only (admin configuration)
- Real-time updates via `onSnapshot` listeners

---

### **📈 Activity Subcollection (`users/{userId}/activity/{activityId}`)**

**Purpose**: User activity tracking and audit logs

**Document Schema**:

```javascript
{
  // Activity Type
  type: "binder_created" | "card_added" | "collection_created" | "profile_updated",

  // Description
  description: "Created binder 'My Pokemon Collection'",

  // References (optional)
  binderRef: DocumentReference,     // Reference to related binder
  cardRef: DocumentReference,       // Reference to related card
  collectionRef: DocumentReference, // Reference to related collection

  // Metadata
  userAgent: "Mozilla/5.0...",
  ipAddress: "192.168.1.1", // For security auditing

  // Timestamp
  timestamp: Timestamp
}
```

**Retention Policy**:

- Limited to last 100 activities per user
- Automatic cleanup for performance
- Critical activities (deletions) retained longer

---

### **🗂️ Collections Subcollection (`users/{userId}/collections/{collectionId}`)**

**Purpose**: User-defined card collections and sets

**Document Schema**:

```javascript
{
  // Collection Information
  name: "First Generation Holos",
  description: "Complete holographic collection from Base Set",
  category: "pokemon",

  // Statistics
  cardCount: 16,
  totalValue: 1250.00,
  completionPercentage: 85.5,

  // Configuration
  isPrivate: false,
  tags: ["base-set", "holographic", "complete"],

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### **🎯 Wishlist Subcollection (`users/{userId}/wishlist/{wishlistId}`)**

**Purpose**: Cards or binders the user wants to acquire

**Document Schema**:

```javascript
{
  // Item Information
  itemType: "card" | "binder",
  name: "Shadowless Charizard",
  description: "Base Set Charizard in PSA 10",

  // Target Details
  targetCondition: "Mint",
  maxPrice: 500.00,
  priority: 1, // 1=high, 2=medium, 3=low

  // Status
  status: "wanted" | "found" | "acquired",

  // References
  binderRef: DocumentReference, // If wishlist item is for specific binder

  // Timestamps
  addedAt: Timestamp,
  updatedAt: Timestamp,
  acquiredAt: Timestamp // When status changed to acquired
}
```

---

### **🔐 Security Rules Summary**

**User Data Isolation**:

```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;

  // Subcollections inherit parent permissions
  match /{subCollection}/{docId} {
    allow read, write: if request.auth.uid == userId;
  }
}
```

**Admin Access**:

```javascript
// Owner role access for admin operations
match /users/{userId} {
  allow read: if isOwner(request.auth);
}

// System configuration
match /systemConfiguration/{document} {
  allow read: if true;  // All users can read limits
  allow write: if isOwner(request.auth);
}
```

**Helper Functions**:

```javascript
function isOwner(auth) {
  return auth != null &&
         exists(/databases/$(database)/documents/users/$(auth.uid)) &&
         get(/databases/$(database)/documents/users/$(auth.uid)).data.role == "owner";
}
```

---

### **📊 Data Flow Patterns**

**User Registration Flow**:

1. Firebase Auth creates user account
2. `createUserProfile()` creates user document with default settings
3. User can immediately start creating binders
4. Activity log tracks profile creation

**Binder Creation Flow**:

1. Client checks limits via `useUserLimits()`
2. Server validates limits in `addBinder()`
3. Binder document created in user's subcollection
4. User's `totalBinders` count incremented
5. Activity log records binder creation

**Card Addition Flow**:

1. Card document added to binder's cards subcollection
2. Binder's `totalCardsInBinder` incremented via transaction
3. User's total value updated (if value tracking enabled)
4. Activity log records card addition

**Real-time Sync Pattern**:

1. Client uses `onSnapshot` listeners for live data
2. TanStack Query cache automatically updated
3. UI re-renders with new data
4. Optimistic updates provide immediate feedback

---

### **🗄️ Data Migration Considerations**

**Version Compatibility**:

- Document schema versioning for future updates
- Backward compatibility for legacy data
- Migration scripts for schema changes

**Performance Optimization**:

- Composite indexes for complex queries
- Subcollection limits to prevent document bloat
- Pagination for large datasets
- Strategic denormalization for frequently accessed data

---

## 🗄️ DATA LAYER & SERVICES
