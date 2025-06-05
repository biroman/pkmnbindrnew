import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import BinderCardSlot from "./BinderCardSlot";
import { generateDragId } from "../../utils/cardMovement";

/**
 * DraggableCardSlot - Wraps BinderCardSlot with drag and drop functionality
 * @param {number} slot - Slot number (overall slot position)
 * @param {number} cardWidth - Width of the card slot in pixels
 * @param {number} cardHeight - Height of the card slot in pixels
 * @param {Function} onAddCard - Callback function when slot is clicked
 * @param {Object} savedCard - Card from Firebase (if any)
 * @param {string} gridSize - Grid size for calculations
 * @param {string} pageType - Type of page ("left", "right", etc.)
 * @param {number} startingSlot - Starting slot for this page
 * @param {boolean} isDragDisabled - Whether dragging is disabled (for pending cards)
 */
const DraggableCardSlot = ({
  slot,
  cardWidth,
  cardHeight,
  onAddCard,
  savedCard,
  gridSize = "3x3",
  pageType = "single",
  startingSlot = 1,
  isDragDisabled = false,
  ...props
}) => {
  // Determine if this slot has a card and if it should be draggable
  const hasCard = savedCard != null;
  const canDrag = hasCard && !isDragDisabled;

  // Generate unique IDs for drag and drop
  const dragId = generateDragId(slot, savedCard);
  const dropId = `drop-${slot}`;

  // Set up draggable for cards
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDragNodeRef,
    transform: dragTransform,
    isDragging,
  } = useDraggable({
    id: dragId,
    disabled: !canDrag,
    data: {
      type: hasCard ? "card" : "empty",
      slot,
      card: savedCard,
      cardId: savedCard?.id,
    },
  });

  // Set up droppable for all slots
  const {
    setNodeRef: setDropNodeRef,
    isOver,
    active,
  } = useDroppable({
    id: dropId,
    data: {
      type: hasCard ? "card" : "empty",
      slot,
      card: savedCard,
      cardId: savedCard?.id,
    },
  });

  // Combine refs for drag and drop
  const setRefs = (element) => {
    setDragNodeRef(element);
    setDropNodeRef(element);
  };

  // Apply drag transform
  const style = {
    transform: CSS.Translate.toString(dragTransform),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    cursor: canDrag ? "grab" : "default",
  };

  // Determine if we're being dragged over by a valid card
  const isDraggedOver = isOver && active?.data?.current?.type === "card";
  const isValidDropTarget =
    isDraggedOver && active?.data?.current?.slot !== slot;

  // Handle click for adding cards (only when slot is empty)
  const handleClick = () => {
    if (!hasCard && onAddCard) {
      onAddCard(slot);
    }
  };

  return (
    <div
      ref={setRefs}
      style={style}
      {...(canDrag ? dragAttributes : {})}
      {...(canDrag ? dragListeners : {})}
      className={`
        relative transition-all duration-200
        ${isDragging ? "scale-105 shadow-2xl rotate-3" : ""}
        ${
          isValidDropTarget
            ? "ring-4 ring-blue-500 ring-opacity-75 scale-105"
            : ""
        }
        ${
          isDraggedOver && !isValidDropTarget
            ? "ring-2 ring-red-500 ring-opacity-50"
            : ""
        }
      `}
    >
      {/* Drop indicator overlay */}
      {isValidDropTarget && (
        <div className="absolute inset-0 bg-blue-500/20 rounded-lg border-4 border-blue-500 border-dashed z-10 pointer-events-none" />
      )}

      {/* The actual card slot */}
      <BinderCardSlot
        slot={slot}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        onAddCard={handleClick}
        savedCard={savedCard}
        gridSize={gridSize}
        pageType={pageType}
        startingSlot={startingSlot}
        {...props}
      />

      {/* Drag handle indicator for cards */}
      {canDrag && !isDragging && (
        <div className="absolute top-2 left-2 opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/70 text-white rounded px-2 py-1 text-xs font-medium pointer-events-none z-20">
          Drag to move
        </div>
      )}

      {/* Disabled drag indicator for pending cards */}
      {hasCard && isDragDisabled && (
        <div className="absolute top-2 left-2 bg-yellow-500/90 text-black rounded px-2 py-1 text-xs font-medium pointer-events-none">
          Save to drag
        </div>
      )}
    </div>
  );
};

export default DraggableCardSlot;
