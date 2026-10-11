import React from 'react';
import { motion } from 'framer-motion';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Identifications',
      value: stats?.total || 0,
      icon: '🍎',
      color: 'primary',
      trend: '+12%',
    },
    {
      title: 'Unique Fruits',
      value: stats?.uniqueFruits || 0,
      icon: '🍍',
      color: 'secondary',
      trend: '+5%',
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate || 0}%`,
      icon: '🎯',
      color: 'success',
      trend: '+2%',
    },
    {
      title: 'Current Streak',
      value: `${stats?.streak || 0} days`,
      icon: '🔥',
      color: 'warning',
      trend: stats?.streak > 0 ? 'Active' : 'Start today',
    },
  ];

  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    secondary: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[card.color]}`}>
              {card.icon}
            </div>
            <span className="text-xs text-green-500">{card.trend}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {card.value}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {card.title}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;