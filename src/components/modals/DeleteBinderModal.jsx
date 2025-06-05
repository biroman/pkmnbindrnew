import { Button, Modal } from "../ui"; // Assuming Modal and Button are available in ui
import { AlertTriangle, Loader2 } from "lucide-react";

const DeleteBinderModal = ({
  isOpen,
  onClose,
  onConfirm,
  binderName,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Binder"
      titleIcon={AlertTriangle}
      iconColor="text-red-500"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete the binder "
          <strong className="text-gray-800 dark:text-gray-200">
            {binderName || "this binder"}
          </strong>
          "?
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          All cards and settings associated with this binder will be permanently
          removed. This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Cancel deletion"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-label={`Confirm deletion of binder ${binderName}`}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="mr-2 h-4 w-4" />
            )}
            {isDeleting ? "Deleting..." : "Delete Binder"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteBinderModal;
