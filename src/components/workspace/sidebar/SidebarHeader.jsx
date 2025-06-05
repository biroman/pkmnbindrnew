import { motion } from "framer-motion";
import { ChevronRight, Circle, Edit3, Check, X } from "lucide-react";
import { Button, Input } from "../../ui";
import { useAnimations } from "../../../contexts/AnimationContext";

/**
 * SidebarHeader - Header section of the sidebar with binder name and collapse button
 */
const SidebarHeader = ({
  binderName,
  isEditingName,
  tempName,
  onStartNameEdit,
  onSaveNameEdit,
  onCancelNameEdit,
  onNameChange,
  onNameKeyPress,
  onToggleCollapsed,
  isDirty,
}) => {
  const { getVariants, getTransition } = useAnimations();

  const headerVariants = getVariants({
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  });

  return (
    <motion.div
      className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
      variants={headerVariants}
      initial="initial"
      animate="animate"
      transition={getTransition({ duration: 0.3, delay: 0.1 })}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {isEditingName ? (
          <div className="flex items-center space-x-2 flex-1">
            <Input
              value={tempName}
              onChange={(e) => onNameChange?.(e.target.value)}
              onKeyPress={onNameKeyPress}
              onBlur={onSaveNameEdit}
              className="text-lg font-semibold flex-1 min-w-0"
              placeholder="Enter binder name"
              maxLength={100}
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onSaveNameEdit}
              className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 flex-shrink-0"
              title="Save name"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelNameEdit}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 flex-shrink-0"
              title="Cancel editing"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="group flex items-center space-x-2 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded px-2 py-1 transition-colors flex-1 min-w-0"
            onClick={onStartNameEdit}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {binderName || "Untitled Binder"}
            </h2>
            <Edit3 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapsed}
        className="h-8 w-8 p-0 hover:scale-110 transition-all duration-200 flex-shrink-0 ml-2"
        title="Collapse Settings"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
      </Button>
    </motion.div>
  );
};

export default SidebarHeader;
