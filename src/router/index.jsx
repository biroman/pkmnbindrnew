import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Route protection components
import ProtectedRoute from "../components/routing/ProtectedRoute";
import AppRoute from "../components/routing/AppRoute";
import SmartRoute from "../components/routing/SmartRoute";
import PublicRoute from "../components/routing/PublicRoute";

// Layout components
import AppLayout from "../components/layout/AppLayout";

// EAGER LOAD - Core pages for instant access (no loading delay)
import WelcomeDashboard from "../components/dashboard/WelcomeDashboard";
import Collections from "../pages/Collections";
import Binder from "../pages/Binder";
import Collection from "../pages/Collection";
import AddCard from "../pages/AddCard";
import Statistics from "../pages/Statistics";
import Landing from "../pages/Landing";

// LAZY LOAD - Less frequently accessed pages
const Auth = lazy(() => import("../components/auth/Auth"));
const AuthAction = lazy(() => import("../components/auth/AuthAction"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));
const UnderDevelopment = lazy(() => import("../pages/UnderDevelopment"));

// Demo components for development
const AnonymousDemo = lazy(() =>
  import("../components/anonymous/AnonymousDemo")
);
const SimpleTest = lazy(() => import("../components/anonymous/SimpleTest"));

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
  // Root redirects to under development for development phase
  {
    path: "/",
    element: <Navigate to="/under-development" replace />,
  },

  // Under development page (keep for reference)
  {
    path: "/under-development",
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

  // Demo routes for development
  {
    path: "/demo/anonymous",
    element: (
      <LazyRoute>
        <AnonymousDemo />
      </LazyRoute>
    ),
  },

  // Simple test route
  {
    path: "/test/simple",
    element: (
      <LazyRoute>
        <SimpleTest />
      </LazyRoute>
    ),
  },

  // App routes (allow both authenticated and anonymous users)
  {
    path: "/app",
    element: (
      <AppRoute>
        <AppLayout />
      </AppRoute>
    ),
    children: [
      // Smart routing: authenticated users → dashboard, anonymous users → collections
      {
        index: true,
        element: <SmartRoute />,
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

      // Collections/Binders - PROTECTED (authenticated users only)
      {
        path: "collections",
        element: (
          <ProtectedRoute>
            <Collections />
          </ProtectedRoute>
        ),
      },

      // Individual Binder Create/Edit - EAGER LOADED (core feature)
      {
        path: "binder",
        element: <Binder />,
      },
      {
        path: "binder/:binderId",
        element: <Binder />,
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

      // Landing page - available for reference during development
      {
        path: "landing",
        element: <Landing />,
      },
    ],
  },

  // Admin routes (still require authentication)
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
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
