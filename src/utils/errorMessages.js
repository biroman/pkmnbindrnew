/**
 * Converts Firebase error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    // Authentication errors
    "auth/invalid-credential":
      "Invalid email or password. Please check your credentials and try again.",
    "auth/user-not-found":
      "No account found with this email address. Please check your email or sign up for a new account.",
    "auth/wrong-password":
      "Incorrect password. Please try again or reset your password.",
    "auth/email-already-in-use":
      "An account with this email already exists. Please try signing in instead.",
    "auth/weak-password":
      "Password is too weak. Please use at least 6 characters with a mix of letters and numbers.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support for assistance.",
    "auth/too-many-requests":
      "Too many failed attempts. Please wait a few minutes before trying again.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection and try again.",
    "auth/invalid-verification-code":
      "Invalid verification code. Please check the code and try again.",
    "auth/invalid-verification-id":
      "Invalid verification ID. Please restart the verification process.",
    "auth/code-expired":
      "Verification code has expired. Please request a new code.",
    "auth/missing-email": "Please enter your email address.",
    "auth/missing-password": "Please enter your password.",
    "auth/requires-recent-login":
      "For security reasons, please sign in again to continue.",
    "auth/account-exists-with-different-credential":
      "An account already exists with the same email but different sign-in credentials.",
    "auth/credential-already-in-use":
      "This credential is already associated with a different user account.",
    "auth/operation-not-allowed":
      "This sign-in method is not enabled. Please contact support.",
    "auth/timeout": "The operation has timed out. Please try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
    "auth/popup-blocked":
      "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
    "auth/popup-closed-by-user":
      "Sign-in was cancelled. Please complete the sign-in process.",
    "auth/unauthorized-domain":
      "This domain is not authorized for authentication.",

    // Firestore errors
    "firestore/permission-denied":
      "You do not have permission to access this data.",
    "firestore/not-found": "The requested data could not be found.",
    "firestore/already-exists": "This data already exists.",
    "firestore/resource-exhausted":
      "Service is temporarily unavailable. Please try again later.",
    "firestore/failed-precondition":
      "The operation could not be completed due to system constraints.",
    "firestore/aborted": "The operation was interrupted. Please try again.",
    "firestore/out-of-range": "The provided data is outside the valid range.",
    "firestore/unimplemented": "This feature is not yet available.",
    "firestore/internal": "An internal error occurred. Please try again later.",
    "firestore/unavailable":
      "The service is temporarily unavailable. Please try again later.",
    "firestore/data-loss": "A data error occurred. Please contact support.",
    "firestore/unauthenticated": "Please sign in to continue.",
    "firestore/deadline-exceeded":
      "The operation took too long. Please try again.",
    "firestore/cancelled": "The operation was cancelled.",

    // Storage errors
    "storage/object-not-found": "File not found.",
    "storage/bucket-not-found": "Storage bucket not found.",
    "storage/project-not-found": "Project not found.",
    "storage/quota-exceeded": "Storage quota exceeded.",
    "storage/unauthenticated": "Please sign in to upload files.",
    "storage/unauthorized": "You do not have permission to access this file.",
    "storage/retry-limit-exceeded":
      "Upload failed after multiple attempts. Please try again.",
    "storage/invalid-checksum": "File upload was corrupted. Please try again.",
    "storage/canceled": "File upload was cancelled.",
    "storage/invalid-event-name": "Invalid operation.",
    "storage/invalid-url": "Invalid file URL.",
    "storage/invalid-argument": "Invalid file or data provided.",
    "storage/no-default-bucket": "No storage bucket configured.",
    "storage/cannot-slice-blob":
      "File processing error. Please try a different file.",
    "storage/server-file-wrong-size":
      "File size mismatch. Please try uploading again.",
  };

  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};

/**
 * Extracts error code from Firebase error object and returns user-friendly message
 * @param {Error} error - Firebase error object
 * @returns {string} User-friendly error message
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred. Please try again.";

  // Handle Firebase errors with error codes
  if (error.code) {
    return getFirebaseErrorMessage(error.code);
  }

  // Handle Firebase errors with message containing error code
  if (error.message && error.message.includes("Firebase: Error (")) {
    const match = error.message.match(/Firebase: Error \(([^)]+)\)/);
    if (match && match[1]) {
      return getFirebaseErrorMessage(match[1]);
    }
  }

  // Handle network errors
  if (error.message && error.message.toLowerCase().includes("network")) {
    return "Network error. Please check your internet connection and try again.";
  }

  // Handle timeout errors
  if (
    error.message &&
    (error.message.toLowerCase().includes("timeout") ||
      error.message.toLowerCase().includes("timed out"))
  ) {
    return "The operation timed out. Please try again.";
  }

  // Fallback to original message if it's user-friendly, otherwise use generic message
  if (
    error.message &&
    error.message.length < 100 &&
    !error.message.includes("Firebase")
  ) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
};

export default getFriendlyErrorMessage;
