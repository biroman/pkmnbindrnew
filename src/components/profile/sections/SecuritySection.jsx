import { useState } from "react";
import {
  Shield,
  Lock,
  Mail,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
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
  Input,
  FormField,
  Label,
  FormMessage,
  Alert,
  AlertDescription,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui";
import SecuritySettings from "../SecuritySettings";
import EmailVerification from "../EmailVerification";
import { useEmailVerificationRestrictions } from "../../../hooks/useEmailVerificationRestrictions";

const SecuritySection = ({
  changePassword,
  isEmailVerified,
  sendVerificationEmail,
  refreshUser,
  deleteAccount,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(null);

  const { isFeatureRestricted, getRestrictionMessage } =
    useEmailVerificationRestrictions();

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteAlert({
        type: "error",
        message: "Please enter your password to confirm account deletion.",
      });
      return;
    }

    setIsDeleting(true);
    setDeleteAlert(null);

    try {
      const result = await deleteAccount(deletePassword);

      if (result.success) {
        // Account deleted successfully - user will be redirected to login
        // No need to show success message as user is logged out
        setIsDeleteDialogOpen(false);
      } else {
        setDeleteAlert({
          type: "error",
          message:
            result.error || "Failed to delete account. Please try again.",
        });
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setDeleteAlert({
        type: "error",
        message: "An unexpected error occurred while deleting your account.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetDeleteForm = () => {
    setDeletePassword("");
    setDeleteAlert(null);
    setShowDeletePassword(false);
  };

  const isDeleteRestricted = isFeatureRestricted("deleteAccount");

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
                  {isDeleteRestricted && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                      ⚠️ {getRestrictionMessage("deleteAccount")}
                    </p>
                  )}
                </div>

                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) {
                      resetDeleteForm();
                    }
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center ml-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white dark:text-white disabled:cursor-not-allowed"
                          disabled={isDeleteRestricted}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isDeleteRestricted
                        ? getRestrictionMessage("deleteAccount")
                        : "Permanently delete your account"}
                    </TooltipContent>
                  </Tooltip>

                  <AlertDialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                        Delete Account Permanently?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-3">
                        <p>
                          You are about to permanently delete your account. This
                          action cannot be undone. All of your data will be
                          removed, including:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 pl-4">
                          <li>Your profile information</li>
                          <li>All your Pokemon binders and cards</li>
                          <li>Your account settings and preferences</li>
                          <li>Your complete account history</li>
                        </ul>
                        <p className="font-semibold text-red-600 dark:text-red-500 pt-2">
                          Please be absolutely sure before proceeding.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                      {deleteAlert && (
                        <Alert
                          variant={
                            deleteAlert.type === "error"
                              ? "destructive"
                              : "default"
                          }
                        >
                          <AlertDescription>
                            {deleteAlert.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      <FormField>
                        <Label
                          htmlFor="delete-password"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          To confirm, please type your password:
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="delete-password"
                            type={showDeletePassword ? "text" : "password"}
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Enter your password"
                            className={`w-full ${
                              deleteAlert?.type === "error"
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            } dark:bg-gray-700 dark:text-white rounded-md shadow-sm`}
                            disabled={isDeleting}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowDeletePassword(!showDeletePassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            disabled={isDeleting}
                          >
                            {showDeletePassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormField>
                    </div>

                    <AlertDialogFooter className="mt-4">
                      <AlertDialogCancel
                        disabled={isDeleting}
                        onClick={resetDeleteForm}
                        className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || !deletePassword.trim()}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <div className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Deleting...
                          </div>
                        ) : (
                          "Yes, Delete My Account"
                        )}
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
