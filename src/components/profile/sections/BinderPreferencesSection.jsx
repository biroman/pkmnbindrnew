import { useState, useEffect } from "react";
import {
  Settings2,
  Grid3X3,
  SortAsc,
  SortDesc,
  Save,
  Check,
  Palette,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  FormField,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Alert,
  AlertDescription,
} from "../../ui";
import { useAuth } from "../../../contexts/AuthContext";
import {
  updateUserPreferences,
  getUserPreferences,
} from "../../../services/firestore";

const GridPreviewCard = ({ size, isSelected, onClick, label }) => {
  const getGridLayout = (size) => {
    switch (size) {
      case "1x1":
        return { cols: 1, rows: 1 };
      case "2x2":
        return { cols: 2, rows: 2 };
      case "3x3":
        return { cols: 3, rows: 3 };
      case "4x3":
        return { cols: 4, rows: 3 };
      case "4x4":
        return { cols: 4, rows: 4 };
      default:
        return { cols: 3, rows: 3 };
    }
  };

  const { cols, rows } = getGridLayout(size);
  const totalCells = cols * rows;

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 border-2 rounded-lg p-4 hover:shadow-md ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Select ${label} grid layout`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Grid preview */}
      <div className="flex flex-col items-center space-y-3">
        <div
          className={`grid gap-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600`}
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            width: "fit-content",
          }}
        >
          {Array.from({ length: totalCells }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-5 rounded-sm border ${
                isSelected
                  ? "bg-blue-100 border-blue-300 dark:bg-blue-800 dark:border-blue-600"
                  : "bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Label */}
        <div className="text-center">
          <p
            className={`text-sm font-medium ${
              isSelected
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {label}
          </p>
          <p
            className={`text-xs ${
              isSelected
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {totalCells} cards
          </p>
        </div>
      </div>
    </div>
  );
};

const BinderPreferencesSection = () => {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState({
    gridSize: "3x3",
    sortingDirection: true, // true = ascending, false = descending
    autoSave: true,
    theme: "light", // Default theme
  });
  const [initialPreferences, setInitialPreferences] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const gridOptions = [
    { value: "1x1", label: "1×1 Grid" },
    { value: "2x2", label: "2×2 Grid" },
    { value: "3x3", label: "3×3 Grid" },
    { value: "4x3", label: "4×3 Grid" },
    { value: "4x4", label: "4×4 Grid" },
  ];

  const themeOptions = [
    { value: "light", label: "Light Theme" },
    { value: "dark", label: "Dark Theme" },
    { value: "auto", label: "Auto (System)" },
    { value: "blue", label: "Blue Theme (Coming Soon)" },
    { value: "green", label: "Green Theme (Coming Soon)" },
  ];

  // Check if preferences have changed
  const hasChanges = () => {
    return JSON.stringify(preferences) !== JSON.stringify(initialPreferences);
  };

  // Load user preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!currentUser?.uid) return;

      try {
        setIsInitialLoading(true);
        const result = await getUserPreferences(currentUser.uid);

        if (result.success) {
          // Add theme to the loaded preferences with fallback
          const loadedPreferences = {
            ...result.data,
            theme: result.data.theme || "light",
          };
          setPreferences(loadedPreferences);
          setInitialPreferences(loadedPreferences);
        } else {
          console.error("Failed to load preferences:", result.error);
          setAlert({
            type: "error",
            message: "Failed to load your preferences. Using defaults.",
          });
          setTimeout(() => setAlert(null), 5000);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        setAlert({
          type: "error",
          message: "Failed to load your preferences. Using defaults.",
        });
        setTimeout(() => setAlert(null), 5000);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadPreferences();
  }, [currentUser?.uid]);

  const handleSavePreferences = async () => {
    if (!currentUser?.uid) {
      setAlert({
        type: "error",
        message: "You must be logged in to save preferences",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUserPreferences(currentUser.uid, preferences);

      if (result.success) {
        setAlert({
          type: "success",
          message: "Preferences saved successfully!",
        });
        setInitialPreferences({ ...preferences }); // Update initial state after successful save
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({
          type: "error",
          message: result.error || "Failed to save preferences",
        });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setAlert({
        type: "error",
        message: "An unexpected error occurred while saving",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Show loading spinner while loading initial preferences
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Binder Preferences
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Set your default options for creating and displaying Pokemon binders
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your preferences...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Binder Preferences
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Set your default options for creating and displaying Pokemon binders
          </p>
        </div>

        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "success"}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Grid Size Setting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Grid3X3 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Default Grid Size
            </CardTitle>
            <Label className="text-sm text-gray-500 dark:text-gray-400">
              You will still be able to change the grid size on a per-binder
              basis.
            </Label>
          </CardHeader>
          <CardContent>
            <FormField>
              <Label className="mb-4 block">
                Choose your preferred grid layout
              </Label>
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
                {gridOptions.map((option) => (
                  <GridPreviewCard
                    key={option.value}
                    size={option.value}
                    label={option.label}
                    isSelected={preferences.gridSize === option.value}
                    onClick={() => updatePreference("gridSize", option.value)}
                  />
                ))}
              </div>
            </FormField>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              Default Binder Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField>
              <Label>Theme Preference</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => updatePreference("theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose theme..." />
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose your preferred theme for the application</p>
                </TooltipContent>
              </Tooltip>
            </FormField>
          </CardContent>
        </Card>

        {/* Behavior Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings2 className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              Behavior Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sorting Direction */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {preferences.sortingDirection ? (
                    <SortAsc className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <SortDesc className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Sorting Direction
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {preferences.sortingDirection
                      ? "Cards are sorted in ascending order (A-Z, 1-9)"
                      : "Cards are sorted in descending order (Z-A, 9-1)"}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.sortingDirection}
                onCheckedChange={(checked) =>
                  updatePreference("sortingDirection", checked)
                }
                aria-label="Sorting Direction"
              />
            </div>

            {/* Auto-Save */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Save className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Auto-Save
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {preferences.autoSave
                      ? "Changes are saved automatically as you edit"
                      : "You need to manually save changes"}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) =>
                  updatePreference("autoSave", checked)
                }
                aria-label="Auto-Save"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSavePreferences}
            loading={isLoading}
            className={`flex items-center transition-all ${
              hasChanges() && !isLoading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-default"
            }`}
            disabled={isLoading || !hasChanges()}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            {isLoading
              ? "Saving..."
              : hasChanges()
              ? "Save Changes"
              : "No Changes"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BinderPreferencesSection;
