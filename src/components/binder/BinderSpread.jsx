import { useState, useRef, useEffect, useCallback } from "react";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import BinderCardSlot from "./BinderCardSlot";
import {
  parseDragId,
  validateCardMove,
  moveCardToSlot,
  swapCards,
} from "../../utils/cardMovement";

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

  // Cross-page drag and drop state
  const [activeId, setActiveId] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get card being dragged for overlay
  const getActiveCard = useCallback(() => {
    if (!activeId) return null;
    const dragInfo = parseDragId(activeId);
    if (dragInfo.type === "card") {
      return allCards.find((card) => card.id === dragInfo.cardId);
    }
    return null;
  }, [activeId, allCards]);

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  // Handle drag end with cross-page support
  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over || !active || active.id === over.id) {
        return; // No valid drop or dropped on same slot
      }

      const sourceInfo = parseDragId(active.id);
      const targetInfo = {
        slot: over.data.current.slot,
        type: over.data.current.type,
        cardId: over.data.current.cardId,
      };

      // Get fresh card data right before validation to include newly added cards
      const freshCards = allCards.length > 0 ? allCards : [];

      // Also try to get cards from saved cards if allCards is stale
      const combinedCards = [...freshCards];
      [...cardsOnPage1, ...cardsOnPage2].forEach((card) => {
        if (!combinedCards.find((c) => c.id === card.id)) {
          combinedCards.push(card);
        }
      });

      // Validate the move with the most up-to-date card data
      const validation = validateCardMove(
        sourceInfo,
        targetInfo,
        combinedCards,
        props.binderId
      );

      if (!validation.isValid) {
        console.warn("Invalid cross-page move:", validation.reason);
        console.log(
          "Available cards for validation:",
          combinedCards.map((c) => c.id)
        );
        console.log("Looking for card ID:", sourceInfo.cardId);
        return;
      }

      setIsMoving(true);

      try {
        let result;

        if (validation.action === "move") {
          // Move card to empty slot
          result = moveCardToSlot(
            props.binderId,
            validation.sourceCard,
            targetInfo.slot,
            gridSize
          );
        } else if (validation.action === "swap") {
          // Swap cards
          result = swapCards(
            props.binderId,
            validation.sourceCard,
            validation.targetCard,
            sourceInfo.slot,
            targetInfo.slot,
            gridSize
          );
        }

        if (result?.success) {
          console.log("Cross-page card move successful:", result);

          // Force immediate UI update by dispatching custom event
          window.dispatchEvent(
            new CustomEvent("localBinderUpdate", {
              detail: { binderId: props.binderId, type: "cardMove", result },
            })
          );

          // Call the callback to trigger save button
          if (onCardMove) {
            onCardMove(result);
          }
        } else {
          console.error("Cross-page card move failed:", result?.error);
        }
      } catch (error) {
        console.error("Error during cross-page card move:", error);
      } finally {
        setIsMoving(false);
      }
    },
    [allCards, cardsOnPage1, cardsOnPage2, gridSize, onCardMove, props.binderId]
  );

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

  const startHoldToDelete = () => {
    if (isHolding) return;

    setIsHolding(true);
    setHoldProgress(0);

    holdTimerRef.current = setTimeout(() => {
      onDeletePage(currentPage);
      setIsHolding(false);
      setHoldProgress(0);
    }, 2000);

    progressIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const newProgress = prev + 2; // 2% per 40ms = 100% in 2 seconds
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 40);
  };

  const cancelHoldToDelete = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const getPageLayout = (page) => {
    if (page === 1) {
      // Page 1: Empty cover on left, page 1 content on right
      return {
        leftSide: {
          isEmpty: true,
          pageNumber: null,
          startingSlot: null,
        },
        rightSide: {
          isEmpty: false,
          pageNumber: 1,
          startingSlot: 1,
        },
        showCoverPage: true,
      };
    } else {
      // Other pages: left page (even-1), right page (even)
      const leftPageNumber = (page - 1) * 2;
      const rightPageNumber = leftPageNumber + 1;

      return {
        leftSide: {
          isEmpty: false,
          pageNumber: leftPageNumber,
          startingSlot: (leftPageNumber - 1) * totalSlots + 1,
        },
        rightSide: {
          isEmpty: false,
          pageNumber: rightPageNumber,
          startingSlot: (rightPageNumber - 1) * totalSlots + 1,
        },
        showCoverPage: false,
      };
    }
  };

  const pageLayout = getPageLayout(currentPage);
  const bindingHeight = getBindingHeight();

  // Get active card for overlay
  const activeCard = getActiveCard();

  // Mobile view with single page
  if (gridDimensions.isMobile) {
    // Determine which side to show
    const currentSide =
      mobilePage === "left" ? pageLayout.leftSide : pageLayout.rightSide;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        disabled={!isDragEnabled || isMoving}
      >
        <div className="flex-1 h-full overflow-hidden">
          <div className="h-full flex flex-col items-center justify-center p-4">
            {/* Mobile Page Toggle */}
            {currentPage !== 1 && (
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  variant={mobilePage === "left" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMobilePage("left")}
                  className="text-xs"
                >
                  Left
                </Button>
                <Button
                  variant={mobilePage === "right" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMobilePage("right")}
                  className="text-xs"
                >
                  Right
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
                  savedCards={
                    mobilePage === "left" ? cardsOnPage1 : cardsOnPage2
                  }
                  allCards={allCards}
                  onCardMove={onCardMove}
                  isDragEnabled={isDragEnabled && !isMoving}
                  isControlledByParent={true}
                  {...props}
                />
              )}
            </div>
          </div>

          {/* Loading overlay for mobile */}
          {isMoving && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Moving card...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drag overlay for mobile */}
        <DragOverlay>
          {activeCard ? (
            <div
              className="transform rotate-6 scale-110 shadow-2xl"
              style={{
                width: `${gridDimensions.cardWidth}px`,
                height: `${gridDimensions.cardHeight}px`,
              }}
            >
              <BinderCardSlot
                slot={0} // Dummy slot for overlay
                cardWidth={gridDimensions.cardWidth}
                cardHeight={gridDimensions.cardHeight}
                savedCard={activeCard}
                gridSize={gridSize}
                pageType="overlay"
                startingSlot={1}
                onAddCard={() => {}} // No-op for overlay
                {...props}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  // Desktop: Show both sides with cross-page dragging
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      disabled={!isDragEnabled || isMoving}
    >
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
            {onNextPage && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={
                        currentPage >= totalPages ? onAddPage : onNextPage
                      }
                      disabled={
                        (!canGoNext && currentPage < totalPages) ||
                        (currentPage >= totalPages && isAtPageLimit)
                      }
                      className="absolute -right-16 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:scale-110 disabled:hover:scale-100 transition-all duration-200 disabled:opacity-50 z-10"
                      title={
                        currentPage >= totalPages
                          ? isAtPageLimit
                            ? "Page limit reached"
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
                  isDragEnabled={isDragEnabled && !isMoving}
                  isControlledByParent={true}
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
                  isDragEnabled={isDragEnabled && !isMoving}
                  isControlledByParent={true}
                  {...props}
                />
              )}
            </div>
          </div>

          {/* Loading overlay for desktop */}
          {isMoving && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Moving card...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drag overlay for desktop */}
        <DragOverlay>
          {activeCard ? (
            <div
              className="transform rotate-6 scale-110 shadow-2xl"
              style={{
                width: `${gridDimensions.cardWidth}px`,
                height: `${gridDimensions.cardHeight}px`,
              }}
            >
              <BinderCardSlot
                slot={0} // Dummy slot for overlay
                cardWidth={gridDimensions.cardWidth}
                cardHeight={gridDimensions.cardHeight}
                savedCard={activeCard}
                gridSize={gridSize}
                pageType="overlay"
                startingSlot={1}
                onAddCard={() => {}} // No-op for overlay
                {...props}
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
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
