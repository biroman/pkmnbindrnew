import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui";
import VerticalToolbar from "./VerticalToolbar";
import Sidebar from "./Sidebar";
import { useAnimations } from "../../contexts/AnimationContext";
import { EditHistoryPanel } from "../../components/history";

/**
 * WorkspaceLayout - Main layout container following design tool patterns
 * Left: Vertical toolbar with core actions
 * Right: Collapsible sidebar with settings
 * Center: Main content area
 */
const WorkspaceLayout = ({
  children,
  // Vertical toolbar props
  onUndo,
  onRedo,
  onAddCards,
  onClipboard,
  onPreviousPage,
  onNextPage,
  canUndo = false,
  canRedo = false,
  canGoPrevious = false,
  canGoNext = false,
  // Sidebar props
  gridSize,
  onGridSizeChange,
  showReverseHolos = true,
  onToggleReverseHolos,
  hideMissingCards = false,
  onToggleHideMissingCards,
  missingCards = [],
  onAddMissingCard,
  onRemoveMissingCard,
  pageCount = 10,
  onPageCountChange,
  currentPage = 1,
  binderName,
  isEditingName,
  tempName,
  onStartNameEdit,
  onSaveNameEdit,
  onCancelNameEdit,
  onNameChange,
  onNameKeyPress,
  isDirty = false,
  onSave,
  onRevert,
  isSaving = false,
  binderInfo,
  clipboard,
  onToggleOverviewMode,
  isOverviewModeActive,
  disabled = false,
  binderId,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const { getVariants, getTransition, shouldAnimate } = useAnimations();

  // Animation variants for toolbar (using opacity + scale since it's fixed positioned)
  const toolbarVariants = getVariants({
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  });

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Vertical Toolbar - Left */}
      <motion.div
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50"
        variants={toolbarVariants}
        initial="initial"
        animate="animate"
        transition={getTransition({
          duration: 0.4,
          ease: "easeOut",
          delay: 0.1,
        })}
      >
        <VerticalToolbar
          onUndo={onUndo}
          onRedo={onRedo}
          onAddCards={onAddCards}
          onClipboard={onClipboard}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          canUndo={canUndo}
          canRedo={canRedo}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onToggleHistoryPanel={() => setIsHistoryPanelOpen((prev) => !prev)}
          onToggleOverviewMode={onToggleOverviewMode}
          isOverviewModeActive={isOverviewModeActive}
          disabled={disabled}
        />
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        layout={shouldAnimate()}
        className="h-full ml-20 relative"
        animate={{
          marginRight: sidebarCollapsed ? 0 : 320, // 320px = w-80
        }}
        transition={getTransition({
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1], // Custom easing for smooth feel
        })}
      >
        <div className="h-full">{children}</div>
      </motion.div>

      {/* Right Sidebar */}
      <AnimatePresence mode="wait">
        <Sidebar
          gridSize={gridSize}
          onGridSizeChange={onGridSizeChange}
          showReverseHolos={showReverseHolos}
          onToggleReverseHolos={onToggleReverseHolos}
          hideMissingCards={hideMissingCards}
          onToggleHideMissingCards={onToggleHideMissingCards}
          missingCards={missingCards}
          onAddMissingCard={onAddMissingCard}
          onRemoveMissingCard={onRemoveMissingCard}
          pageCount={pageCount}
          onPageCountChange={onPageCountChange}
          currentPage={currentPage}
          binderName={binderName}
          isEditingName={isEditingName}
          tempName={tempName}
          onStartNameEdit={onStartNameEdit}
          onSaveNameEdit={onSaveNameEdit}
          onCancelNameEdit={onCancelNameEdit}
          onNameChange={onNameChange}
          onNameKeyPress={onNameKeyPress}
          isDirty={isDirty}
          onSave={onSave}
          onRevert={onRevert}
          isSaving={isSaving}
          binderInfo={binderInfo}
          clipboard={clipboard}
          isCollapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          binderId={binderId}
        />
      </AnimatePresence>

      {/* Edit History Panel */}
      <EditHistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
      />
    </div>
  );
};

export default WorkspaceLayout;
