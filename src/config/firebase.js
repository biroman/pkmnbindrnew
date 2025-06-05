import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check BEFORE other Firebase services
if (typeof window !== "undefined") {
  // Only initialize in browser environment
  try {
    // Enable debug mode in development
    if (import.meta.env.DEV) {
      // Debug mode for development
      self.FIREBASE_APPCHECK_DEBUG_TOKEN =
        import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
      console.log("🧪 App Check debug mode enabled for development");
    }

    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY
      ),

      // Optional: Enable debug mode in development
      isTokenAutoRefreshEnabled: true,
    });

    console.log("✅ App Check initialized successfully");
  } catch (error) {
    console.warn("⚠️ App Check initialization failed:", error);
    // App will still work, but without App Check protection
  }
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
