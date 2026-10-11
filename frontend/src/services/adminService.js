import api from './api';

/**
 * Admin Service
 * Handles all admin-related API calls including user management, model management, and system analytics
 * Note: All endpoints in this service require admin role
 */
const adminService = {
  // ==================== USER MANAGEMENT ====================
  
  /**
   * Get all users with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search by name or email
   * @param {string} params.role - Filter by role
   * @param {string} params.status - Filter by status (active, inactive, banned)
   * @param {string} params.sort - Sort by field
   * @param {string} params.order - Sort order (asc, desc)
   */
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);
      
      const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single user details by ID
   * @param {string} userId - User ID
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new user (admin)
   * @param {Object} userData - User registration data
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user details
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user (soft delete)
   * @param {string} userId - User ID
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Permanently delete user
   * @param {string} userId - User ID
   */
  permanentDeleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}/permanent`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Ban user
   * @param {string} userId - User ID
   * @param {string} reason - Ban reason
   */
  banUser: async (userId, reason) => {
    try {
      const response = await api.post(`/admin/users/${userId}/ban`, { reason });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unban user
   * @param {string} userId - User ID
   */
  unbanUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/unban`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Assign role to user
   * @param {string} userId - User ID
   * @param {string} role - Role name
   */
  assignRole: async (userId, role) => {
    try {
      const response = await api.post(`/admin/users/${userId}/role`, { role });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user activity log
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   */
  getUserActivityLog: async (userId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const url = `/admin/users/${userId}/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user statistics
   * @param {string} userId - User ID
   */
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== MODEL MANAGEMENT ====================

  /**
   * Get all ML models
   */
  getModels: async () => {
    try {
      const response = await api.get('/admin/models');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get model details by ID
   * @param {string} modelId - Model ID
   */
  getModelById: async (modelId) => {
    try {
      const response = await api.get(`/admin/models/${modelId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload new model
   * @param {File} modelFile - Model file (.h5, .tflite)
   * @param {Object} metadata - Model metadata
   */
  uploadModel: async (modelFile, metadata) => {
    try {
      const formData = new FormData();
      formData.append('model', modelFile);
      formData.append('name', metadata.name);
      formData.append('version', metadata.version);
      formData.append('description', metadata.description);
      formData.append('model_type', metadata.modelType);
      
      const response = await api.post('/admin/models/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Train new model
   * @param {Object} trainingConfig - Training configuration
   */
  trainModel: async (trainingConfig) => {
    try {
      const response = await api.post('/admin/models/train', trainingConfig);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get training status
   * @param {string} jobId - Training job ID
   */
  getTrainingStatus: async (jobId) => {
    try {
      const response = await api.get(`/admin/models/train/${jobId}/status`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel training job
   * @param {string} jobId - Training job ID
   */
  cancelTraining: async (jobId) => {
    try {
      const response = await api.post(`/admin/models/train/${jobId}/cancel`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Activate model for inference
   * @param {string} modelId - Model ID
   */
  activateModel: async (modelId) => {
    try {
      const response = await api.post(`/admin/models/${modelId}/activate`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Deactivate model
   * @param {string} modelId - Model ID
   */
  deactivateModel: async (modelId) => {
    try {
      const response = await api.post(`/admin/models/${modelId}/deactivate`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete model
   * @param {string} modelId - Model ID
   */
  deleteModel: async (modelId) => {
    try {
      const response = await api.delete(`/admin/models/${modelId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get model performance metrics
   * @param {string} modelId - Model ID
   */
  getModelMetrics: async (modelId) => {
    try {
      const response = await api.get(`/admin/models/${modelId}/metrics`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Test model with sample image
   * @param {string} modelId - Model ID
   * @param {File} imageFile - Sample image
   */
  testModel: async (modelId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/admin/models/${modelId}/test`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== FRUIT DATABASE MANAGEMENT ====================

  /**
   * Get all fruits in database
   * @param {Object} params - Query parameters
   */
  getAllFruits: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      
      const url = `/admin/fruits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add new fruit to encyclopedia
   * @param {Object} fruitData - Fruit data
   */
  addFruit: async (fruitData) => {
    try {
      const response = await api.post('/admin/fruits', fruitData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update fruit information
   * @param {string} fruitId - Fruit ID
   * @param {Object} fruitData - Updated fruit data
   */
  updateFruit: async (fruitId, fruitData) => {
    try {
      const response = await api.put(`/admin/fruits/${fruitId}`, fruitData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete fruit from encyclopedia
   * @param {string} fruitId - Fruit ID
   */
  deleteFruit: async (fruitId) => {
    try {
      const response = await api.delete(`/admin/fruits/${fruitId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk upload fruits
   * @param {File} csvFile - CSV file with fruit data
   */
  bulkUploadFruits: async (csvFile) => {
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      
      const response = await api.post('/admin/fruits/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload fruit image
   * @param {string} fruitId - Fruit ID
   * @param {File} imageFile - Image file
   */
  uploadFruitImage: async (fruitId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/admin/fruits/${fruitId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete fruit image
   * @param {string} fruitId - Fruit ID
   * @param {string} imageId - Image ID
   */
  deleteFruitImage: async (fruitId, imageId) => {
    try {
      const response = await api.delete(`/admin/fruits/${fruitId}/images/${imageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== SYSTEM ANALYTICS ====================

  /**
   * Get system overview statistics
   */
  getSystemOverview: async () => {
    try {
      const response = await api.get('/admin/analytics/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user growth analytics
   * @param {Object} params - Query parameters
   */
  getUserGrowth: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const url = `/admin/analytics/user-growth${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get identification analytics
   * @param {Object} params - Query parameters
   */
  getIdentificationAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const url = `/admin/analytics/identifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get system performance metrics
   */
  getSystemPerformance: async () => {
    try {
      const response = await api.get('/admin/analytics/performance');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get API usage statistics
   * @param {Object} params - Query parameters
   */
  getApiUsage: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const url = `/admin/analytics/api-usage${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get error logs
   * @param {Object} params - Query parameters
   */
  getErrorLogs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.level) queryParams.append('level', params.level);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const url = `/admin/logs/errors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get system health status
   */
  getSystemHealth: async () => {
    try {
      const response = await api.get('/admin/system/health');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get database statistics
   */
  getDatabaseStats: async () => {
    try {
      const response = await api.get('/admin/system/database-stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear system cache
   */
  clearCache: async () => {
    try {
      const response = await api.post('/admin/system/clear-cache');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get system configuration
   */
  getSystemConfig: async () => {
    try {
      const response = await api.get('/admin/system/config');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update system configuration
   * @param {Object} config - System configuration
   */
  updateSystemConfig: async (config) => {
    try {
      const response = await api.put('/admin/system/config', config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create database backup
   */
  createBackup: async () => {
    try {
      const response = await api.post('/admin/system/backup');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get list of backups
   */
  getBackups: async () => {
    try {
      const response = await api.get('/admin/system/backups');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Restore database from backup
   * @param {string} backupId - Backup ID
   */
  restoreBackup: async (backupId) => {
    try {
      const response = await api.post(`/admin/system/restore/${backupId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send system notification to all users
   * @param {Object} notification - Notification data
   */
  sendGlobalNotification: async (notification) => {
    try {
      const response = await api.post('/notifications/admin/send-all', null, {
        params: {
          title: notification.title,
          message: notification.message,
          notification_type: notification.type || notification.notification_type || 'info',
          role: notification.role,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get system maintenance status
   */
  getMaintenanceStatus: async () => {
    try {
      const response = await api.get('/admin/system/maintenance');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Enable/disable maintenance mode
   * @param {boolean} enabled - Maintenance mode status
   * @param {string} message - Maintenance message
   */
  setMaintenanceMode: async (enabled, message = '') => {
    try {
      const response = await api.post('/admin/system/maintenance', { enabled, message });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default adminService;