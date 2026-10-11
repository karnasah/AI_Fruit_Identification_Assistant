import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';

const PrivacySettings = () => {
  const { user } = useAuth();
  const { preferences, setPreference, showToast } = useStore();
  const { showSuccess, showError } = useNotification();
  
  const [settings, setSettings] = useState({
    shareAnonymousData: true,
    saveHistory: true,
    allowAnalytics: true,
    showOnlineStatus: true,
    allowCookies: true,
    dataRetentionDays: 30,
    twoFactorAuth: false,
    emailVerification: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [showDataDeleteModal, setShowDataDeleteModal] = useState(false);

  useEffect(() => {
    setSettings({
      shareAnonymousData: preferences?.shareAnonymousData !== false,
      saveHistory: preferences?.saveHistory !== false,
      allowAnalytics: preferences?.allowAnalytics !== false,
      showOnlineStatus: preferences?.showOnlineStatus !== false,
      allowCookies: preferences?.allowCookies !== false,
      dataRetentionDays: preferences?.dataRetentionDays || 30,
      twoFactorAuth: preferences?.twoFactorAuth || false,
      emailVerification: preferences?.emailVerification !== false,
    });
  }, [preferences]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setPreference(key, value);
  };

  const handleExportData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowDataExportModal(false);
      showSuccess('Your data export has been prepared and will be sent to your email.');
    }, 2000);
  };

  const handleDeleteData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowDataDeleteModal(false);
      showSuccess('Your data has been deleted successfully.');
    }, 2000);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all your identification history? This action cannot be undone.')) {
      showSuccess('History cleared successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Collection Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>📊</span> Data Collection
        </h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Share Anonymous Usage Data
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Help improve the AI model by sharing anonymous usage data
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.shareAnonymousData}
                onChange={(e) => handleChange('shareAnonymousData', e.target.checked)}
                className="sr-only peer"
                id="shareAnonymousData"
              />
              <label
                htmlFor="shareAnonymousData"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.shareAnonymousData ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Save Identification History
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Keep track of your fruit identifications
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.saveHistory}
                onChange={(e) => handleChange('saveHistory', e.target.checked)}
                className="sr-only peer"
                id="saveHistory"
              />
              <label
                htmlFor="saveHistory"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.saveHistory ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Allow Analytics
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Collect anonymous analytics to improve user experience
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.allowAnalytics}
                onChange={(e) => handleChange('allowAnalytics', e.target.checked)}
                className="sr-only peer"
                id="allowAnalytics"
              />
              <label
                htmlFor="allowAnalytics"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.allowAnalytics ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Allow Cookies
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable cookies for better experience and authentication
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.allowCookies}
                onChange={(e) => handleChange('allowCookies', e.target.checked)}
                className="sr-only peer"
                id="allowCookies"
              />
              <label
                htmlFor="allowCookies"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.allowCookies ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>🛡️</span> Privacy Controls
        </h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Show Online Status
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Let others see when you're active
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.showOnlineStatus}
                onChange={(e) => handleChange('showOnlineStatus', e.target.checked)}
                className="sr-only peer"
                id="showOnlineStatus"
              />
              <label
                htmlFor="showOnlineStatus"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.showOnlineStatus ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Two-Factor Authentication
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                className="sr-only peer"
                id="twoFactorAuth"
              />
              <label
                htmlFor="twoFactorAuth"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.twoFactorAuth ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>⏰</span> Data Retention
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Keep my data for
          </label>
          <select
            value={settings.dataRetentionDays}
            onChange={(e) => handleChange('dataRetentionDays', parseInt(e.target.value))}
            className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={365}>1 year</option>
            <option value={0}>Forever</option>
          </select>
        </div>
        
        <button
          onClick={handleClearHistory}
          className="mt-4 text-sm text-red-500 hover:text-red-600"
        >
          Clear All History
        </button>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>📁</span> Your Data
        </h2>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowDataExportModal(true)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📥</span>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Export Your Data</p>
                <p className="text-xs text-gray-500">Download a copy of all your data</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
          
          <button
            onClick={() => setShowDataDeleteModal(true)}
            className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🗑️</span>
              <div className="text-left">
                <p className="font-medium text-red-600 dark:text-red-400">Delete All Data</p>
                <p className="text-xs text-red-500">Permanently delete all your data</p>
              </div>
            </div>
            <span className="text-red-400">→</span>
          </button>
        </div>
      </div>

      {/* Data Export Modal */}
      {showDataExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Export Your Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This will export all your identification history, favorites, and account data in JSON format.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleExportData} isLoading={isLoading} className="flex-1">
                Export
              </Button>
              <Button variant="outline" onClick={() => setShowDataExportModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Delete Modal */}
      {showDataDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">⚠️ Delete All Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This action is irreversible. All your identification history, favorites, and account data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDeleteData} isLoading={isLoading} className="flex-1">
                Yes, Delete
              </Button>
              <Button variant="outline" onClick={() => setShowDataDeleteModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings;