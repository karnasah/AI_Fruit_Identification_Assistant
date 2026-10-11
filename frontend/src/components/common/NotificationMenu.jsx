import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import notificationService from '../../services/notificationService';

const NotificationMenu = ({ onClose }) => {
  const {
    notifications,
    unreadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotification();

  const handleMarkRead = async (notification) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    if (notification.persisted) {
      try {
        await notificationService.markAsRead(notification.id);
      } catch {
        // Keep the local read state responsive if the API is unavailable.
      }
    }
  };

  const handleRemove = async (notification) => {
    removeNotification(notification.id);
    if (notification.persisted) {
      try {
        await notificationService.deleteNotification(notification.id);
      } catch {
        // Keep the local removal responsive if the API is unavailable.
      }
    }
  };

  const handleMarkAllRead = async () => {
    markAllNotificationsRead();
    try {
      await notificationService.markAllAsRead();
    } catch {
      // Keep the local read state responsive if the API is unavailable.
    }
  };

  const handleClearAll = async () => {
    clearAllNotifications();
    try {
      await notificationService.deleteAll();
    } catch {
      // Keep the local removal responsive if the API is unavailable.
    }
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
        {unreadNotifications > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs text-primary-500 hover:text-primary-600">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 ${notification.read ? '' : 'bg-primary-50/50 dark:bg-primary-900/10'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <button onClick={() => handleMarkRead(notification)} className="flex-1 text-left">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{notification.title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                </button>
                <button onClick={() => handleRemove(notification)} className="text-gray-400 hover:text-red-500" aria-label="Delete notification">
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <button onClick={handleClearAll} className="w-full p-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
          Clear all
        </button>
      )}
    </div>
  );
};

export default NotificationMenu;