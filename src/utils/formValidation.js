/**
 * Reusable form validation utilities
 */

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

/**
 * Base validation functions
 */
export const Validators = {
  required: (value, message = "This field is required") => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return message;
    }
    return null;
  },

  email: (value, message = "Please enter a valid email address") => {
    if (value && !ValidationPatterns.email.test(value)) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters long`;
    }
    return null;
  },

  pattern:
    (regex, message = "Invalid format") =>
    (value) => {
      if (value && !regex.test(value)) {
        return message;
      }
      return null;
    },

  url: (value, message = "Please enter a valid URL") => {
    if (value && !ValidationPatterns.url.test(value)) {
      return message;
    }
    return null;
  },

  strongPassword: (
    value,
    message = "Password must contain at least 8 characters with uppercase, lowercase, number, and special character"
  ) => {
    if (value && !ValidationPatterns.strongPassword.test(value)) {
      return message;
    }
    return null;
  },

  confirmPassword:
    (originalValue, message = "Passwords do not match") =>
    (value) => {
      if (value && value !== originalValue) {
        return message;
      }
      return null;
    },

  numeric: (value, message = "Must be a valid number") => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  integer: (value, message = "Must be a whole number") => {
    if (value && (!Number.isInteger(Number(value)) || Number(value) < 0)) {
      return message;
    }
    return null;
  },

  range: (min, max, message) => (value) => {
    const num = Number(value);
    if (value && (num < min || num > max)) {
      return message || `Value must be between ${min} and ${max}`;
    }
    return null;
  },

  date: (value, message = "Please enter a valid date") => {
    if (value && isNaN(Date.parse(value))) {
      return message;
    }
    return null;
  },

  futureDate: (value, message = "Date must be in the future") => {
    if (value && new Date(value) <= new Date()) {
      return message;
    }
    return null;
  },

  pastDate: (value, message = "Date must be in the past") => {
    if (value && new Date(value) >= new Date()) {
      return message;
    }
    return null;
  },
};

/**
 * Validate a single field with multiple validators
 * @param {any} value - Field value
 * @param {Array} validators - Array of validator functions
 * @returns {string|null} First validation error or null if valid
 */
export const validateField = (value, validators = []) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return null;
};

/**
 * Validate multiple fields using a schema
 * @param {Object} data - Form data object
 * @param {Object} schema - Validation schema object
 * @returns {Object} Object with field errors
 */
export const validateForm = (data, schema) => {
  const errors = {};

  Object.keys(schema).forEach((fieldName) => {
    const fieldValidators = schema[fieldName];
    const fieldValue = data[fieldName];
    const error = validateField(fieldValue, fieldValidators);

    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Predefined validation schemas for common forms
 */
export const ValidationSchemas = {
  // Login form schema
  login: {
    email: [Validators.required, Validators.email],
    password: [Validators.required],
  },

  // Registration form schema
  register: {
    email: [Validators.required, Validators.email],
    password: [Validators.required, Validators.strongPassword],
    confirmPassword: [], // Set dynamically based on password value
    displayName: [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ],
  },

  // Profile update schema
  profile: {
    displayName: [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ],
    email: [Validators.required, Validators.email],
    bio: [Validators.maxLength(500)],
    website: [Validators.url],
  },

  // Binder creation schema
  binder: {
    name: [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(100),
    ],
    description: [Validators.maxLength(500)],
    isPublic: [],
    tags: [],
  },

  // Card addition schema
  card: {
    name: [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(100),
    ],
    set: [Validators.required],
    rarity: [Validators.required],
    condition: [Validators.required],
    price: [Validators.numeric, Validators.range(0, 999999)],
    quantity: [
      Validators.required,
      Validators.integer,
      Validators.range(1, 99),
    ],
  },

  // Password reset schema
  passwordReset: {
    newPassword: [Validators.required, Validators.strongPassword],
    confirmPassword: [], // Set dynamically
  },

  // Contact form schema
  contact: {
    name: [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ],
    email: [Validators.required, Validators.email],
    subject: [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(200),
    ],
    message: [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(2000),
    ],
  },
};

/**
 * Helper to create password confirmation validator
 * @param {string} password - Original password value
 * @returns {Array} Validators including confirmation check
 */
export const createPasswordConfirmationValidators = (password) => [
  Validators.required,
  Validators.confirmPassword(password),
];

/**
 * Validate form with real-time updates
 * @param {Object} formData - Current form data
 * @param {Object} schema - Validation schema
 * @param {string} changedField - Field that was just changed
 * @returns {Object} Validation result with errors and isValid flag
 */
export const validateFormRealtime = (formData, schema, changedField = null) => {
  // For password confirmation, update schema dynamically
  if (
    schema === ValidationSchemas.register ||
    schema === ValidationSchemas.passwordReset
  ) {
    const updatedSchema = { ...schema };
    if (formData.password) {
      updatedSchema.confirmPassword = createPasswordConfirmationValidators(
        formData.password
      );
    }
    schema = updatedSchema;
  }

  const errors = validateForm(formData, schema);

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    hasFieldError: (field) => !!errors[field],
    getFieldError: (field) => errors[field] || null,
    changedFieldError: changedField ? errors[changedField] : null,
  };
};

/**
 * Debounced validation for performance
 * @param {Function} validationFn - Validation function
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Debounced validation function
 */
export const createDebouncedValidator = (validationFn, delay = 300) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(validationFn(...args));
      }, delay);
    });
  };
};

export default {
  Validators,
  ValidationPatterns,
  ValidationSchemas,
  validateField,
  validateForm,
  validateFormRealtime,
  createPasswordConfirmationValidators,
  createDebouncedValidator,
};
