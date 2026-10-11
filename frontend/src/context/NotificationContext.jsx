import React, { createContext, useContext, useEffect } from 'react';
import { useNotification } from '../hooks/useNotification';

// Create context
const NotificationContext = createContext(null);

// Provider component
export const NotificationProvider = ({ children }) => {
  const notification = useNotification();
  const {
    requestPermission,
    showInfo,
    unreadNotifications,
  } = notification;

  // Request notification permission on mount
  useEffect(() => {
    const initNotifications = async () => {
      // Check if browser notifications are supported
      if ('Notification' in window) {
        // Don't auto-request permission, wait for user action
        const permission = localStorage.getItem('notification_permission');
        if (permission === 'granted') {
          await requestPermission();
        }
      }
    };
    
    initNotifications();
  }, [requestPermission]);

  // Show welcome notification for new users
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome');
    if (!hasSeenWelcome && unreadNotifications === 0) {
      setTimeout(() => {
        showInfo('Welcome to Fruit AI Assistant! 🍎 Start by identifying your first fruit.', 5000);
        localStorage.setItem('has_seen_welcome', 'true');
      }, 1000);
    }
  }, [showInfo, unreadNotifications]);

  return (
    <NotificationContext.Provider value={notification}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;