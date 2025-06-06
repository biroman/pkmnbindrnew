import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { parseGridSize } from "../../utils/gridUtils";

const PageThumbnail = ({
  id,
  pageNumber,
  isActive,
  cards = [],
  gridSize = "3x3",
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const { cols, rows, totalSlots } = parseGridSize(gridSize);

  // Filter cards for this specific page
  const pageCards = cards.filter((card) => card.pageNumber === pageNumber);
  const cardCount = pageCards.length;

  // Create a mini grid representation
  const renderMiniGrid = () => {
    const slots = Array.from({ length: totalSlots }, (_, index) => {
      const slotNumber = index + 1;
      const cardInSlot = pageCards.find(
        (card) => card.slotInPage === slotNumber
      );

      return (
        <div
          key={slotNumber}
          className={`
            aspect-[2/3] rounded border overflow-hidden
            ${
              cardInSlot
                ? "border-blue-300 shadow-sm"
                : "bg-gray-200 dark:bg-gray-500 border-gray-300 dark:border-gray-400"
            }
          `}
          style={{
            minWidth: "24px",
            minHeight: "36px",
          }}
        >
          {cardInSlot ? (
            <img
              src={cardInSlot.images?.small || cardInSlot.image}
              alt={cardInSlot.name || "Pokemon Card"}
              className="w-full h-full object-cover transition-opacity duration-200 hover:opacity-90"
              loading="lazy"
              onError={(e) => {
                // Fallback to a colored rectangle if image fails to load
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
          ) : null}
          {cardInSlot && (
            <div
              className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded hidden"
              style={{ display: "none" }}
            />
          )}
        </div>
      );
    });

    return (
      <div
        className="grid gap-1.5 w-full max-w-[120px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {slots}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        aspect-[2/3] 
        bg-white dark:bg-gray-700 
        rounded-lg 
        flex flex-col items-center justify-between
        text-gray-700 dark:text-gray-200 
        shadow-lg 
        border-2
        ${isDragging ? "shadow-2xl scale-105" : "hover:shadow-xl"}
        ${
          isActive && !isDragging
            ? "border-blue-500 ring-2 ring-blue-500"
            : "border-gray-300 dark:border-gray-600"
        }
        ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        p-3
        transition-all duration-200
      `}
      aria-label={`Page ${pageNumber} with ${cardCount} cards`}
    >
      {/* Page number at top */}
      <div className="text-xs font-bold text-gray-500 dark:text-gray-400 select-none">
        {pageNumber}
      </div>

      {/* Mini grid preview in the middle */}
      <div className="flex-1 flex items-center justify-center w-full px-1">
        {cardCount > 0 ? (
          renderMiniGrid()
        ) : (
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Empty
          </div>
        )}
      </div>

      {/* Card count at bottom */}
      <div className="text-xs text-gray-500 dark:text-gray-400 select-none font-medium">
        {cardCount > 0 ? `${cardCount}/${totalSlots}` : "0"}
      </div>
    </div>
  );
};

export default PageThumbnail;
