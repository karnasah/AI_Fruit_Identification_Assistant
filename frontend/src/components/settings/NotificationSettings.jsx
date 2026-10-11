import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotification } from '../../hooks/useNotification';
import { useStore } from '../../store';
import Button from '../common/Button';

const NotificationSettings = () => {
  const { requestPermission, hasPermission } = useNotification();
  const { preferences, setPreference, showToast } = useStore();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    identificationAlerts: true,
    seasonalAlerts: true,
    newsletterSubscription: false,
    achievementAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from preferences
    setSettings({
      emailNotifications: preferences?.emailNotifications !== false,
      pushNotifications: preferences?.pushNotifications || false,
      identificationAlerts: preferences?.identificationAlerts !== false,
      seasonalAlerts: preferences?.seasonalAlerts !== false,
      newsletterSubscription: preferences?.newsletterSubscription || false,
      achievementAlerts: preferences?.achievementAlerts !== false,
      weeklyDigest: preferences?.weeklyDigest || false,
      marketingEmails: preferences?.marketingEmails || false,
    });
  }, [preferences]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setPreference(key, value);
  };

  const handleEnablePushNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      handleChange('pushNotifications', true);
      showToast('Push notifications enabled!', 'success');
    } else {
      showToast('Please allow notification permissions in your browser settings.', 'error');
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      showToast('Notification settings saved!', 'success');
    }, 500);
  };

  const notificationCategories = [
    {
      title: 'Email Notifications',
      icon: '📧',
      description: 'Receive notifications via email',
      items: [
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Get important updates via email' },
        { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary of your activity' },
        { key: 'newsletterSubscription', label: 'Newsletter', description: 'Monthly fruit insights and tips' },
        { key: 'marketingEmails', label: 'Marketing Emails', description: 'Special offers and promotions' },
      ],
    },
    {
      title: 'Push Notifications',
      icon: '🔔',
      description: 'Real-time notifications on your device',
      items: [
        { key: 'pushNotifications', label: 'Push Notifications', description: 'Get instant alerts on your device' },
        { key: 'identificationAlerts', label: 'Identification Alerts', description: 'When fruit identification is complete' },
        { key: 'seasonalAlerts', label: 'Seasonal Fruit Alerts', description: 'When fruits come into season' },
        { key: 'achievementAlerts', label: 'Achievement Alerts', description: 'When you unlock new achievements' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Push Notification Permission Banner */}
      {!hasPermission && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Enable Push Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get real-time alerts for fruit identification and seasonal updates
            </p>
          </div>
          <Button onClick={handleEnablePushNotifications} size="sm">
            Enable
          </Button>
        </div>
      )}

      {/* Notification Categories */}
      {notificationCategories.map((category, idx) => (
        <motion.div
          key={category.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {category.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {category.description}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {category.items.map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between cursor-pointer py-2"
              >
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {item.label}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.checked)}
                    className="sr-only peer"
                    id={`notif-${item.key}`}
                  />
                  <label
                    htmlFor={`notif-${item.key}`}
                    className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
                  >
                    <span
                      className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                        ${settings[item.key] ? 'translate-x-4' : 'translate-x-0'}
                      `}
                    />
                  </label>
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveAll} isLoading={isSaving}>
          💾 Save All Settings
        </Button>
      </div>

      {/* Notification Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>📱</span> Notification Preview
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xl">
              🍎
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Identification Complete!
              </p>
              <p className="text-xs text-gray-500">Successfully identified Apple with 96% confidence</p>
            </div>
            <span className="text-xs text-gray-400">now</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xl">
              🌸
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Mango Season Alert!
              </p>
              <p className="text-xs text-gray-500">Mangoes are now in season. Check out their benefits!</p>
            </div>
            <span className="text-xs text-gray-400">2h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;