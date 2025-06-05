import { useState, useRef, useEffect } from "react";
import BinderGrid from "./BinderGrid";
import { parseGridSize } from "../../utils/gridUtils";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui";

/**
 * BinderSpread - Two-page spread component that mimics a real binder
 * Page 1: Cover page (left, empty) + Page 1 (right, with slots)
 * Page 2+: Normal two-page spreads (left + right with slots)
 * @param {Object} gridDimensions - Grid dimensions from useGridDimensions
 * @param {string} gridSize - Grid size string like "3x3", "4x3", etc.
 * @param {number} currentPage - Current page being viewed
 * @param {number} totalPages - Total number of pages in binder
 * @param {Function} onAddCard - Callback when a card slot is clicked
 * @param {Function} onPreviousPage - Callback for previous page navigation
 * @param {Function} onNextPage - Callback for next page navigation
 * @param {Function} onAddPage - Callback for adding a new page
 * @param {Function} onDeletePage - Callback for deleting current page
 * @param {boolean} canGoPrevious - Whether previous navigation is available
 * @param {boolean} canGoNext - Whether next navigation is available
 * @param {boolean} isAtPageLimit - Whether the user is at their page limit
 * @param {string} limitReason - Reason why page limit exists (for tooltip)
 * @param {number} maxPages - Maximum pages allowed
 * @param {Array} cardsOnPage1 - Cards for the first/left page
 * @param {Array} cardsOnPage2 - Cards for the second/right page
 */
