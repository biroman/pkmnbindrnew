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
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reload,
} from "firebase/auth";
import { auth } from "../config/firebase";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../services/firestore";
import { getFriendlyErrorMessage } from "../utils/errorMessages";

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
    return sendPasswordResetEmail(auth, email);
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
      return { success: false, error: error.message };
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      await sendEmailVerification(currentUser);
      return { success: true };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error: error.message };
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
    getUserRole,
    isOwner,
    isUser,
    hasRole,
    canPerformAction,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
