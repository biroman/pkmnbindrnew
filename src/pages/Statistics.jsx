const Statistics = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Collection Statistics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Detailed insights and analytics about your Pokemon card collection
          </p>
        </div>

        {/* Statistics content will go here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View charts and graphs showing collection value trends, rarity
            distribution, and completion rates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
