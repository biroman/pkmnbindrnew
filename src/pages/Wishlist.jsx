import { Target } from "lucide-react";

const Wishlist = () => {
  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Wishlist
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Keep track of Pokemon cards you want to add to your collection
          </p>
        </div>

        {/* Wishlist content will go here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
          <Target className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Wishlist Coming Soon
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Track cards you want with priority levels, maximum prices, and
            notes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
