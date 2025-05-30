const Collection = () => {
  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Collection
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Browse and manage your Pokemon card collection
          </p>
        </div>

        {/* Collection content will go here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
          <div className="text-4xl sm:text-6xl mb-4">📚</div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Collection View Coming Soon
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            This page will display your Pokemon card collection with filtering
            and sorting options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Collection;
