import React from 'react';
import { motion } from 'framer-motion';

const ActivityGraph = ({ data }) => {
  // Default activity data if none provided
  const activityData = data || [
    { hour: '6 AM', count: 2 },
    { hour: '8 AM', count: 5 },
    { hour: '10 AM', count: 12 },
    { hour: '12 PM', count: 18 },
    { hour: '2 PM', count: 15 },
    { hour: '4 PM', count: 22 },
    { hour: '6 PM', count: 28 },
    { hour: '8 PM', count: 20 },
    { hour: '10 PM', count: 8 },
  ];

  const maxCount = activityData.length > 0 
    ? Math.max(...activityData.map(item => item?.count || 0), 1)
    : 1;

  // Get color based on count percentage
  const getBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-orange-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Find the most active hour safely
  const getMostActiveHour = () => {
    if (!activityData || activityData.length === 0) return 'N/A';
    try {
      const maxItem = activityData.reduce((max, item) => (item?.count || 0) > (max?.count || 0) ? item : max, activityData[0]);
      return maxItem?.hour || 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>⏰</span> Activity by Time of Day
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Peak hours shown in red
        </span>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3">
        {activityData.map((item, index) => {
          const percentage = ((item?.count || 0) / maxCount) * 100;
          const barColor = getBarColor(percentage);
          
          return (
            <motion.div
              key={item?.hour || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-16 text-xs text-gray-500 dark:text-gray-400">
                {item?.hour || 'Unknown'}
              </div>
              <div className="flex-1">
                <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`absolute inset-y-0 left-0 ${barColor} rounded-lg flex items-center justify-end pr-2`}
                  >
                    <span className="text-xs text-white font-medium">
                      {item?.count || 0}
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Most Active Time</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {getMostActiveHour()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Peak Activity</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {maxCount} identifications
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Daily Average</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {activityData.length > 0 
                ? Math.round(activityData.reduce((sum, item) => sum + (item?.count || 0), 0) / activityData.length)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Insight Note */}
      <div className="mt-3 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <p className="text-xs text-primary-700 dark:text-primary-300 text-center">
          💡 {maxCount > 20 
            ? "Great activity! You're most active in the evening hours." 
            : "Identify more fruits to see your activity patterns!"}
        </p>
      </div>
    </div>
  );
};

export default ActivityGraph;