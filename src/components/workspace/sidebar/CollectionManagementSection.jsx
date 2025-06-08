import { useState } from "react";
import { Eye, EyeOff, Hash, Plus, X } from "lucide-react";
import { Button, Switch, Input } from "../../ui";

/**
 * CollectionManagementSection - Collection and missing cards management
 */
const CollectionManagementSection = ({
  hideMissingCards,
  onToggleHideMissingCards,
  missingCards,
  onAddMissingCard,
  onRemoveMissingCard,
}) => {
  const [newMissingCard, setNewMissingCard] = useState("");

  // Handle adding missing card
  const handleAddMissingCard = () => {
    if (!newMissingCard.trim()) return;

    // Normalize card number (remove # if present, convert to number then back to string)
    const normalizedCard = newMissingCard.replace(/^#/, "").trim();

    // Validate it's a number
    if (!/^\d+$/.test(normalizedCard)) {
      console.warn("Card number must be numeric");
      return;
    }

    // Check if already exists
    if (missingCards.includes(normalizedCard)) {
      console.warn("Card already in missing list");
      setNewMissingCard("");
      return;
    }

    onAddMissingCard?.(normalizedCard);
    setNewMissingCard("");
  };

  // Handle Enter key in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddMissingCard();
    }
  };

  return (
    <div className="space-y-4">
      {/* Hide Missing Cards - Primary filter that affects what users see */}
      <div>
        <div className="p-3 bg-gray-100/50 dark:bg-gray-800/40 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/40">
          <div className="flex items-center justify-between">
            <label
              htmlFor="hideMissingCards"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center space-x-2 cursor-pointer"
            >
              {hideMissingCards ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-green-500" />
              )}
              <span>Hide Missing Cards</span>
            </label>
            <Switch
              id="hideMissingCards"
              checked={hideMissingCards}
              onCheckedChange={onToggleHideMissingCards}
              aria-label="Toggle visibility of missing cards"
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {hideMissingCards
              ? "Only showing cards you own"
              : "Showing all slots including missing cards"}
          </div>
        </div>
      </div>

      {/* Missing Cards Management - Active management tool */}
      <div>
        <div className="p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg shadow-sm border border-red-200/50 dark:border-red-700/40">
          <div className="flex items-center space-x-2 mb-3">
            <Hash className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Missing Cards
            </span>
          </div>

          {/* Add Missing Card Input */}
          <div className="flex space-x-2 mb-3">
            <div className="flex-1">
              <Input
                placeholder="Enter card number (e.g., 1, 25, 150)"
                value={newMissingCard}
                onChange={(e) => setNewMissingCard(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-sm"
                maxLength={5}
                aria-label="Missing card number input"
              />
            </div>
            <Button
              onClick={handleAddMissingCard}
              size="sm"
              disabled={!newMissingCard.trim()}
              className="bg-red-600 hover:bg-red-700 text-white px-3"
              title="Add missing card"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Missing Cards List */}
          {missingCards.length > 0 ? (
            <div className="space-y-1 max-h-24 overflow-y-auto">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Missing cards ({missingCards.length}):
              </div>
              {missingCards.map((cardNumber, index) => (
                <div
                  key={cardNumber || `missing-card-${index}`}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded px-2 py-1 text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    #{cardNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveMissingCard?.(cardNumber)}
                    className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                    title={`Remove card #${cardNumber}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
              No missing cards specified
            </div>
          )}
        </div>
      </div>

      {/* Collection Progress - Informational/motivational display */}
      <div>
        <div className="p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg shadow-sm border border-green-200/50 dark:border-green-700/40">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Collection Progress
            </p>
            <div className="flex items-baseline">
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                0
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-0.5">
                / 0 cards
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: "0%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add cards to track your collection progress
          </p>
          {missingCards.length > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {missingCards.length} cards marked as missing
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionManagementSection;
