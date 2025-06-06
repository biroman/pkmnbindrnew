import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useWindowSize, useGridDimensions } from "../hooks";
import { useBinderPreferences } from "../hooks/useBinderPreferences";
import { useLocalCardState } from "../hooks/useLocalCardState";
import { useMemo } from "react";
import { usePageLimits } from "../hooks/useUserLimits";
import { useBinderState } from "../hooks/useBinderState";
import { BinderSpread } from "../components/binder";
import BinderOverview from "../components/binder/BinderOverview";
import { WorkspaceLayout } from "../components/workspace";
import { LoadingSpinner, Button } from "../components/ui";
import { useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { AddCardsModal } from "../components/cards";

const Binder = () => {
  const { currentUser } = useAuth();
  const { binderId } = useParams();

  // Get binder-specific preferences
  const {
    preferences,
    isLoading: isLoadingPreferences,
    error: preferencesError,
    saveError,
    updatePreferences,
    savePreferences,
    revertPreferences,
    clearSaveError,
    isDirty,
    isSaving,
  } = useBinderPreferences(binderId);

  // Get page limits using the new hook
  const {
    canAdd: canAddPage,
    isAtLimit: isAtPageLimit,
    limitReason,
    maxPages,
    remaining: remainingPages,
    warningMessage: pageWarningMessage,
  } = usePageLimits(preferences?.pageCount || 0);

  // Separate current page into local state
  const [currentPage, setCurrentPage] = useState(1);

  // Add binder state hook to load saved cards
  const binderState = useBinderState(binderId, preferences, currentPage);

  // Memoize saved cards to prevent infinite loops
  const memoizedSavedCards = useMemo(() => {
    const cards = binderState?.allVisibleCards || [];
    console.log("Memoized saved cards updated:", cards.length, "cards");
    return cards;
  }, [binderState?.allVisibleCards]);

  // Use local card state for immediate UI updates during drag operations
  const localCardState = useLocalCardState(memoizedSavedCards, binderId);

  // Binder name state management - now driven by preferences.binderName
  // The local binderName, isEditingName, tempName can be removed if
  // WorkspaceLayout is updated to take binderName directly from preferences
  // and handle editing via updatePreferences({ binderName: newName })
  // For now, let's keep it but sync it.
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isOverviewModeActive, setIsOverviewModeActive] = useState(false);
  const [displayPages, setDisplayPages] = useState([]);
  const [isAddCardsModalOpen, setIsAddCardsModalOpen] = useState(false);

  // Sync local binderName with fetched binder name from preferences
  // This effect also handles the initial setting of binderName
  useEffect(() => {
    if (preferences?.binderName) {
      // Set the main binderName based on fetched preferences
      // This replaces the old static "Untitled Binder"
      // If you have a separate local `binderName` state, update it here:
      // setBinderName(preferences.binderName);
    }
  }, [preferences?.binderName]);

  // Effect to initialize/update displayPages for drag-and-drop
  useEffect(() => {
    if (preferences?.pageCount > 0) {
      // Simple sequential page setup - no complex ordering needed
      const pages = Array.from({ length: preferences.pageCount }, (_, i) => ({
        id: `page-${i + 1}`,
        number: i + 1,
      }));

      setDisplayPages(pages);
    } else {
      setDisplayPages([]);
    }
  }, [preferences?.pageCount]); // Only depend on page count

  // Custom hooks for responsive behavior
  const windowSize = useWindowSize();
  // preferences object might be null/undefined initially if isLoadingPreferences is true
  const gridSizeForDimensions = preferences?.gridSize || "3x3"; // Fallback for initial load
  const gridDimensions = useGridDimensions(windowSize, gridSizeForDimensions);

  // Ensure current page doesn't exceed total pages when page count changes
  useEffect(() => {
    if (preferences?.pageCount && currentPage > preferences.pageCount) {
      setCurrentPage(preferences.pageCount);
    }
    // Ensure currentPage is at least 1 if pageCount becomes 0 or very small from an external update
    else if (preferences?.pageCount > 0 && currentPage < 1) {
      setCurrentPage(1);
    }
    // If pageCount is 0 (e.g. new binder or all pages deleted), set currentPage to 1 (or 0 if you allow empty binders)
    else if (preferences?.pageCount === 0) {
      setCurrentPage(1); // Or handle as an empty state
    }
  }, [preferences?.pageCount, currentPage]);

  // Keyboard shortcuts - handleSavePreferences and handleRevertPreferences are from the hook
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (isDirty && !isSaving) {
          savePreferences(); // Use savePreferences from the hook
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && isDirty) {
        event.preventDefault();
        revertPreferences(); // Use revertPreferences from the hook
      }
      if (event.key === "Escape" && isEditingName) {
        handleCancelNameEdit();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, isSaving, savePreferences, revertPreferences, isEditingName]); // Added hook fns to deps

  // Binder name editing functions
  const handleStartNameEdit = () => {
    setTempName(preferences?.binderName || "");
    setIsEditingName(true);
  };

  const handleSaveNameEdit = () => {
    if (tempName.trim()) {
      updatePreferences({ binderName: tempName.trim() });
      // Optionally, call savePreferences() here if you want immediate save on name change
      // await savePreferences();
    }
    setIsEditingName(false);
  };

  const handleCancelNameEdit = () => {
    setIsEditingName(false);
    setTempName(""); // Reset temp name
  };

  const handleNameKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveNameEdit();
    }
  };

  // Function to handle page reordering from BinderOverview
  const handlePageReorder = ({ oldIndex, newIndex }) => {
    console.log(`Reordering page from index ${oldIndex} to ${newIndex}`);

    // Simple approach: Update the display pages and move cards to match new page numbers
    setDisplayPages((currentPages) => {
      const movedPagesArray = arrayMove(currentPages, oldIndex, newIndex);

      // Create a simple mapping: old position -> new position
      const positionMapping = new Map();
      movedPagesArray.forEach((page, newIndex) => {
        const originalPosition = parseInt(page.id.split("-")[1]);
        const newPosition = newIndex + 1;
        positionMapping.set(originalPosition, newPosition);
      });

      console.log("Position mapping:", Array.from(positionMapping.entries()));

      // Move all cards to their new page numbers - use localCards which includes pending moves
      if (localCardState.localCards && localCardState.localCards.length > 0) {
        const cardsToMove = [];

        localCardState.localCards.forEach((card) => {
          const newPageNumber = positionMapping.get(card.pageNumber);
          if (newPageNumber && newPageNumber !== card.pageNumber) {
            cardsToMove.push({
              cardId: card.id,
              cardName: card.name || `Card ${card.number}`,
              fromPageNumber: card.pageNumber,
              fromSlotInPage: card.slotInPage,
              fromOverallSlotNumber: card.overallSlotNumber,
              toPageNumber: newPageNumber,
              toSlotInPage: card.slotInPage,
              toOverallSlotNumber:
                (newPageNumber - 1) * binderState.slotsPerPage +
                card.slotInPage,
              moveType: "move",
            });
          }
        });

        console.log(`Moving ${cardsToMove.length} cards due to page reorder`);

        // Add page move as a single operation instead of individual card moves
        if (cardsToMove.length > 0) {
          import("../utils/localBinderStorage").then(
            ({
              addPageMoveToPending,
              getPendingChangesSummary,
              clearPendingChanges,
            }) => {
              console.log(
                "Before adding page move:",
                getPendingChangesSummary(binderId)
              );

              // Clear any existing pending changes to ensure clean state
              clearPendingChanges(binderId);

              addPageMoveToPending(binderId, {
                fromPagePosition: oldIndex + 1,
                toPagePosition: newIndex + 1,
                affectedCards: cardsToMove.map((card) => ({
                  cardId: card.cardId,
                  cardName: card.cardName,
                  toPageNumber: card.toPageNumber,
                  toSlotInPage: card.toSlotInPage,
                  toOverallSlotNumber: card.toOverallSlotNumber,
                })),
              });

              console.log(
                "After adding page move:",
                getPendingChangesSummary(binderId)
              );

              // Trigger UI update for immediate card position changes
              window.dispatchEvent(
                new StorageEvent("storage", {
                  key: `pokemon_binder_pending_${binderId}`,
                })
              );
            }
          );
        }
      }

      // Return simple page structure - no complex ordering needed
      return movedPagesArray.map((page, index) => ({
        id: `page-${index + 1}`, // Simple sequential IDs
        number: index + 1,
      }));
    });
  };

  // Function to handle adding cards - opens the modal
  const handleAddCards = () => {
    setIsAddCardsModalOpen(true);
  };

  // Function to handle cards being added from the modal
  const handleCardsAdded = (cards) => {
    console.log("Cards to add to binder:", cards);
    // TODO: Implement actual card adding logic here
    // This might involve:
    // 1. Finding the next available slots in the binder
    // 2. Updating the binder's card data in Firebase
    // 3. Updating local state to show the new cards
  };

  // Function to handle cards being added locally
  const handleCardsAddedLocally = (result) => {
    console.log("Cards added to local storage:", result);
    // Could show a success toast here
    // The pending changes will be detected by the sidebar component
  };

  // Function to handle card movements (drag and drop)
  const handleCardMove = (result) => {
    console.log("Card move result (local):", result);
    if (result.success) {
      console.log("Card moved successfully to local storage!");
      // The save button will appear automatically because of pending changes

      // Force a re-render of local card state to ensure UI updates
      // This will trigger the useLocalCardState hook to re-apply pending movements
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `pokemon_binder_pending_${binderId}`,
        })
      );
    }
  };

  // Show loading states
  if (isLoadingPreferences) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state from preferences hook
  if (preferencesError) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-red-500">
        <p>Error loading binder data: {preferencesError.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Fallback if preferences are somehow still undefined after loading and no error
  // This case should ideally be handled by the hook or initial data states
  if (!preferences) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <p>
          Initializing binder... If this persists, the binder may not exist or
          there was an issue.
        </p>
        {/* Optionally, redirect or show a specific UI for new binder setup */}
      </div>
    );
  }

  // Calculate navigation states using preferences from the hook
  const canGoPrevious = currentPage > 1;
  const canGoNext = preferences.pageCount
    ? currentPage < preferences.pageCount
    : false;

  // Page Navigation Handlers
  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Enhanced handleAddPage with proper limit checking
  const handleAddPage = () => {
    const currentPageCount = preferences.pageCount || 0;

    // Check if user can add more pages
    if (!canAddPage) {
      console.log("Cannot add page: limit reached");
      return; // Don't add page if at limit
    }

    const newPageCount = currentPageCount + 1;
    updatePreferences({ pageCount: newPageCount });
    setCurrentPage(newPageCount);
  };

  // handleDeletePage - uses updatePreferences
  const handleDeletePage = (pageToDelete) => {
    if (!preferences || preferences.pageCount <= 1) return;
    const newPageCount = preferences.pageCount - 1;
    let newCurrentPage = currentPage;
    if (pageToDelete === currentPage) {
      newCurrentPage = currentPage > 1 ? currentPage - 1 : 1;
    } else if (pageToDelete < currentPage) {
      newCurrentPage = currentPage - 1;
    }
    newCurrentPage = Math.min(newCurrentPage, newPageCount);
    setCurrentPage(newCurrentPage);
    updatePreferences({ pageCount: newPageCount });
  };

  // Other handlers like handleGridSizeChange, handleToggleReverseHolos, etc.
  // should also use updatePreferences similarly.
  const handleGridSizeChange = (newGridSize) => {
    updatePreferences({ gridSize: newGridSize });
  };

  const handleToggleReverseHolos = (newShowReverseHolos) => {
    updatePreferences({ showReverseHolos: newShowReverseHolos });
  };

  const handleToggleHideMissingCards = (newHideMissingCards) => {
    updatePreferences({ hideMissingCards: newHideMissingCards });
  };

  const handleAddMissingCard = (cardNumber) => {
    const currentMissingCards = preferences.missingCards || [];
    const updatedMissingCards = [
      ...new Set([...currentMissingCards, cardNumber]),
    ].sort((a, b) => parseInt(a) - parseInt(b));
    updatePreferences({ missingCards: updatedMissingCards });
  };

  const handleRemoveMissingCard = (cardNumber) => {
    const currentMissingCards = preferences.missingCards || [];
    const updatedMissingCards = currentMissingCards.filter(
      (card) => card !== cardNumber
    );
    updatePreferences({ missingCards: updatedMissingCards });
  };

  const handlePageCountChange = (newPageCount) => {
    const numericPageCount = parseInt(newPageCount, 10);
    if (isNaN(numericPageCount) || numericPageCount < 1) return;
    const validPageCount = Math.min(numericPageCount, maxPages || Infinity);
    const newCurrentPage =
      currentPage > validPageCount ? validPageCount : currentPage;
    setCurrentPage(newCurrentPage);
    updatePreferences({ pageCount: validPageCount });
  };

  // WorkspaceLayout props need to be updated to use preferences values
  return (
    <>
      {/* Server-side validation error notification */}
      {saveError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Save Failed
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {saveError}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => {
                    // Clear the error when user dismisses it
                    clearSaveError();
                  }}
                  className="inline-flex bg-red-50 dark:bg-red-900/20 rounded-md p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WorkspaceLayout
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        gridSize={preferences.gridSize}
        onGridSizeChange={handleGridSizeChange}
        showReverseHolos={preferences.showReverseHolos}
        onToggleReverseHolos={handleToggleReverseHolos}
        hideMissingCards={preferences.hideMissingCards}
        onToggleHideMissingCards={handleToggleHideMissingCards}
        missingCards={preferences.missingCards || []}
        onAddMissingCard={handleAddMissingCard}
        onRemoveMissingCard={handleRemoveMissingCard}
        pageCount={preferences.pageCount || 0}
        onPageCountChange={handlePageCountChange}
        currentPage={currentPage}
        binderName={preferences.binderName || "Untitled Binder"}
        isEditingName={isEditingName}
        tempName={tempName}
        onStartNameEdit={handleStartNameEdit}
        onSaveNameEdit={handleSaveNameEdit}
        onCancelNameEdit={handleCancelNameEdit}
        onNameChange={(e) => setTempName(e.target.value)}
        onNameKeyPress={handleNameKeyPress}
        isDirty={isDirty}
        onSave={isDirty && !isSaving ? savePreferences : undefined}
        onRevert={isDirty && !isSaving ? revertPreferences : undefined}
        isSaving={isSaving}
        disabled={isOverviewModeActive}
        isOverviewModeActive={isOverviewModeActive}
        onToggleOverviewMode={() => setIsOverviewModeActive((prev) => !prev)}
        onAddCards={handleAddCards}
        onClipboard={() => console.log("Clipboard clicked")}
        binderId={binderId}
      >
        {isOverviewModeActive ? (
          <BinderOverview
            pages={displayPages}
            currentPageNumber={currentPage}
            onPageReorder={handlePageReorder}
            allCards={localCardState.localCards}
            gridSize={preferences.gridSize}
          />
        ) : (
          <BinderSpread
            gridDimensions={gridDimensions}
            gridSize={preferences.gridSize}
            currentPage={currentPage}
            totalPages={preferences.pageCount || 1}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            isAtPageLimit={isAtPageLimit}
            limitReason={limitReason}
            maxPages={maxPages}
            cardsOnPage1={localCardState.getCardsForPage(currentPage)}
            cardsOnPage2={localCardState.getCardsForPage(currentPage + 1)}
            allCards={localCardState.localCards}
            onCardMove={handleCardMove}
            isDragEnabled={!isOverviewModeActive}
            onAddCard={handleAddCards}
          />
        )}
      </WorkspaceLayout>

      {/* Add Cards Modal */}
      <AddCardsModal
        isOpen={isAddCardsModalOpen}
        onClose={() => setIsAddCardsModalOpen(false)}
        binderId={binderId}
        onCardsAddedLocally={handleCardsAddedLocally}
        currentPage={currentPage}
        gridSize={preferences?.gridSize || "3x3"}
        totalPages={preferences?.pageCount || 1}
        savedCards={binderState?.allVisibleCards || []}
        onAddMorePages={(pagesNeeded) => {
          const newPageCount = (preferences?.pageCount || 1) + pagesNeeded;
          updatePreferences({ pageCount: newPageCount });
          setCurrentPage(newPageCount);
        }}
        onChangeGridSize={handleGridSizeChange}
        canAddPages={canAddPage}
        maxPages={maxPages}
      />
    </>
  );
};

export default Binder;

// Helper/placeholder functions if not already defined elsewhere
// These would need actual implementation for undo/redo and card adding.
const handleUndo = () => console.log("Undo action triggered");
const handleRedo = () => console.log("Redo action triggered");
const canUndo = false; // Placeholder
const canRedo = false; // Placeholder
