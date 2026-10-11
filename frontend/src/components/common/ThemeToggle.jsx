import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely show the theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}
        aria-label="Loading theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center gap-2
        p-2 rounded-lg
        transition-all duration-300
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-primary-500
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <>
          <span className="text-yellow-500 text-lg">☀️</span>
          {showLabel && <span className="text-sm">Light Mode</span>}
        </>
      ) : (
        <>
          <span className="text-gray-700 text-lg">🌙</span>
          {showLabel && <span className="text-sm">Dark Mode</span>}
        </>
      )}
    </button>
  );
};

// Animated Theme Toggle (Switch style)
export const AnimatedThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-12 h-6 rounded-full transition-colors duration-300
        ${isDark ? 'bg-primary-600' : 'bg-gray-300'}
        focus:outline-none focus:ring-2 focus:ring-primary-500
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className={`
          absolute top-0.5 left-0.5
          w-5 h-5 rounded-full
          bg-white
          transition-transform duration-300
          flex items-center justify-center text-xs
          ${isDark ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export default ThemeToggle;