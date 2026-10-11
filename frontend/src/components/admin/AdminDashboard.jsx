import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Button from '../common/Button';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIdentifications: 0,
    totalFruits: 0,
    activeUsers: 0,
    successRate: 0,
    modelAccuracy: 0,
    pendingReviews: 0,
    storageUsed: '0 GB',
    apiCallsToday: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    api: 'operational',
    database: 'connected',
    mlService: 'running',
    storage: 'healthy',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1542,
        totalIdentifications: 28456,
        totalFruits: 132,
        activeUsers: 892,
        successRate: 94.8,
        modelAccuracy: 96.2,
        pendingReviews: 23,
        storageUsed: '45.2 GB',
        apiCallsToday: 3456,
      });
      
      setRecentActivities([
        { id: 1, user: 'John Doe', action: 'Registered new account', timestamp: '2 minutes ago', type: 'user' },
        { id: 2, user: 'Jane Smith', action: 'Identified Mango', timestamp: '15 minutes ago', type: 'identification' },
        { id: 3, user: 'Mike Johnson', action: 'Added new fruit: Dragon Fruit', timestamp: '1 hour ago', type: 'fruit' },
        { id: 4, user: 'Sarah Williams', action: 'Reported issue with identification', timestamp: '3 hours ago', type: 'report' },
        { id: 5, user: 'Admin', action: 'Updated ML model to v2.3', timestamp: '5 hours ago', type: 'system' },
      ]);
      
      setIsLoading(false);
    }, 1000);
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'primary', trend: '+12%' },
    { title: 'Identifications', value: stats.totalIdentifications.toLocaleString(), icon: '🍎', color: 'secondary', trend: '+8%' },
    { title: 'Fruit Database', value: stats.totalFruits, icon: '📚', color: 'accent', trend: '+5' },
    { title: 'Active Users', value: stats.activeUsers, icon: '🟢', color: 'success', trend: '+3%' },
    { title: 'Success Rate', value: `${stats.successRate}%`, icon: '🎯', color: 'info', trend: '+2.3%' },
    { title: 'Model Accuracy', value: `${stats.modelAccuracy}%`, icon: '🧠', color: 'warning', trend: '+0.5%' },
  ];

  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
    secondary: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600',
    accent: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
  };

  const getHealthStatusColor = (status) => {
    if (status === 'operational' || status === 'connected' || status === 'running' || status === 'healthy') {
      return 'text-green-500';
    }
    if (status === 'degraded') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatusIcon = (status) => {
    if (status === 'operational' || status === 'connected' || status === 'running' || status === 'healthy') {
      return '●';
    }
    if (status === 'degraded') return '◔';
    return '○';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loader"></div>
        <span className="ml-3 text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-white/80 mt-1">
          Welcome back, {user?.name || 'Admin'}! Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-green-500 mt-1">{card.trend} from last month</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[card.color]}`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📋</span> Recent Activity
            </h3>
            <button className="text-sm text-primary-500 hover:text-primary-600">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
                  {activity.type === 'user' && '👤'}
                  {activity.type === 'identification' && '🍎'}
                  {activity.type === 'fruit' && '🍍'}
                  {activity.type === 'report' && '📝'}
                  {activity.type === 'system' && '⚙️'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <span>🖥️</span> System Health
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">API Status</span>
              <span className={`${getHealthStatusColor(systemHealth.api)} flex items-center gap-1`}>
                <span>{getHealthStatusIcon(systemHealth.api)}</span> {systemHealth.api}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <span className={`${getHealthStatusColor(systemHealth.database)} flex items-center gap-1`}>
                <span>{getHealthStatusIcon(systemHealth.database)}</span> {systemHealth.database}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">ML Service</span>
              <span className={`${getHealthStatusColor(systemHealth.mlService)} flex items-center gap-1`}>
                <span>{getHealthStatusIcon(systemHealth.mlService)}</span> {systemHealth.mlService}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Storage</span>
              <span className={`${getHealthStatusColor(systemHealth.storage)} flex items-center gap-1`}>
                <span>{getHealthStatusIcon(systemHealth.storage)}</span> {systemHealth.storage} ({stats.storageUsed})
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Calls Today</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.apiCallsToday.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <span>⚡</span> Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-sm font-medium">Add User</div>
          </button>
          <button className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div className="text-2xl mb-1">🍎</div>
            <div className="text-sm font-medium">Add Fruit</div>
          </button>
          <button className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-sm font-medium">Export Report</div>
          </button>
          <button className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-sm font-medium">Retrain Model</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;