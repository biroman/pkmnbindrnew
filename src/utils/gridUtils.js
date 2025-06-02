/**
 * Grid utilities for binder layouts
 */

/**
 * Parse grid size string into rows and columns
 * @param {string} gridSize - Grid size string like "3x3", "4x3", etc.
 * @returns {Object} Object with rows, cols, and totalSlots
 */
export const parseGridSize = (gridSize = "3x3") => {
  const [cols, rows] = gridSize.split("x").map(Number);

  return {
    cols: cols || 3,
    rows: rows || 3,
    totalSlots: (cols || 3) * (rows || 3),
  };
};

/**
 * Get all available grid size options
 * @returns {Array} Array of grid size options with metadata
 */
export const getGridSizeOptions = () => [
  { value: "1x1", label: "1×1 Grid", cols: 1, rows: 1, totalSlots: 1 },
  { value: "2x2", label: "2×2 Grid", cols: 2, rows: 2, totalSlots: 4 },
  { value: "3x3", label: "3×3 Grid", cols: 3, rows: 3, totalSlots: 9 },
  { value: "4x3", label: "4×3 Grid", cols: 4, rows: 3, totalSlots: 12 },
  { value: "4x4", label: "4×4 Grid", cols: 4, rows: 4, totalSlots: 16 },
];

/**
 * Calculate optimal grid dimensions for dual-page binder layout
 * @param {Object} windowSize - Window dimensions
 * @param {string} gridSize - Grid size string
 * @param {Object} options - Additional options
 * @returns {Object} Calculated dimensions
 */
export const calculateBinderDimensions = (
  windowSize,
  gridSize = "3x3",
  options = {}
) => {
  const {
    headerHeight = 80,
    cardAspectRatio = 2.5 / 3.5,
    spacing = 16,
    bindingWidth = 32, // Space between left and right pages
  } = options;

  const { cols, rows } = parseGridSize(gridSize);
  const { width: viewportWidth, height: viewportHeight } = windowSize;

  // Responsive breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  // Calculate available space
  const padding = viewportWidth >= breakpoints.md ? 32 : 16;
  const availableWidth = viewportWidth - padding * 2;
  const availableHeight = viewportHeight - headerHeight - padding * 2;

  // On mobile, stack pages vertically; on desktop, side by side
  const isMobile = viewportWidth < breakpoints.lg;

  if (isMobile) {
    // Mobile: Single page layout (stacked)
    const widthUsage = 0.9;
    const heightUsage = 0.85;

    const maxCardWidth = (availableWidth * widthUsage) / cols;
    const maxCardHeight = (availableHeight * heightUsage) / rows;

    // Respect aspect ratio
    const cardWidthFromHeight = maxCardHeight * cardAspectRatio;
    const cardHeightFromWidth = maxCardWidth / cardAspectRatio;

    const finalCardWidth = Math.min(maxCardWidth, cardWidthFromHeight);
    const finalCardHeight = Math.min(maxCardHeight, cardHeightFromWidth);

    const gap = Math.max(6, Math.min(16, finalCardWidth * 0.06));

    return {
      isMobile: true,
      isDualPage: false,
      cardWidth: Math.round(finalCardWidth),
      cardHeight: Math.round(finalCardHeight),
      gap: Math.round(gap),
      gridWidth: Math.round(finalCardWidth * cols + gap * (cols - 1)),
      gridHeight: Math.round(finalCardHeight * rows + gap * (rows - 1)),
      pageWidth: Math.round(finalCardWidth * cols + gap * (cols - 1) + spacing),
      totalWidth: Math.round(
        finalCardWidth * cols + gap * (cols - 1) + spacing
      ),
    };
  } else {
    // Desktop: Dual page layout (side by side)
    const widthUsage = 0.85; // Leave more room for dual pages
    const heightUsage = 0.9;

    // Available width for both pages combined (minus binding space)
    const totalGridWidth = availableWidth * widthUsage - bindingWidth;
    const singlePageWidth = totalGridWidth / 2;

    const maxCardWidth = singlePageWidth / cols;
    const maxCardHeight = (availableHeight * heightUsage) / rows;

    // Respect aspect ratio
    const cardWidthFromHeight = maxCardHeight * cardAspectRatio;
    const cardHeightFromWidth = maxCardWidth / cardAspectRatio;

    const finalCardWidth = Math.min(maxCardWidth, cardWidthFromHeight);
    const finalCardHeight = Math.min(maxCardHeight, cardHeightFromWidth);

    const gap = Math.max(8, Math.min(20, finalCardWidth * 0.08));

    const gridWidth = finalCardWidth * cols + gap * (cols - 1);
    const gridHeight = finalCardHeight * rows + gap * (rows - 1);

    return {
      isMobile: false,
      isDualPage: true,
      cardWidth: Math.round(finalCardWidth),
      cardHeight: Math.round(finalCardHeight),
      gap: Math.round(gap),
      gridWidth: Math.round(gridWidth),
      gridHeight: Math.round(gridHeight),
      pageWidth: Math.round(gridWidth + spacing),
      totalWidth: Math.round(gridWidth * 2 + bindingWidth + spacing * 2),
      bindingWidth,
    };
  }
};
