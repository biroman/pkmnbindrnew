import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, Circle, Edit3 } from "lucide-react";
import { Button } from "../../ui";
import { useAnimations } from "../../../contexts/AnimationContext";
import { useBinderSync } from "../../../hooks/useBinder.Sync";

/**
 * SaveControlsSection - Bottom action bar for save/revert controls
 * Handles both regular preferences and pending card changes
 */
const SaveControlsSection = ({
  isDirty,
  isSaving,
  onSave,
  onRevert,
  binderId, // New prop to handle pending card changes
}) => {
  const { getTransition } = useAnimations();

  // Get sync status for binder
  const { isSyncing, hasUnsyncedChanges, syncToFirebase, revertToFirebase } =
    useBinderSync(binderId);

  // Determine if we have any changes at all
  const hasAnyChanges = isDirty || hasUnsyncedChanges;
  const isAnySaving = isSaving || isSyncing;

  // Handle unified save that saves both preferences and pending cards
  const handleUnifiedSave = async () => {
    // Save preferences first if there are any
    if (isDirty && onSave) {
      await onSave();
    }

    // Then sync local binder state if there are any changes
    if (hasUnsyncedChanges) {
      await syncToFirebase();
    }
  };

  // Handle unified revert that reverts both preferences and pending cards
  const handleUnifiedRevert = async () => {
    console.log("Reverting all changes...");

    // Revert preferences if there are any
    if (isDirty && onRevert) {
      onRevert();
    }

    // Revert local binder state changes to Firebase state
    if (hasUnsyncedChanges && revertToFirebase) {
      const result = await revertToFirebase();
      if (result.success) {
        console.log("Successfully reverted binder changes");
      } else {
        console.error("Failed to revert binder changes:", result.error);
      }
    }
  };

  // Calculate total changes for display
  const totalChanges = (isDirty ? 1 : 0) + (hasUnsyncedChanges ? 1 : 0);

  return (
    <AnimatePresence>
      {hasAnyChanges && (
        <motion.div
          className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={getTransition({ duration: 0.3, ease: "easeOut" })}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Unsaved Changes
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isAnySaving ? "Saving..." : "Ready to save"}
            </span>
          </div>

          {/* Changes Summary */}
          {hasAnyChanges && (
            <div className="mb-3 space-y-1">
              {isDirty && (
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Edit3 className="w-3 h-3" />
                  <span>Binder preferences modified</span>
                </div>
              )}
              {hasUnsyncedChanges && (
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Edit3 className="w-3 h-3" />
                  <span>Binder state changes</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleUnifiedSave}
              disabled={isAnySaving}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
              title="Save all changes"
            >
              <Save className="h-4 w-4 mr-2" />
              {isAnySaving
                ? "Saving Changes..."
                : `Save ${totalChanges} Change${totalChanges !== 1 ? "s" : ""}`}
            </Button>

            <Button
              variant="outline"
              onClick={handleUnifiedRevert}
              disabled={isAnySaving}
              className="w-full h-8 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-gray-300 dark:border-gray-600"
              title="Discard all changes"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              Undo All Changes
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveControlsSection;
