import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

// Route protection components
import ProtectedRoute from "../components/routing/ProtectedRoute";
import PublicRoute from "../components/routing/PublicRoute";

// Layout components
import AppLayout from "../components/layout/AppLayout";

// Lazy load pages for better performance
const WelcomeDashboard = lazy(() =>
  import("../components/dashboard/WelcomeDashboard")
);
const Auth = lazy(() => import("../components/auth/Auth"));
const Collection = lazy(() => import("../pages/Collection"));
const AddCard = lazy(() => import("../pages/AddCard"));
const Collections = lazy(() => import("../pages/Collections"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Statistics = lazy(() => import("../pages/Statistics"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));
const UnderDevelopment = lazy(() => import("../pages/UnderDevelopment"));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
    </div>
  </div>
);

// Wrapper component for lazy loaded routes
const LazyRoute = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Router configuration
export const router = createBrowserRouter([
  // Landing page - Under Development
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

  // Protected routes (require authentication) - accessible via direct URLs
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        index: true,
        element: (
          <LazyRoute>
            <WelcomeDashboard />
          </LazyRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <LazyRoute>
            <WelcomeDashboard />
          </LazyRoute>
        ),
      },

      // Collection management
      {
        path: "collection",
        element: (
          <LazyRoute>
            <Collection />
          </LazyRoute>
        ),
      },

      // Add new card
      {
        path: "add-card",
        element: (
          <LazyRoute>
            <AddCard />
          </LazyRoute>
        ),
      },

      // Collections/Binders
      {
        path: "collections",
        element: (
          <LazyRoute>
            <Collections />
          </LazyRoute>
        ),
      },

      // Wishlist
      {
        path: "wishlist",
        element: (
          <LazyRoute>
            <Wishlist />
          </LazyRoute>
        ),
      },

      // Statistics
      {
        path: "stats",
        element: (
          <LazyRoute>
            <Statistics />
          </LazyRoute>
        ),
      },

      // Profile
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

  // 404 catch-all route
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
