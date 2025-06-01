import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Share2,
  Lock,
  HardDrive,
  Cloud,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../components/ui";
import { AnonymousLimitBanner } from "../components/anonymous";

const Collections = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration (replace with real data later)
  const binders = []; // Empty for now, will be populated with real data

  const handleCreateBinder = () => {
    // Navigate to binder creation page
    navigate("/app/binder");
  };

  return (
    <TooltipProvider>
      <div className="p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Anonymous User Banner */}
          {!currentUser && (
            <div className="mb-6">
              <AnonymousLimitBanner variant="compact" />
            </div>
          )}

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {currentUser ? "My Binders" : "Binders"}
                </h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {currentUser
                    ? "Organize your Pokemon cards into custom collections"
                    : "Create and organize your Pokemon card binders locally"}
                </p>
              </div>

              <Button
                onClick={handleCreateBinder}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Binder
              </Button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search binders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>

              <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0 border-l border-gray-200 dark:border-gray-700"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Binders Grid/List */}
          {binders.length === 0 ? (
            /* Empty State */
            <Card className="p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-6">
                  <Folder className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 dark:text-blue-400" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentUser
                    ? "Create Your First Binder"
                    : "Start Your Collection"}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base leading-relaxed">
                  {currentUser
                    ? "Organize your Pokemon cards into themed collections. Create binders for different sets, rarities, or your favorite Pokemon!"
                    : "Try out our binder system! Create unlimited binders locally and organize your Pokemon cards by set, type, or any way you like."}
                </p>

                {/* Feature highlights for anonymous users */}
                {!currentUser && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                    <div className="flex items-start space-x-3">
                      <HardDrive className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Unlimited Local Storage
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Create as many binders as you want
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Folder className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Full Organization
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Sort, filter, and manage your cards
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 opacity-50">
                      <Lock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Cloud Sync
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Requires sign up
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 opacity-50">
                      <Lock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Share with Friends
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Requires sign up
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateBinder}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {currentUser
                    ? "Create Your First Binder"
                    : "Try Creating a Binder"}
                </Button>

                {/* Upgrade prompt for anonymous users */}
                {!currentUser && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Want cloud sync and sharing?
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        (window.location.href = "/auth?mode=signup")
                      }
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    >
                      <Cloud className="h-4 w-4 mr-2" />
                      Sign Up Free
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            /* Binders Grid/List View */
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {/* Binder cards will go here */}
              {binders.map((binder) => (
                <Card
                  key={binder.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    {/* Binder content */}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Collections;
