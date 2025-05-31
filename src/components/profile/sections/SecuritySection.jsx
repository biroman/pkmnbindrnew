import { useState } from "react";
import { Shield, Lock, Mail, AlertTriangle, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui";
import SecuritySettings from "../SecuritySettings";
import EmailVerification from "../EmailVerification";

const SecuritySection = ({
  changePassword,
  isEmailVerified,
  sendVerificationEmail,
  refreshUser,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    // This would need to be implemented in your auth context
    // For now, just show confirmation
    console.log("Account deletion requested");
    setIsDeleteDialogOpen(false);
    // TODO: Implement actual account deletion
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security Settings
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your password, email verification, and account security
          </p>
        </div>

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Lock className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Password Protected
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Strong password active
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {isEmailVerified() ? "Email Verified" : "Email Pending"}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {isEmailVerified()
                      ? "Account verified"
                      : "Verification needed"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    2FA Recommended
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Not yet implemented
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Verification - Show if not verified */}
        <EmailVerification
          isEmailVerified={isEmailVerified}
          sendVerificationEmail={sendVerificationEmail}
          refreshUser={refreshUser}
        />

        {/* Password Change */}
        <SecuritySettings changePassword={changePassword} />

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>

                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center ml-4 bg-red-500 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Permanently delete your account</p>
                    </TooltipContent>
                  </Tooltip>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Delete Account Permanently?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          This action will permanently delete your account and
                          all associated data, including:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                          <li>Your profile information</li>
                          <li>All your Pokemon binders</li>
                          <li>Your account settings and preferences</li>
                          <li>Your account history and statistics</li>
                        </ul>
                        <p className="font-medium text-red-600 dark:text-red-400 mt-4">
                          This action cannot be undone.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        Yes, Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default SecuritySection;
