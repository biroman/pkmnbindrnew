import BinderCardSlot from "./BinderCardSlot";
import { parseGridSize } from "../../utils/gridUtils";

/**
 * BinderGrid - Flexible grid component for Pokemon card binder
 * @param {Object} gridDimensions - Grid dimensions object from useGridDimensions hook
 * @param {string} gridSize - Grid size string like "3x3", "4x3", etc.
 * @param {Function} onAddCard - Callback function when a card slot is clicked
 * @param {number} startingSlot - Starting slot number (for dual-page layouts)
 * @param {string} pageType - Type of page ("left", "right", or "single")
 */
const BinderGrid = ({
  gridDimensions,
  gridSize = "3x3",
  onAddCard,
  startingSlot = 1,
  pageType = "single",
  ...props
}) => {
  const { cols, rows, totalSlots } = parseGridSize(gridSize);

  // Create array for dynamic grid slots
  const gridSlots = Array.from(
    { length: totalSlots },
    (_, index) => startingSlot + index
  );

  return (
    <div className="flex flex-col items-center justify-center h-full p-2">
      {/* Grid container */}
      <div
        className="grid"
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
        {gridSlots.map((slot) => (
          <BinderCardSlot
            key={slot}
            slot={slot}
            cardWidth={gridDimensions.cardWidth}
            cardHeight={gridDimensions.cardHeight}
            onAddCard={onAddCard}
            {...props}
          />
        ))}
      </div>
    </div>
  );
};

export default BinderGrid;
