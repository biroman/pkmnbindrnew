import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { Switch } from "../../ui";

/**
 * GridLayoutOption - Visual grid preview component
 */
const GridLayoutOption = ({
  gridSize,
  isSelected,
  onClick,
  label,
  description,
}) => {
  const getGridDimensions = (size) => {
    switch (size) {
      case "1x1":
        return { cols: 1, rows: 1, cards: 1 };
      case "2x2":
        return { cols: 2, rows: 2, cards: 4 };
      case "3x3":
        return { cols: 3, rows: 3, cards: 9 };
      case "4x3":
        return { cols: 4, rows: 3, cards: 12 };
      case "4x4":
        return { cols: 4, rows: 4, cards: 16 };
      default:
        return { cols: 3, rows: 3, cards: 9 };
    }
  };

  const { cols, rows, cards } = getGridDimensions(gridSize);
  const totalCells = cols * rows;

  return (
    <motion.div
      className={`relative cursor-pointer transition-all duration-300 rounded-lg p-3 border-2 group ${
        isSelected
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-md shadow-blue-500/10"
          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md bg-white dark:bg-gray-800/50"
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Select ${label} grid layout`}
    >
      {/* Selection indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center z-10 shadow-md"
          >
            <Check className="h-2.5 w-2.5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid preview */}
      <div className="flex flex-col items-center space-y-2">
        <div
          className={`grid gap-0.5 p-1.5 rounded-md transition-all duration-200 ${
            isSelected
              ? "bg-white dark:bg-gray-800 shadow-inner"
              : "bg-gray-50 dark:bg-gray-700/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
          }`}
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            width: "fit-content",
          }}
        >
          {Array.from({ length: totalCells }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2.5 rounded-xs transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"
                  : "bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500"
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
            />
          ))}
        </div>

        {/* Label and description */}
        <div className="text-center">
          <p
            className={`text-xs font-semibold transition-colors duration-200 ${
              isSelected
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
            }`}
          >
            {label}
          </p>
          <p
            className={`text-xs transition-colors duration-200 ${
              isSelected
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          !isSelected ? "bg-gradient-to-br from-blue-500/5 to-indigo-500/5" : ""
        }`}
      />
    </motion.div>
  );
};

/**
 * BinderSettingsSection - Binder configuration settings section
 */
const BinderSettingsSection = ({
  gridSize,
  onGridSizeChange,
  showReverseHolos,
  onToggleReverseHolos,
}) => {
  const gridOptions = [
    { size: "1x1", label: "Single", description: "1 card" },
    { size: "2x2", label: "Compact", description: "4 cards" },
    { size: "3x3", label: "Standard", description: "9 cards" },
    { size: "4x3", label: "Wide", description: "12 cards" },
    { size: "4x4", label: "Large", description: "16 cards" },
  ];

  return (
    <div className="space-y-6">
      {/* Grid Layout - Frequently changed display option */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Grid Layout
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose how many cards per page
            </p>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {gridOptions.find((opt) => opt.size === gridSize)?.description ||
              "9 cards"}
          </div>
        </div>

        {/* More compact grid - 3 columns for top row, 2 for bottom */}
        <div className="grid grid-cols-3 gap-2">
          {gridOptions.slice(0, 3).map((option) => (
            <GridLayoutOption
              key={option.size}
              gridSize={option.size}
              isSelected={gridSize === option.size}
              onClick={() => onGridSizeChange(option.size)}
              label={option.label}
              description={option.description}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 max-w-[66%] mx-auto">
          {gridOptions.slice(3).map((option) => (
            <GridLayoutOption
              key={option.size}
              gridSize={option.size}
              isSelected={gridSize === option.size}
              onClick={() => onGridSizeChange(option.size)}
              label={option.label}
              description={option.description}
            />
          ))}
        </div>
      </div>

      {/* Show Reverse Holos - Secondary display option */}
      <div>
        <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 rounded-xl shadow-sm border border-yellow-200/50 dark:border-yellow-700/40">
          <div className="flex items-center justify-between">
            <label
              htmlFor="showReverseHolos"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center space-x-2 cursor-pointer"
            >
              <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <span className="block">Show Reverse Holos</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Display holographic variants
                </span>
              </div>
            </label>
            <Switch
              id="showReverseHolos"
              checked={showReverseHolos}
              onCheckedChange={onToggleReverseHolos}
              aria-label="Toggle display of reverse holo cards"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinderSettingsSection;
