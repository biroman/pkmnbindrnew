import { Loader2 } from "lucide-react";

/**
 * Reusable loading spinner component with different variants and sizes
 * @param {Object} props - Component props
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {string} props.variant - Style variant: 'default', 'button', 'page', 'inline'
 * @param {string} props.text - Optional loading text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullScreen - Whether to show as fullscreen overlay
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({
  size = "md",
  variant = "default",
  text,
  className = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const spinnerElement = (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );

  const svgSpinner = (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (variant === "button") {
    return (
      <>
        {svgSpinner}
        {text && <span className="ml-2">{text}</span>}
      </>
    );
  }

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center">
        {spinnerElement}
        {text && (
          <span className={`ml-2 ${textSizeClasses[size]}`}>{text}</span>
        )}
      </span>
    );
  }

  if (variant === "page" || fullScreen) {
    return (
      <div
        className={`flex items-center justify-center ${
          fullScreen
            ? "fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
            : "min-h-[50vh]"
        }`}
      >
        <div className="text-center">
          <div className="relative">{spinnerElement}</div>
          {text && (
            <p
              className={`text-gray-600 dark:text-gray-400 mt-3 ${textSizeClasses[size]}`}
            >
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        {spinnerElement}
        {text && (
          <p
            className={`text-gray-600 dark:text-gray-400 mt-2 ${textSizeClasses[size]}`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Loading overlay component for wrapping content
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether to show loading state
 * @param {React.ReactNode} props.children - Content to wrap
 * @param {string} props.loadingText - Loading text
 * @param {Object} props.spinnerProps - Props to pass to LoadingSpinner
 * @returns {JSX.Element} Loading overlay component
 */
export const LoadingOverlay = ({
  loading,
  children,
  loadingText = "Loading...",
  spinnerProps = {},
}) => {
  if (loading) {
    return (
      <LoadingSpinner variant="page" text={loadingText} {...spinnerProps} />
    );
  }

  return children;
};

/**
 * Skeleton loader for content placeholders
 * @param {Object} props - Component props
 * @param {number} props.lines - Number of skeleton lines
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showAvatar - Whether to show avatar skeleton
 * @returns {JSX.Element} Skeleton loader component
 */
export const SkeletonLoader = ({
  lines = 3,
  className = "",
  showAvatar = false,
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
              index === lines - 1 ? "w-2/3" : "w-full"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

/**
 * Grid skeleton loader for card layouts
 * @param {Object} props - Component props
 * @param {number} props.cards - Number of skeleton cards
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Grid skeleton loader
 */
export const GridSkeletonLoader = ({ cards = 6, className = "" }) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
