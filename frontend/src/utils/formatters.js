/**
 * Formatter Functions
 * Utilities for formatting data for display
 */

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (USD, INR, etc.)
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

/**
 * Format number with units (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number with unit
 */
export const formatNumberWithUnit = (num) => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '0 sec';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} sec`);
  
  return parts.join(' ');
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  }
  
  return phone;
};

/**
 * Format fruit name for display
 * @param {string} name - Fruit name
 * @returns {string} Formatted fruit name
 */
export const formatFruitName = (name) => {
  if (!name) return '';
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format confidence score for display
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} Formatted confidence
 */
export const formatConfidence = (confidence) => {
  if (confidence === null || confidence === undefined) return 'N/A';
  return `${Math.round(confidence * 100)}%`;
};

/**
 * Format calories for display
 * @param {number} calories - Calories value
 * @returns {string} Formatted calories
 */
export const formatCalories = (calories) => {
  if (!calories) return 'N/A';
  return `${Math.round(calories)} kcal`;
};

/**
 * Format list as readable string
 * @param {Array} items - Array of items
 * @param {string} conjunction - Conjunction word (and, or)
 * @returns {string} Formatted list
 */
export const formatList = (items, conjunction = 'and') => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
};

/**
 * Format slug to readable text
 * @param {string} slug - URL slug
 * @returns {string} Readable text
 */
export const formatSlugToText = (slug) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format text to slug
 * @param {string} text - Text to convert
 * @returns {string} URL slug
 */
export const formatTextToSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Format first letter uppercase
 * @param {string} text - Text to format
 * @returns {string} Formatted text
 */
export const capitalizeFirstLetter = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Format sentence case
 * @param {string} text - Text to format
 * @returns {string} Sentence case text
 */
export const toSentenceCase = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Format title case
 * @param {string} text - Text to format
 * @returns {string} Title case text
 */
export const toTitleCase = (text) => {
  if (!text) return '';
  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index !== 0 && smallWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Format JSON for display
 * @param {Object} obj - Object to format
 * @returns {string} Formatted JSON string
 */
export const formatJSON = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @param {number} decimals - Decimal places
 * @returns {string} Human readable size
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format rating stars
 * @param {number} rating - Rating (0-5)
 * @returns {string} Star string
 */
export const formatRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
};

/**
 * Format relative time (e.g., "in 2 hours", "yesterday")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  
  const isPast = diff < 0;
  const absDiff = Math.abs(diff);
  
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  const prefix = isPast ? '' : 'in ';
  const suffix = isPast ? ' ago' : '';
  
  if (seconds < 60) return `${prefix}just now${suffix}`;
  if (minutes < 60) return `${prefix}${minutes} minute${minutes !== 1 ? 's' : ''}${suffix}`;
  if (hours < 24) return `${prefix}${hours} hour${hours !== 1 ? 's' : ''}${suffix}`;
  if (days === 1) return isPast ? 'yesterday' : 'tomorrow';
  if (days < 7) return `${prefix}${days} day${days !== 1 ? 's' : ''}${suffix}`;
  if (weeks < 4) return `${prefix}${weeks} week${weeks !== 1 ? 's' : ''}${suffix}`;
  if (months < 12) return `${prefix}${months} month${months !== 1 ? 's' : ''}${suffix}`;
  return `${prefix}${years} year${years !== 1 ? 's' : ''}${suffix}`;
};

/**
 * Format address object to string
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};