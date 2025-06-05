import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui";
import { useAnimations } from "../../contexts/AnimationContext";
import {
  SidebarHeader,
  BinderSettingsSection,
  CollectionManagementSection,
  BinderInfoSection,
  SaveControlsSection,
} from "./sidebar/index";

/**
 * Sidebar - Right-side collapsible sidebar for settings and configuration
 * Follows design tool pattern (settings/properties panel)
 * @param {string} gridSize - Current grid size
 * @param {Function} onGridSizeChange - Grid size change handler
 * @param {boolean} showReverseHolos - Show reverse holos setting
 * @param {Function} onToggleReverseHolos - Toggle reverse holos handler
 * @param {boolean} hideMissingCards - Hide missing cards setting
 * @param {Function} onToggleHideMissingCards - Toggle hide missing cards handler
 * @param {Array} missingCards - Array of missing card numbers
 * @param {Function} onAddMissingCard - Add missing card handler
 * @param {Function} onRemoveMissingCard - Remove missing card handler
 * @param {number} currentPage - Current page being viewed
 * @param {boolean} isDirty - Whether there are unsaved changes
 * @param {Function} onSave - Save preferences to Firebase
 * @param {Function} onRevert - Revert to last saved state
 * @param {boolean} isSaving - Whether save operation is in progress
 * @param {ReactNode} binderInfo - Binder info content
 * @param {boolean} isCollapsed - Whether sidebar is collapsed
 * @param {Function} onToggleCollapsed - Toggle collapsed state
 * @param {string} binderName - Current binder name
 * @param {boolean} isEditingName - Whether currently editing name
 * @param {string} tempName - Temporary name during editing
 * @param {Function} onStartNameEdit - Start editing name
 * @param {Function} onSaveNameEdit - Save name edit
 * @param {Function} onCancelNameEdit - Cancel name edit
 * @param {Function} onNameChange - Handle name change
 * @param {Function} onNameKeyPress - Handle name key press
 * @param {string} binderId - The ID of the current binder for pending changes
 */
const Sidebar = ({
  gridSize = "3x3",
  onGridSizeChange,
  showReverseHolos = true,
  onToggleReverseHolos,
  hideMissingCards = false,
  onToggleHideMissingCards,
  missingCards = [],
  onAddMissingCard,
  onRemoveMissingCard,
  currentPage = 1,
  isDirty = false,
  onSave,
  onRevert,
  isSaving = false,
  binderInfo,
  isCollapsed = false,
  onToggleCollapsed,
  binderName,
  isEditingName,
  tempName,
  onStartNameEdit,
  onSaveNameEdit,
  onCancelNameEdit,
  onNameChange,
  onNameKeyPress,
  binderId,
}) => {
  const { getVariants, getTransition } = useAnimations();

  // Animation variants
  const sidebarVariants = getVariants({
    initial: { x: 320, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 320, opacity: 0 },
  });

  const buttonVariants = getVariants({
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  });

  const contentVariants = getVariants({
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  });

  if (isCollapsed) {
    return (
      <motion.div
        className="fixed right-4 top-20 z-40"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={getTransition({ duration: 0.2 })}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapsed}
          className="h-10 w-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:scale-110 transition-all duration-200"
          title="Open Settings"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-40 flex flex-col"
      variants={sidebarVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={getTransition({ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] })}
    >
      {/* Header */}
      <SidebarHeader
        binderName={binderName}
        isEditingName={isEditingName}
        tempName={tempName}
        onStartNameEdit={onStartNameEdit}
        onSaveNameEdit={onSaveNameEdit}
        onCancelNameEdit={onCancelNameEdit}
        onNameChange={onNameChange}
        onNameKeyPress={onNameKeyPress}
        onToggleCollapsed={onToggleCollapsed}
        isDirty={isDirty}
      />

      {/* Content */}
      <motion.div
        className="p-4 space-y-6 flex-1 overflow-y-auto"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        transition={getTransition({ duration: 0.4, delay: 0.2 })}
      >
        {/* Binder Settings Section */}
        <BinderSettingsSection
          gridSize={gridSize}
          onGridSizeChange={onGridSizeChange}
          showReverseHolos={showReverseHolos}
          onToggleReverseHolos={onToggleReverseHolos}
        />

        {/* Visual separator */}
        <div className="border-t border-gray-200/60 dark:border-gray-700/60 pt-6 -mt-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Collection Management
          </h3>

          {/* Collection Management Section */}
          <CollectionManagementSection
            hideMissingCards={hideMissingCards}
            onToggleHideMissingCards={onToggleHideMissingCards}
            missingCards={missingCards}
            onAddMissingCard={onAddMissingCard}
            onRemoveMissingCard={onRemoveMissingCard}
          />
        </div>

        {/* Binder Info Section */}
        <BinderInfoSection
          binderInfo={binderInfo}
          isExpanded={true}
          onToggleExpanded={() => {}}
        />
      </motion.div>

      {/* Save Controls Section */}
      <SaveControlsSection
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={onSave}
        onRevert={onRevert}
        binderId={binderId}
      />
    </motion.div>
  );
};

export default Sidebar;
