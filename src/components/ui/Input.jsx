import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    ${
      error
        ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400"
        : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
    }
    dark:focus:ring-blue-400
    ${className}
  `.trim();

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
