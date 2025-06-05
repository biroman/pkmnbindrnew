import { Link } from "react-router-dom";
import {
  BookOpen,
  Grid3X3,
  CalendarDays,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

// Helper to format Firestore Timestamps
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A"; // Handle null or undefined timestamp
  // Check if it's already a Date object (e.g., from client-side creation before Firestore sync)
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  // Check if it's a Firestore Timestamp object
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  // If it's a string or number (e.g. from older data or direct ms timestamp), try to parse
  try {
    const date = new Date(timestamp);
    if (!isNaN(date.valueOf())) {
      // Check if valid date
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  } catch (e) {
    // Fallthrough
  }
  return "Invalid Date"; // Fallback for unparseable timestamps
};

const getSlotsForGrid = (gridSize) => {
  if (!gridSize || typeof gridSize !== "string") return 9; // Default for safety
  const parts = gridSize.split("x");
  if (parts.length !== 2) return 9; // Default
  const num1 = parseInt(parts[0]);
  const num2 = parseInt(parts[1]);
  if (isNaN(num1) || isNaN(num2)) return 9; // Default
  return num1 * num2;
};

const BinderCard = ({ binder, onDeleteInitiate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!binder) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Binder data not available.
        </p>
      </div>
    );
  }

  const slotsPerPage = getSlotsForGrid(binder.gridSize);
  const totalPossibleSlots = binder.pageCount * slotsPerPage;
  const progressPercentage =
    totalPossibleSlots > 0
      ? Math.round(
          ((binder.totalCardsInBinder || 0) / totalPossibleSlots) * 100
        )
      : 0;

  const handleDropdownToggle = (e) => {
    e.preventDefault(); // Prevent Link navigation when clicking options button
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteInitiate(binder.id, binder.binderName);
    setIsDropdownOpen(false);
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 relative"
    >
      <div className="absolute top-3 right-3 z-10" ref={dropdownRef}>
        <button
          onClick={handleDropdownToggle}
          aria-label="More options"
          className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <MoreVertical size={18} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
            <button
              onClick={handleDeleteClick}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300"
            >
              <Trash2 size={14} className="mr-2" />
              Delete Binder
            </button>
          </div>
        )}
      </div>

      <Link
        to={`/app/binder/${binder.id}`}
        className="block p-5 sm:p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-xl"
      >
        <div className="flex items-start justify-between mb-3 pr-8">
          <h2
            className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate pr-8"
            title={binder.binderName}
          >
            {binder.binderName || "Untitled Binder"}
          </h2>
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        </div>

        {binder.description && (
          <p
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2"
            title={binder.description}
          >
            {binder.description}
          </p>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5">
            <div
              className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
              aria-valuenow={progressPercentage}
              aria-valuemin="0"
              aria-valuemax="100"
              role="progressbar"
              aria-label={`Binder progress ${progressPercentage} percent`}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {binder.totalCardsInBinder || 0} / {totalPossibleSlots} cards
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 dark:text-gray-400 space-y-1 sm:space-y-0">
            <div className="flex items-center">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              Created: {formatDate(binder.createdAt)}
            </div>
            <div className="flex items-center">
              <Grid3X3 className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              {binder.gridSize} ({binder.pageCount} pages)
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BinderCard;
