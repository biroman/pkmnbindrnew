import { sendEmailVerification as firebaseOriginalSendEmailVerification } from "firebase/auth";

export const firebaseSendEmailVerification = (user) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/app/dashboard`, // Redirect to dashboard after verification
    handleCodeInApp: false, // Use our custom page instead of handling in-app
  };

  return firebaseOriginalSendEmailVerification(user, actionCodeSettings);
};
