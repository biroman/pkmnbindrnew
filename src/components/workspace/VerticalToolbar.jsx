import {
  Undo2,
  Redo2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  History,
  LayoutGrid,
} from "lucide-react";
import { Button } from "../ui";

/**
 * VerticalToolbar - Left-side floating vertical toolbar with core actions
 * Follows Photoshop/Figma design tool pattern
 * @param {Function} onUndo - Undo action handler
 * @param {Function} onRedo - Redo action handler
 * @param {Function} onToggleHistoryPanel - Handler to toggle the history panel
 * @param {Function} onToggleOverviewMode - Handler to toggle the binder overview mode
 * @param {boolean} isOverviewModeActive - Whether overview mode is currently active
 * @param {Function} onAddCards - Add cards action handler
 * @param {Function} onClipboard - Clipboard action handler
 * @param {Function} onPreviousPage - Previous page handler
 * @param {Function} onNextPage - Next page handler
 * @param {boolean} canUndo - Whether undo is available
 * @param {boolean} canRedo - Whether redo is available
 * @param {boolean} canGoPrevious - Whether previous page is available
 * @param {boolean} canGoNext - Whether next page is available
 * @param {boolean} disabled - Whether all actions are disabled
 */
const VerticalToolbar = ({
  onUndo,
  onRedo,
  onToggleHistoryPanel,
  onToggleOverviewMode,
  isOverviewModeActive,
  onAddCards,
  onClipboard,
  onPreviousPage,
  onNextPage,
  canUndo = false,
  canRedo = false,
  canGoPrevious = false,
  canGoNext = false,
  disabled = false,
}) => {
  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 px-2">
      <div className="flex flex-col items-center justify-center gap-2">
        {/* History Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={disabled || !canUndo}
          className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
            canUndo
              ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110"
              : "opacity-50"
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={disabled || !canRedo}
          className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
            canRedo
              ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110"
              : "opacity-50"
          }`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-5 w-5" />
        </Button>

        {/* History Panel Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleHistoryPanel}
          disabled={disabled}
          className="h-10 w-10 p-0 rounded-xl transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110"
          title="View Edit History"
        >
          <History className="h-5 w-5" />
        </Button>

        {/* Divider */}
        <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 my-1"></div>

        {/* Overview Mode Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleOverviewMode}
          className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 hover:scale-110 
            ${
              isOverviewModeActive
                ? "bg-teal-100 dark:bg-teal-700 text-teal-700 dark:text-teal-200"
                : "hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400"
            }`}
          title="Toggle Page Overview"
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>

        {/* Divider */}
        <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 my-1"></div>

        {/* Add Cards Action */}
        <Button
          onClick={onAddCards}
          disabled={disabled}
          className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
          title="Add Cards"
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Clipboard Action */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClipboard}
          disabled={disabled}
          className="h-10 w-10 p-0 rounded-xl transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110"
          title="Clipboard"
        >
          <Clipboard className="h-5 w-5" />
        </Button>

        {/* Divider */}
        <div className="w-6 h-px bg-gray-300 dark:bg-gray-600 my-1"></div>

        {/* Page Navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreviousPage}
          disabled={disabled || !canGoPrevious}
          className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
            canGoPrevious
              ? "hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:scale-110"
              : "opacity-50"
          }`}
          title="Previous Page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNextPage}
          disabled={disabled || !canGoNext}
          className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
            canGoNext
              ? "hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:scale-110"
              : "opacity-50"
          }`}
          title="Next Page"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VerticalToolbar;
