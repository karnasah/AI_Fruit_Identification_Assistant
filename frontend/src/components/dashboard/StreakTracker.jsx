import React from 'react';
import { motion } from 'framer-motion';

const StreakTracker = ({ streak = 0, lastActive = null }) => {
  // Calculate streak level
  const getStreakLevel = () => {
    if (streak >= 100) return { label: 'Legendary', color: 'from-purple-500 to-pink-500', icon: '🏆' };
    if (streak >= 50) return { label: 'Master', color: 'from-blue-500 to-purple-500', icon: '⭐' };
    if (streak >= 30) return { label: 'Dedicated', color: 'from-green-500 to-teal-500', icon: '🔥' };
    if (streak >= 14) return { label: 'Consistent', color: 'from-yellow-500 to-orange-500', icon: '📅' };
    if (streak >= 7) return { label: 'Active', color: 'from-primary-500 to-secondary-500', icon: '🌱' };
    if (streak >= 3) return { label: 'Getting Started', color: 'from-gray-500 to-gray-600', icon: '🚀' };
    return { label: 'Beginner', color: 'from-gray-400 to-gray-500', icon: '🌱' };
  };

  const streakLevel = getStreakLevel();

  // Generate last 7 days for calendar view
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isActive: i === 0 ? streak > 0 : Math.random() > 0.5, // Replace with actual activity data
      });
    }
    return days;
  };

  const weekDays = getLast7Days();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
      {/* Streak Header */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${streakLevel.color} mb-3`}>
          <span className="text-3xl">{streakLevel.icon}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {streak} Day Streak
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {streakLevel.label} Level
        </p>
      </div>

      {/* Streak Message */}
      <div className="text-center mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {streak === 0 && "Start identifying fruits today to begin your streak! 🎯"}
          {streak === 1 && "Great start! Keep it going tomorrow! 💪"}
          {streak >= 2 && streak < 7 && `Excellent! You've identified fruits for ${streak} days in a row! 🔥`}
          {streak >= 7 && streak < 30 && `Amazing! ${streak} day streak! You're on fire! 🔥🔥`}
          {streak >= 30 && `Incredible! ${streak} day streak! You're a fruit expert! 👑`}
        </p>
      </div>

      {/* Calendar View */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Last 7 days</p>
        <div className="flex justify-between gap-1">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center flex-1">
              <div
                className={`
                  w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm
                  ${day.isActive 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }
                `}
              >
                {day.isActive ? '✓' : '○'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {day.dayName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone */}
      {streak < 100 && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Next Milestone</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {streak < 7 ? `${7 - streak} days to 7-day streak` : 
               streak < 30 ? `${30 - streak} days to 30-day streak` :
               streak < 100 ? `${100 - streak} days to 100-day streak` : 'Max reached!'}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${streak < 7 ? (streak / 7) * 100 : streak < 30 ? (streak / 30) * 100 : (streak / 100) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakTracker;