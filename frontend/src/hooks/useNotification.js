import { useStore } from '../store';
import { useCallback, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';

/**
 * Custom hook for notification management
 * Provides access to notification state and methods
 */
export const useNotification = () => {
  const {
    notifications,
    unreadNotifications,
    addNotification: storeAddNotification,
    markNotificationRead: storeMarkRead,
    markAllNotificationsRead: storeMarkAllRead,
    removeNotification: storeRemoveNotification,
    clearAllNotifications: storeClearAll,
    showToast: storeShowToast,
    hideToast: storeHideToast,
    toast,
    isAuthenticated,
    setNotifications,
  } = useStore();

  const permissionRef = useRef(false);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      permissionRef.current = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionRef.current = permission === 'granted';
      return permissionRef.current;
    }

    return false;
  }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback((title, options = {}) => {
    if (!permissionRef.current && Notification.permission !== 'granted') {
      requestPermission();
      return;
    }

    if (Notification.permission === 'granted') {
      const notificationOptions = {
        icon: options.icon || '/logo192.png',
        body: options.body || '',
        silent: options.silent || false,
        tag: options.tag || 'fruit-ai',
        requireInteraction: options.requireInteraction || false,
        ...options,
      };

      const notification = new Notification(title, notificationOptions);

      if (options.onClick) {
        notification.onclick = options.onClick;
      }

      if (options.onClose) {
        notification.onclose = options.onClose;
      }

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }, [requestPermission]);

  // Add a new notification (store + optional browser)
  const addNotification = useCallback((notification, sendBrowser = false) => {
    const notificationId = storeAddNotification(notification);
    
    if (sendBrowser && notification.title) {
      sendBrowserNotification(notification.title, {
        body: notification.message,
        icon: notification.icon,
        onClick: notification.onClick,
      });
    }
    
    return notificationId;
  }, [storeAddNotification, sendBrowserNotification]);

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId) => {
    storeMarkRead(notificationId);
  }, [storeMarkRead]);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(() => {
    storeMarkAllRead();
  }, [storeMarkAllRead]);

  // Remove a notification
  const removeNotification = useCallback((notificationId) => {
    storeRemoveNotification(notificationId);
  }, [storeRemoveNotification]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    storeClearAll();
  }, [storeClearAll]);

  const loadPersistedNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    const [notificationResponse, unreadResponse] = await Promise.all([
      notificationService.getNotifications({ limit: 50 }),
      notificationService.getUnreadCount(),
    ]);

    const notifications = (notificationResponse.data || []).map((item) => ({
      id: String(item.id),
      title: item.title,
      message: item.message,
      type: item.type || 'info',
      read: item.read,
      persisted: true,
      createdAt: item.created_at,
      action: item.action_url ? { url: item.action_url, text: item.action_text } : null,
      data: item.data || null,
    }));

    setNotifications(notifications, unreadResponse.unread_count || 0);
  }, [isAuthenticated, setNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    loadPersistedNotifications().catch(() => {});
    const intervalId = window.setInterval(() => {
      loadPersistedNotifications().catch(() => {});
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, loadPersistedNotifications]);

  // Show toast message
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    storeShowToast(message, type, duration);
  }, [storeShowToast]);

  // Hide toast message
  const hideToast = useCallback(() => {
    storeHideToast();
  }, [storeHideToast]);

  // Show success toast
  const showSuccess = useCallback((message, duration = 3000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  // Show error toast
  const showError = useCallback((message, duration = 4000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  // Show warning toast
  const showWarning = useCallback((message, duration = 3000) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  // Show info toast
  const showInfo = useCallback((message, duration = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  // Send identification success notification
  const notifyIdentificationSuccess = useCallback((fruitName, confidence) => {
    addNotification({
      title: 'Identification Complete!',
      message: `Successfully identified ${fruitName} with ${Math.round(confidence)}% confidence.`,
      type: 'success',
      icon: '🍎',
    }, true);
    
    showSuccess(`Identified: ${fruitName}`);
  }, [addNotification, showSuccess]);

  // Send identification failure notification
  const notifyIdentificationFailure = useCallback((error) => {
    addNotification({
      title: 'Identification Failed',
      message: error || 'Could not identify the fruit. Please try again with a clearer image.',
      type: 'error',
      icon: '⚠️',
    }, false);
    
    showError(error || 'Identification failed');
  }, [addNotification, showError]);

  // Send welcome notification for new users
  const notifyWelcome = useCallback((userName) => {
    addNotification({
      title: 'Welcome to Fruit AI!',
      message: `Hello ${userName}! Start by identifying your first fruit.`,
      type: 'info',
      icon: '🎉',
    }, true);
  }, [addNotification]);

  // Send achievement notification
  const notifyAchievement = useCallback((achievementName, description) => {
    addNotification({
      title: `🏆 Achievement Unlocked: ${achievementName}`,
      message: description || `You've earned the ${achievementName} achievement!`,
      type: 'success',
      icon: '🏆',
    }, true);
  }, [addNotification]);

  // Send seasonal fruit alert
  const notifySeasonalFruit = useCallback((fruitName, season) => {
    addNotification({
      title: `🍂 ${fruitName} is in season!`,
      message: `${fruitName} is at its peak during ${season}. Check out its nutritional benefits.`,
      type: 'info',
      icon: '📅',
    }, true);
  }, [addNotification]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return unreadNotifications;
  }, [unreadNotifications]);

  // Initialize notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      permissionRef.current = true;
    }
  }, []);

  return {
    // State
    notifications,
    unreadNotifications,
    toast,
    hasPermission: permissionRef.current,
    
    // Methods
    requestPermission,
    sendBrowserNotification,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearAllNotifications,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    getUnreadCount,
    
    // Preset notifications
    notifyIdentificationSuccess,
    notifyIdentificationFailure,
    notifyWelcome,
    notifyAchievement,
    notifySeasonalFruit,
  };
};

export default useNotification;