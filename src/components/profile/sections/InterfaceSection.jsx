import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Zap, Check, Smartphone, Save } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertDescription,
  Button,
} from "../../ui";
import {
  useAnimations,
  ANIMATION_LEVELS,
} from "../../../contexts/AnimationContext";

const InterfaceSection = () => {
  const {
    userPreference,
    systemPrefersReduced,
    effectiveLevel,
    updatePreference,
    isGuest,
    isLoading: animationLoading,
  } = useAnimations();

  // Local state for unsaved changes
  const [selectedPreference, setSelectedPreference] = useState(userPreference);
  const [isSaving, setIsSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState(null);

  // Update local state when userPreference changes (e.g., on component mount)
  useEffect(() => {
    setSelectedPreference(userPreference);
  }, [userPreference]);

  // Clear alerts after 3 seconds
  useEffect(() => {
    if (saveAlert) {
      const timer = setTimeout(() => setSaveAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveAlert]);

  const hasUnsavedChanges = selectedPreference !== userPreference;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreference(selectedPreference);
      setSaveAlert({
        type: "success",
        message: "Animation preferences saved successfully!",
      });
    } catch (error) {
      setSaveAlert({
        type: "error",
        message: "Failed to save preferences. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedPreference(userPreference);
  };

  const animationOptions = [
    {
      value: null,
      label: "Follow System",
      shortLabel: "System Default",
      preview: "auto",
      description: `Currently: ${systemPrefersReduced ? "Reduced" : "Full"}`,
    },
    {
      value: ANIMATION_LEVELS.FULL,
      label: "Full Animations",
      shortLabel: "Full",
      preview: "full",
      description: "All animations enabled",
    },
    {
      value: ANIMATION_LEVELS.REDUCED,
      label: "Reduced Animations",
      shortLabel: "Reduced",
      preview: "reduced",
      description: "Essential animations only",
    },
    {
      value: ANIMATION_LEVELS.NONE,
      label: "No Animations",
      shortLabel: "None",
      preview: "none",
      description: "Disable all animations",
    },
  ];

  // Animated preview components
  const FullAnimatedIcon = () => (
    <motion.div className="w-6 h-6 rounded-md bg-blue-500 dark:bg-blue-600 relative overflow-hidden shadow-sm">
      <motion.div
        className="w-2 h-2 bg-white/90 rounded-full absolute top-1/2 -translate-y-1/2"
        animate={{ x: [2, 14, 2] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "mirror",
        }}
      />
    </motion.div>
  );

  const ReducedAnimatedIcon = () => (
    <motion.div
      className="w-6 h-6 rounded-md bg-teal-500 dark:bg-teal-600 shadow-sm"
      animate={{ opacity: [0.65, 1, 0.65] }}
      transition={{
        duration: 2.0,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "mirror",
      }}
    />
  );

  const StaticIcon = () => (
    <div className="w-6 h-6 rounded-md bg-slate-400 dark:bg-slate-500 shadow-sm" />
  );

  const AnimationPreview = ({ type }) => {
    switch (type) {
      case "auto":
        return (
          <div className="flex items-center justify-center h-6 space-x-1.5">
            <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            {systemPrefersReduced ? (
              <ReducedAnimatedIcon />
            ) : (
              <FullAnimatedIcon />
            )}
          </div>
        );
      case "full":
        return <FullAnimatedIcon />;
      case "reduced":
        return <ReducedAnimatedIcon />;
      case "none":
        return <StaticIcon />;
      default:
        return (
          <div className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700" />
        );
    }
  };

  if (isGuest) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Interface
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Animation preferences and UI behavior settings
          </p>
        </div>

        <Alert>
          <Monitor className="h-4 w-4" />
          <AlertDescription>
            Interface preferences are only available for logged-in users. As a
            guest, the system will follow your device's accessibility settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Interface
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Customize animations and UI behavior to match your preferences
        </p>
      </div>

      {/* Save Alert */}
      {saveAlert && (
        <Alert variant={saveAlert.type === "error" ? "destructive" : "success"}>
          <AlertDescription>{saveAlert.message}</AlertDescription>
        </Alert>
      )}

      {/* Animation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Animation Preferences
              {!animationLoading && (
                <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  {effectiveLevel === ANIMATION_LEVELS.FULL
                    ? "Full"
                    : effectiveLevel === ANIMATION_LEVELS.REDUCED
                    ? "Reduced"
                    : "None"}
                </span>
              )}
              {animationLoading && (
                <div className="ml-2 w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose how animations behave throughout the application.
            </p>

            {/* Grid layout similar to binder preferences */}
            <div className="grid grid-cols-2 gap-3">
              {animationOptions.map((option) => (
                <button
                  key={option.value || "system"}
                  onClick={() => setSelectedPreference(option.value)}
                  disabled={animationLoading || isSaving}
                  className={`p-3 text-center rounded-lg border transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    selectedPreference === option.value
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500"
                  } ${
                    animationLoading || isSaving
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2.5">
                    <div className="flex items-center justify-center relative h-6 mb-1">
                      <AnimationPreview type={option.preview} />
                      {selectedPreference === option.value && (
                        <Check className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0.5 text-white bg-blue-500 dark:bg-blue-600 rounded-full shadow-md" />
                      )}
                    </div>
                    <div className="text-xs font-medium">
                      {option.shortLabel}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Save/Reset buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              {hasUnsavedChanges && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                  size="sm"
                >
                  Reset
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                loading={isSaving}
                size="sm"
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future UI Settings Placeholder */}
      <Card className="border-slate-200 dark:border-slate-700 opacity-75">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-500 dark:text-slate-400">
            <Monitor className="h-5 w-5 mr-2" />
            Additional Interface Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Monitor className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              More interface options coming soon!
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Font sizes, compact mode, keyboard shortcuts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterfaceSection;
