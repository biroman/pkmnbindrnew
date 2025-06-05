import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import DraggableCardSlot from "./DraggableCardSlot";
import BinderCardSlot from "./BinderCardSlot";
import { parseGridSize } from "../../utils/gridUtils";
import { getPageAndSlotFromSlotNumber } from "../../utils/slotAssignment";
import {
  parseDragId,
  validateCardMove,
  moveCardToSlot,
  swapCards,
} from "../../utils/cardMovement";
import { useParams } from "react-router-dom";
import { usePendingChanges } from "../../hooks/usePendingChanges";

/**
 * BinderGrid - Flexible grid component for Pokemon card binder with drag and drop
 * @param {Object} gridDimensions - Grid dimensions object from useGridDimensions hook
 * @param {string} gridSize - Grid size string like "3x3", "4x3", etc.
 * @param {Function} onAddCard - Callback function when a card slot is clicked
 * @param {number} startingSlot - Starting slot number (for dual-page layouts)
 * @param {string} pageType - Type of page ("left", "right", or "single")
 * @param {Array} savedCards - Array of saved cards from Firebase for this page
 * @param {Array} allCards - All cards in the binder (for drag validation)
 * @param {Function} onCardMove - Callback for successful card moves
 * @param {boolean} isDragEnabled - Whether drag and drop is enabled
 */
const BinderGrid = ({
  gridDimensions,
  gridSize = "3x3",
  onAddCard,
  startingSlot = 1,
  pageType = "single",
  savedCards = [],
  allCards = [],
  onCardMove,
  isDragEnabled = true,
  ...props
}) => {
  const { binderId } = useParams();
  const { pendingCards } = usePendingChanges(binderId);
  const [activeId, setActiveId] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  const { cols, rows, totalSlots } = parseGridSize(gridSize);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Create array for dynamic grid slots
  const gridSlots = Array.from(
    { length: totalSlots },
    (_, index) => startingSlot + index
  );

  // Function to get saved card for a specific slot
  const getSavedCardForSlot = useCallback(
    (slot) => {
      // Convert the overall slot number to page and slot position
      const { pageNumber, slotInPage } = getPageAndSlotFromSlotNumber(
        slot,
        gridSize
      );

      return (
        savedCards.find(
          (card) =>
            card.pageNumber === pageNumber && card.slotInPage === slotInPage
        ) || null
      );
    },
    [savedCards, gridSize]
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

  // Handle drag end
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

      // Validate the move
      const validation = validateCardMove(sourceInfo, targetInfo, allCards);

      if (!validation.isValid) {
        console.warn("Invalid move:", validation.reason);
        return;
      }

      setIsMoving(true);

      try {
        let result;

        if (validation.action === "move") {
          // Move card to empty slot
          result = moveCardToSlot(
            binderId,
            validation.sourceCard,
            targetInfo.slot,
            gridSize
          );
        } else if (validation.action === "swap") {
          // Swap cards
          result = swapCards(
            binderId,
            validation.sourceCard,
            validation.targetCard,
            sourceInfo.slot,
            targetInfo.slot,
            gridSize
          );
        }

        if (result?.success) {
          console.log("Card move successful (saved locally):", result);

          // Force immediate UI update by dispatching custom event
          window.dispatchEvent(
            new CustomEvent("cardMoved", {
              detail: { binderId, result },
            })
          );

          // Call the callback to trigger save button
          if (onCardMove) {
            onCardMove(result);
          }
        } else {
          console.error("Card move failed:", result?.error);
        }
      } catch (error) {
        console.error("Error during card move:", error);
      } finally {
        setIsMoving(false);
      }
    },
    [allCards, binderId, gridSize, onCardMove]
  );

  // Check if a card is pending (and thus should not be draggable)
  const isCardPending = useCallback(
    (card) => {
      if (!card) return false;
      return pendingCards.some(
        (pendingCard) =>
          pendingCard.pageNumber === card.pageNumber &&
          pendingCard.slotInPage === card.slotInPage
      );
    },
    [pendingCards]
  );

  const activeCard = getActiveCard();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      disabled={!isDragEnabled || isMoving}
    >
      <div className="flex flex-col items-center justify-center h-full p-2">
        {/* Grid container */}
        <div
          className="grid group"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            width: `${gridDimensions.gridWidth}px`,
            height: `${gridDimensions.gridHeight}px`,
            gap: `${gridDimensions.gap}px`,
            maxWidth: "95vw",
            maxHeight: "95vh",
          }}
        >
          {gridSlots.map((slot) => {
            const savedCard = getSavedCardForSlot(slot);
            const isPending = isCardPending(savedCard);

            return (
              <DraggableCardSlot
                key={slot}
                slot={slot}
                cardWidth={gridDimensions.cardWidth}
                cardHeight={gridDimensions.cardHeight}
                onAddCard={onAddCard}
                savedCard={savedCard}
                gridSize={gridSize}
                pageType={pageType}
                startingSlot={startingSlot}
                isDragDisabled={isPending || isMoving}
                {...props}
              />
            );
          })}
        </div>

        {/* Loading overlay for when moving cards */}
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

      {/* Drag overlay */}
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
              pageType={pageType}
              startingSlot={startingSlot}
              onAddCard={() => {}} // No-op for overlay
              {...props}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default BinderGrid;
