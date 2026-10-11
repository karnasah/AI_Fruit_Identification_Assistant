import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme, showToast } = useStore();
  
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'light',
    darkMode: false,
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    identificationAlerts: true,
    seasonalAlerts: false,
    newsletterSubscription: false,
    
    // Privacy
    shareData: true,
    saveHistory: true,
    anonymousAnalytics: true,
    
    // Display
    showConfidenceScore: true,
    showNutritionalInfo: true,
    showSeasonalInfo: true,
    showPriceInfo: false,
    
    // Voice
    voiceOutput: false,
    voiceInput: true,
    voiceLanguage: 'en-US',
    voiceSpeed: 1.0,
    
    // Advanced
    autoSave: true,
    offlineMode: false,
    cacheImages: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply immediate effects
    if (key === 'theme' || key === 'darkMode') {
      const newTheme = key === 'theme' ? value : settings.theme;
      setTheme(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('user_settings', JSON.stringify(settings));
      setIsSaving(false);
      showToast('Settings saved successfully!', 'success');
    }, 500);
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        theme: 'light',
        darkMode: false,
        fontSize: 'medium',
        reducedMotion: false,
        highContrast: false,
        emailNotifications: true,
        pushNotifications: true,
        identificationAlerts: true,
        seasonalAlerts: false,
        newsletterSubscription: false,
        shareData: true,
        saveHistory: true,
        anonymousAnalytics: true,
        showConfidenceScore: true,
        showNutritionalInfo: true,
        showSeasonalInfo: true,
        showPriceInfo: false,
        voiceOutput: false,
        voiceInput: true,
        voiceLanguage: 'en-US',
        voiceSpeed: 1.0,
        autoSave: true,
        offlineMode: false,
        cacheImages: true,
      });
      setTheme('light');
      showToast('Settings reset to default', 'info');
    }
  };

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'display', label: 'Display', icon: '🖥️' },
    { id: 'voice', label: 'Voice', icon: '🎤' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Settings
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Customize your app experience
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-24">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
                
                <hr className="my-3 border-gray-200 dark:border-gray-700" />
                
                <button
                  onClick={handleResetSettings}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <span className="text-xl">🔄</span>
                  <span className="font-medium">Reset All</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
              >
                {/* Appearance Section */}
                {activeSection === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Appearance
                    </h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                      </label>
                      <div className="flex gap-3">
                        {['light', 'dark'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => handleChange('theme', mode)}
                            className={`flex-1 py-3 rounded-lg capitalize font-medium transition-all ${
                              settings.theme === mode
                                ? 'bg-primary-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {mode === 'light' ? '☀️ Light' : '🌙 Dark'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Size
                      </label>
                      <div className="flex gap-3">
                        {['small', 'medium', 'large'].map((size) => (
                          <button
                            key={size}
                            onClick={() => handleChange('fontSize', size)}
                            className={`flex-1 py-3 rounded-lg capitalize transition-all ${
                              settings.fontSize === size
                                ? 'bg-primary-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Reduced Motion</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Minimize animations and movements
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.reducedMotion}
                          onChange={(e) => handleChange('reducedMotion', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">High Contrast</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Increase color contrast for better readability
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.highContrast}
                          onChange={(e) => handleChange('highContrast', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Notifications
                    </h2>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Receive updates via email
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Get instant alerts on your device
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.pushNotifications}
                          onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Identification Alerts</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Notify when identification is complete
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.identificationAlerts}
                          onChange={(e) => handleChange('identificationAlerts', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Seasonal Fruit Alerts</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Get notified about seasonal fruits
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.seasonalAlerts}
                          onChange={(e) => handleChange('seasonalAlerts', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Newsletter Subscription</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Receive monthly fruit insights
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.newsletterSubscription}
                          onChange={(e) => handleChange('newsletterSubscription', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Privacy Section */}
                {activeSection === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Privacy & Data
                    </h2>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Share Anonymous Data</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Help improve the AI model
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.shareData}
                          onChange={(e) => handleChange('shareData', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Save Identification History</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Keep track of your identifications
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.saveHistory}
                          onChange={(e) => handleChange('saveHistory', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Anonymous Analytics</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Collect usage statistics anonymously
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.anonymousAnalytics}
                          onChange={(e) => handleChange('anonymousAnalytics', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <strong>Data Export</strong> - Download all your data
                      </p>
                      <Button variant="outline" size="sm">
                        📥 Export My Data
                      </Button>
                    </div>
                  </div>
                )}

                {/* Display Section */}
                {activeSection === 'display' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Display Options
                    </h2>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Show Confidence Score</span>
                        <input
                          type="checkbox"
                          checked={settings.showConfidenceScore}
                          onChange={(e) => handleChange('showConfidenceScore', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Show Nutritional Information</span>
                        <input
                          type="checkbox"
                          checked={settings.showNutritionalInfo}
                          onChange={(e) => handleChange('showNutritionalInfo', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Show Seasonal Information</span>
                        <input
                          type="checkbox"
                          checked={settings.showSeasonalInfo}
                          onChange={(e) => handleChange('showSeasonalInfo', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Show Price Information</span>
                        <input
                          type="checkbox"
                          checked={settings.showPriceInfo}
                          onChange={(e) => handleChange('showPriceInfo', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Voice Section */}
                {activeSection === 'voice' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Voice Settings
                    </h2>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Enable Voice Output</span>
                        <input
                          type="checkbox"
                          checked={settings.voiceOutput}
                          onChange={(e) => handleChange('voiceOutput', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Enable Voice Input</span>
                        <input
                          type="checkbox"
                          checked={settings.voiceInput}
                          onChange={(e) => handleChange('voiceInput', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Voice Language
                        </label>
                        <select
                          value={settings.voiceLanguage}
                          onChange={(e) => handleChange('voiceLanguage', e.target.value)}
                          className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="hi-IN">Hindi</option>
                          <option value="es-ES">Spanish</option>
                          <option value="fr-FR">French</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Voice Speed: {settings.voiceSpeed}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={settings.voiceSpeed}
                          onChange={(e) => handleChange('voiceSpeed', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Section */}
                {activeSection === 'advanced' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Advanced Settings
                    </h2>
                    
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Auto-save Identifications</span>
                        <input
                          type="checkbox"
                          checked={settings.autoSave}
                          onChange={(e) => handleChange('autoSave', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Offline Mode</span>
                        <input
                          type="checkbox"
                          checked={settings.offlineMode}
                          onChange={(e) => handleChange('offlineMode', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300">Cache Images</span>
                        <input
                          type="checkbox"
                          checked={settings.cacheImages}
                          onChange={(e) => handleChange('cacheImages', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <strong>Clear Cache</strong> - Remove all cached data
                      </p>
                      <Button variant="outline" size="sm">
                        🗑️ Clear Cache
                      </Button>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSettings}
                      isLoading={isSaving}
                      className="px-8"
                    >
                      💾 Save All Settings
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SettingsPage;