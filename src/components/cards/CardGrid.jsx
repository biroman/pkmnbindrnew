import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui";
import CardItem from "./CardItem";

const CardGrid = ({
  cards,
  selectedCards,
  onCardToggle,
  currentPage,
  totalPages,
  onPageChange,
  emptyMessage = "No cards found.",
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <CardItem
              key={card.id || `card-${index}-${Date.now()}`}
              card={card}
              isSelected={selectedCards.some((c) => c.id === card.id)}
              onToggle={() => onCardToggle(card)}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-1">
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant={1 === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    className="w-8 h-8 p-0"
                  >
                    1
                  </Button>
                  {currentPage > 4 && (
                    <span className="px-1 text-gray-400">...</span>
                  )}
                </>
              )}

              {/* Show pages around current */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(
                  1,
                  Math.min(currentPage - 2, totalPages - 4)
                );
                const page = startPage + i;

                if (page > totalPages) return null;

                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-1 text-gray-400">...</span>
                  )}
                  <Button
                    variant={totalPages === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default CardGrid;
