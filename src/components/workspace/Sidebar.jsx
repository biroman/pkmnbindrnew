import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Info,
  Clipboard,
  ChevronRight,
  Grid3X3,
  BookOpen,
  Save,
  RotateCcw,
  Circle,
} from "lucide-react";
import { Button, Slider } from "../ui";
import { useAnimations } from "../../contexts/AnimationContext";
import { usePageLimits } from "../../hooks/usePageLimits";

/**
 * Sidebar - Right-side collapsible sidebar for settings and configuration
 * Follows design tool pattern (settings/properties panel)
 * @param {string} gridSize - Current grid size
 * @param {Function} onGridSizeChange - Grid size change handler
 * @param {boolean} showReverseHolos - Show reverse holos setting
 * @param {Function} onToggleReverseHolos - Toggle reverse holos handler
 * @param {number} pageCount - Total number of pages in binder
 * @param {Function} onPageCountChange - Page count change handler
 * @param {number} currentPage - Current page being viewed
 * @param {boolean} isDirty - Whether there are unsaved changes
 * @param {Function} onSave - Save preferences to Firebase
 * @param {Function} onRevert - Revert to last saved state
 * @param {boolean} isSaving - Whether save operation is in progress
 * @param {ReactNode} binderInfo - Binder info content
 * @param {ReactNode} clipboard - Clipboard content
 * @param {boolean} isCollapsed - Whether sidebar is collapsed
 * @param {Function} onToggleCollapsed - Toggle collapsed state
 */
