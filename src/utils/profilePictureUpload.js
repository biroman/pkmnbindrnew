import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";
import {
  checkUserLockout,
  checkDailyLimits,
  validateFileForThreats,
  recordUploadAttempt,
} from "./securityMonitoring";

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 1024; // 1KB minimum
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_DIMENSION = 1024; // Max width/height in pixels

// Rate limiting constants
const UPLOAD_COOLDOWN = 20000; // 20 seconds between uploads
const lastUploadTimes = new Map(); // Track upload times per user

/**
 * Check if user is within rate limits
 */
const checkRateLimit = (userId) => {
  const lastUpload = lastUploadTimes.get(userId);
  const now = Date.now();

  if (lastUpload && now - lastUpload < UPLOAD_COOLDOWN) {
    const remainingTime = Math.ceil(
      (UPLOAD_COOLDOWN - (now - lastUpload)) / 1000
    );
    return {
      allowed: false,
      error: `Please wait ${remainingTime} seconds before uploading again`,
    };
  }

  return { allowed: true };
};

/**
 * Record upload attempt
 */
const recordUpload = (userId) => {
  lastUploadTimes.set(userId, Date.now());
};

/**
 * Validate uploaded file with enhanced security checks
 */
export const validateProfilePicture = (file) => {
  if (!file) {
    return { isValid: false, error: "Please select a file" };
  }

  // Check file type (MIME type can be spoofed, but it's a first line of defense)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Only JPEG, PNG, and WebP images are allowed",
    };
  }

  // Check file size bounds
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "File size must be less than 5MB",
    };
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: "File is too small. Please select a valid image",
    };
  }

  // Check file name for malicious patterns
  if (
    file.name.includes("..") ||
    file.name.includes("/") ||
    file.name.includes("\\")
  ) {
    return {
      isValid: false,
      error: "Invalid file name",
    };
  }

  // Basic file extension validation
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return {
      isValid: false,
      error: "Invalid file extension",
    };
  }

  return { isValid: true };
};

/**
 * Validate image content (not just MIME type)
 */
const validateImageContent = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Check minimum dimensions
      if (img.width < 50 || img.height < 50) {
        reject(new Error("Image must be at least 50x50 pixels"));
        return;
      }

      // Check maximum dimensions
      if (img.width > 4096 || img.height > 4096) {
        reject(new Error("Image dimensions too large"));
        return;
      }

      resolve(true);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid or corrupted image file"));
    };

    img.src = url;
  });
};

/**
 * Compress and resize image with position-based cropping for profile pictures
 */
