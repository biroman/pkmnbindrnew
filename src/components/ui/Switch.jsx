import { forwardRef } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

const Switch = forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "switch-root peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-300 dark:bg-gray-600",
      className
    )}
    style={{
      transition: "background-color 200ms ease-in-out",
    }}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "switch-thumb pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0"
      )}
      style={{
        transform: "translateX(0px)",
        transition: "transform 200ms ease-in-out",
        willChange: "transform",
      }}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

// Add CSS for the checked states
const switchStyles = `
.switch-root[data-state="checked"] {
  background-color: #2563eb !important; /* blue-600 */
}

.switch-thumb[data-state="checked"] {
  transform: translateX(21px) !important;
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleId = "radix-switch-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = switchStyles;
    document.head.appendChild(style);
  }
}

export { Switch };
