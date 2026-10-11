import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @param {string} userData.role - User role (farmer/vendor/general)
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - Email address
   * @param {string} credentials.password - Password
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store tokens and user data in localStorage
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token || '');
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
      
      return response;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send password reset email
   * @param {string} email - User email address
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password (authenticated user)
   * @param {Object} passwords - Password objects
   * @param {string} passwords.currentPassword - Current password
   * @param {string} passwords.newPassword - New password
   */
  changePassword: async (passwords) => {
    try {
      const response = await api.post('/auth/change-password', passwords);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify email with OTP
   * @param {string} email - User email
   * @param {string} otp - One-time password
   */
  verifyEmail: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Resend verification OTP
   * @param {string} email - User email
   */
  resendVerification: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Get stored user data
   */
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      
      // Update stored user data
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
