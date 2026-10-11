import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminPage = () => {
  const { user } = useAuth();
  const { showToast } = useStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIdentifications: 0,
    totalFruits: 0,
    activeUsers: 0,
    successRate: 0,
    modelAccuracy: 0,
  });
  
  const [users, setUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      window.location.href = '/';
      showToast('Access denied. Admin privileges required.', 'error');
    }
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
      });
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joined: '2025-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'farmer', status: 'active', joined: '2025-01-20' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'vendor', status: 'inactive', joined: '2025-02-01' },
      ]);
      setRecentActivities([
        { id: 1, user: 'John Doe', action: 'Identified Apple', timestamp: '2 minutes ago' },
        { id: 2, user: 'Jane Smith', action: 'Registered new account', timestamp: '15 minutes ago' },
        { id: 3, user: 'Mike Johnson', action: 'Identified Mango', timestamp: '1 hour ago' },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'models', label: 'ML Models', icon: '🧠' },
    { id: 'fruits', label: 'Fruit DB', icon: '🍎' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Loading admin dashboard..." />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8">
        <div className="container-custom max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage users, monitor system performance, and control ML models
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Total Users</span>
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</div>
                  <div className="text-sm text-green-500 mt-1">↑ 12% this month</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Identifications</span>
                    <span className="text-2xl">🍎</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalIdentifications.toLocaleString()}</div>
                  <div className="text-sm text-green-500 mt-1">↑ 8% this month</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Success Rate</span>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{stats.successRate}%</div>
                  <div className="text-sm text-gray-500 mt-1">↑ 2.3% from last month</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Model Accuracy</span>
                    <span className="text-2xl">🧠</span>
                  </div>
                  <div className="text-3xl font-bold text-primary-600">{stats.modelAccuracy}%</div>
                  <div className="text-sm text-gray-500 mt-1">↑ 0.5% from last week</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.user}</p>
                          <p className="text-xs text-gray-500">{activity.action}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">System Health</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>API Status</span>
                        <span className="text-green-500">● Operational</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Database</span>
                        <span className="text-green-500">● Connected</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ML Service</span>
                        <span className="text-green-500">● Running</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Usage</span>
                        <span>45% used</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-red-100 text-red-700' :
                            user.role === 'farmer' ? 'bg-green-100 text-green-700' :
                            user.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.joined}</td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-primary-600 hover:text-primary-700 mr-2">Edit</button>
                          <button className="text-red-600 hover:text-red-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ML Models Tab */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Active Model</h3>
                  <Button size="sm">Upload New Model</Button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Fruit Classifier v2.3</p>
                      <p className="text-sm text-gray-500">Accuracy: 96.2% | Size: 45MB</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Model Performance</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Precision</span>
                      <span>95.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '95.8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recall</span>
                      <span>94.3%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '94.3%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>F1 Score</span>
                      <span>95.0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {(activeTab === 'fruits' || activeTab === 'analytics' || activeTab === 'system') && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-8 text-center">
              <div className="text-5xl mb-3">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                This section is under development.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AdminPage;