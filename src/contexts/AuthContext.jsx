import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reload,
  deleteUser,
} from "firebase/auth";
import { auth } from "../config/firebase";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "../services/firestore";
import { getFriendlyErrorMessage } from "../utils/errorMessages";
import { firebaseSendEmailVerification } from "../utils/firebaseSendEmailVerification";

// Create context
const AuthContext = createContext({});

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create or get user profile in Firestore
  const handleUserProfile = async (user, isNewUser = false) => {
    if (!user) return;

    try {
      if (isNewUser) {
        // Create new user profile
        const profileData = {
          displayName: user.displayName || "",
          email: user.email,
          photoURL: user.photoURL || null,
        };

        const result = await createUserProfile(user.uid, profileData);
        if (result.success) {
          setUserProfile(result.data);
        }
      } else {
        // Get existing user profile
        const result = await getUserProfile(user.uid);
        if (result.success) {
          setUserProfile(result.data);
          // Update last login time
          await updateUserProfile(user.uid, {});
        } else if (result.error === "User profile not found") {
          // Create profile if it doesn't exist (for existing users)
          const profileData = {
            displayName: user.displayName || "",
            email: user.email,
            photoURL: user.photoURL || null,
          };
          const createResult = await createUserProfile(user.uid, profileData);
          if (createResult.success) {
            setUserProfile(createResult.data);
          }
        }
      }
    } catch (error) {
      console.error("Error handling user profile:", error);
    }
  };

  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Create user profile in Firestore
      await handleUserProfile(result.user, true);

      // Send email verification
      if (result.user) {
        await sendVerificationEmail(result.user);
        console.log("Verification email sent to:", result.user.email);
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Sign in function
  const signin = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google sign in
  const signinWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if this is a new user and create profile if needed
      const isNewUser =
        result.user.metadata.creationTime ===
        result.user.metadata.lastSignInTime;
      await handleUserProfile(result.user, isNewUser);

      // Send verification email if new Google user and email is not yet verified
      if (isNewUser && result.user && !result.user.emailVerified) {
        await sendVerificationEmail(result.user);
        console.log(
          "Verification email sent to new Google user:",
          result.user.email
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  // Reset password
  const resetPassword = (email) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth`, // Redirect back to login after password reset
      handleCodeInApp: false, // Use our custom page instead of handling in-app
    };

    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  // Update user profile
  const updateUserProfileAuth = (updates) => {
    return updateProfile(currentUser, updates);
  };

  // Update user profile in Firestore
  const updateUserFirestoreProfile = async (updates) => {
    if (!currentUser) return;

    try {
      const result = await updateUserProfile(currentUser.uid, updates);
      if (result.success) {
        // Refresh user profile
        const profileResult = await getUserProfile(currentUser.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        }
      }
      return result;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, error: getFriendlyErrorMessage(error) };
    }
  };

  // Change user password
  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      return { success: true };
    } catch (error) {
      console.error("Error changing password:", error);

      // Provide specific error messages for password change context
      let friendlyMessage;
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        friendlyMessage =
          "Current password is incorrect. Please verify your current password and try again.";
      } else if (error.code === "auth/weak-password") {
        friendlyMessage =
          "New password is too weak. Please use at least 6 characters with a mix of letters and numbers.";
      } else if (error.code === "auth/requires-recent-login") {
        friendlyMessage =
          "For security reasons, please sign out and sign in again before changing your password.";
      } else {
        friendlyMessage = getFriendlyErrorMessage(error);
      }

      return { success: false, error: friendlyMessage };
    }
  };

  // Send email verification (accepts user to verify, defaults to currentUser)
  const sendVerificationEmail = async (userToVerify = currentUser) => {
    if (!userToVerify) {
      console.error(
        "sendVerificationEmail: No user provided or current user is null"
      );
      return { success: false, error: "No user to verify." };
    }

    try {
      await firebaseSendEmailVerification(userToVerify);
      console.log(
        "Verification email sent via sendVerificationEmail function to:",
        userToVerify.email
      );
      return { success: true };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error: getFriendlyErrorMessage(error) };
    }
  };

  // Check if email is verified
  const isEmailVerified = () => {
    return currentUser?.emailVerified || false;
  };

  // Refresh user data to check verification status
  const refreshUser = async () => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      await reload(currentUser);
      // Force React to update by creating a new user object with the fresh data
      const refreshedUser = auth.currentUser;
      setCurrentUser(refreshedUser);
      return { success: true };
    } catch (error) {
      console.error("Error refreshing user:", error);
      throw error;
    }
  };

  // Delete user account completely
  const deleteAccount = async (currentPassword) => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      // Re-authenticate user before deleting account for security
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      const userId = currentUser.uid;

      // Delete all user data from Firestore first
      const firestoreResult = await deleteUserAccount(userId);
      if (!firestoreResult.success) {
        throw new Error(firestoreResult.error);
      }

      // Delete the Firebase Auth user
      await deleteUser(currentUser);

      // Clear local state
      setCurrentUser(null);
      setUserProfile(null);

      return { success: true };
    } catch (error) {
      console.error("Error deleting account:", error);

      // Provide specific error messages for account deletion context
      let friendlyMessage;
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        friendlyMessage =
          "Current password is incorrect. Please verify your password and try again.";
      } else if (error.code === "auth/requires-recent-login") {
        friendlyMessage =
          "For security reasons, please sign out and sign in again before deleting your account.";
      } else if (error.code === "auth/user-not-found") {
        friendlyMessage =
          "Account not found. Please refresh the page and try again.";
      } else {
        friendlyMessage = getFriendlyErrorMessage(error);
      }

      return { success: false, error: friendlyMessage };
    }
  };

  // Role checking functions
  const getUserRole = () => {
    return userProfile?.role || "user";
  };

  const isOwner = () => {
    return getUserRole() === "owner";
  };

  const isUser = () => {
    return getUserRole() === "user";
  };

  const hasRole = (role) => {
    return getUserRole() === role;
  };

  // Check if user has permission for certain actions
  const canPerformAction = (action) => {
    const role = getUserRole();

    switch (action) {
      case "view_admin_panel":
      case "manage_users":
      case "system_settings":
        return role === "owner";

      case "manage_collection":
      case "add_binders":
      case "create_wishlist":
        return role === "owner" || role === "user";

      default:
        return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Get user profile when user signs in
        await handleUserProfile(user, false);
      } else {
        // Clear profile when user signs out
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const contextValue = {
    currentUser,
    userProfile,
    signup,
    signin,
    signinWithGoogle,
    logout,
    resetPassword,
    updateUserProfile: updateUserProfileAuth,
    updateUserFirestoreProfile,
    changePassword,
    sendVerificationEmail,
    isEmailVerified,
    refreshUser,
    deleteAccount,
    getUserRole,
    isOwner,
    isUser,
    hasRole,
    canPerformAction,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
