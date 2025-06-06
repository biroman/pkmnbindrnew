import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  useUserProfile,
  useUserBinders,
  useUserActivity,
} from "../../hooks/useUserData";
import { Card } from "../ui";
import {
  Plus,
  BookOpen,
  TrendingUp,
  Award,
  BookMarked,
  Sparkles,
  History,
  LayoutGrid,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

// Animation variants for the dashboard elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const WelcomeDashboard = () => {
  const { currentUser } = useAuth();
  const { data: userProfile } = useUserProfile(currentUser?.uid);
  const { data: userBinders, isLoading: bindersLoading } = useUserBinders(
    currentUser?.uid,
    { limit: 5 } // Fetch recent binders for "Jump Back In"
  );
  const { data: userActivity, isLoading: activityLoading } = useUserActivity(
    currentUser?.uid,
    5 // Fetch recent activities
  );

  const displayName = userProfile?.data?.displayName || "Trainer";
  const recentBinders = userBinders?.data || [];
  const recentActivities = userActivity?.data || [];

  // Key Performance Indicators (KPIs)
  const kpis = [
    {
      label: "Total Cards",
      value: userProfile?.data?.totalCards || 0,
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
    },
    {
      label: "Total Binders",
      value: userProfile?.data?.totalBinders || 0,
      icon: <LayoutGrid className="h-6 w-6 text-purple-500" />,
    },
    {
      label: "Collection Value",
      value: `$${(userProfile?.data?.collectionValue || 0).toLocaleString()}`,
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    },
    {
      label: "Sets Completed",
      value: userProfile?.data?.completedSets || 0,
      icon: <Award className="h-6 w-6 text-yellow-500" />,
    },
  ];

  // Quick Actions
  const quickActions = [
    {
      title: "Create Binder",
      href: "/app/collections",
      icon: <Plus className="h-8 w-8" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Add New Cards",
      href: "/app/add-card",
      icon: <BookMarked className="h-8 w-8" />,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Explore Sets",
      href: "/app/sets", // Assuming a route for exploring sets
      icon: <Sparkles className="h-8 w-8" />,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Personalized Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <img
          src={
            userProfile?.data?.photoURL ||
            `https://api.dicebear.com/8.x/bottts/svg?seed=${currentUser?.uid}`
          }
          alt="Profile"
          className="h-16 w-16 rounded-full border-2 border-blue-500 p-1"
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {displayName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's get your collection organized.
          </p>
        </div>
      </motion.div>

      {/* At-a-Glance KPI Section */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="p-4 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {kpi.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpi.value}
              </p>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* "Jump Back In" - Recent Binders */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Jump Back In
            </h2>
            {bindersLoading ? (
              <p>Loading binders...</p>
            ) : recentBinders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {recentBinders.slice(0, 3).map((binder, index) => (
                    <motion.div
                      key={binder.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={`/app/binder/${binder.id}`}>
                        <Card className="p-4 h-full flex flex-col justify-between group overflow-hidden relative hover:shadow-xl transition-shadow duration-300">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                              {binder.binderName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              {binder.cardCount || 0} /{" "}
                              {binder.totalSlots || "N/A"} cards
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (binder.cardCount / binder.totalSlots) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No binders created yet. Start a new one!
              </p>
            )}
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.href}>
                  <div
                    className={`p-6 rounded-xl text-white bg-gradient-to-br ${action.color} flex flex-col items-center justify-center text-center h-40 hover:scale-105 hover:shadow-lg transition-all duration-300`}
                  >
                    {action.icon}
                    <h3 className="mt-2 font-semibold">{action.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Wishlist / Collection Goals */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Collection Goal
              </h2>
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Base Set Completion
                  </h3>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    98%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: "98%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Missing 2 cards.{" "}
                  <Link
                    to="/app/wishlist"
                    className="text-blue-600 hover:underline"
                  >
                    View Wishlist
                  </Link>
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity Feed */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            {activityLoading ? (
              <p>Loading activity...</p>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className="flex items-center gap-4"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.15 }}
                    >
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <History className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {activity.description || "An action was performed."}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(
                            activity.timestamp?.toDate?.() || new Date(),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No recent activity to show.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeDashboard;
