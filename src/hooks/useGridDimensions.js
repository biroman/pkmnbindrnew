import { useMemo } from "react";
import { calculateBinderDimensions } from "../utils/gridUtils";

/**
 * Custom hook for calculating responsive grid dimensions for Pokemon card binder
 * @param {Object} windowSize - Object containing window width and height
 * @param {string} gridSize - Grid size string like "3x3", "4x3", etc.
 * @param {Object} options - Additional options for calculation
 * @returns {Object} Grid dimensions including width, height, card size, and gap
 */
export const useGridDimensions = (
  windowSize,
  gridSize = "3x3",
  options = {}
) => {
  return useMemo(() => {
    return calculateBinderDimensions(windowSize, gridSize, options);
  }, [windowSize, gridSize, options]);
};
