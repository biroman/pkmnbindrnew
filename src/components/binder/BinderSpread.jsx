import { useState, useRef, useEffect } from "react";
import BinderGrid from "./BinderGrid";
import { parseGridSize } from "../../utils/gridUtils";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "../ui";

/**
 * BinderSpread - Two-page spread component that mimics a real binder
 * Page 1: Cover page (left, empty) + Page 1 (right, with slots)
 * Page 2+: Normal two-page spreads (left + right with slots)
 * @param {Object} gridDimensions - Grid dimensions from useGridDimensions
 * @param {string} gridSize - Grid size string like "3x3", "4x3", etc.
 * @param {number} currentPage - Current page being viewed
 * @param {Function} onAddCard - Callback when a card slot is clicked
 */
const BinderSpread = ({
  gridDimensions,
  gridSize = "3x3",
  currentPage = 1,
  onAddCard,
  ...props
}) => {
  const { totalSlots } = parseGridSize(gridSize);
  const leftPageRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(0);

  // Mobile page state (which page to show: "left" or "right")
  const [mobilePage, setMobilePage] = useState("right"); // Default to right for page 1

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
          className="flex items-center"
          style={{ width: `${gridDimensions.totalWidth}px` }}
        >
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
