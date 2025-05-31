import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export const cva = (base, variants) => {
  return (props) => {
    const variantClasses = Object.entries(props || {})
      .map(([key, value]) => {
        return variants?.[key]?.[value];
      })
      .filter(Boolean);

    return cn(base, ...variantClasses);
  };
};
