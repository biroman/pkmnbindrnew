import { Undo2, Redo2, Plus } from "lucide-react";
import { Button } from "../ui";

/**
 * BottomToolbar - Floating rounded toolbar that hovers above the bottom
 * @param {Function} onUndo - Undo action handler (disabled initially)
 * @param {Function} onRedo - Redo action handler (disabled initially)
 * @param {Function} onAddCards - Add cards action handler
 * @param {boolean} canUndo - Whether undo is available
 * @param {boolean} canRedo - Whether redo is available
 * @param {string} gridSize - Current grid size for display
 * @param {Function} onGridSizeChange - Grid size change handler
 * @param {ReactNode} pageNavigation - Page navigation component
 * @param {boolean} disabled - Whether all actions are disabled
 */
const BottomToolbar = ({
  onUndo,
  onRedo,
  onAddCards,
  canUndo = false,
  canRedo = false,
  gridSize = "3x3",
  onGridSizeChange,
  pageNavigation,
  disabled = false,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
        <div className="flex items-center space-x-6">
          {/* Left Section - History Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={disabled || !canUndo}
              className={`h-9 w-9 p-0 rounded-xl transition-all duration-200 ${
                canUndo
                  ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110"
                  : "opacity-50"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={disabled || !canRedo}
              className={`h-9 w-9 p-0 rounded-xl transition-all duration-200 ${
                canRedo
                  ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110"
                  : "opacity-50"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Add Cards Button */}
          <Button
            onClick={onAddCards}
            disabled={disabled}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Add Cards</span>
          </Button>

          {/* Right Section - Page Navigation */}
          {pageNavigation && (
            <>
              {/* Divider */}
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

              <div className="flex items-center">{pageNavigation}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomToolbar;
