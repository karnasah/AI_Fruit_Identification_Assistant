import api from './api';

const notificationService = {
  getNotifications: async (params = {}) => {
    return api.get('/notifications/', { params });
  },

  getUnreadCount: async () => {
    return api.get('/notifications/unread-count');
  },

  markAsRead: async (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return api.put('/notifications/read-all');
  },

  deleteNotification: async (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },

  deleteAll: async () => {
    return api.delete('/notifications/');
  },
};

export default notificationService;