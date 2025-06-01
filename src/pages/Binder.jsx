import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "../components/ui";
import { useState, useMemo, useEffect } from "react";

const Binder = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { binderId } = useParams();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize for responsive binder sizing
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBackToCollections = () => {
    if (currentUser) {
      navigate("/app/collections");
    } else {
      navigate("/under-development");
    }
  };

  // Create array for 3x3 grid (9 slots)
  const gridSlots = Array.from({ length: 9 }, (_, index) => index + 1);

  /**
   * Responsive Grid Sizing Algorithm
   * Calculates optimal dimensions for 3x3 Pokemon card grid
   */
  const gridDimensions = useMemo(() => {
    // Grid configuration
    const cols = 3;
    const rows = 3;

    // Pokemon card aspect ratio: 2.5:3.5 (width:height)
    const cardAspectRatio = 2.5 / 3.5;

    // Get viewport dimensions
    const viewportWidth = windowSize.width;
    const viewportHeight = windowSize.height;

    // Define responsive breakpoints
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    };

    // Calculate available space (accounting for header, padding)
    const headerHeight = 80; // Header height
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
  }, [windowSize]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Main grid container */}
      <div className="flex-1 h-full p-4 overflow-hidden">
        <div className="h-full flex justify-center items-center">
          {/* Responsive 3x3 Grid */}
          <div
            className="grid grid-cols-3 grid-rows-3"
            style={{
              width: `${gridDimensions.gridWidth}px`,
              height: `${gridDimensions.gridHeight}px`,
              gap: `${gridDimensions.gap}px`,
              maxWidth: "95vw",
              maxHeight: "95vh",
            }}
          >
            {gridSlots.map((slot) => (
              <div
                key={slot}
                className="relative bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 flex items-center justify-center group cursor-pointer"
                style={{
                  width: `${gridDimensions.cardWidth}px`,
                  height: `${gridDimensions.cardHeight}px`,
                  aspectRatio: "5 / 7", // Pokemon card aspect ratio
                }}
              >
                {/* Empty slot placeholder */}
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors text-center p-1">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm font-medium leading-tight">
                    Add Card
                  </span>
                  <span className="text-2xs sm:text-xs text-gray-300 dark:text-gray-600 mt-0.5 sm:mt-1">
                    Slot {slot}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Binder;
