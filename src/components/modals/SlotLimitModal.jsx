import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Plus, Settings, X } from "lucide-react";
import { Button } from "../ui";

const SlotLimitModal = ({
  isOpen,
  onClose,
  selectedCardsCount,
  availableSlotsCount,
  totalPages,
  gridSize,
  onAddMorePages,
  onChangeGridSize,
  canAddPages = true,
  maxPages = null,
}) => {
  const slotsNeeded = selectedCardsCount - availableSlotsCount;
  const currentSlotsPerPage =
    gridSize === "3x3"
      ? 9
      : gridSize === "4x4"
      ? 16
      : gridSize === "2x2"
      ? 4
      : 9;
  const pagesNeeded = Math.ceil(slotsNeeded / currentSlotsPerPage);

  const handleAddPages = () => {
    onAddMorePages(pagesNeeded);
    onClose();
  };

  const handleChangeToLargerGrid = () => {
    const newGridSize =
      gridSize === "2x2" ? "3x3" : gridSize === "3x3" ? "4x4" : "4x4";
    onChangeGridSize(newGridSize);
    onClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Not Enough Space
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Your binder doesn't have enough slots
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="space-y-4">
              {/* Problem Description */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cards to add:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedCardsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Available slots:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {availableSlotsCount}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      Additional slots needed:
                    </span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {slotsNeeded}
                    </span>
                  </div>
                </div>
              </div>

              {/* Solutions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Choose a solution:
                </h4>

                {/* Add More Pages */}
                {canAddPages &&
                  (!maxPages || totalPages + pagesNeeded <= maxPages) && (
                    <button
                      onClick={handleAddPages}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-md">
                          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Add {pagesNeeded} more page
                            {pagesNeeded > 1 ? "s" : ""}
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            This will create {pagesNeeded * currentSlotsPerPage}{" "}
                            new slots
                          </div>
                        </div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </button>
                  )}

                {/* Change Grid Size */}
                {gridSize !== "4x4" && (
                  <button
                    onClick={handleChangeToLargerGrid}
                    className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-md">
                        <Settings className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-green-900 dark:text-green-100">
                          Use larger grid ({gridSize === "2x2" ? "3×3" : "4×4"})
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300">
                          More slots per page without adding pages
                        </div>
                      </div>
                    </div>
                    <div className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </button>
                )}

                {/* Show limits if applicable */}
                {maxPages && totalPages + pagesNeeded > maxPages && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <strong>Page limit reached:</strong> You can only have{" "}
                      {maxPages} pages in this binder.
                      {gridSize !== "4x4" && (
                        <span className="block mt-1">
                          Consider using a larger grid size to fit more cards
                          per page.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SlotLimitModal;
