import { ChevronLeft, ChevronRight, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "../ui";

/**
 * BinderNavigation - Controls for navigating through binder pages
 * @param {number} currentPageSpread - Current page spread number (1 = pages 1-2, 2 = pages 3-4, etc.)
 * @param {number} totalPageSpreads - Total number of page spreads in binder
 * @param {Function} onPageChange - Callback when page changes
 * @param {boolean} disabled - Whether navigation is disabled
 * @param {boolean} isMobile - Whether in mobile mode (single page view)
 */
const BinderNavigation = ({
  currentPageSpread = 1,
  totalPageSpreads = 1,
  onPageChange,
  disabled = false,
  isMobile = false,
}) => {
  const canGoBack = currentPageSpread > 1;
  const canGoForward = currentPageSpread < totalPageSpreads;

  const handlePrevious = () => {
    if (canGoBack && onPageChange) {
      onPageChange(currentPageSpread - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward && onPageChange) {
      onPageChange(currentPageSpread + 1);
    }
  };

  // Calculate page display text based on mobile/desktop mode
  const getPageDisplayText = () => {
    if (isMobile) {
      return `Spread ${currentPageSpread} of ${totalPageSpreads}`;
    } else {
      return `Pages ${(currentPageSpread - 1) * 2 + 1}-${
        currentPageSpread * 2
      } of ${totalPageSpreads * 2}`;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Previous Page */}
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={disabled || !canGoBack}
        className="flex items-center space-x-2"
      >
        <RotateCcw className="h-4 w-4" />
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Page Indicator */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getPageDisplayText()}
          {isMobile && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
              (Single page mode)
            </span>
          )}
        </div>

        {/* Page Dots Indicator */}
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(totalPageSpreads, 5) }, (_, i) => {
            const pageSpread = i + 1;
            const isActive = pageSpread === currentPageSpread;

            return (
              <button
                key={pageSpread}
                onClick={() => onPageChange && onPageChange(pageSpread)}
                disabled={disabled}
                className={`w-2 h-2 rounded-full transition-colors ${
                  isActive
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to page spread ${pageSpread}`}
              />
            );
          })}
          {totalPageSpreads > 5 && (
            <span className="text-xs text-gray-400">...</span>
          )}
        </div>
      </div>

      {/* Next Page */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={disabled || !canGoForward}
        className="flex items-center space-x-2"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BinderNavigation;
