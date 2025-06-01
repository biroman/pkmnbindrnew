import { useState, useCallback } from "react";
import { getFriendlyErrorMessage } from "../utils/errorMessages";

/**
 * Reusable hook for handling async operations with loading, error, and success states
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {string} options.successMessage - Default success message
 * @param {boolean} options.showSuccess - Whether to show success state
 * @returns {Object} Async operation utilities
 */
export const useAsyncOperation = (options = {}) => {
  const {
    onSuccess,
    onError,
    successMessage = "Operation completed successfully",
    showSuccess = false,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const execute = useCallback(
    async (asyncFunction, ...args) => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const result = await asyncFunction(...args);

        if (showSuccess) {
          setSuccess(successMessage);
          setTimeout(() => setSuccess(""), 3000); // Auto-clear success message
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const friendlyMessage = getFriendlyErrorMessage(err);
        setError(friendlyMessage);

        if (onError) {
          onError(err);
        }

        throw err; // Re-throw for caller to handle if needed
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, successMessage, showSuccess]
  );

  const clearStates = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  const clearError = useCallback(() => setError(""), []);
  const clearSuccess = useCallback(() => setSuccess(""), []);

  return {
    loading,
    error,
    success,
    execute,
    clearStates,
    clearError,
    clearSuccess,
    // Utilities for quick checks
    hasError: !!error,
    hasSuccess: !!success,
    isIdle: !loading && !error && !success,
  };
};

/**
 * Hook for handling form validation and submission
 * @param {Function} validationFn - Function that returns validation errors object
 * @param {Function} submitFn - Async function to call on form submission
 * @param {Object} options - Additional options
 * @returns {Object} Form handling utilities
 */
export const useFormHandler = (validationFn, submitFn, options = {}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const asyncOp = useAsyncOperation(options);

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const handleSubmit = useCallback(
    async (formData, ...args) => {
      // Clear previous states
      asyncOp.clearStates();
      setFieldErrors({});

      // Validate form
      const errors = validationFn ? validationFn(formData) : {};
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        asyncOp.clearError();
        return false;
      }

      // Execute submission
      try {
        return await asyncOp.execute(submitFn, formData, ...args);
      } catch (error) {
        // Handle specific field errors based on error codes
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          setFieldErrors({
            email: " ", // Space to trigger error styling
            password: " ",
          });
        }
        return false;
      }
    },
    [validationFn, submitFn, asyncOp]
  );

  return {
    ...asyncOp,
    fieldErrors,
    clearFieldError,
    clearAllFieldErrors,
    handleSubmit,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
  };
};

/**
 * Hook for data fetching with retry logic
 * @param {Function} fetchFn - Function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} Data fetching utilities
 */
export const useDataFetcher = (fetchFn, options = {}) => {
  const {
    retries = 1,
    retryDelay = 2000,
    autoRetry = true,
    ...asyncOptions
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const asyncOp = useAsyncOperation(asyncOptions);

  const fetchWithRetry = useCallback(
    async (...args) => {
      try {
        return await asyncOp.execute(fetchFn, ...args);
      } catch (error) {
        if (autoRetry && retryCount < retries) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchWithRetry(...args);
          }, retryDelay);
        }
        throw error;
      }
    },
    [fetchFn, asyncOp, retries, retryDelay, autoRetry, retryCount]
  );

  const resetRetries = useCallback(() => {
    setRetryCount(0);
  }, []);

  return {
    ...asyncOp,
    fetch: fetchWithRetry,
    retryCount,
    resetRetries,
    canRetry: retryCount < retries,
  };
};

export default useAsyncOperation;
