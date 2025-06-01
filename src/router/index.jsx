import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

// Route protection components
import ProtectedRoute from "../components/routing/ProtectedRoute";
import PublicRoute from "../components/routing/PublicRoute";

// Layout components
import AppLayout from "../components/layout/AppLayout";

// EAGER LOAD - Core pages for instant access (no loading delay)
import WelcomeDashboard from "../components/dashboard/WelcomeDashboard";
import Collections from "../pages/Collections";
import Collection from "../pages/Collection";
import AddCard from "../pages/AddCard";
import Statistics from "../pages/Statistics";

// LAZY LOAD - Less frequently accessed pages
const Auth = lazy(() => import("../components/auth/Auth"));
const AuthAction = lazy(() => import("../components/auth/AuthAction"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));
const UnderDevelopment = lazy(() => import("../pages/UnderDevelopment"));

// Improved loading component for Suspense
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Wrapper component for lazy loaded routes
const LazyRoute = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Router configuration
export const router = createBrowserRouter([
  // Landing page - Keep lazy (not frequently accessed)
  {
    path: "/",
    element: (
      <LazyRoute>
        <UnderDevelopment />
      </LazyRoute>
    ),
  },

  // Public routes (redirect to dashboard if authenticated)
  {
    path: "/auth",
    element: (
      <PublicRoute>
        <LazyRoute>
          <Auth />
        </LazyRoute>
      </PublicRoute>
    ),
  },

  // Auth action handler (password reset, email verification)
  {
    path: "/auth/action",
    element: (
      <LazyRoute>
        <AuthAction />
      </LazyRoute>
    ),
  },

  // Protected routes (require authentication) - accessible via direct URLs
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard - EAGER LOADED (instant access)
      {
        index: true,
        element: <WelcomeDashboard />,
      },
      {
        path: "dashboard",
        element: <WelcomeDashboard />,
      },

      // Collection management - EAGER LOADED (core features)
      {
        path: "collection",
        element: <Collection />,
      },

      // Add new card - EAGER LOADED (frequently used)
      {
        path: "add-card",
        element: <AddCard />,
      },

      // Collections/Binders - EAGER LOADED (main feature)
      {
        path: "collections",
        element: <Collections />,
      },

      // Statistics - EAGER LOADED (accessed from dashboard)
      {
        path: "stats",
        element: <Statistics />,
      },

      // Wishlist - LAZY LOADED (less frequent)
      {
        path: "wishlist",
        element: (
          <LazyRoute>
            <Wishlist />
          </LazyRoute>
        ),
      },

      // Profile - LAZY LOADED (less frequent)
      {
        path: "profile",
        element: (
          <LazyRoute>
            <Profile />
          </LazyRoute>
        ),
      },
    ],
  },

  // 404 catch-all route - LAZY LOADED
  {
    path: "*",
    element: (
      <LazyRoute>
        <NotFound />
      </LazyRoute>
    ),
  },
]);

export default router;
