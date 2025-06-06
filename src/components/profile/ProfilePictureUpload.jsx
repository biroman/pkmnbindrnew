import { useState, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  Trash2,
  User,
  Loader2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Cropper from "react-easy-crop";
import {
  Button,
  Alert,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "../ui";
import {
  uploadProfilePicture,
  deleteProfilePicture,
  getProfilePictureUrl,
  generateInitials,
} from "../../utils/profilePictureUpload";

const ProfilePictureUpload = ({
  currentUser,
  userProfile,
  updateUserFirestoreProfile,
  onUploadSuccess,
  onUploadError,
  size = "default", // "default" or "large"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  const profilePictureUrl = getProfilePictureUrl(userProfile, currentUser);
  const userInitials = generateInitials(
    userProfile?.displayName || currentUser?.displayName,
    currentUser?.email
  );

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      // Reset crop settings when new image is loaded
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.readAsDataURL(file);

    setIsDialogOpen(true);
  };

  // Callback for when crop area changes
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Helper function to create cropped image
  const createCroppedImage = useCallback(
    async (imageSrc, cropArea) => {
      const image = new Image();
      image.src = imageSrc;

      return new Promise((resolve) => {
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas size to the crop area (square for profile picture)
          const size = Math.min(cropArea.width, cropArea.height);
          canvas.width = size;
          canvas.height = size;

          // Calculate center crop coordinates
          const centerX = cropArea.x + cropArea.width / 2;
          const centerY = cropArea.y + cropArea.height / 2;
          const startX = centerX - size / 2;
          const startY = centerY - size / 2;

          // Draw the cropped image
          ctx.drawImage(image, startX, startY, size, size, 0, 0, size, size);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              const timestamp = Date.now();
              const extension = selectedFile.type.split("/")[1];
              const croppedFile = new File(
                [blob],
                `profile_${timestamp}.${extension}`,
                { type: selectedFile.type }
              );
              resolve(croppedFile);
            },
            selectedFile.type,
            0.8
          );
        };
      });
    },
    [selectedFile]
  );

  const handleUpload = async () => {
    if (!selectedFile || !currentUser || !croppedAreaPixels) return;

    setIsUploading(true);

    try {
      // Create cropped image from the selected area
      const croppedFile = await createCroppedImage(
        previewUrl,
        croppedAreaPixels
      );

      // Upload to Firebase Storage (with cleanup of old image)
      const uploadResult = await uploadProfilePicture(
        currentUser.uid,
        croppedFile,
        userProfile?.photoPath // Pass current photo path for cleanup
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Update user profile with new photo URL
      const updateResult = await updateUserFirestoreProfile({
        photoURL: uploadResult.url,
        photoPath: uploadResult.path,
      });

      if (updateResult.success) {
        onUploadSuccess?.(uploadResult.url);
        setModalError(null);
        setIsDialogOpen(false);
        resetUploadState();
      } else {
        throw new Error(updateResult.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setModalError(error.message);
      onUploadError?.(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !userProfile?.photoPath) return;

    setIsDeleting(true);

    try {
      // Delete from Firebase Storage
      const deleteResult = await deleteProfilePicture(
        userProfile.photoPath,
        currentUser.uid
      );

      if (!deleteResult.success) {
        throw new Error(deleteResult.error);
      }

      // Update user profile to remove photo URL
      const updateResult = await updateUserFirestoreProfile({
        photoURL: null,
        photoPath: null,
      });

      if (updateResult.success) {
        onUploadSuccess?.(null);
      } else {
        throw new Error(updateResult.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Delete error:", error);
      onUploadError?.(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setModalError(null);
    resetUploadState();
  };

  const sizeClasses = {
    default: {
      container: "w-32 h-32",
      text: "text-2xl",
      buttonContainer: "flex items-center space-x-3",
      buttonSize: "sm",
    },
    large: {
      container: "w-40 h-40",
      text: "text-3xl",
      buttonContainer: "flex flex-col space-y-2",
      buttonSize: "sm",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center space-y-4">
        {/* Profile Picture Display */}
        <div className="relative group">
          <div
            className={`${currentSize.container} rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg ring-4 ring-white/20 transition-all duration-200 group-hover:ring-white/40`}
          >
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            {/* Initials Fallback */}
            <div
              className={`w-full h-full flex items-center justify-center ${
                currentSize.text
              } font-bold text-white bg-gradient-to-br from-blue-500 to-purple-600 ${
                profilePictureUrl ? "hidden" : "flex"
              }`}
            >
              {userInitials}
            </div>
          </div>

          {/* Upload Overlay */}
          <div
            className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className={currentSize.buttonContainer}>
          <Button
            variant="outline"
            size={currentSize.buttonSize}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            className="flex items-center bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 transition-all duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            {size === "large" ? "Change Photo" : "Upload"}
          </Button>

          {profilePictureUrl && (
            <Button
              variant="outline"
              size={currentSize.buttonSize}
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
              className="flex items-center bg-red-500/10 backdrop-blur border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all duration-200"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remove
            </Button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Preview Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-900 border-0 shadow-2xl">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit Profile Picture
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Adjust your photo and upload your new profile picture
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {modalError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {modalError}
                    </p>
                  </div>
                </div>
              )}

              {previewUrl && (
                <div className="space-y-6">
                  {/* Preview Section */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Crop Area */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Adjust Your Photo
                      </label>
                      <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden shadow-inner">
                        <Cropper
                          image={previewUrl}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          cropShape="round"
                          showGrid={false}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                          style={{
                            containerStyle: {
                              background: "transparent",
                            },
                            mediaStyle: {
                              borderRadius: "12px",
                            },
                            cropAreaStyle: {
                              border: "3px solid #3b82f6",
                              boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.2)",
                            },
                          }}
                        />
                      </div>
                    </div>

                    {/* Preview & Controls */}
                    <div className="lg:w-80 space-y-6">
                      {/* Live Preview */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Preview
                        </label>
                        <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg ring-4 ring-white dark:ring-gray-700">
                            {/* This would show the cropped preview in a real implementation */}
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                              Preview
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Your new profile picture
                          </p>
                        </div>
                      </div>

                      {/* Zoom Control */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Zoom Level
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <ZoomOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <input
                              type="range"
                              min={1}
                              max={3}
                              step={0.1}
                              value={zoom}
                              onChange={(e) =>
                                setZoom(parseFloat(e.target.value))
                              }
                              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                                  ((zoom - 1) / 2) * 100
                                }%, #e5e7eb ${
                                  ((zoom - 1) / 2) * 100
                                }%, #e5e7eb 100%)`,
                              }}
                            />
                            <ZoomIn className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round(zoom * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reset Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCrop({ x: 0, y: 0 });
                          setZoom(1);
                        }}
                        className="w-full flex items-center justify-center"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Position
                      </Button>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedFile?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedFile &&
                              (selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Will be resized to 1024×1024
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleDialogClose}
                disabled={isUploading}
                className="mr-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !croppedAreaPixels || isUploading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Guidelines */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            JPEG, PNG, or WebP. Max size 5MB.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Images will be resized to 1024x1024 pixels.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ProfilePictureUpload;
