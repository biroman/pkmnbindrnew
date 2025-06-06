import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Package, Plus, Check } from "lucide-react";
import { Button } from "../ui";
import CardSearchTab from "./CardSearchTab";
import SetBrowseTab from "./SetBrowseTab";
import { addCardsToLocalBinder } from "../../utils/localBinderStorage";
import { getNextAvailableSlots } from "../../utils/slotAssignment";
import { SlotLimitModal } from "../modals";

const AddCardsModal = ({
  isOpen,
  onClose,
  binderId,
  onCardsAddedLocally,
  currentPage = 1,
  gridSize = "3x3",
  totalPages = 1,
  savedCards = [],
  onAddMorePages, // New prop for adding pages
  onChangeGridSize, // New prop for changing grid size
  canAddPages = true, // New prop to check if user can add pages
  maxPages = null, // New prop for maximum pages limit
}) => {
  const [activeTab, setActiveTab] = useState("search"); // "search" or "sets"
  const [selectedCards, setSelectedCards] = useState([]);
  const [isAddingToBinder, setIsAddingToBinder] = useState(false);
  const [isSlotLimitModalOpen, setIsSlotLimitModalOpen] = useState(false);
  const [slotLimitData, setSlotLimitData] = useState(null);

  const handleAddSelectedCards = async () => {
    if (selectedCards.length === 0 || !binderId) {
      console.log("Cannot add cards:", {
        selectedCardsLength: selectedCards.length,
        binderId,
      });
      return;
    }

    console.log("Adding cards to binder:", {
      selectedCards: selectedCards.length,
      binderId,
      currentPage,
      gridSize,
      totalPages,
    });

    setIsAddingToBinder(true);

    try {
      // Get next available slots for the selected cards
      const availableSlots = getNextAvailableSlots(
        binderId,
        selectedCards.length,
        currentPage,
        gridSize,
        savedCards,
        totalPages
      );

      // Check if we have enough available slots
      if (availableSlots.length < selectedCards.length) {
        // Show slot limit modal instead of console error
        setSlotLimitData({
          selectedCardsCount: selectedCards.length,
          availableSlotsCount: availableSlots.length,
          totalPages,
          gridSize,
        });
        setIsSlotLimitModalOpen(true);
        setIsAddingToBinder(false);
        return;
      }

      // Assign slots to cards and format them correctly
      const cardsWithSlots = selectedCards.map((card, index) => {
        const slot = availableSlots[index];
        return {
          // Generate a unique ID for the card entry
          id:
            card._tempSelectionId ||
            `${card.id}_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,

          // Card data
          cardData: card,

          // Slot position
          pageNumber: slot.pageNumber,
          slotInPage: slot.slotInPage,
          overallSlotNumber: slot.overallSlotNumber,

          // Additional metadata
          dateAdded: new Date().toISOString(),
        };
      });

      console.log("Cards with assigned slots:", cardsWithSlots);

      // Add cards to local storage with slot assignments
      const result = addCardsToLocalBinder(binderId, cardsWithSlots);
      console.log("Add cards result:", result);

      if (result.success) {
        // IMPORTANT: Dispatch the event to notify other components to refresh
        window.dispatchEvent(
          new CustomEvent("localBinderUpdate", {
            detail: {
              binderId,
              type: "cardsAdded",
              addedCount: result.addedCount || cardsWithSlots.length,
            },
          })
        );

        // Clear selection and close modal
        setSelectedCards([]);

        // Notify parent component about the local additions
        if (onCardsAddedLocally) {
          onCardsAddedLocally({
            addedCount: result.addedCount || cardsWithSlots.length,
            totalSelected: selectedCards.length,
            slotsAssigned: availableSlots.slice(0, cardsWithSlots.length),
          });
        }

        onClose();
      } else {
        console.error("Failed to add cards to pending");
        // Could add error toast here
      }
    } catch (error) {
      console.error("Error adding cards to pending:", error);
      // Could add error toast here
    } finally {
      setIsAddingToBinder(false);
    }
  };

  const handleCardToggle = (card) => {
    setSelectedCards((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === card.id);
      if (existingIndex !== -1) {
        // If already selected, add another copy instead of removing
        const cardWithTempId = {
          ...card,
          _tempSelectionId: `${card.id}_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        };
        return [...prev, cardWithTempId];
      } else {
        // First selection of this card
        return [...prev, card];
      }
    });
  };

  const handleBulkAddSet = (cards) => {
    setSelectedCards((prev) => {
      // Allow all cards from the set, including duplicates
      const cardsWithTempIds = cards.map((card) => ({
        ...card,
        _tempSelectionId: `${card.id}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      }));
      return [...prev, ...cardsWithTempIds];
    });
  };

  const handleRemoveCard = (cardToRemove) => {
    setSelectedCards((prev) => {
      // If the card has a temp selection ID, remove that specific instance
      if (cardToRemove._tempSelectionId) {
        return prev.filter(
          (c) => c._tempSelectionId !== cardToRemove._tempSelectionId
        );
      } else {
        // For cards without temp ID, remove the first instance
        const indexToRemove = prev.findIndex((c) => c.id === cardToRemove.id);
        if (indexToRemove !== -1) {
          return prev.filter((_, index) => index !== indexToRemove);
        }
        return prev;
      }
    });
  };

  const handleAddMorePages = (pagesNeeded) => {
    if (onAddMorePages) {
      onAddMorePages(pagesNeeded);
    }
  };

  const handleChangeGridSize = (newGridSize) => {
    if (onChangeGridSize) {
      onChangeGridSize(newGridSize);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-7xl h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50 flex flex-col overflow-hidden backdrop-blur-xl"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Add Cards to Binder
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Search and discover Pokemon cards for your collection
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 w-10 h-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-8">
                <button
                  onClick={() => setActiveTab("search")}
                  className={`relative flex items-center space-x-3 px-6 py-4 font-semibold transition-all duration-200 ${
                    activeTab === "search"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Search className="w-5 h-5" />
                  <span>Search Cards</span>
                  {activeTab === "search" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      initial={false}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("sets")}
                  className={`relative flex items-center space-x-3 px-6 py-4 font-semibold transition-all duration-200 ${
                    activeTab === "sets"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>Browse Sets</span>
                  {activeTab === "sets" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      initial={false}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "search" ? (
                  <CardSearchTab
                    selectedCards={selectedCards}
                    onCardToggle={handleCardToggle}
                    showSidebar={true}
                  />
                ) : (
                  <SetBrowseTab
                    selectedCards={selectedCards}
                    onCardToggle={handleCardToggle}
                    onBulkAddSet={handleBulkAddSet}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Selected Cards Section */}
          {selectedCards.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-8 py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Selected Cards ({selectedCards.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCards([])}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2 max-h-24 overflow-y-auto">
                {selectedCards.map((card, index) => (
                  <div
                    key={card._tempSelectionId || `${card.id}-${index}`}
                    className="relative group"
                  >
                    <div className="aspect-[5/7] bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 overflow-hidden">
                      <img
                        src={card.images?.small}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveCard(card)}
                        className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Remove ${card.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedCards.length} card
                  {selectedCards.length !== 1 ? "s" : ""} selected
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSelectedCards}
                disabled={selectedCards.length === 0 || isAddingToBinder}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToBinder ? (
                  <>
                    <Check className="w-4 h-4 mr-2 animate-pulse" />
                    Adding to Binder...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add {selectedCards.length > 0
                      ? selectedCards.length
                      : ""}{" "}
                    Card
                    {selectedCards.length !== 1 ? "s" : ""} to Binder
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Slot Limit Modal */}
      {slotLimitData && (
        <SlotLimitModal
          isOpen={isSlotLimitModalOpen}
          onClose={() => setIsSlotLimitModalOpen(false)}
          selectedCardsCount={slotLimitData.selectedCardsCount}
          availableSlotsCount={slotLimitData.availableSlotsCount}
          totalPages={slotLimitData.totalPages}
          gridSize={slotLimitData.gridSize}
          onAddMorePages={handleAddMorePages}
          onChangeGridSize={handleChangeGridSize}
          canAddPages={canAddPages}
          maxPages={maxPages}
        />
      )}
    </AnimatePresence>
  );
};

export default AddCardsModal;
