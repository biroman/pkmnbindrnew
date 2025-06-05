import { useState } from "react";
import { Check, ImageIcon } from "lucide-react";

const CardItem = ({ card, isSelected, onToggle }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Get the best available image (small or normal resolution)
  const cardImage = card.images?.small || card.images?.normal;

  return (
    <div
      onClick={onToggle}
      className={`
        relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200
        ${
          isSelected
            ? "ring-2 ring-blue-500 shadow-lg transform scale-105"
            : "hover:shadow-md hover:transform hover:scale-102"
        }
      `}
    >
      {/* Card Image */}
      <div className="aspect-[5/7] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        {!imageError && cardImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
            <img
              src={cardImage}
              alt={card.name}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs text-center px-2">No Image</span>
          </div>
        )}

        {/* Selection Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={`
          absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200
          ${!isSelected ? "group-hover:bg-black/10" : ""}
        `}
        />
      </div>

      {/* Card Info */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
          {card.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {card.set?.name}
          </span>
          {card.number && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
              #{card.number}
            </span>
          )}
        </div>
        {/* Always reserve space for rarity to maintain consistent height */}
        <div className="mt-1 h-6 flex items-start">
          {card.rarity ? (
            <span
              className={`
              inline-block px-2 py-0.5 text-xs rounded-full
              ${
                card.rarity.includes("Rare")
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : card.rarity.includes("Uncommon")
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }
            `}
            >
              {card.rarity}
            </span>
          ) : (
            <span className="text-xs text-transparent">placeholder</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardItem;
