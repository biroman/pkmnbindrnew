import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Button from "../components/ui/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-3 sm:p-6">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-6 text-gray-400 dark:text-gray-500" />
        <h1 className="text-4xl sm:text-6xl lg:text-9xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto px-4">
          Oops! The page you're looking for doesn't exist. It might have been
          moved or deleted.
        </p>
        <Link to="/app/dashboard">
          <Button variant="primary" size="lg">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
