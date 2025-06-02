import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  useWindowSize,
  useGridDimensions,
  useBinderPreferences,
} from "../hooks";
import { useBinderState } from "../hooks/useBinderState";
import { BinderSpread } from "../components/binder";
import BinderNavigation from "../components/binder/BinderNavigation";
import { WorkspaceLayout } from "../components/workspace";
import { LoadingSpinner } from "../components/ui";

/**
 * FullBinder - Complete binder implementation with navigation, state management, etc.
 * This shows what the binder would look like with full functionality
 */
const FullBinder = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { binderId } = useParams();

  // Get user preferences for grid size
  const {
    preferences,
    isLoading: preferencesLoading,
    updatePreferences,
  } = useBinderPreferences();

  // Binder state management
  const binderState = useBinderState(binderId, preferences.gridSize, {
    defaultPages: 5, // Start with 5 page spreads (10 pages)
    autoSave: preferences.autoSave,
  });

  // Responsive behavior
  const windowSize = useWindowSize();
  const gridDimensions = useGridDimensions(windowSize, preferences.gridSize);

  // Card management functions
  const handleAddCard = (slot) => {
    // This would open a card picker dialog
    console.log(`Add card to slot ${slot} in binder ${binderId}`);

    // For demo, add a placeholder card
    const mockCard = {
      id: `card-${Date.now()}`,
      name: `Pokemon Card ${slot}`,
      set: "Demo Set",
      number: slot.toString(),
      image: "/placeholder-pokemon.jpg",
    };

    binderState.addCard(slot, mockCard);
  };

  const handleAddCards = () => {
    // TODO: Implement add cards dialog/functionality
    console.log("Open add cards dialog");
  };

  const handleRemoveCard = (slot) => {
    binderState.removeCard(slot);
  };

  const handleMoveCard = (fromSlot, toSlot) => {
    binderState.moveCard(fromSlot, toSlot);
  };

  const handleCardDrop = (draggedSlot, targetSlot) => {
    if (draggedSlot === targetSlot) return;

    const draggedCard = binderState.getCard(draggedSlot);
    const targetCard = binderState.getCard(targetSlot);

    if (draggedCard && !targetCard) {
      // Move card to empty slot
      binderState.moveCard(draggedSlot, targetSlot);
    } else if (draggedCard && targetCard) {
      // Swap cards
      binderState.swapCards(draggedSlot, targetSlot);
    }
  };

  const handleUndo = () => {
    // TODO: Implement undo functionality in Phase 4
    console.log("Undo action");
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality in Phase 4
    console.log("Redo action");
  };

  const handlePreviousPage = () => {
    if (binderState.currentPageSpread > 1) {
      binderState.goToPageSpread(binderState.currentPageSpread - 1);
    }
  };

  const handleNextPage = () => {
    if (binderState.currentPageSpread < binderState.totalPageSpreads) {
      binderState.goToPageSpread(binderState.currentPageSpread + 1);
    }
  };

  const handleGridSizeChange = (newGridSize) => {
    updatePreferences({ gridSize: newGridSize });
  };

  const handleToggleReverseHolos = (showReverseHolos) => {
    updatePreferences({ showReverseHolos });
  };

  // Auto-add pages when needed
  const handleAutoAddPages = () => {
    const { filledSlots, totalSlots } = binderState;
    const usagePercentage = filledSlots / totalSlots;

    // Add pages if more than 80% full
    if (usagePercentage > 0.8) {
      binderState.addPageSpread();
    }
  };

  // Show loading while preferences are being fetched
  if (preferencesLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate slot numbers for current spread
  const currentLeftPageSlots = Array.from(
    {
      length:
        binderState.currentSlotRange.leftPage.end -
        binderState.currentSlotRange.leftPage.start +
        1,
    },
    (_, i) => binderState.currentSlotRange.leftPage.start + i
  );

  const currentRightPageSlots = Array.from(
    {
      length:
        binderState.currentSlotRange.rightPage.end -
        binderState.currentSlotRange.rightPage.start +
        1,
    },
    (_, i) => binderState.currentSlotRange.rightPage.start + i
  );

  // Prepare binder info for sidebar
  const binderInfoContent = (
    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
      <div>
        Cards: {binderState.filledSlots}/{binderState.totalSlots}
      </div>
      <div>Pages: {binderState.totalPageSpreads * 2}</div>
      <div>
        Page {binderState.currentPages.left}-{binderState.currentPages.right}
      </div>
      <div className="pt-2">
        <BinderNavigation
          currentPageSpread={binderState.currentPageSpread}
          totalPageSpreads={binderState.totalPageSpreads}
          onPageChange={binderState.goToPageSpread}
          disabled={binderState.isLoading}
          isMobile={gridDimensions.isMobile}
        />
      </div>
    </div>
  );

  return (
    <WorkspaceLayout
      // Vertical toolbar props
      onUndo={handleUndo}
      onRedo={handleRedo}
      onAddCards={handleAddCards}
      onPreviousPage={handlePreviousPage}
      onNextPage={handleNextPage}
      canUndo={false} // Will be implemented in Phase 4
      canRedo={false} // Will be implemented in Phase 4
      canGoPrevious={binderState.currentPageSpread > 1}
      canGoNext={binderState.currentPageSpread < binderState.totalPageSpreads}
      // Sidebar props
      gridSize={preferences.gridSize}
      onGridSizeChange={handleGridSizeChange}
      showReverseHolos={preferences.showReverseHolos || true}
      onToggleReverseHolos={handleToggleReverseHolos}
      binderInfo={binderInfoContent}
      disabled={binderState.isLoading}
    >
      <BinderSpread
        gridDimensions={gridDimensions}
        gridSize={preferences.gridSize}
        onAddCard={handleAddCard}
        // Enhanced props for full functionality
        cards={binderState.getCurrentSpreadCards()}
        leftPageSlots={currentLeftPageSlots}
        rightPageSlots={currentRightPageSlots}
        onRemoveCard={handleRemoveCard}
        onMoveCard={handleMoveCard}
        onCardDrop={handleCardDrop}
        onAutoAddPages={handleAutoAddPages}
        showSlotNumbers={true}
        allowCardManagement={true}
        isLoading={binderState.isLoading}
        emptySlotText={`Add Card (Slot {slot})`}
      />
    </WorkspaceLayout>
  );
};

export default FullBinder;
