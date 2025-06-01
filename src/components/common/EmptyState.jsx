import { BookOpen, Users, Search, Plus, RefreshCw } from "lucide-react";
import Button from "../ui/Button";

/**
 * Reusable empty state component with different variants and actions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display (defaults based on variant)
 * @param {string} props.title - Main title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Action button or element
 * @param {string} props.variant - Style variant: 'default', 'search', 'error', 'collection'
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Empty state component
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "h-8 w-8",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      icon: "h-12 w-12",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16",
      icon: "h-16 w-16",
      title: "text-xl",
      description: "text-base",
    },
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case "search":
        return <Search className={sizeClasses[size].icon} />;
      case "collection":
        return <BookOpen className={sizeClasses[size].icon} />;
      case "users":
        return <Users className={sizeClasses[size].icon} />;
      case "error":
        return <RefreshCw className={sizeClasses[size].icon} />;
      default:
        return <BookOpen className={sizeClasses[size].icon} />;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={`text-center ${sizeClasses[size].container} ${className}`}>
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-4">
        <div className="text-gray-400 dark:text-gray-600">{displayIcon}</div>
      </div>
      {title && (
        <h3
          className={`font-semibold text-gray-900 dark:text-white mb-2 ${sizeClasses[size].title}`}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className={`text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto ${sizeClasses[size].description}`}
        >
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

/**
 * Predefined empty state for collections/binders
 */
export const EmptyCollection = ({
  actionHref,
  actionText = "Create First Binder",
}) => (
  <EmptyState
    variant="collection"
    title="Start Your Pokemon Journey"
    description="Create your first binder and start organizing your Pokemon cards. Share your collection with friends and fellow collectors!"
    action={
      actionHref ? (
        <Button
          as="a"
          href={actionHref}
          className="inline-flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{actionText}</span>
        </Button>
      ) : null
    }
  />
);

/**
 * Predefined empty state for search results
 */
export const EmptySearchResults = ({ searchTerm, onClear }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={
      searchTerm
        ? `No items match "${searchTerm}". Try adjusting your search terms or filters.`
        : "Try searching for something or adjust your filters."
    }
    action={
      onClear ? (
        <Button variant="outline" onClick={onClear}>
          Clear Search
        </Button>
      ) : null
    }
  />
);

/**
 * Predefined empty state for activity/feed
 */
export const EmptyActivity = () => (
  <EmptyState
    icon={<RefreshCw className="h-12 w-12" />}
    title="No recent activity"
    description="Your activity will appear here as you use the app."
    size="sm"
  />
);

/**
 * Predefined empty state for user lists
 */
export const EmptyUserList = () => (
  <EmptyState
    variant="users"
    title="No users found"
    description="No users match the current filters or search criteria."
    size="sm"
  />
);

/**
 * Predefined empty state for data loading errors
 */
export const EmptyError = ({ onRetry, errorMessage }) => (
  <EmptyState
    variant="error"
    title="Unable to load data"
    description={
      errorMessage || "Something went wrong while loading. Please try again."
    }
    action={
      onRetry ? (
        <Button
          variant="outline"
          onClick={onRetry}
          className="inline-flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>
      ) : null
    }
  />
);

/**
 * Generic empty state with quick setup
 */
export const QuickEmptyState = ({
  iconName = "BookOpen",
  title,
  description,
  actionText,
  onAction,
  ...props
}) => {
  const icons = {
    BookOpen: <BookOpen className="h-12 w-12" />,
    Users: <Users className="h-12 w-12" />,
    Search: <Search className="h-12 w-12" />,
    Plus: <Plus className="h-12 w-12" />,
    RefreshCw: <RefreshCw className="h-12 w-12" />,
  };

  return (
    <EmptyState
      icon={icons[iconName]}
      title={title}
      description={description}
      action={
        actionText && onAction ? (
          <Button onClick={onAction}>{actionText}</Button>
        ) : null
      }
      {...props}
    />
  );
};

export default EmptyState;
