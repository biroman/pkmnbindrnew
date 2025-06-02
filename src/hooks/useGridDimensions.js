import { useMemo } from "react";

/**
 * Custom hook for calculating responsive grid dimensions for Pokemon card binder
 * @param {Object} windowSize - Object containing window width and height
 * @param {Object} config - Configuration object for grid layout
 * @returns {Object} Grid dimensions including width, height, card size, and gap
 */
export const useGridDimensions = (windowSize, config = {}) => {
  const {
    cols = 3,
    rows = 3,
    cardAspectRatio = 2.5 / 3.5, // Pokemon card aspect ratio: width:height
    headerHeight = 80,
  } = config;

  return useMemo(() => {
    const { width: viewportWidth, height: viewportHeight } = windowSize;

    // Define responsive breakpoints
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    };

    // Calculate available space (accounting for header, padding)
    const padding = viewportWidth >= breakpoints.md ? 32 : 16;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = viewportHeight - headerHeight - padding * 2;

    // Use more aggressive space usage, especially on smaller screens
    const heightUsage =
      viewportWidth <= breakpoints.sm
        ? 0.95 // Mobile: use 95%
        : viewportWidth <= breakpoints.md
        ? 0.92 // Tablet: use 92%
        : 0.9; // Desktop: use 90%

    const widthUsage = 0.9; // Keep width usage consistent

    // Calculate optimal card size based on available space
    const maxCardWidth = (availableWidth * widthUsage) / cols;
    const maxCardHeight = (availableHeight * heightUsage) / rows;

    // Respect card aspect ratio - use height as primary constraint
    const cardWidthFromHeight = maxCardHeight * cardAspectRatio;
    const cardHeightFromWidth = maxCardWidth / cardAspectRatio;

    // Use the smaller dimension to ensure cards fit
    const finalCardWidth = Math.min(maxCardWidth, cardWidthFromHeight);
    const finalCardHeight = Math.min(maxCardHeight, cardHeightFromWidth);

    // Calculate grid dimensions based on final card size
    const gap = Math.max(8, Math.min(24, finalCardWidth * 0.08)); // 8% of card width, min 8px, max 24px

    const gridWidth = finalCardWidth * cols + gap * (cols - 1);
    const gridHeight = finalCardHeight * rows + gap * (rows - 1);

    // Responsive adjustments for different screen sizes
    let responsiveScale = 1;
    if (viewportWidth <= breakpoints.sm) {
      responsiveScale = 0.9; // Mobile: less aggressive scaling
    } else if (viewportWidth <= breakpoints.md) {
      responsiveScale = 0.95; // Tablet: slight scaling
    } else if (viewportWidth >= breakpoints.xl) {
      responsiveScale = 1.1; // Large desktop: bigger
    }

    return {
      gridWidth: Math.round(gridWidth * responsiveScale),
      gridHeight: Math.round(gridHeight * responsiveScale),
      cardWidth: Math.round(finalCardWidth * responsiveScale),
      cardHeight: Math.round(finalCardHeight * responsiveScale),
      gap: Math.round(gap * responsiveScale),
    };
  }, [windowSize, cols, rows, cardAspectRatio, headerHeight]);
};
