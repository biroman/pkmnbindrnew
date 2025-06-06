import { Plus, Star } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";
import { getPageAndSlotFromSlotNumber } from "../../utils/slotAssignment";

/**
 * BinderCardSlot - Individual card slot component for the binder grid
 * @param {number} slot - Slot number (overall slot position)
 * @param {number} cardWidth - Width of the card slot in pixels
 * @param {number} cardHeight - Height of the card slot in pixels
 * @param {Function} onAddCard - Callback function when slot is clicked
 * @param {Object} savedCard - Card from Firebase (if any)
 * @param {string} gridSize - Grid size for calculations
 * @param {string} pageType - Type of page ("left", "right", etc.)
 * @param {number} startingSlot - Starting slot for this page
 */
const BinderCardSlot = ({
  slot,
  cardWidth,
  cardHeight,
  onAddCard,
  savedCard,
  gridSize = "3x3",
  pageType = "single",
  startingSlot = 1,
}) => {
  const { binderId } = useParams();
  const { currentUser } = useAuth();

  // Calculate the actual page and slot position from the slot number
  const { pageNumber, slotInPage } = getPageAndSlotFromSlotNumber(
    slot,
    gridSize
  );

  // In the new system, only savedCard exists (from local storage)
  const displayCard = savedCard;

  const handleClick = () => {
    if (onAddCard && !displayCard) {
      onAddCard(slot);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  // If there's a card to display
  if (displayCard) {
    const cardData = displayCard.cardData || displayCard;

    return (
      <div
        className="relative rounded-lg border-2 transition-all duration-200 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          aspectRatio: "5 / 7", // Pokemon card aspect ratio
        }}
      >
        {/* Card Image */}
        <img
          src={cardData.images?.small || cardData.images?.normal}
          alt={cardData.name}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />

        {/* Fallback content if image fails to load */}
        <div
          className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 p-2 text-center"
          style={{ display: "none" }}
        >
          <span className="text-xs font-medium leading-tight">
            {cardData.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {cardData.set?.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            #{cardData.number}
          </span>
        </div>

        {/* Reverse Holo Indicator */}
        {(cardData.isReverseHolo || displayCard.isReverseHolo) && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <Star className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        {/* Card info overlay on hover */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/80 transition-all duration-200 rounded-lg opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-white p-2 text-center">
          <span className="text-xs font-medium leading-tight">
            {cardData.name}
          </span>
          <span className="text-xs text-gray-300 mt-1">
            {cardData.set?.name}
          </span>
          <span className="text-xs text-gray-300">#{cardData.number}</span>
          {cardData.rarity && (
            <span className="text-xs text-gray-300">{cardData.rarity}</span>
          )}
          {(cardData.isReverseHolo || displayCard.isReverseHolo) && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">Reverse Holo</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty slot
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
