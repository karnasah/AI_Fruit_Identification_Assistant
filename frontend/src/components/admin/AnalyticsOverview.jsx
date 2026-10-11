import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AnalyticsOverview = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  // User Growth Data
  const userGrowthData = {
    labels: timeRange === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timeRange === 'month'
      ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Users',
        data: timeRange === 'week' 
          ? [12, 19, 15, 17, 14, 22, 18]
          : timeRange === 'month'
          ? Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 10)
          : [45, 52, 48, 55, 62, 58, 65, 70, 68, 72, 75, 80],
        borderColor: '#f57d19',
        backgroundColor: 'rgba(245, 125, 25, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Active Users',
        data: timeRange === 'week'
          ? [8, 15, 12, 14, 11, 18, 15]
          : timeRange === 'month'
          ? Array.from({ length: 30 }, () => Math.floor(Math.random() * 25) + 8)
          : [38, 42, 40, 45, 48, 45, 52, 55, 53, 58, 60, 62],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // Identification Trends Data
  const identificationTrendsData = {
    labels: timeRange === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timeRange === 'month'
      ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Identifications',
        data: timeRange === 'week'
          ? [45, 62, 58, 71, 85, 92, 78]
          : timeRange === 'month'
          ? Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 40)
          : [420, 450, 480, 510, 540, 560, 590, 620, 650, 680, 710, 750],
        backgroundColor: 'rgba(245, 125, 25, 0.5)',
        borderColor: '#f57d19',
        borderWidth: 1,
      },
    ],
  };

  // Fruit Category Distribution
  const categoryDistributionData = {
    labels: ['Citrus', 'Berries', 'Tropical', 'Stone Fruits', 'Pome Fruits', 'Melons', 'Exotic'],
    datasets: [
      {
        data: [25, 20, 18, 15, 12, 5, 5],
        backgroundColor: [
          '#f57d19',
          '#22c55e',
          '#3b82f6',
          '#a855f7',
          '#ef4444',
          '#eab308',
          '#ec4899',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Top Fruits Identified
  const topFruitsData = {
    labels: ['Apple', 'Banana', 'Mango', 'Orange', 'Strawberry', 'Grapes', 'Watermelon'],
    datasets: [
      {
        label: 'Identifications',
        data: [3420, 2850, 2450, 2100, 1850, 1560, 1230],
        backgroundColor: '#f57d19',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#111827',
        bodyColor: isDark ? '#9ca3af' : '#6b7280',
        borderColor: '#f57d19',
        borderWidth: 1,
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor } },
      y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: textColor, font: { size: 10 } } },
    },
  };

  const barOptions = {
    ...chartOptions,
    plugins: { ...chartOptions.plugins, legend: { display: false } },
  };

  const statsCards = [
    { title: 'Total Users', value: '1,542', change: '+12%', icon: '👥', color: 'primary' },
    { title: 'Total Identifications', value: '28,456', change: '+8%', icon: '🍎', color: 'secondary' },
    { title: 'Success Rate', value: '94.8%', change: '+2.3%', icon: '🎯', color: 'success' },
    { title: 'Avg Response Time', value: '1.8s', change: '-0.3s', icon: '⚡', color: 'info' },
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        {['week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg capitalize transition-all ${
              timeRange === range
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className={`text-xs mt-1 ${card.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {card.change} from last {timeRange}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl">
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
          <div className="h-64">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>

        {/* Identification Trends Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Identification Trends</h3>
          <div className="h-64">
            <Bar data={identificationTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Fruit Category Distribution</h3>
          <div className="h-64">
            <Doughnut data={categoryDistributionData} options={doughnutOptions} />
          </div>
        </div>

        {/* Top Fruits Identified */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Fruits Identified</h3>
          <div className="h-64">
            <Bar data={topFruitsData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">4.2 min</div>
            <div className="text-xs text-gray-500">Avg Session Duration</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">3.4</div>
            <div className="text-xs text-gray-500">Sessions per User</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl mb-1">📱</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">65%</div>
            <div className="text-xs text-gray-500">Mobile Users</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">4.9</div>
            <div className="text-xs text-gray-500">Avg Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;