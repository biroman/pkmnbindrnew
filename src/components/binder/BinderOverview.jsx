import PageThumbnail from "./PageThumbnail";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  // arrayMove is used in Binder.jsx, not directly here
} from "@dnd-kit/sortable";

const BinderOverview = ({
  pages, // Now expects an array of page objects e.g. [{ id: 'page-1', number: 1}, ...]
  currentPageNumber,
  // onPageClick, // For future navigation
  onPageReorder,
  allCards = [], // All cards in the binder for generating previews
  gridSize = "3x3", // Grid size for layout calculations
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id && over) {
      const oldIndex = pages.findIndex((page) => page.id === active.id);
      const newIndex = pages.findIndex((page) => page.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onPageReorder({ oldIndex, newIndex });
      }
    }
  };

  if (!pages || pages.length === 0) {
    return (
      <div className="flex-1 h-full flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
        This binder has no pages to display in the overview.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={pages.map((p) => p.id)}
        strategy={rectSortingStrategy}
      >
        <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-100 dark:bg-gray-800/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
            {pages.map((page) => (
              <PageThumbnail
                key={page.id}
                id={page.id}
                pageNumber={page.number}
                isActive={page.number === currentPageNumber}
                cards={allCards}
                gridSize={gridSize}
                // onClick={() => onPageClick(page.number)} // For future navigation
              />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default BinderOverview;
