import { AnimatePresence, motion } from "framer-motion";
import { X, History as HistoryIcon } from "lucide-react";
import EditHistoryItem from "./EditHistoryItem";
import { Button } from "../ui"; // Assuming Button component exists in src/components/ui
import { useEffect, useRef } from "react"; // Added useEffect and useRef

// Dummy data for now
const DUMMY_HISTORY = [
  {
    id: "1",
    description: "Added 'Pikachu' to 'Favorites'",
    timestamp: new Date(Date.now() - 60000 * 2),
  },
  {
    id: "2",
    description: "Renamed binder to 'My Awesome Collection'",
    timestamp: new Date(Date.now() - 60000 * 5),
  },
  {
    id: "3",
    description: "Changed grid size to 3x4",
    timestamp: new Date(Date.now() - 60000 * 10),
  },
  {
    id: "4",
    description: "Page 2 deleted",
    timestamp: new Date(Date.now() - 60000 * 12),
  },
  {
    id: "5",
    description: "Card 'Charizard' moved to page 3",
    timestamp: new Date(Date.now() - 60000 * 25),
  },
];

const EditHistoryPanel = ({ isOpen, onClose }) => {
  const panelRef = useRef(null); // Create a ref for the panel

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const panelVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "100%", opacity: 0 },
  };

  const transition = {
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1],
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef} // Attach the ref here
          key="edit-history-panel"
          initial="closed"
          animate="open"
          exit="closed"
          variants={panelVariants}
          transition={transition}
          className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white dark:bg-gray-800 shadow-xl z-[60] flex flex-col border-l border-gray-200 dark:border-gray-700"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center">
              <HistoryIcon className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit History
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close history panel"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {DUMMY_HISTORY.length > 0 ? (
              DUMMY_HISTORY.map((action) => (
                <EditHistoryItem key={action.id} action={action} />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No edits recorded yet.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditHistoryPanel;
