import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronRight } from "lucide-react";
import { useAnimations } from "../../../contexts/AnimationContext";

/**
 * BinderInfoSection - Expandable binder information section
 */
const BinderInfoSection = ({ binderInfo, isExpanded, onToggleExpanded }) => {
  const { getVariants, getTransition, shouldAnimate } = useAnimations();

  const sectionVariants = getVariants({
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  });

  if (!binderInfo) {
    return null;
  }

  return (
    <div className="pt-3 border-t border-gray-200/60 dark:border-gray-700/60 mt-4">
      <motion.button
        onClick={onToggleExpanded}
        className="flex items-center justify-between w-full p-3 hover:bg-gray-100/70 dark:hover:bg-gray-700/50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        whileHover={shouldAnimate() ? {} : {}} // Keep for consistency, but rely on Tailwind hover
        whileTap={shouldAnimate() ? { scale: 0.98 } : {}}
        aria-expanded={isExpanded}
        aria-controls="binder-info-content"
      >
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Binder Information
          </span>
        </div>
        <motion.div
          animate={shouldAnimate() ? { rotate: isExpanded ? 90 : 0 } : {}}
          transition={getTransition({ duration: 0.2 })}
        >
          <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="binder-info-content"
            className="mt-2 mx-1 p-3 bg-white dark:bg-gray-800 rounded-md shadow-inner border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 space-y-3"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={getTransition({
              duration: 0.3,
              ease: "easeInOut",
            })}
          >
            {binderInfo}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BinderInfoSection;
