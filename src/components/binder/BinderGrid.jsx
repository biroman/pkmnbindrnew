import BinderCardSlot from "./BinderCardSlot";

/**
 * BinderGrid - Responsive 3x3 grid component for Pokemon card binder
 * @param {Object} gridDimensions - Grid dimensions object from useGridDimensions hook
 * @param {Function} onAddCard - Callback function when a card slot is clicked
 */
const BinderGrid = ({ gridDimensions, onAddCard }) => {
  // Create array for 3x3 grid (9 slots)
  const gridSlots = Array.from({ length: 9 }, (_, index) => index + 1);

  return (
    <div className="flex-1 h-full p-4 overflow-hidden">
      <div className="h-full flex justify-center items-center">
        {/* Responsive 3x3 Grid */}
        <div
          className="grid grid-cols-3 grid-rows-3"
          style={{
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BinderGrid;
