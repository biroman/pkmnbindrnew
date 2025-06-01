import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, HardDrive, Cloud } from "lucide-react";
import { Button, Badge, Card, CardContent } from "../components/ui";

const Binder = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { binderId } = useParams();

  const handleBackToCollections = () => {
    if (currentUser) {
      navigate("/app/collections");
    } else {
      navigate("/under-development");
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Coming Soon Placeholder */}
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-6">
              <Plus className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Binder Tool Coming Soon
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              We're building an amazing binder creation and management tool.
              This will be where you create and organize your Pokemon card
              collections.
            </p>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              {currentUser ? (
                <div className="flex items-center">
                  <Cloud className="h-4 w-4 mr-2 text-green-500" />
                  Ready for cloud sync
                </div>
              ) : (
                <div className="flex items-center">
                  <HardDrive className="h-4 w-4 mr-2 text-blue-500" />
                  Local storage ready
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Binder;
