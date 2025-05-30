import { Folder } from "lucide-react";

const Collections = () => {
  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Collections & Binders
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Organize your cards into custom collections and binders
          </p>
        </div>

        {/* Collections grid will go here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
          <Folder className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Collection Management Coming Soon
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Create and manage custom collections like "Base Set", "Favorites",
            or "Rare Cards".
          </p>
        </div>
      </div>
    </div>
  );
};

export default Collections;
