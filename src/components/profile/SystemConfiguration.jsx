/**
 * SystemConfiguration Component
 *
 * Admin interface for configuring user limits, feature flags, and system settings.
 * Provides a user-friendly way to manage LIMIT_ENFORCEMENT and other configurations.
 */

import { useState, useEffect } from "react";
import {
  Save,
  RefreshCw,
  Users,
  Database,
  Zap,
  Shield,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  HardDrive,
  Cloud,
  Share,
  Download,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Switch,
  Slider,
  Badge,
  Separator,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Input,
  Label,
} from "../ui";

const SystemConfiguration = () => {
  // State for limit enforcement configuration
  const [limitConfig, setLimitConfig] = useState({
    ENFORCE_BINDER_LIMITS: false,
    ENFORCE_CARD_LIMITS: false,
    ENFORCE_STORAGE_WARNINGS: true,
    ENFORCE_FEATURE_LOCKS: true,
    STRICT_MODE: false,
  });

  // State for user limits
  const [userLimits, setUserLimits] = useState({
    guest: {
      maxBinders: 3,
      maxCardsPerBinder: 50,
    },
    registered: {
      maxBinders: 25,
      maxCardsPerBinder: 400,
    },
  });

  // State for warning thresholds
  const [warningThresholds, setWarningThresholds] = useState({
    BINDER_WARNING: 80,
    CARD_WARNING: 90,
    STORAGE_WARNING: 85,
    API_WARNING: 90,
  });

  // State for feature flags (mockup for future features)
  const [featureFlags, setFeatureFlags] = useState({
    // Current Phase 1 features
    ANONYMOUS_BINDERS: true,
    LOCAL_STORAGE: true,
    BASIC_CARD_MANAGEMENT: true,

    // Future Phase 2 features
    POKEMON_API_INTEGRATION: false,
    SET_COMPLETION_TRACKING: false,
    ADVANCED_SEARCH: false,

    // Future Phase 3 features
    DRAG_AND_DROP: false,
    BULK_OPERATIONS: false,
    CUSTOM_LAYOUTS: false,
    EXPORT_FUNCTIONALITY: false,

    // Future Phase 4 features
    DATA_MIGRATION: false,
    ACCOUNT_SYNC: false,

    // Future Phase 5 features
    SHARING: false,
    COLLABORATION: false,

    // Experimental features
    REAL_TIME_SYNC: false,
    OFFLINE_MODE: false,
    PWA_FEATURES: false,
    AI_CARD_RECOGNITION: false,
    PRICE_TRACKING: false,
    MARKET_ANALYTICS: false,
  });

  // State for performance settings
  const [performanceSettings, setPerformanceSettings] = useState({
    cacheTTL: {
      guest: 1, // hours
      registered: 24, // hours
    },
    maxConcurrentRequests: 10,
    rateLimitRequests: 100,
    rateLimitWindow: 15, // minutes
    imageOptimization: true,
    lazyLoading: true,
    compressionLevel: 6,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Mock function to load current configuration
  const loadConfiguration = async () => {
    // In a real app, this would fetch from your backend/Firebase
    console.log("Loading system configuration...");
    // For now, using the default values set in state
  };

  // Mock function to save configuration
  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to your backend/Firebase
      console.log("Saving configuration:", {
        limitConfig,
        userLimits,
        warningThresholds,
        featureFlags,
        performanceSettings,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setLimitConfig({
      ENFORCE_BINDER_LIMITS: false,
      ENFORCE_CARD_LIMITS: false,
      ENFORCE_STORAGE_WARNINGS: true,
      ENFORCE_FEATURE_LOCKS: true,
      STRICT_MODE: false,
    });
    setHasUnsavedChanges(true);
  };

  // Mark changes when any setting is updated
  const markChanges = () => {
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              System Configuration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure user limits, feature flags, and system behavior
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {lastSaved && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}

            {hasUnsavedChanges && (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-600"
              >
                Unsaved changes
              </Badge>
            )}

            <Button
              onClick={resetToDefaults}
              variant="outline"
              size="sm"
              className="text-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={saveConfiguration}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Warning Alert */}
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Warning:</strong> Changes to system configuration will
            affect all users. Test changes carefully before applying to
            production.
          </AlertDescription>
        </Alert>

        {/* Configuration Tabs */}
        <Tabs defaultValue="limits" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="limits" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              User Limits
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* User Limits Tab */}
          <TabsContent value="limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Limit Enforcement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Active Configuration */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Current Configuration
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">
                        Guest Binders:
                      </span>
                      <span className="ml-2 font-medium">
                        {limitConfig.ENFORCE_BINDER_LIMITS
                          ? `Limited to ${userLimits.guest.maxBinders}`
                          : "Unlimited (local storage)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">
                        Guest Cards:
                      </span>
                      <span className="ml-2 font-medium">
                        {limitConfig.ENFORCE_CARD_LIMITS
                          ? `Limited to ${userLimits.guest.maxCardsPerBinder}`
                          : "Unlimited (local storage)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enforcement Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Guest User Limits
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
                        <div>
                          <Label className="font-medium">
                            Enforce Binder Limits
                          </Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Limit guests to {userLimits.guest.maxBinders}{" "}
                            binders
                          </p>
                        </div>
                        <Switch
                          checked={limitConfig.ENFORCE_BINDER_LIMITS}
                          onCheckedChange={(checked) => {
                            setLimitConfig((prev) => ({
                              ...prev,
                              ENFORCE_BINDER_LIMITS: checked,
                            }));
                            markChanges();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
                        <div>
                          <Label className="font-medium">
                            Enforce Card Limits
                          </Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Limit guests to {userLimits.guest.maxCardsPerBinder}{" "}
                            cards per binder
                          </p>
                        </div>
                        <Switch
                          checked={limitConfig.ENFORCE_CARD_LIMITS}
                          onCheckedChange={(checked) => {
                            setLimitConfig((prev) => ({
                              ...prev,
                              ENFORCE_CARD_LIMITS: checked,
                            }));
                            markChanges();
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      System Enforcement
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
                        <div>
                          <Label className="font-medium">
                            Storage Warnings
                          </Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Show local storage usage warnings
                          </p>
                        </div>
                        <Switch
                          checked={limitConfig.ENFORCE_STORAGE_WARNINGS}
                          onCheckedChange={(checked) => {
                            setLimitConfig((prev) => ({
                              ...prev,
                              ENFORCE_STORAGE_WARNINGS: checked,
                            }));
                            markChanges();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
                        <div>
                          <Label className="font-medium">Feature Locks</Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Lock premium features for guests
                          </p>
                        </div>
                        <Switch
                          checked={limitConfig.ENFORCE_FEATURE_LOCKS}
                          onCheckedChange={(checked) => {
                            setLimitConfig((prev) => ({
                              ...prev,
                              ENFORCE_FEATURE_LOCKS: checked,
                            }));
                            markChanges();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <div>
                          <Label className="font-medium text-red-700 dark:text-red-400">
                            Strict Mode
                          </Label>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Enforce ALL limits globally
                          </p>
                        </div>
                        <Switch
                          checked={limitConfig.STRICT_MODE}
                          onCheckedChange={(checked) => {
                            setLimitConfig((prev) => ({
                              ...prev,
                              STRICT_MODE: checked,
                            }));
                            markChanges();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Limit Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Guest User Limits
                    </h4>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>
                          Max Binders: {userLimits.guest.maxBinders}
                        </Label>
                        <Slider
                          value={[userLimits.guest.maxBinders]}
                          onValueChange={([value]) => {
                            setUserLimits((prev) => ({
                              ...prev,
                              guest: { ...prev.guest, maxBinders: value },
                            }));
                            markChanges();
                          }}
                          max={50}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Max Cards per Binder:{" "}
                          {userLimits.guest.maxCardsPerBinder}
                        </Label>
                        <Slider
                          value={[userLimits.guest.maxCardsPerBinder]}
                          onValueChange={([value]) => {
                            setUserLimits((prev) => ({
                              ...prev,
                              guest: {
                                ...prev.guest,
                                maxCardsPerBinder: value,
                              },
                            }));
                            markChanges();
                          }}
                          max={200}
                          min={10}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Registered User Limits
                    </h4>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>
                          Max Binders: {userLimits.registered.maxBinders}
                        </Label>
                        <Slider
                          value={[userLimits.registered.maxBinders]}
                          onValueChange={([value]) => {
                            setUserLimits((prev) => ({
                              ...prev,
                              registered: {
                                ...prev.registered,
                                maxBinders: value,
                              },
                            }));
                            markChanges();
                          }}
                          max={100}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Max Cards per Binder:{" "}
                          {userLimits.registered.maxCardsPerBinder}
                        </Label>
                        <Slider
                          value={[userLimits.registered.maxCardsPerBinder]}
                          onValueChange={([value]) => {
                            setUserLimits((prev) => ({
                              ...prev,
                              registered: {
                                ...prev.registered,
                                maxCardsPerBinder: value,
                              },
                            }));
                            markChanges();
                          }}
                          max={1000}
                          min={100}
                          step={50}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Phase Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Phase 1 (Current)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(featureFlags)
                    .filter(
                      ([key]) =>
                        key.includes("ANONYMOUS") ||
                        key.includes("LOCAL") ||
                        key.includes("BASIC")
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <Label className="text-sm">
                          {key.replace(/_/g, " ")}
                        </Label>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => {
                            setFeatureFlags((prev) => ({
                              ...prev,
                              [key]: checked,
                            }));
                            markChanges();
                          }}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Phase 2 Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Phase 2 (Planned)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(featureFlags)
                    .filter(
                      ([key]) =>
                        key.includes("API") ||
                        key.includes("COMPLETION") ||
                        key.includes("ADVANCED")
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <Label className="text-sm">
                          {key.replace(/_/g, " ")}
                        </Label>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => {
                            setFeatureFlags((prev) => ({
                              ...prev,
                              [key]: checked,
                            }));
                            markChanges();
                          }}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Experimental Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Experimental
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(featureFlags)
                    .filter(
                      ([key]) =>
                        key.includes("AI") ||
                        key.includes("PRICE") ||
                        key.includes("MARKET") ||
                        key.includes("REAL_TIME")
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <Label className="text-sm">
                          {key.replace(/_/g, " ")}
                        </Label>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => {
                            setFeatureFlags((prev) => ({
                              ...prev,
                              [key]: checked,
                            }));
                            markChanges();
                          }}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Performance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Cache Settings</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>
                          Guest Cache TTL: {performanceSettings.cacheTTL.guest}{" "}
                          hours
                        </Label>
                        <Slider
                          value={[performanceSettings.cacheTTL.guest]}
                          onValueChange={([value]) => {
                            setPerformanceSettings((prev) => ({
                              ...prev,
                              cacheTTL: { ...prev.cacheTTL, guest: value },
                            }));
                            markChanges();
                          }}
                          max={24}
                          min={0.5}
                          step={0.5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Registered Cache TTL:{" "}
                          {performanceSettings.cacheTTL.registered} hours
                        </Label>
                        <Slider
                          value={[performanceSettings.cacheTTL.registered]}
                          onValueChange={([value]) => {
                            setPerformanceSettings((prev) => ({
                              ...prev,
                              cacheTTL: { ...prev.cacheTTL, registered: value },
                            }));
                            markChanges();
                          }}
                          max={72}
                          min={1}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Rate Limiting</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>
                          Max Concurrent Requests:{" "}
                          {performanceSettings.maxConcurrentRequests}
                        </Label>
                        <Slider
                          value={[performanceSettings.maxConcurrentRequests]}
                          onValueChange={([value]) => {
                            setPerformanceSettings((prev) => ({
                              ...prev,
                              maxConcurrentRequests: value,
                            }));
                            markChanges();
                          }}
                          max={50}
                          min={1}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Rate Limit: {performanceSettings.rateLimitRequests}{" "}
                          requests per {performanceSettings.rateLimitWindow} min
                        </Label>
                        <Slider
                          value={[performanceSettings.rateLimitRequests]}
                          onValueChange={([value]) => {
                            setPerformanceSettings((prev) => ({
                              ...prev,
                              rateLimitRequests: value,
                            }));
                            markChanges();
                          }}
                          max={1000}
                          min={10}
                          step={10}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Optimization Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
                      <Label>Image Optimization</Label>
                      <Switch
                        checked={performanceSettings.imageOptimization}
                        onCheckedChange={(checked) => {
                          setPerformanceSettings((prev) => ({
                            ...prev,
                            imageOptimization: checked,
                          }));
                          markChanges();
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
                      <Label>Lazy Loading</Label>
                      <Switch
                        checked={performanceSettings.lazyLoading}
                        onCheckedChange={(checked) => {
                          setPerformanceSettings((prev) => ({
                            ...prev,
                            lazyLoading: checked,
                          }));
                          markChanges();
                        }}
                      />
                    </div>
                    <div className="space-y-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
                      <Label>
                        Compression Level:{" "}
                        {performanceSettings.compressionLevel}
                      </Label>
                      <Slider
                        value={[performanceSettings.compressionLevel]}
                        onValueChange={([value]) => {
                          setPerformanceSettings((prev) => ({
                            ...prev,
                            compressionLevel: value,
                          }));
                          markChanges();
                        }}
                        max={9}
                        min={1}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security & Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <p className="text-center text-blue-600 dark:text-blue-400">
                    🔒 Security configuration coming soon!
                  </p>
                  <p className="text-center text-sm text-blue-500 dark:text-blue-300 mt-2">
                    Features will include: API key management, access control,
                    audit logs, data retention policies, and privacy settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default SystemConfiguration;
