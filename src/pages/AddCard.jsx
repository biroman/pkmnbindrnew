const AddCard = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Card
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add a new Pokemon card to your collection
          </p>
        </div>

        {/* Add card form will go here */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">➕</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Card Entry Form Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This page will have a form to add new Pokemon cards with details
            like name, set, rarity, condition, and value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddCard;
