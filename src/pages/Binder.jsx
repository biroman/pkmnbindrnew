import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useWindowSize, useGridDimensions } from "../hooks";
import { useBinderPreferences } from "../hooks/useBinderPreferences";
import { usePageLimits } from "../hooks/usePageLimits";
import { BinderSpread } from "../components/binder";
import { WorkspaceLayout } from "../components/workspace";
import { LoadingSpinner } from "../components/ui";
import { useEffect, useState } from "react";

const Binder = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { binderId } = useParams();
  const { maxPages, isLoading: pageLoading } = usePageLimits();

  // Separate current page into local state
  const [currentPage, setCurrentPage] = useState(1);

  // Get user preferences with local state management
  const {
    preferences,
    isLoading: preferencesLoading,
    updatePreferences,
    savePreferences,
    revertPreferences,
    isDirty,
    isSaving,
  } = useBinderPreferences();

  // Custom hooks for responsive behavior
  const windowSize = useWindowSize();
  const gridDimensions = useGridDimensions(windowSize, preferences.gridSize);

  // Ensure current page doesn't exceed total pages when page count changes
  useEffect(() => {
    if (currentPage > preferences.pageCount) {
      setCurrentPage(preferences.pageCount);
    }
  }, [preferences.pageCount, currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+S or Cmd+S: Save preferences
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (isDirty && !isSaving) {
          handleSavePreferences();
        }
      }

      // Ctrl+Z or Cmd+Z: Revert preferences (when dirty)
      if ((event.ctrlKey || event.metaKey) && event.key === "z" && isDirty) {
        event.preventDefault();
        handleRevertPreferences();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, isSaving]);

  // Calculate navigation states
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < preferences.pageCount;

  // Helper to get page type information
  const getPageInfo = (page) => {
    if (page === 1) {
      return { type: "cover", description: "Cover Page" };
    } else {
      const spreadNumber = Math.ceil((page - 1) / 1); // Each page after 1 is its own spread
      return { type: "spread", description: `Spread ${spreadNumber}` };
    }
  };

  const currentPageInfo = getPageInfo(currentPage);

  const handleAddCard = (slot) => {
    const pageInfo = getPageInfo(currentPage);
    console.log(
      `Add card to slot ${slot} in binder ${binderId} (${preferences.gridSize} grid) on ${pageInfo.description} (Page ${currentPage})`
    );
  };

  const handleAddCards = () => {
    // TODO: Implement add cards dialog/functionality
    console.log("Open add cards dialog");
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
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < preferences.pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleGridSizeChange = (newGridSize) => {
    updatePreferences({ gridSize: newGridSize });
  };

  const handleToggleReverseHolos = (showReverseHolos) => {
    updatePreferences({ showReverseHolos });
  };

  const handlePageCountChange = (newPageCount) => {
    // Ensure the new page count doesn't exceed the maximum allowed pages
    const validPageCount = Math.min(newPageCount, maxPages);

    // If reducing page count below current page, set current page to new max
    const newCurrentPage =
      currentPage > validPageCount ? validPageCount : currentPage;
    setCurrentPage(newCurrentPage);
    updatePreferences({ pageCount: validPageCount });
  };

  const handleSavePreferences = async () => {
    try {
      await savePreferences();
      console.log("Preferences saved successfully");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      // You could show a toast notification here
    }
  };

  const handleRevertPreferences = () => {
    revertPreferences();
    console.log("Preferences reverted to last saved state");
  };

  // Show loading while preferences are being fetched
  if (preferencesLoading || pageLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      // Sidebar props
      gridSize={preferences.gridSize}
      onGridSizeChange={handleGridSizeChange}
      showReverseHolos={preferences.showReverseHolos || true}
      onToggleReverseHolos={handleToggleReverseHolos}
      pageCount={preferences.pageCount}
      maxPages={maxPages}
      onPageCountChange={handlePageCountChange}
      currentPage={currentPage}
      isDirty={isDirty}
      onSave={handleSavePreferences}
      onRevert={handleRevertPreferences}
      isSaving={isSaving}
      disabled={false}
    >
      <BinderSpread
        gridDimensions={gridDimensions}
        gridSize={preferences.gridSize}
        currentPage={currentPage}
        onAddCard={handleAddCard}
      />
    </WorkspaceLayout>
  );
};

export default Binder;
