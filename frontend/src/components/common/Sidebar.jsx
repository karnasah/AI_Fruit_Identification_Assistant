import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { id: 'main', label: 'Main Dashboard', path: '/dashboard', icon: '📊' },
    { id: 'identify', label: 'Identify Fruit', path: '/identify', icon: '🍎' },
    { id: 'history', label: 'History', path: '/dashboard?tab=history', icon: '📜' },
    { id: 'favorites', label: 'Favorites', path: '/dashboard?tab=favorites', icon: '⭐' },
    { id: 'encyclopedia', label: 'Encyclopedia', path: '/encyclopedia', icon: '📚' },
    { id: 'chatbot', label: 'AI Chatbot', path: '/chatbot', icon: '🤖' },
    { id: 'profile', label: 'Profile', path: '/profile', icon: '👤' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const adminItems = [
    { id: 'admin', label: 'Admin Panel', path: '/admin', icon: '🛡️' },
    { id: 'users', label: 'Manage Users', path: '/admin/users', icon: '👥' },
    { id: 'models', label: 'ML Models', path: '/admin/models', icon: '🧠' },
    { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: '📈' },
  ];

  const handleNavigation = (path, id) => {
    if (onTabChange && id) {
      onTabChange(id);
    }
    if (path) {
      window.location.href = path;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🍎</div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">FruitAI</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assistant</p>
                </div>
              </div>
              {user && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-3 mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Main Menu
                </p>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path, item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                      ${activeTab === item.id || location.pathname === item.path
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {user?.role === 'admin' && (
                <div className="px-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                    Admin
                  </p>
                  {adminItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path, item.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                        ${activeTab === item.id
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <span>←</span>
                <span>Close Menu</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;