/**
 * Validation Functions
 * Input validation utilities for forms and data
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and requirements
 */
export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[@#$%^&+=]/.test(password),
  };
  
  const passedCount = Object.values(requirements).filter(Boolean).length;
  const score = Math.round((passedCount / 5) * 100);
  
  let strength = 'weak';
  if (score >= 80) strength = 'strong';
  else if (score >= 60) strength = 'medium';
  
  return {
    isValid: password.length >= 6 && requirements.hasUpperCase && requirements.hasNumber,
    strength,
    score,
    requirements,
    message: getPasswordMessage(requirements),
  };
};

/**
 * Get password validation message
 * @param {Object} requirements - Password requirements
 * @returns {string} Validation message
 */
const getPasswordMessage = (requirements) => {
  if (!requirements.minLength) return 'Password must be at least 6 characters';
  if (!requirements.hasUpperCase) return 'Password must contain at least one uppercase letter';
  if (!requirements.hasNumber) return 'Password must contain at least one number';
  return 'Password is valid';
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {boolean} Is valid name
 */
export const isValidName = (name) => {
  if (!name) return false;
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, maxSizeMB = 10) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please upload JPEG, PNG, or WEBP image.' };
  }
  
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit.` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate login form
 * @param {Object} data - Form data
 * @returns {Object} Validation errors
 */
export const validateLogin = (data) => {
  const errors = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return errors;
};

/**
 * Validate registration form
 * @param {Object} data - Form data
 * @returns {Object} Validation errors
 */
export const validateRegister = (data) => {
  const errors = {};
  
  if (!data.name) {
    errors.name = 'Full name is required';
  } else if (!isValidName(data.name)) {
    errors.name = 'Name must be 2-50 characters and contain only letters';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
  }
  
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (!data.agreeTerms) {
    errors.agreeTerms = 'You must agree to the terms and conditions';
  }
  
  return errors;
};

/**
 * Validate profile update form
 * @param {Object} data - Form data
 * @returns {Object} Validation errors
 */
export const validateProfile = (data) => {
  const errors = {};
  
  if (!data.name) {
    errors.name = 'Full name is required';
  } else if (!isValidName(data.name)) {
    errors.name = 'Name must be 2-50 characters and contain only letters';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return errors;
};

/**
 * Validate password change form
 * @param {Object} data - Form data
 * @returns {Object} Validation errors
 */
export const validatePasswordChange = (data) => {
  const errors = {};
  
  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  if (!data.newPassword) {
    errors.newPassword = 'New password is required';
  } else {
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.message;
    }
  }
  
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

/**
 * Validate forgot password form
 * @param {Object} data - Form data
 * @returns {Object} Validation errors
 */
export const validateForgotPassword = (data) => {
  const errors = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  return errors;
};

/**
 * Validate contact form
 * @param {Object} data - Form data
 * @returns {Object} Validation errors
 */
export const validateContact = (data) => {
  const errors = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (!isValidName(data.name)) {
    errors.name = 'Please enter a valid name';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.subject) {
    errors.subject = 'Subject is required';
  }
  
  if (!data.message) {
    errors.message = 'Message is required';
  } else if (data.message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (data.message.length > 1000) {
    errors.message = 'Message cannot exceed 1000 characters';
  }
  
  return errors;
};

/**
 * Check if string is empty or only whitespace
 * @param {string} value - String to check
 * @returns {boolean} Is empty
 */
export const isEmptyString = (value) => {
  return !value || value.trim().length === 0;
};

/**
 * Validate numeric value
 * @param {*} value - Value to validate
 * @returns {boolean} Is valid number
 */
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validate integer
 * @param {*} value - Value to validate
 * @returns {boolean} Is integer
 */
export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

/**
 * Validate range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Is within range
 */
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Get validation summary
 * @param {Object} errors - Errors object
 * @returns {Object} Validation summary
 */
export const getValidationSummary = (errors) => {
  const errorList = Object.values(errors).filter(Boolean);
  return {
    isValid: errorList.length === 0,
    errorCount: errorList.length,
    firstError: errorList[0] || null,
    errorList,
  };
};

/**
 * Sanitize input string
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .slice(0, 1000); // Limit length
};

/**
 * Validate fruit name search query
 * @param {string} query - Search query
 * @returns {boolean} Is valid search query
 */
export const isValidSearchQuery = (query) => {
  if (!query) return false;
  return query.length >= 2 && query.length <= 50;
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    required = true,
  } = options;
  
  if (!file && required) {
    return { isValid: false, error: 'Please select a file' };
  }
  
  if (!file) {
    return { isValid: true, error: null };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` 
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  return { isValid: true, error: null };
};