export const compressImageWithPosition = (
  file,
  position = { x: 0, y: 0 },
  cropSize = MAX_DIMENSION,
  quality = 0.8
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate image content first
      await validateImageContent(file);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate scaling for the preview size (240px) vs final size (1024px)
        const previewSize = 240;
        const scaleFactor = cropSize / previewSize;

        // Scale the position proportionally
        const scaledPosition = {
          x: position.x * scaleFactor,
          y: position.y * scaleFactor,
        };

        // Calculate crop dimensions - make it square for profile picture
        const cropWidth = cropSize;
        const cropHeight = cropSize;

        // Calculate source crop area from the original image
        const originalScale = Math.max(
          previewSize / img.naturalWidth,
          previewSize / img.naturalHeight
        );

        // Convert preview coordinates back to original image coordinates
        const sourceX = -scaledPosition.x / originalScale;
        const sourceY = -scaledPosition.y / originalScale;
        const sourceWidth = cropSize / originalScale;
        const sourceHeight = cropSize / originalScale;

        // Set canvas dimensions to final crop size
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw the cropped portion of the image
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight, // Source rectangle
          0,
          0,
          cropWidth,
          cropHeight // Destination rectangle
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Validate compressed file size
              if (blob.size > MAX_FILE_SIZE) {
                reject(new Error("Compressed image is still too large"));
                return;
              }

              // Create a new File object with timestamp in name for uniqueness
              const timestamp = Date.now();
              const extension = file.type.split("/")[1];
              const compressedFile = new File(
                [blob],
                `profile_${timestamp}.${extension}`,
                {
                  type: file.type,
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas compression failed"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Compress and resize image with security considerations (legacy function)
 */
export const compressImage = (
  file,
  maxWidth = MAX_DIMENSION,
  maxHeight = MAX_DIMENSION,
  quality = 0.8
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate image content first
      await validateImageContent(file);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Validate compressed file size
              if (blob.size > MAX_FILE_SIZE) {
                reject(new Error("Compressed image is still too large"));
                return;
              }

              // Create a new File object with timestamp in name for uniqueness
              const timestamp = Date.now();
              const extension = file.type.split("/")[1];
              const compressedFile = new File(
                [blob],
                `profile_${timestamp}.${extension}`,
                {
                  type: file.type,
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas compression failed"));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Upload profile picture to Firebase Storage with enhanced security
 */
export const uploadProfilePicture = async (
  userId,
  file,
  currentPhotoPath = null
) => {
  try {
    // Security checks first
    const lockoutCheck = checkUserLockout(userId);
    if (lockoutCheck.locked) {
      throw new Error(lockoutCheck.error);
    }

    const dailyLimitCheck = checkDailyLimits(userId);
    if (dailyLimitCheck.exceeded) {
      throw new Error(dailyLimitCheck.error);
    }

    const threatCheck = validateFileForThreats(file);
    if (threatCheck.threat) {
      recordUploadAttempt(userId, false, threatCheck.error);
      throw new Error(threatCheck.error);
    }

    // Rate limiting check
    const rateLimitCheck = checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.error);
    }

    // Validate file
    const validation = validateProfilePicture(file);
    if (!validation.isValid) {
      recordUploadAttempt(userId, false, validation.error);
      throw new Error(validation.error);
    }

    // Compress image (includes content validation)
    const compressedFile = await compressImage(file);

    // Record upload attempt for rate limiting
    recordUpload(userId);

    // Create storage reference with timestamp for uniqueness
    const timestamp = Date.now();
    const extension = compressedFile.type.split("/")[1];
    const fileName = `profile_${timestamp}.${extension}`;
    const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);

    // Upload file with custom metadata
    const metadata = {
      contentType: compressedFile.type,
      customMetadata: {
        uploadedBy: userId,
        uploadTime: timestamp.toString(),
        originalName: file.name.substring(0, 100), // Limit original name length
      },
    };

    const uploadResult = await uploadBytes(
      storageRef,
      compressedFile,
      metadata
    );

    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Clean up old profile picture AFTER successful upload
    if (currentPhotoPath) {
      try {
        await deleteObject(ref(storage, currentPhotoPath));
        console.log(
          "Old profile picture deleted successfully:",
          currentPhotoPath
        );
      } catch (deleteError) {
        // Don't fail the upload if old image deletion fails
        console.warn("Failed to delete old profile picture:", deleteError);
        // Log this for monitoring but don't throw error
      }
    }

    // Record successful upload
    recordUploadAttempt(userId, true);

    return {
      success: true,
      url: downloadURL,
      path: uploadResult.ref.fullPath,
      oldImageCleaned: !!currentPhotoPath,
    };
  } catch (error) {
    console.error("Profile picture upload error:", error);

    // Record failed upload attempt
    recordUploadAttempt(userId, false, error.message);

    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.code === "storage/unauthorized") {
      userMessage = "Upload failed: Authentication required";
    } else if (error.code === "storage/quota-exceeded") {
      userMessage = "Upload failed: Storage quota exceeded";
    } else if (error.code === "storage/invalid-format") {
      userMessage = "Upload failed: Invalid file format";
    }

    return {
      success: false,
      error: userMessage || "Failed to upload profile picture",
    };
  }
};

/**
 * Delete profile picture from Firebase Storage with rate limiting
 */
export const deleteProfilePicture = async (imagePath, userId) => {
  try {
    if (!imagePath) return { success: true };

    // Rate limiting check for deletes too
    const rateLimitCheck = checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.error);
    }

    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);

    // Record delete attempt for rate limiting
    recordUpload(userId);

    return { success: true };
  } catch (error) {
    console.error("Profile picture deletion error:", error);
    // Don't fail if image doesn't exist
    if (error.code === "storage/object-not-found") {
      return { success: true };
    }
    return {
      success: false,
      error: error.message || "Failed to delete profile picture",
    };
  }
};

/**
 * Get profile picture URL with fallback
 */
export const getProfilePictureUrl = (userProfile, currentUser) => {
  return userProfile?.photoURL || currentUser?.photoURL || null;
};

/**
 * Generate initials from display name or email
 */
export const generateInitials = (displayName, email) => {
  if (displayName && displayName.trim()) {
    const names = displayName.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  if (email) {
    return email[0].toUpperCase();
  }

  return "U";
};
