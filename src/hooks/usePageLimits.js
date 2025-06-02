import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

export const usePageLimits = () => {
  const { currentUser } = useAuth();
  const [maxPages, setMaxPages] = useState({
    guest: 10,
    registered: 50,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the system configuration document reference
    const configRef = doc(db, "systemConfiguration", "limits");

    // Set up real-time listener for changes
    const unsubscribe = onSnapshot(
      configRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setMaxPages({
            guest: data.guestMaxPages || 10,
            registered: data.registeredMaxPages || 50,
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching page limits:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getCurrentMaxPages = () => {
    return currentUser ? maxPages.registered : maxPages.guest;
  };

  return {
    maxPages: getCurrentMaxPages(),
    isLoading,
    isGuest: !currentUser,
  };
};