const BinderSpread = ({
  gridDimensions,
  gridSize = "3x3",
  currentPage = 1,
  totalPages = 10,
  onAddCard,
  onPreviousPage,
  onNextPage,
  onAddPage,
  onDeletePage,
  canGoPrevious = false,
  canGoNext = false,
  isAtPageLimit = false,
  limitReason = "",
  maxPages = null,
  cardsOnPage1 = [],
  cardsOnPage2 = [],
  allCards = [], // All cards for drag validation
  onCardMove, // Callback for card moves
  isDragEnabled = true, // Whether drag and drop is enabled
  ...props
}) => {
  const { totalSlots } = parseGridSize(gridSize);
  const leftPageRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(0);

  // Mobile page state (which page to show: "left" or "right")
  const [mobilePage, setMobilePage] = useState("right"); // Default to right for page 1

  // Hold-to-delete state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Calculate the actual page height for binding
  useEffect(() => {
    if (leftPageRef.current) {
      const height = leftPageRef.current.offsetHeight;
      setPageHeight(height);
    }
  }, [gridDimensions, currentPage]);

  // For page 1, default to showing the right side (actual content) - MOVED OUTSIDE CONDITIONAL BLOCK
  useEffect(() => {
    if (currentPage === 1 && gridDimensions.isMobile) {
      setMobilePage("right");
    }
  }, [currentPage, gridDimensions.isMobile]);

  // Cleanup hold timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Hold-to-delete functions
  const startHoldToDelete = () => {
    console.log("Starting hold to delete for page:", currentPage);
    setIsHolding(true);
    setHoldProgress(0);

    // Progress animation (update every 50ms for smooth animation)
    progressIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const newProgress = prev + (50 / 1000) * 100; // 50ms steps over 1000ms = 5% per step
        return Math.min(newProgress, 100);
      });
    }, 50);

    // Delete after 1 second
    holdTimerRef.current = setTimeout(() => {
      console.log("Hold complete, deleting page:", currentPage);
      if (onDeletePage) {
        onDeletePage(currentPage);
      }
      cancelHoldToDelete();
    }, 1000);
  };

  const cancelHoldToDelete = () => {
    console.log("Canceling hold to delete");
    setIsHolding(false);
    setHoldProgress(0);

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Calculate page layout based on page structure
  const getPageLayout = (page) => {
    if (page === 1) {
      // Page 1: Empty cover (left) + Page 1 content (right)
      return {
        showCoverPage: true,
        leftSide: { type: "cover", isEmpty: true, pageNumber: 0 },
        rightSide: {
          type: "content",
          isEmpty: false,
          pageNumber: 1,
          startingSlot: 1,
        },
      };
    } else {
      // Page 2+: Normal spreads with content on both sides
      const slotsPerPage = totalSlots;
      const leftPageNumber = (page - 2) * 2 + 2; // Pages 2, 4, 6, 8...
      const rightPageNumber = leftPageNumber + 1; // Pages 3, 5, 7, 9...
      const baseSlotOffset = slotsPerPage; // Skip the first page's slots

      return {
        showCoverPage: false,
        leftSide: {
          type: "content",
          isEmpty: false,
          pageNumber: leftPageNumber,
          startingSlot:
            baseSlotOffset + (leftPageNumber - 2) * slotsPerPage + 1,
        },
        rightSide: {
          type: "content",
          isEmpty: false,
          pageNumber: rightPageNumber,
          startingSlot:
            baseSlotOffset + (rightPageNumber - 2) * slotsPerPage + 1,
        },
      };
    }
  };

  const pageLayout = getPageLayout(currentPage);

  // Calculate binding height based on grid + padding to match page content exactly
  const getBindingHeight = () => {
    // Use measured page height if available, otherwise calculate from grid dimensions
    if (pageHeight) {
      return pageHeight;
    }

    // Calculate height to match BinderGrid container:
    // - Grid height + padding (p-2 = 8px top + 8px bottom = 16px total)
    // - Add some extra space for visual balance
    return gridDimensions.gridHeight + 32; // 16px padding + 16px extra space
  };

  const bindingHeight = getBindingHeight();

  if (gridDimensions.isMobile) {
    // Mobile: Show only one side at a time
    const showPageSelector =
      !pageLayout.showCoverPage || !pageLayout.leftSide.isEmpty;
    const currentSide =
      mobilePage === "left" ? pageLayout.leftSide : pageLayout.rightSide;

    return (
      <div className="flex-1 h-full overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Mobile Page Navigation */}
          {showPageSelector && (
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobilePage("left")}
                disabled={mobilePage === "left" || pageLayout.leftSide.isEmpty}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">
                  {pageLayout.leftSide.isEmpty
                    ? "Cover"
                    : `Page ${pageLayout.leftSide.pageNumber}`}
                </span>
              </Button>

              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {currentSide.isEmpty
                  ? "Cover Page"
                  : `Page ${currentSide.pageNumber}`}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobilePage("right")}
                disabled={mobilePage === "right"}
                className="flex items-center space-x-1"
              >
                <span className="text-xs">
                  Page {pageLayout.rightSide.pageNumber}
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Single Page Content */}
          <div className="flex-1 min-h-0 bg-white dark:bg-gray-800">
            {currentSide.isEmpty ? (
              <CoverPageContent gridDimensions={gridDimensions} />
            ) : (
              <BinderGrid
                gridDimensions={gridDimensions}
                gridSize={gridSize}
                startingSlot={currentSide.startingSlot}
                onAddCard={onAddCard}
                pageType={mobilePage}
                savedCards={mobilePage === "left" ? cardsOnPage1 : cardsOnPage2}
                {...props}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Show both sides
  return (
    <div className="flex-1 h-full overflow-hidden">
      <div className="h-full flex items-center justify-center p-4">
        <div
          className="relative flex items-center"
          style={{ width: `${gridDimensions.totalWidth}px` }}
        >
          {/* Page Navigation - Left */}
          {onPreviousPage && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onPreviousPage}
              disabled={!canGoPrevious}
              className="absolute -left-16 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:scale-110 disabled:hover:scale-100 transition-all duration-200 disabled:opacity-50 z-10"
              title="Previous Page"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Page Navigation - Right */}
          {(onNextPage || onAddPage) && (
            <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 z-50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={currentPage >= totalPages ? "default" : "ghost"}
                      size="lg"
                      onClick={
                        currentPage >= totalPages ? onAddPage : onNextPage
                      }
                      disabled={
                        currentPage >= totalPages ? isAtPageLimit : !canGoNext
                      }
                      className={`h-12 w-12 p-0 backdrop-blur-xl rounded-full shadow-lg border transition-all duration-200 ${
                        currentPage >= totalPages
                          ? isAtPageLimit
                            ? "!bg-gray-400 !text-gray-600 !border-gray-300 cursor-not-allowed" // Disabled state
                            : "!bg-blue-500 hover:!bg-blue-600 dark:!bg-blue-500 dark:hover:!bg-blue-600 !text-white !border-blue-400 dark:!border-blue-400 hover:scale-110" // Active state
                          : !canGoNext
                          ? "bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 disabled:opacity-50 disabled:hover:scale-100"
                          : "bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 hover:scale-110"
                      }`}
                      title={
                        currentPage >= totalPages
                          ? isAtPageLimit
                            ? `Page limit reached (${totalPages}/${maxPages})`
                            : "Add New Page"
                          : "Next Page"
                      }
                    >
                      {currentPage >= totalPages ? (
                        isAtPageLimit ? (
                          <Lock className="h-6 w-6" />
                        ) : (
                          <Plus className="h-6 w-6" />
                        )
                      ) : (
                        <ChevronRight className="h-6 w-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  {currentPage >= totalPages && isAtPageLimit && (
                    <TooltipContent
                      side="left"
                      sideOffset={8}
                      className="max-w-xs p-3 bg-gray-900 text-white border border-gray-700 shadow-xl z-[9999]"
                    >
                      <div className="space-y-2">
                        <p className="font-medium text-sm">
                          Page limit reached
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {limitReason ||
                            "You've reached the maximum number of pages for this binder."}
                        </p>
                        {maxPages && (
                          <div className="flex items-center justify-between pt-1 mt-2 border-t border-gray-700">
                            <span className="text-xs text-gray-400">
                              Pages:
                            </span>
                            <span className="text-xs text-blue-300 font-medium">
                              {totalPages}/{maxPages}
                            </span>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Delete Page Button */}
          {onDeletePage && totalPages > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={startHoldToDelete}
              onMouseUp={cancelHoldToDelete}
              onMouseLeave={cancelHoldToDelete}
              onTouchStart={startHoldToDelete}
              onTouchEnd={cancelHoldToDelete}
              className={`absolute -right-14 top-1/2 mt-8 h-8 w-8 p-0 backdrop-blur-xl rounded-full shadow-md border transition-all duration-200 hover:scale-110 z-10 ${
                isHolding
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-400"
                  : "bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-800"
              }`}
              title={`Hold to Delete Page ${currentPage}`}
            >
              {/* Progress Ring */}
              {isHolding && (
                <div className="absolute inset-0 rounded-full">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 32 32"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeOpacity="0.3"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 14 * (1 - holdProgress / 100)
                      }`}
                      className="transition-all duration-75 ease-linear"
                    />
                  </svg>
                </div>
              )}
              <Trash2 className="h-4 w-4 relative z-10" />
            </Button>
          )}

          {/* Left Side */}
          <div
            ref={leftPageRef}
            className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-l-lg shadow-lg border border-gray-200 dark:border-gray-700"
            style={{ width: `${gridDimensions.pageWidth}px` }}
          >
            {pageLayout.leftSide.isEmpty ? (
              <CoverPageContent gridDimensions={gridDimensions} />
            ) : (
              <BinderGrid
                gridDimensions={gridDimensions}
                gridSize={gridSize}
                startingSlot={pageLayout.leftSide.startingSlot}
                onAddCard={onAddCard}
                pageType="left"
                savedCards={cardsOnPage1}
                allCards={allCards}
                onCardMove={onCardMove}
                isDragEnabled={isDragEnabled}
                {...props}
              />
            )}
          </div>

          {/* Binding (center spine) */}
          <div
            className="flex-shrink-0 bg-gray-200 dark:bg-gray-900 border-y border-gray-300 dark:border-gray-600 relative"
            style={{
              width: `${gridDimensions.bindingWidth}px`,
              height: `${bindingHeight}px`,
            }}
          >
            {/* Binding rings/holes - scale count based on height */}
            <div className="absolute inset-0 flex flex-col justify-evenly items-center py-4">
              {Array.from(
                { length: Math.max(3, Math.floor(bindingHeight / 100)) },
                (_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 border border-gray-500 dark:border-gray-400"
                  />
                )
              )}
            </div>
          </div>

          {/* Right Side */}
          <div
            className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-r-lg shadow-lg border border-gray-200 dark:border-gray-700"
            style={{ width: `${gridDimensions.pageWidth}px` }}
          >
            {pageLayout.rightSide.isEmpty ? (
              <CoverPageContent gridDimensions={gridDimensions} />
            ) : (
              <BinderGrid
                gridDimensions={gridDimensions}
                gridSize={gridSize}
                startingSlot={pageLayout.rightSide.startingSlot}
                onAddCard={onAddCard}
                pageType="right"
                savedCards={currentPage === 1 ? cardsOnPage1 : cardsOnPage2}
                allCards={allCards}
                onCardMove={onCardMove}
                isDragEnabled={isDragEnabled}
                {...props}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Cover Page Component - Empty page for tips/tricks later
const CoverPageContent = ({ gridDimensions }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-2">
      {/* Container that matches grid dimensions exactly */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: `${gridDimensions.gridWidth}px`,
          height: `${gridDimensions.gridHeight}px`,
          maxWidth: "95vw",
          maxHeight: "95vh",
        }}
      >
        <div className="max-w-sm text-center">
          <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Pokemon Binder
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This cover page is reserved for future tips and tricks to help you
            organize your collection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BinderSpread;
