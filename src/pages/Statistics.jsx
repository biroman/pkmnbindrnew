import { BarChart3 } from "lucide-react";

const Statistics = () => {
  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Collection Statistics
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Detailed insights and analytics about your Pokemon card collection
          </p>
        </div>

        {/* Statistics content will go here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
          <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard Coming Soon
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            View charts and graphs showing collection value trends, rarity
            distribution, and completion rates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
