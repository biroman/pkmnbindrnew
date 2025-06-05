import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PageThumbnail = ({ id, pageNumber, isActive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        aspect-[2/3] 
        bg-white dark:bg-gray-700 
        rounded-lg 
        flex flex-col items-center justify-center 
        text-gray-700 dark:text-gray-200 
        shadow-lg 
        border-2
        ${isDragging ? "shadow-2xl scale-105" : "hover:shadow-xl"}
        ${
          isActive && !isDragging
            ? "border-blue-500 ring-2 ring-blue-500"
            : "border-gray-300 dark:border-gray-600"
        }
        ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        p-2
      `}
      aria-label={`Page ${pageNumber}`}
    >
      <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 select-none">
        {pageNumber}
      </span>
      {/* Placeholder for potential mini-preview of page content later */}
      {/* <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">3 cards</div> */}
    </div>
  );
};

export default PageThumbnail;
