import SecuritySettings from "../SecuritySettings";
import EmailVerification from "../EmailVerification";

const SecuritySection = ({
  changePassword,
  isEmailVerified,
  sendVerificationEmail,
  refreshUser,
}) => {
  return (
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
    </div>
  );
};

export default SecuritySection;
