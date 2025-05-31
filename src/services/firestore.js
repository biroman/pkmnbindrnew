import {
  doc,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getFriendlyErrorMessage } from "../utils/errorMessages";

// Helper function to get user's document reference
const getUserDocRef = (userId) => doc(db, "users", userId);

// Helper function to get user's subcollection reference
const getUserSubcollection = (userId, subcollection) =>
  collection(db, "users", userId, subcollection);

// ===== USER OPERATIONS =====

export const createUserProfile = async (userId, userData) => {
  try {
    const userDocRef = getUserDocRef(userId);

    // Set role based on email from environment variable
    const ownerEmail = import.meta.env.VITE_OWNER_EMAIL;
    const userRole = userData.email === ownerEmail ? "owner" : "user";

    const profileData = {
      ...userData,
      role: userRole,
      totalBinders: 0,
      totalValue: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      settings: {
        theme: "light",
        currency: "USD",
        publicProfile: false,
      },
    };

    await setDoc(userDocRef, profileData);
    return { success: true, data: profileData };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDocRef = getUserDocRef(userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userDocRef = getUserDocRef(userId);
    const updateData = {
      ...updates,
      lastLoginAt: serverTimestamp(),
    };

    await updateDoc(userDocRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== BINDER OPERATIONS =====

export const addBinder = async (userId, binderData) => {
  try {
    const batch = writeBatch(db);

    // Add binder to user's binders collection
    const bindersRef = getUserSubcollection(userId, "binders");
    const binderDocRef = doc(bindersRef);

    const binder = {
      ...binderData,
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isFavorite: false,
    };

    batch.set(binderDocRef, binder);

    // Update user's total binders count
    const userDocRef = getUserDocRef(userId);
    batch.update(userDocRef, {
      totalBinders: increment(1),
      totalValue: increment(binderData.currentValue || 0),
    });

    // Add activity log
    const activityRef = getUserSubcollection(userId, "activity");
    const activityDocRef = doc(activityRef);
    batch.set(activityDocRef, {
      type: "binder_added",
      description: `Added ${binderData.name} to collection`,
      binderRef: binderDocRef,
      timestamp: serverTimestamp(),
    });

    await batch.commit();
    return { success: true, binderId: binderDocRef.id };
  } catch (error) {
    console.error("Error adding binder:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserBinders = async (userId, options = {}) => {
  try {
    const bindersRef = getUserSubcollection(userId, "binders");
    let q = query(bindersRef, orderBy("addedAt", "desc"));

    // Apply filters if provided
    if (options.rarity) {
      q = query(q, where("rarity", "==", options.rarity));
    }
    if (options.isFavorite) {
      q = query(q, where("isFavorite", "==", true));
    }
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    const binders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: binders };
  } catch (error) {
    console.error("Error getting user binders:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const updateBinder = async (userId, binderId, updates) => {
  try {
    const binderDocRef = doc(getUserSubcollection(userId, "binders"), binderId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(binderDocRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Error updating binder:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const deleteBinder = async (userId, binderId) => {
  try {
    const batch = writeBatch(db);

    // Get binder data first to update totals
    const binderDocRef = doc(getUserSubcollection(userId, "binders"), binderId);
    const binderDoc = await getDoc(binderDocRef);

    if (!binderDoc.exists()) {
      return { success: false, error: "Binder not found" };
    }

    const binderData = binderDoc.data();

    // Delete the binder
    batch.delete(binderDocRef);

    // Update user's totals
    const userDocRef = getUserDocRef(userId);
    batch.update(userDocRef, {
      totalBinders: increment(-1),
      totalValue: increment(-(binderData.currentValue || 0)),
    });

    // Add activity log
    const activityRef = getUserSubcollection(userId, "activity");
    const activityDocRef = doc(activityRef);
    batch.set(activityDocRef, {
      type: "binder_removed",
      description: `Removed ${binderData.name} from collection`,
      timestamp: serverTimestamp(),
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error deleting binder:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== COLLECTION OPERATIONS =====

export const createCollection = async (userId, collectionData) => {
  try {
    const collectionsRef = getUserSubcollection(userId, "collections");
    const collection = {
      ...collectionData,
      cardCount: 0,
      totalValue: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collectionsRef, collection);

    // Add activity log
    const activityRef = getUserSubcollection(userId, "activity");
    await addDoc(activityRef, {
      type: "collection_created",
      description: `Created collection "${collectionData.name}"`,
      collectionRef: docRef,
      timestamp: serverTimestamp(),
    });

    return { success: true, collectionId: docRef.id };
  } catch (error) {
    console.error("Error creating collection:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserCollections = async (userId) => {
  try {
    const collectionsRef = getUserSubcollection(userId, "collections");
    const q = query(collectionsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const collections = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: collections };
  } catch (error) {
    console.error("Error getting user collections:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== WISHLIST OPERATIONS =====

export const addToWishlist = async (userId, binderData) => {
  try {
    const wishlistRef = getUserSubcollection(userId, "wishlist");
    const wishlistItem = {
      ...binderData,
      priority: "Medium",
      addedAt: serverTimestamp(),
    };

    const docRef = await addDoc(wishlistRef, wishlistItem);
    return { success: true, wishlistId: docRef.id };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

export const getUserWishlist = async (userId) => {
  try {
    const wishlistRef = getUserSubcollection(userId, "wishlist");
    const q = query(wishlistRef, orderBy("addedAt", "desc"));
    const querySnapshot = await getDocs(q);

    const wishlist = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: wishlist };
  } catch (error) {
    console.error("Error getting user wishlist:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== ACTIVITY OPERATIONS =====

export const getUserActivity = async (userId, limitCount = 10) => {
  try {
    const activityRef = getUserSubcollection(userId, "activity");
    const q = query(
      activityRef,
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    const activities = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: activities };
  } catch (error) {
    console.error("Error getting user activity:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== MIGRATION FUNCTIONS =====

export const migrateUserRoles = async () => {
  try {
    console.log("Starting user role migration...");

    const ownerEmail = import.meta.env.VITE_OWNER_EMAIL;
    const usersRef = collection(db, "users");

    // Get all users without ordering (to avoid permission issues)
    const querySnapshot = await getDocs(usersRef);

    console.log(`Found ${querySnapshot.size} users to check for migration`);

    const batch = writeBatch(db);
    let updatedCount = 0;

    querySnapshot.docs.forEach((doc) => {
      const userData = doc.data();

      // Check if user already has a role field
      if (!userData.role) {
        console.log(`Migrating user ${doc.id} (${userData.email})`);

        const userRole = userData.email === ownerEmail ? "owner" : "user";

        batch.update(doc.ref, {
          role: userRole,
        });

        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Migration completed. Updated ${updatedCount} users.`);
      return { success: true, updatedCount };
    } else {
      console.log("No users needed migration.");
      return { success: true, updatedCount: 0 };
    }
  } catch (error) {
    console.error("Error during user role migration:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// ===== ADMIN OPERATIONS (Owner Only) =====

export const getAdminStats = async () => {
  try {
    const startTime = Date.now();

    // Get total user count
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    const totalUsers = usersSnapshot.size;

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsersQuery = query(
      usersRef,
      where("createdAt", ">=", thirtyDaysAgo)
    );
    const recentUsersSnapshot = await getDocs(recentUsersQuery);
    const newUsersThisMonth = recentUsersSnapshot.size;

    // Calculate total binders across all users
    let totalBindersAcrossUsers = 0;
    let totalValueAcrossUsers = 0;
    let usersWithData = 0;

    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data();
      totalBindersAcrossUsers += userData.totalBinders || 0;
      totalValueAcrossUsers += userData.totalValue || 0;
      if (userData.totalBinders > 0) usersWithData++;
    });

    // Get active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsersQuery = query(
      usersRef,
      where("lastLoginAt", ">=", sevenDaysAgo)
    );
    const activeUsersSnapshot = await getDocs(activeUsersQuery);
    const activeUsers = activeUsersSnapshot.size;

    // Calculate system health based on available metrics
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const systemHealth = calculateSystemHealth({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      responseTime,
      usersWithData,
      totalBindersAcrossUsers,
    });

    return {
      success: true,
      data: {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        totalBindersAcrossUsers,
        totalValueAcrossUsers,
        systemHealth: systemHealth.status,
        healthDetails: systemHealth.details,
        responseTime,
      },
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};

// Helper function to calculate system health
const calculateSystemHealth = ({
  totalUsers,
  activeUsers,
  newUsersThisMonth,
  responseTime,
  usersWithData,
  totalBindersAcrossUsers,
}) => {
  let healthScore = 100;
  const issues = [];

  // Response time check (should be under 2 seconds)
  if (responseTime > 2000) {
    healthScore -= 20;
    issues.push("Slow database response");
  }

  // User activity check (at least 10% of users should be active)
  const activityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 100;
  if (activityRate < 10 && totalUsers > 10) {
    healthScore -= 15;
    issues.push("Low user activity");
  }

  // Data health check (users should have data)
  const dataRate = totalUsers > 0 ? (usersWithData / totalUsers) * 100 : 100;
  if (dataRate < 30 && totalUsers > 5) {
    healthScore -= 10;
    issues.push("Many users have no data");
  }

  // Growth check (should have some new users if not a new app)
  if (totalUsers > 20 && newUsersThisMonth === 0) {
    healthScore -= 10;
    issues.push("No new user growth");
  }

  // Determine status
  let status;
  if (healthScore >= 90) {
    status = "Excellent";
  } else if (healthScore >= 75) {
    status = "Good";
  } else if (healthScore >= 60) {
    status = "Fair";
  } else if (healthScore >= 40) {
    status = "Poor";
  } else {
    status = "Critical";
  }

  return {
    status,
    score: healthScore,
    details: {
      responseTime: `${responseTime}ms`,
      activityRate: `${activityRate.toFixed(1)}%`,
      dataRate: `${dataRate.toFixed(1)}%`,
      issues: issues.length > 0 ? issues : ["All systems normal"],
    },
  };
};

export const getAllUsers = async (limitCount = 50) => {
  try {
    console.log("getAllUsers: Starting query...");

    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(limitCount));

    console.log("getAllUsers: Query created, executing...");

    const querySnapshot = await getDocs(q);

    console.log("getAllUsers: Query executed, processing results...");
    console.log("getAllUsers: Query snapshot size:", querySnapshot.size);

    const users = querySnapshot.docs.map((doc) => {
      console.log("getAllUsers: Processing user doc:", doc.id, doc.data());
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    console.log("getAllUsers: Final users array:", users);

    return { success: true, data: users };
  } catch (error) {
    console.error("getAllUsers: Error occurred:", error);
    console.error("getAllUsers: Error code:", error.code);
    console.error("getAllUsers: Error message:", error.message);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
};
