/**
 * Application Constants
 * Centralized configuration values used across the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// App Information
export const APP_INFO = {
  NAME: 'AI Fruit Identification Assistant',
  SHORT_NAME: 'FruitAI',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered fruit identification system using computer vision and deep learning',
  COPYRIGHT: `© ${new Date().getFullYear()} Fruit AI Assistant. All rights reserved.`,
};

// Fruit Categories
export const FRUIT_CATEGORIES = [
  { id: 'citrus', name: 'Citrus', icon: '🍊', color: 'orange' },
  { id: 'berries', name: 'Berries', icon: '🫐', color: 'purple' },
  { id: 'tropical', name: 'Tropical', icon: '🥭', color: 'yellow' },
  { id: 'stone_fruits', name: 'Stone Fruits', icon: '🍑', color: 'pink' },
  { id: 'pome_fruits', name: 'Pome Fruits', icon: '🍎', color: 'red' },
  { id: 'melons', name: 'Melons', icon: '🍈', color: 'green' },
  { id: 'exotic', name: 'Exotic', icon: '🥥', color: 'brown' },
  { id: 'dried', name: 'Dried Fruits', icon: '🍇', color: 'brown' },
];

// Seasons
export const SEASONS = [
  { id: 'spring', name: 'Spring', months: [3, 4, 5], icon: '🌸' },
  { id: 'summer', name: 'Summer', months: [6, 7, 8], icon: '☀️' },
  { id: 'autumn', name: 'Autumn', months: [9, 10, 11], icon: '🍂' },
  { id: 'winter', name: 'Winter', months: [12, 1, 2], icon: '❄️' },
];

// User Roles
export const USER_ROLES = {
  GENERAL: 'general',
  FARMER: 'farmer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
};

// User Role Labels
export const USER_ROLE_LABELS = {
  [USER_ROLES.GENERAL]: 'General User',
  [USER_ROLES.FARMER]: 'Farmer',
  [USER_ROLES.VENDOR]: 'Vendor',
  [USER_ROLES.ADMIN]: 'Administrator',
};

// Identification Status
export const IDENTIFICATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
};

// Confidence Thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMIT_OPTIONS: [10, 20, 50, 100],
};

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'user_settings',
  NOTIFICATION_PERMISSION: 'notification_permission',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  IDENTIFY: '/identify',
  DASHBOARD: '/dashboard',
  ENCYCLOPEDIA: '/encyclopedia',
  CHATBOT: '/chatbot',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ABOUT: '/about',
  CONTACT: '/contact',
  HELP: '/help',
  ADMIN: '/admin',
};

// Toast Notification Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Toast Durations (ms)
export const TOAST_DURATIONS = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  FRUITS: {
    IDENTIFY: '/fruits/identify',
    IDENTIFY_BASE64: '/fruits/identify-base64',
    IDENTIFY_MULTIPLE: '/fruits/identify-multiple',
    HISTORY: '/fruits/history',
    INFO: '/fruits/info',
    NUTRITION: '/fruits/nutrition',
    FAVORITES: '/fruits/favorites',
    STATISTICS: '/fruits/statistics',
  },
  ENCYCLOPEDIA: {
    FRUITS: '/encyclopedia/fruits',
    CATEGORIES: '/encyclopedia/categories',
    SEASONS: '/encyclopedia/seasons',
    SEARCH: '/encyclopedia/search',
    COMPARE: '/encyclopedia/compare',
  },
  CHATBOT: {
    MESSAGE: '/chatbot/message',
    HISTORY: '/chatbot/history',
    SESSION: '/chatbot/session',
    SUGGESTIONS: '/chatbot/suggestions',
    FAQS: '/chatbot/faqs',
  },
  VOICE: {
    SPEECH_TO_TEXT: '/voice/speech-to-text',
    TEXT_TO_SPEECH: '/voice/text-to-speech',
    PROCESS_COMMAND: '/voice/process-command',
    VOICES: '/voice/voices',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
    ANALYTICS: '/dashboard/analytics',
    LEADERBOARD: '/dashboard/leaderboard',
  },
  ADMIN: {
    USERS: '/admin/users',
    MODELS: '/admin/models',
    FRUITS: '/admin/fruits',
    ANALYTICS: '/admin/analytics',
    SYSTEM: '/admin/system',
  },
};

// Supported Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  notifications: true,
  emailUpdates: true,
  autoSave: true,
  voiceInput: true,
  voiceOutput: false,
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PASSWORD: /^(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9@#$%^&+=]{6,}$/,
  PHONE: /^\+?[0-9]{10,15}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size exceeds ${UPLOAD_LIMITS.MAX_SIZE_MB}MB limit.`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image.',
  IDENTIFICATION_FAILED: 'Failed to identify fruit. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Welcome back.',
  REGISTER_SUCCESS: 'Registration successful! Please check your email to verify your account.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  IDENTIFICATION_SUCCESS: 'Fruit identified successfully!',
  FAVORITE_ADDED: 'Added to favorites.',
  FAVORITE_REMOVED: 'Removed from favorites.',
};