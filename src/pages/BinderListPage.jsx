import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getBindersForUser,
  deleteBinder as deleteBinderService,
} from "../services/firestore";
import { Button, LoadingSpinner, Badge } from "../components/ui";
import { BinderCard } from "../components/binder";
import { DeleteBinderModal } from "../components/modals";
import { PlusCircle, Layers, AlertTriangle, Users, Folder } from "lucide-react";
import { useDeleteBinder } from "../hooks/useUserData";
import { useUserLimits } from "../hooks/useUserLimits";

const BinderListPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    canCreateBinder,
    getUsagePercentage,
    isApproachingLimit,
    limits,
    isGuest,
    isRegistered,
    userType,
  } = useUserLimits();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [binderToDelete, setBinderToDelete] = useState(null);

  const {
    data: bindersData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["userBinders", currentUser?.uid],
    queryFn: () => {
      if (!currentUser?.uid) {
        return Promise.resolve({
          success: false,
          error: "User not authenticated.",
          binders: [],
        });
      }
      return getBindersForUser(currentUser.uid);
    },
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 1, // 1 minute - reduced from 5 minutes for better responsiveness
  });

  const { mutate: deleteBinder, isLoading: isDeletingBinder } =
    useDeleteBinder();

  const handleDeleteInitiate = (binderId, binderName) => {
    setBinderToDelete({ id: binderId, name: binderName });
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setBinderToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!binderToDelete || !currentUser?.uid) return;

    deleteBinder(
      { userId: currentUser.uid, binderId: binderToDelete.id },
      {
        onSuccess: () => {
          console.log(`Binder "${binderToDelete.name}" deleted successfully.`);
          handleCloseModal();
        },
        onError: (error) => {
          console.error("Error deleting binder:", error);
          handleCloseModal();
          alert(`Failed to delete binder: ${error.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner message="Loading your binders..." />
      </div>
    );
  }

  const displayError = queryError?.message || bindersData?.error;
  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mb-6" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Error Loading Binders
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {displayError}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const binders = bindersData?.binders || [];
  const binderCount = binders.length;
  const maxBinders = limits.maxBinders;
  const isUnlimited = maxBinders === Number.MAX_SAFE_INTEGER;
  const usagePercentage = getUsagePercentage("binders", binderCount);
  const approaching = isApproachingLimit("binders", binderCount);
  const canCreate = canCreateBinder(binderCount);

  // Determine badge color and style based on usage
  let badgeVariant = "secondary";
  let badgeText = "";

  if (isUnlimited) {
    badgeText = `${binderCount} binders`;
    badgeVariant = "secondary";
  } else {
    badgeText = `${binderCount} / ${maxBinders}`;
    if (usagePercentage >= 100) {
      badgeVariant = "destructive";
    } else if (approaching) {
      badgeVariant = "warning"; // You might need to add this variant to your Badge component
    } else {
      badgeVariant = "secondary";
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-300 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                My Binders
              </h1>
              <Badge variant={badgeVariant} className="flex items-center gap-1">
                <Folder className="w-3 h-3" />
                {badgeText}
              </Badge>
              {isGuest && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Guest
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your Pokémon card collections.
              {!isUnlimited && approaching && (
                <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
                  Approaching limit ({usagePercentage}% used)
                </span>
              )}
              {!canCreate && !isUnlimited && (
                <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                  Binder limit reached
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => navigate("/app/binder/new")}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white flex items-center shadow-sm hover:shadow-md transition-shadow duration-200"
            aria-label="Create new binder"
            disabled={!canCreate}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Binder
          </Button>
        </div>

        {binders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No binders yet
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Get started by creating your first binder.
            </p>
            <Button
              onClick={() => navigate("/app/binder/new")}
              className="mt-6"
              variant="default"
              aria-label="Create your first binder"
              disabled={!canCreate}
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Binder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {binders.map((binder) => (
              <BinderCard
                key={binder.id}
                binder={binder}
                onDeleteInitiate={handleDeleteInitiate}
              />
            ))}
          </div>
        )}
      </div>

      {binderToDelete && (
        <DeleteBinderModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          binderName={binderToDelete.name}
          isDeleting={isDeletingBinder}
        />
      )}
    </div>
  );
};

export default BinderListPage;
