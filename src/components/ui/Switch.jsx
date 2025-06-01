import { forwardRef } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

const Switch = forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "switch-root peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-blue-300 dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-300 dark:bg-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500",
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
        "switch-thumb pointer-events-none block h-5 w-5 rounded-full bg-white dark:bg-gray-100 shadow-lg ring-0 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
      style={{
        transition: "transform 200ms ease-in-out",
        willChange: "transform",
      }}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
