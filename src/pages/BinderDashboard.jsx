import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, BookOpen, Settings, MoreHorizontal } from "lucide-react";
import { Button } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useAnimations } from "../contexts/AnimationContext";

const BinderDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getVariants, getTransition, shouldAnimate } = useAnimations();

  // Mock data for now - later this will come from Firebase
  const [binders] = useState([
    {
      id: "1",
      name: "Base Set Collection",
      cardCount: 45,
      totalSlots: 102,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Modern Meta Cards",
      cardCount: 67,
      totalSlots: 90,
      createdAt: "2024-02-20",
    },
    {
      id: "3",
      name: "Rare & Vintage",
      cardCount: 23,
      totalSlots: 54,
      createdAt: "2024-03-10",
    },
  ]);

  const handleCreateBinder = () => {
    // For now, navigate to a new binder directly
    // Later this could open a creation wizard
    navigate("/app/binder/new");
  };

  const handleOpenBinder = (binderId) => {
    navigate(`/app/binder/${binderId}`);
  };

  // Animation variants
  const containerVariants = getVariants({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  });

  const gridVariants = getVariants({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  });

  const cardVariants = getVariants({
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={getTransition({ duration: 0.5 })}
      >
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            initial={shouldAnimate() ? { opacity: 0, x: -20 } : {}}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition({ delay: 0.1 })}
          >
            My Pokemon Binders
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-400"
            initial={shouldAnimate() ? { opacity: 0, x: -20 } : {}}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition({ delay: 0.2 })}
          >
            Organize your collection with custom binders
          </motion.p>
        </div>

        {/* Binders Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={gridVariants}
          initial="initial"
          animate="animate"
          transition={getTransition({ delay: 0.3 })}
        >
          {/* Create New Binder Card */}
          <CreateBinderCard
            onClick={handleCreateBinder}
            variants={cardVariants}
            transition={getTransition({ delay: 0.4 })}
          />

          {/* Existing Binders */}
          {binders.map((binder, index) => (
            <BinderCard
              key={binder.id}
              binder={binder}
              onClick={() => handleOpenBinder(binder.id)}
              variants={cardVariants}
              transition={getTransition({ delay: 0.5 + index * 0.1 })}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {binders.length === 0 && (
          <EmptyState onCreateBinder={handleCreateBinder} />
        )}
      </motion.div>
    </div>
  );
};

// Create New Binder Card Component
const CreateBinderCard = ({ onClick, variants, transition }) => {
  return (
    <motion.div
      className="group cursor-pointer"
      variants={variants}
      initial="initial"
      animate="animate"
      transition={transition}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="h-64 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 flex flex-col items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Create New Binder
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
          Start organizing your Pokemon cards
        </p>
      </div>
    </motion.div>
  );
};

// Individual Binder Card Component
const BinderCard = ({ binder, onClick, variants, transition }) => {
  const [showMenu, setShowMenu] = useState(false);

  const completionPercentage = Math.round(
    (binder.cardCount / binder.totalSlots) * 100
  );

  return (
    <motion.div
      className="group cursor-pointer"
      variants={variants}
      initial="initial"
      animate="animate"
      transition={transition}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 p-6 flex flex-col">
        {/* Header with Menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Binder Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {binder.name}
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {binder.cardCount}/{binder.totalSlots}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {completionPercentage}% complete
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          Created {new Date(binder.createdAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ onCreateBinder }) => {
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No binders yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        Start organizing your Pokemon card collection by creating your first
        binder
      </p>
      <Button
        onClick={onCreateBinder}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Binder
      </Button>
    </motion.div>
  );
};

export default BinderDashboard;
