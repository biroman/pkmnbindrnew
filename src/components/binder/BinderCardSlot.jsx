import { Plus } from "lucide-react";

/**
 * BinderCardSlot - Individual card slot component for the binder grid
 * @param {number} slot - Slot number (1-9)
 * @param {number} cardWidth - Width of the card slot in pixels
 * @param {number} cardHeight - Height of the card slot in pixels
 * @param {Function} onAddCard - Callback function when slot is clicked
 */
const BinderCardSlot = ({ slot, cardWidth, cardHeight, onAddCard }) => {
  const handleClick = () => {
    if (onAddCard) {
      onAddCard(slot);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="relative bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 flex items-center justify-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        aspectRatio: "5 / 7", // Pokemon card aspect ratio
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Add card to slot ${slot}`}
    >
      {/* Empty slot placeholder */}
      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center p-1 relative z-10">
        <Plus className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
        <span className="text-xs sm:text-sm font-medium leading-tight">
          Add Card
        </span>
        <span className="text-2xs sm:text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mt-0.5 sm:mt-1">
          Slot {slot}
        </span>
      </div>
    </div>
  );
};

export default BinderCardSlot;
