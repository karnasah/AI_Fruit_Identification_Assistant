import { useStore } from '../store';
import { useEffect } from 'react';

/**
 * Custom hook for theme management
 * Provides access to theme state and methods
 */
export const useTheme = () => {
  const {
    theme,
    toggleTheme: storeToggleTheme,
    setTheme: storeSetTheme,
    preferences,
    setPreference,
  } = useStore();

  // Toggle between light and dark theme
  const toggleTheme = () => {
    storeToggleTheme();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyThemeToDocument(newTheme);
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  // Set specific theme
  const setTheme = (newTheme) => {
    storeSetTheme(newTheme);
    applyThemeToDocument(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme to document element
  const applyThemeToDocument = (themeValue) => {
    if (themeValue === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Get current theme
  const getTheme = () => theme;

  // Check if dark mode is active
  const isDarkMode = () => theme === 'dark';

  // Check if light mode is active
  const isLightMode = () => theme === 'light';

  // Get font size class based on preference
  const getFontSizeClass = () => {
    const fontSize = preferences?.fontSize || 'medium';
    switch (fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  // Apply font size to document
  const applyFontSize = () => {
    const fontSize = preferences?.fontSize || 'medium';
    const root = document.documentElement;
    
    // Remove existing font size classes
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    
    switch (fontSize) {
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

  // Apply reduced motion preference
  const applyReducedMotion = () => {
    const reducedMotion = preferences?.reducedMotion || false;
    const root = document.documentElement;
    
    if (reducedMotion) {
      root.style.setProperty('--transition-duration', '0ms');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--transition-duration');
      root.classList.remove('reduce-motion');
    }
  };

  // Apply high contrast preference
  const applyHighContrast = () => {
    const highContrast = preferences?.highContrast || false;
    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  };

  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme = savedTheme;
    if (!initialTheme) {
      initialTheme = systemPrefersDark ? 'dark' : 'light';
    }
    
    setTheme(initialTheme);
  };

  // Listen to system theme changes
  const listenToSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  };

  // Apply all theme-related settings
  const applyAllSettings = () => {
    applyThemeToDocument(theme);
    applyFontSize();
    applyReducedMotion();
    applyHighContrast();
  };

  // Run on mount
  useEffect(() => {
    initializeTheme();
    const cleanup = listenToSystemTheme();
    
    return () => {
      cleanup();
    };
  }, []);

  // Apply settings when preferences change
  useEffect(() => {
    applyAllSettings();
  }, [theme, preferences?.fontSize, preferences?.reducedMotion, preferences?.highContrast]);

  return {
    // State
    theme,
    fontSize: preferences?.fontSize,
    reducedMotion: preferences?.reducedMotion,
    highContrast: preferences?.highContrast,
    
    // Methods
    toggleTheme,
    setTheme,
    getTheme,
    isDarkMode,
    isLightMode,
    getFontSizeClass,
    applyFontSize,
    applyReducedMotion,
    applyHighContrast,
    initializeTheme,
    applyAllSettings,
  };
};

export default useTheme;