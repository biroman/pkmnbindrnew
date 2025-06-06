import { useState } from "react";
import {
  Share2,
  Eye,
  EyeOff,
  Link,
  Clock,
  Users,
  Globe,
  Lock,
  Construction,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  FormField,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Alert,
  AlertDescription,
} from "../../ui";

const PrivacySharingSection = () => {
  const [settings, setSettings] = useState({
    defaultVisibility: "private",
    allowPublicDiscovery: false,
    linkExpiration: "never",
    allowComments: true,
    allowCopy: false,
    showOwnerInfo: true,
    requireEmailForView: false,
    allowAnalytics: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save settings API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call
      setAlert({
        type: "success",
        message: "Privacy settings saved successfully!",
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to save settings" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Privacy & Sharing
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Control who can see your binders and how they can be shared
          </p>
        </div>

        {/* Coming Soon Banner */}
        <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <Construction className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Coming Soon!</strong> Privacy and sharing features are
            currently under development. These settings will be available in an
            upcoming update.
          </AlertDescription>
        </Alert>

        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "success"}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Default Visibility Settings */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                Default Visibility Settings
              </div>
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full font-medium">
                Coming Soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField>
              <Label className="text-gray-400 dark:text-gray-500">
                Default Binder Visibility
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={settings.defaultVisibility}
                    onValueChange={(value) =>
                      updateSetting("defaultVisibility", value)
                    }
                    disabled={true}
                  >
                    <SelectTrigger className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                      <SelectValue placeholder="Choose visibility..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Private - Only you can view
                        </div>
                      </SelectItem>
                      <SelectItem value="unlisted">
                        <div className="flex items-center">
                          <Link className="h-4 w-4 mr-2" />
                          Unlisted - Anyone with link can view
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Public - Anyone can discover and view
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Feature coming soon! This will control how new binders are
                    visible by default.
                  </p>
                </TooltipContent>
              </Tooltip>
            </FormField>

            <FormField>
              <Label className="text-gray-400 dark:text-gray-500">
                Allow Public Discovery
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={settings.allowPublicDiscovery ? "allow" : "block"}
                    onValueChange={(value) =>
                      updateSetting("allowPublicDiscovery", value === "allow")
                    }
                    disabled={true}
                  >
                    <SelectTrigger className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">
                        Allow others to find my public binders
                      </SelectItem>
                      <SelectItem value="block">
                        Hide my binders from search and discovery
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Feature coming soon! This will control whether your public
                    binders appear in search results.
                  </p>
                </TooltipContent>
              </Tooltip>
            </FormField>
          </CardContent>
        </Card>

        {/* Link Sharing Settings */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Link className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                Link Sharing Settings
              </div>
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full font-medium">
                Coming Soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField>
              <Label className="text-gray-400 dark:text-gray-500">
                Default Link Expiration
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={settings.linkExpiration}
                    onValueChange={(value) =>
                      updateSetting("linkExpiration", value)
                    }
                    disabled={true}
                  >
                    <SelectTrigger className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                      <SelectValue placeholder="Choose expiration..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never expire</SelectItem>
                      <SelectItem value="1-day">1 Day</SelectItem>
                      <SelectItem value="1-week">1 Week</SelectItem>
                      <SelectItem value="1-month">1 Month</SelectItem>
                      <SelectItem value="3-months">3 Months</SelectItem>
                      <SelectItem value="1-year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Feature coming soon! This will control how long shared links
                    remain active.
                  </p>
                </TooltipContent>
              </Tooltip>
            </FormField>

            <FormField>
              <Label className="text-gray-400 dark:text-gray-500">
                Require Email for Viewing
              </Label>
              <Select
                value={settings.requireEmailForView ? "require" : "allow"}
                onValueChange={(value) =>
                  updateSetting("requireEmailForView", value === "require")
                }
                disabled={true}
              >
                <SelectTrigger className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allow">Allow anonymous viewing</SelectItem>
                  <SelectItem value="require">
                    Require email to view shared binders
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>

        {/* Interaction Settings */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                Viewer Interaction Settings
              </div>
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full font-medium">
                Coming Soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField>
              <Label className="text-gray-400 dark:text-gray-500">
                Allow Comments
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={settings.allowComments ? "allow" : "disable"}
                    onValueChange={(value) =>
                      updateSetting("allowComments", value === "allow")
                    }
                    disabled={true}
                  >
                    <SelectTrigger className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">
                        Allow comments on shared binders
                      </SelectItem>
                      <SelectItem value="disable">Disable comments</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Feature coming soon! This will control whether viewers can
                    leave comments.
                  </p>
                </TooltipContent>
              </Tooltip>
            </FormField>

            <FormField>
              <Label className="text-gray-400 dark:text-gray-500">
                Allow Copying/Downloading
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={settings.allowCopy ? "allow" : "disable"}
                    onValueChange={(value) =>
                      updateSetting("allowCopy", value === "allow")
                    }
                    disabled={true}
                  >
                    <SelectTrigger className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">
                        Allow viewers to copy/export binder data
                      </SelectItem>
                      <SelectItem value="disable">
                        Prevent copying/downloading
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Feature coming soon! This will control whether viewers can
                    copy your binder data.
                  </p>
                </TooltipContent>
              </Tooltip>
            </FormField>

            <FormField>
              <Label className="text-gray-400 dark:text-gray-500">
                Show Owner Information
              </Label>
              <Select
                value={settings.showOwnerInfo ? "show" : "hide"}
                onValueChange={(value) =>
                  updateSetting("showOwnerInfo", value === "show")
                }
                disabled={true}
              >
                <SelectTrigger className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="show">
                    Show my profile on shared binders
                  </SelectItem>
                  <SelectItem value="hide">Keep my profile private</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField>
              <Label className="text-gray-400 dark:text-gray-500">
                View Analytics
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={settings.allowAnalytics ? "enable" : "disable"}
                    onValueChange={(value) =>
                      updateSetting("allowAnalytics", value === "enable")
                    }
                    disabled={true}
                  >
                    <SelectTrigger className="cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enable">
                        Track view counts and analytics
                      </SelectItem>
                      <SelectItem value="disable">
                        Disable view tracking
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Feature coming soon! This will control whether to track
                    binder views and analytics.
                  </p>
                </TooltipContent>
              </Tooltip>
            </FormField>
          </CardContent>
        </Card>

        {/* Privacy Overview */}
        <Card className="border-blue-200 dark:border-blue-800 opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <Eye className="h-5 w-5 mr-2" />
                Privacy Summary
              </div>
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full font-medium">
                Coming Soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-500 dark:text-gray-400">
                  Privacy settings will be displayed here once implemented.
                </p>
                <ul className="text-gray-400 dark:text-gray-500 space-y-1">
                  <li>• Default visibility controls</li>
                  <li>• Public discovery preferences</li>
                  <li>• Comment and interaction settings</li>
                  <li>• Link sharing configurations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSaveSettings}
                loading={isLoading}
                className="flex items-center cursor-not-allowed opacity-50"
                disabled={true}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Save Privacy Settings
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Privacy settings are coming soon and cannot be saved yet.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PrivacySharingSection;
