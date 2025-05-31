import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Alert = forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-white border-gray-200 text-gray-950 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-50",
      destructive:
        "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
      success:
        "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
      warning:
        "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border p-4",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

const AlertIcon = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex-shrink-0", className)} {...props}>
    {children}
  </div>
));
AlertIcon.displayName = "AlertIcon";

const AlertContent = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start space-x-3", className)}
    {...props}
  />
));
AlertContent.displayName = "AlertContent";

// Legacy Alert component for backward compatibility
const LegacyAlert = ({ alert, onClose }) => {
  if (!alert) return null;

  const variantMap = {
    success: "success",
    error: "destructive",
    info: "default",
  };

  return (
    <Alert variant={variantMap[alert.type] || "default"}>
      <AlertDescription>{alert.message}</AlertDescription>
    </Alert>
  );
};

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
  AlertContent,
  LegacyAlert,
};
export default LegacyAlert;
