import React from "react";
import { X } from "lucide-react";
import {
  Dialog as RadixDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
  DialogClose,
} from "./Dialog"; // Assuming your styled Radix components are here

const Modal = ({
  isOpen,
  onClose,
  title,
  titleIcon: TitleIcon, // Allow passing an icon component
  iconColor = "text-gray-500 dark:text-gray-400", // Default icon color
  children,
  maxWidth = "sm:max-w-lg", // Default max width
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <RadixDialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className={`w-full ${maxWidth} bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden p-0`}
          onEscapeKeyDown={onClose}
          onPointerDownOutside={onClose}
          showCloseButton={false}
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              {TitleIcon && (
                <TitleIcon
                  className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${iconColor}`}
                  aria-hidden="true"
                />
              )}
              <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </DialogTitle>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 sm:p-6">{children}</div>
        </DialogContent>
      </DialogPortal>
    </RadixDialog>
  );
};

export default Modal;
