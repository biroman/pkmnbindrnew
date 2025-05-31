import { forwardRef } from "react";
import { cn } from "../../lib/utils";

// Core Input component (new API)
const InputCore = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-400",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
InputCore.displayName = "InputCore";

// Backward compatible Input component (legacy API)
const Input = forwardRef(
  ({ label, error, helperText, className, ...props }, ref) => {
    // If legacy props are used, render with composition pattern
    if (label || error || helperText) {
      const inputClasses = cn(
        error &&
          "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400",
        className
      );

      return (
        <FormField>
          {label && <Label>{label}</Label>}
          <InputCore ref={ref} className={inputClasses} {...props} />
          {error && <FormMessage>{error}</FormMessage>}
          {helperText && !error && (
            <FormDescription>{helperText}</FormDescription>
          )}
        </FormField>
      );
    }

    // If no legacy props, use the new core component
    return <InputCore ref={ref} className={className} {...props} />;
  }
);
Input.displayName = "Input";

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

const FormField = forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2 text-gray-900 dark:text-white", className)}
    {...props}
  >
    {children}
  </div>
));
FormField.displayName = "FormField";

const FormMessage = forwardRef(({ className, children, ...props }, ref) => {
  if (!children) {
    return null;
  }

  return (
    <p
      ref={ref}
      className={cn(
        "text-sm font-medium text-red-600 dark:text-red-400",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

const FormDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

export { Input, InputCore, Label, FormField, FormMessage, FormDescription };
export default Input;
