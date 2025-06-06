import { forwardRef } from "react";
import * as Switch from "@radix-ui/react-switch";
import { useTheme } from "../../contexts/ThemeContext";
import { cn } from "../../lib/utils";

const ThemeToggle = forwardRef(({ size = "md", className, ...props }, ref) => {
  const { isDark, toggleTheme } = useTheme();

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <Switch.Root
      ref={ref}
      checked={isDark}
      onCheckedChange={toggleTheme}
      className={cn(
        sizes[size],
        "relative rounded-lg p-2 transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=checked]:bg-gray-800 data-[state=unchecked]:bg-gray-100",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      {...props}
    >
      <div className="relative w-full h-full">
        {/* Sun Icon */}
        <svg
          className={cn(
            iconSizes[size],
            "absolute inset-0 transition-all duration-300 text-yellow-500",
            isDark ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          className={cn(
            iconSizes[size],
            "absolute inset-0 transition-all duration-300 text-blue-400",
            isDark ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </Switch.Root>
  );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
