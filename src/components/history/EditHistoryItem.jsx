import { Clock } from "lucide-react";

const EditHistoryItem = ({ action }) => {
  // action: { id: string, description: string, timestamp: Date }
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 cursor-default">
      <p className="text-sm text-gray-800 dark:text-gray-200">
        {action.description}
      </p>
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
        <Clock className="w-3 h-3 mr-1.5" />
        <span>{timeAgo(action.timestamp)}</span>
      </div>
    </div>
  );
};

export default EditHistoryItem;
