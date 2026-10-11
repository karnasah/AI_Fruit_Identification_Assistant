/**
 * Helper Functions
 * Reusable utility functions for common operations
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type (full, date, time, datetime)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'datetime') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const options = {
    full: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    date: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    short: { month: 'short', day: 'numeric' },
  };
  
  return d.toLocaleDateString(undefined, options[format] || options.datetime);
};

/**
 * Format time ago (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Time ago string
 */
export const timeAgo = (date) => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
      return `${count} ${unit}${count !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};

/**
 * Format percentage
 * @param {number} value - Value (0-1 or 0-100)
 * @param {boolean} isDecimal - Whether value is decimal (0-1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (value === null || value === undefined) return '0%';
  const percentage = isDecimal ? value * 100 : value;
  return `${Math.round(percentage)}%`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Convert file to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert base64 to file
 * @param {string} base64 - Base64 string
 * @param {string} filename - Output filename
 * @returns {File} File object
 */
export const base64ToFile = (base64, filename = 'image.jpg') => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

/**
 * Download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Download filename
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Get file extension
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file is image
 * @param {File} file - File to check
 * @returns {boolean} Is image
 */
export const isImageFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return imageTypes.includes(file.type);
};

/**
 * Generate random ID
 * @param {number} length - ID length
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

/**
 * Update URL query parameter without reload
 * @param {Object} params - Parameters to update
 */
export const updateQueryParams = (params) => {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  window.history.pushState({}, '', url);
};

/**
 * Scroll to element smoothly
 * @param {string} elementId - Element ID
 * @param {number} offset - Scroll offset
 */
export const scrollToElement = (elementId, offset = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

/**
 * Detect device type
 * @returns {string} Device type (mobile, tablet, desktop)
 */
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Check if online
 * @returns {boolean} Is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Get color based on confidence score
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} Color class
 */
export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return 'text-green-600 bg-green-100';
  if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

/**
 * Get emoji for fruit
 * @param {string} fruitName - Fruit name
 * @returns {string} Emoji
 */
export const getFruitEmoji = (fruitName) => {
  const emojiMap = {
    apple: '🍎',
    banana: '🍌',
    orange: '🍊',
    mango: '🥭',
    grape: '🍇',
    strawberry: '🍓',
    watermelon: '🍉',
    pineapple: '🍍',
    peach: '🍑',
    pear: '🍐',
    cherry: '🍒',
    kiwi: '🥝',
    lemon: '🍋',
    coconut: '🥥',
    avocado: '🥑',
  };
  
  const lowerName = fruitName?.toLowerCase() || '';
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(key)) return emoji;
  }
  return '🍎';
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after sleep
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry async function
 * @param {Function} fn - Async function to retry
 * @param {number} attempts - Number of attempts
 * @param {number} delay - Delay between attempts
 * @returns {Promise} Result
 */
export const retry = async (fn, attempts = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await sleep(delay);
    return retry(fn, attempts - 1, delay);
  }
};