const Sidebar = ({
  gridSize = "3x3",
  onGridSizeChange,
  showReverseHolos = true,
  onToggleReverseHolos,
  pageCount = 10,
  onPageCountChange,
  currentPage = 1,
  isDirty = false,
  onSave,
  onRevert,
  isSaving = false,
  binderInfo,
  clipboard,
  isCollapsed = false,
  onToggleCollapsed,
}) => {
  const { getVariants, getTransition, shouldAnimate } = useAnimations();
  const { maxPages } = usePageLimits();

  const [expandedSections, setExpandedSections] = useState({
    settings: true,
    info: true,
    clipboard: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const gridOptions = ["1x1", "2x2", "3x3", "4x4"];

  // Animation variants
  const sidebarVariants = getVariants({
    initial: { x: 320, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 320, opacity: 0 },
  });

  const buttonVariants = getVariants({
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  });

  const headerVariants = getVariants({
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  });

  const contentVariants = getVariants({
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  });

  const sectionVariants = getVariants({
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  });

  if (isCollapsed) {
    return (
      <motion.div
        className="fixed right-4 top-20 z-40"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={getTransition({ duration: 0.2 })}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapsed}
          className="h-10 w-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:scale-110 transition-all duration-200"
          title="Open Settings"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-40 overflow-y-auto"
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={getTransition({ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] })}
    >
      {/* Header */}
      <motion.div
        className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
        variants={headerVariants}
        initial="initial"
        animate="animate"
        transition={getTransition({ duration: 0.3, delay: 0.1 })}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Settings
          </h2>
          {isDirty && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center"
              title="Unsaved changes"
            >
              <Circle className="h-2 w-2 fill-orange-500 text-orange-500" />
            </motion.div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapsed}
          className="h-8 w-8 p-0 hover:scale-110 transition-all duration-200"
          title="Collapse Settings"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
      </motion.div>

      {/* Save/Revert Controls */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            className="px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={getTransition({ duration: 0.3 })}
          >
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Circle className="h-3 w-3 fill-orange-500 text-orange-500" />
                <span className="text-sm text-orange-700 dark:text-orange-300">
                  Unsaved changes
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRevert}
                  disabled={isSaving}
                  className="h-7 px-2 text-xs hover:bg-orange-100 dark:hover:bg-orange-800/40"
                  title="Revert changes"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Revert
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="h-7 px-2 text-xs bg-orange-600 hover:bg-orange-700"
                  title="Save changes"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="p-4 space-y-6"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        transition={getTransition({ duration: 0.4, delay: 0.2 })}
      >
        {/* Binder Settings Section */}
        <div>
          <motion.button
            onClick={() => toggleSection("settings")}
            className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={shouldAnimate() ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate() ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Binder Settings
              </span>
            </div>
            <motion.div
              animate={
                shouldAnimate()
                  ? { rotate: expandedSections.settings ? 90 : 0 }
                  : {}
              }
              transition={getTransition({ duration: 0.2 })}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.settings && (
              <motion.div
                className="mt-3 pl-6 space-y-4"
                variants={sectionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={getTransition({ duration: 0.3, ease: "easeInOut" })}
                style={{ overflow: "hidden" }}
              >
                {/* Grid Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grid Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {gridOptions.map((option, index) => (
                      <motion.button
                        key={option}
                        onClick={() => onGridSizeChange?.(option)}
                        className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                          gridSize === option
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        whileHover={shouldAnimate() ? { scale: 1.05 } : {}}
                        whileTap={shouldAnimate() ? { scale: 0.95 } : {}}
                        initial={
                          shouldAnimate()
                            ? { opacity: 0, y: 10 }
                            : { opacity: 1, y: 0 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={getTransition({ delay: index * 0.1 })}
                      >
                        <Grid3X3 className="h-4 w-4 mx-auto mb-1" />
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Show Reverse Holos */}
                <motion.div
                  initial={
                    shouldAnimate()
                      ? { opacity: 0, x: -10 }
                      : { opacity: 1, x: 0 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={getTransition({ delay: 0.4 })}
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showReverseHolos}
                      onChange={(e) => onToggleReverseHolos?.(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show Reverse Holos
                    </span>
                  </label>
                </motion.div>

                {/* Page Count */}
                <motion.div
                  initial={
                    shouldAnimate()
                      ? { opacity: 0, x: -10 }
                      : { opacity: 1, x: 0 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={getTransition({ delay: 0.5 })}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Pages in Binder</span>
                    </div>
                  </label>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={maxPages}
                      step={1}
                      value={[pageCount]}
                      onValueChange={([value]) => onPageCountChange?.(value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {pageCount} pages
                      </span>
                      <span>{maxPages}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Binder Info Section */}
        <div>
          <motion.button
            onClick={() => toggleSection("info")}
            className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={shouldAnimate() ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate() ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Binder Info
              </span>
            </div>
            <motion.div
              animate={
                shouldAnimate()
                  ? { rotate: expandedSections.info ? 90 : 0 }
                  : {}
              }
              transition={getTransition({ duration: 0.2 })}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.info && (
              <motion.div
                className="mt-3 pl-6"
                variants={sectionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={getTransition({ duration: 0.3, ease: "easeInOut" })}
                style={{ overflow: "hidden" }}
              >
                {binderInfo || (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-2">
                      <div>
                        {currentPage === 1
                          ? "Cover + Page 1"
                          : `Pages ${(currentPage - 2) * 2 + 2}-${
                              (currentPage - 2) * 2 + 3
                            }`}
                      </div>
                      <div>
                        {(() => {
                          const gridSizeNum = parseInt(gridSize.split("x")[0]);
                          const slotsPerPage = gridSizeNum * gridSizeNum;

                          // Calculate total slots with book structure:
                          // Page 1: Cover (empty) + Content page 1 = slotsPerPage
                          // Page 2+: Normal spreads (2 content pages each) = (pageCount - 1) * slotsPerPage * 2
                          const firstPageSlots = slotsPerPage; // Page 1 only has right side content
                          const spreadPages = Math.max(0, pageCount - 1); // Pages 2+
                          const spreadSlots = spreadPages * slotsPerPage * 2; // 2 content pages per spread
                          const totalSlots = firstPageSlots + spreadSlots;

                          return `0/${totalSlots} cards`;
                        })()}
                      </div>
                      <div>Grid: {gridSize}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clipboard Section */}
        <div>
          <motion.button
            onClick={() => toggleSection("clipboard")}
            className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={shouldAnimate() ? { scale: 1.02 } : {}}
            whileTap={shouldAnimate() ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center space-x-2">
              <Clipboard className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Clipboard
              </span>
            </div>
            <motion.div
              animate={
                shouldAnimate()
                  ? { rotate: expandedSections.clipboard ? 90 : 0 }
                  : {}
              }
              transition={getTransition({ duration: 0.2 })}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {expandedSections.clipboard && (
              <motion.div
                className="mt-3 pl-6"
                variants={sectionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={getTransition({ duration: 0.3, ease: "easeInOut" })}
                style={{ overflow: "hidden" }}
              >
                {clipboard || (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Clipboard will appear here in Phase 3
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
