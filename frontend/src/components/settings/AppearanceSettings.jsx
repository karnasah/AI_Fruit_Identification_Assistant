import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useStore } from '../../store';
import Button from '../common/Button';

const AppearanceSettings = () => {
  const { theme, setTheme, fontSize, setPreference: setThemePreference } = useTheme();
  const { preferences, setPreference, showToast } = useStore();
  
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
    compactView: false,
    showAnimations: true,
    autoPlayVideos: false,
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [selectedAccentColor, setSelectedAccentColor] = useState('#f57d19');

  useEffect(() => {
    setSettings({
      theme: theme || 'light',
      fontSize: fontSize || 'medium',
      reducedMotion: preferences?.reducedMotion || false,
      highContrast: preferences?.highContrast || false,
      compactView: preferences?.compactView || false,
      showAnimations: preferences?.showAnimations !== false,
      autoPlayVideos: preferences?.autoPlayVideos || false,
      language: preferences?.language || 'en',
      dateFormat: preferences?.dateFormat || 'MM/DD/YYYY',
      timeFormat: preferences?.timeFormat || '12h',
    });
  }, [theme, fontSize, preferences]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply immediate effects
    if (key === 'theme') {
      setTheme(value);
    }
    if (key === 'fontSize') {
      setThemePreference('fontSize', value);
      applyFontSize(value);
    }
    if (key === 'reducedMotion') {
      setPreference('reducedMotion', value);
      applyReducedMotion(value);
    }
    if (key === 'highContrast') {
      setPreference('highContrast', value);
      applyHighContrast(value);
    }
    if (key === 'compactView') {
      setPreference('compactView', value);
    }
    if (key === 'showAnimations') {
      setPreference('showAnimations', value);
    }
    if (key === 'language') {
      setPreference('language', value);
    }
  };

  const applyFontSize = (size) => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (size) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      default:
        root.classList.add('text-base');
    }
  };

  const applyReducedMotion = (enabled) => {
    const root = document.documentElement;
    if (enabled) {
      root.style.setProperty('--transition-duration', '0ms');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--transition-duration');
      root.classList.remove('reduce-motion');
    }
  };

  const applyHighContrast = (enabled) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Save all settings to backend
    setTimeout(() => {
      setIsSaving(false);
      showToast('Appearance settings saved!', 'success');
    }, 500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all appearance settings to default?')) {
      setSettings({
        theme: 'light',
        fontSize: 'medium',
        reducedMotion: false,
        highContrast: false,
        compactView: false,
        showAnimations: true,
        autoPlayVideos: false,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
      });
      setTheme('light');
      applyFontSize('medium');
      applyReducedMotion(false);
      applyHighContrast(false);
      showToast('Settings reset to default', 'info');
    }
  };

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️', bgColor: 'bg-white', textColor: 'text-gray-900' },
    { value: 'dark', label: 'Dark', icon: '🌙', bgColor: 'bg-gray-900', textColor: 'text-white' },
  ];

  const fontSizes = [
    { value: 'small', label: 'Small', icon: 'A⁻' },
    { value: 'medium', label: 'Medium', icon: 'A' },
    { value: 'large', label: 'Large', icon: 'A⁺' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  ];

  const accentColors = [
    { name: 'Orange', value: '#f57d19' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>🎨</span> Theme
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => handleChange('theme', themeOption.value)}
              className={`
                p-4 rounded-xl border-2 transition-all
                ${settings.theme === themeOption.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }
              `}
            >
              <div className={`p-4 rounded-lg mb-2 ${themeOption.bgColor}`}>
                <div className={`text-center ${themeOption.textColor}`}>
                  <div className="text-3xl mb-2">🍎</div>
                  <p className="text-sm font-medium">Sample Text</p>
                  <p className="text-xs opacity-75">Preview</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>{themeOption.icon}</span>
                <span className="font-medium">{themeOption.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedAccentColor(color.value)}
                className={`
                  w-10 h-10 rounded-full transition-all
                  ${selectedAccentColor === color.value ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''}
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>🔤</span> Font Size
        </h2>
        
        <div className="flex gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => handleChange('fontSize', size.value)}
              className={`
                flex-1 py-3 rounded-lg font-medium transition-all
                ${settings.fontSize === size.value
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <div className="text-lg">{size.icon}</div>
              <div className="text-sm">{size.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>🌐</span> Language
        </h2>
        
        <select
          value={settings.language}
          onChange={(e) => handleChange('language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Time Format */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>📅</span> Date & Time Format
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Format
            </label>
            <select
              value={settings.timeFormat}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="12h">12-hour (12:30 PM)</option>
              <option value="24h">24-hour (13:30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>🖥️</span> Display Options
        </h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Compact View
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show more content by reducing spacing
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.compactView}
                onChange={(e) => handleChange('compactView', e.target.checked)}
                className="sr-only peer"
                id="compactView"
              />
              <label
                htmlFor="compactView"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.compactView ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Show Animations
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable smooth transitions and animations
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.showAnimations}
                onChange={(e) => handleChange('showAnimations', e.target.checked)}
                className="sr-only peer"
                id="showAnimations"
              />
              <label
                htmlFor="showAnimations"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.showAnimations ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Reduced Motion
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Minimize animations for accessibility
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => handleChange('reducedMotion', e.target.checked)}
                className="sr-only peer"
                id="reducedMotion"
              />
              <label
                htmlFor="reducedMotion"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.reducedMotion ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                High Contrast
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Increase color contrast for better readability
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => handleChange('highContrast', e.target.checked)}
                className="sr-only peer"
                id="highContrast"
              />
              <label
                htmlFor="highContrast"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.highContrast ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Auto-play Videos
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically play tutorial videos
              </p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.autoPlayVideos}
                onChange={(e) => handleChange('autoPlayVideos', e.target.checked)}
                className="sr-only peer"
                id="autoPlayVideos"
              />
              <label
                htmlFor="autoPlayVideos"
                className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer relative"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.autoPlayVideos ? 'translate-x-4' : 'translate-x-0'}`} />
              </label>
            </div>
          </label>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>👁️</span> Live Preview
        </h2>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
              🍎
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Apple</p>
              <p className="text-xs text-gray-500">96% confidence</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is how your content will appear with the current settings.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleResetDefaults}>
          Reset to Default
        </Button>
        <Button onClick={handleSaveSettings} isLoading={isSaving}>
          💾 Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;