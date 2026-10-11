import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFruitEmoji } from '../../utils/helpers';

const MostIdentified = ({ fruits, fullSize = false }) => {
  const navigate = useNavigate();
  const fruitData = fruits || [];

  // Find max count for percentage calculation
  const maxCount = Math.max(...fruitData.map(f => f.count), 1);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5 ${fullSize ? '' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🏆</span> Most Identified Fruits
        </h3>
        {fullSize && (
          <button
            type="button"
            onClick={() => navigate('/dashboard?tab=history')}
            className="text-xs text-primary-500 hover:text-primary-600"
          >
            View All →
          </button>
        )}
      </div>

      <div className="space-y-4">
        {fruitData.map((fruit, index) => (
          <motion.div
            key={fruit.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-2xl">{getFruitEmoji(fruit.name)}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {fruit.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {fruit.count}
              </span>
            </div>
            <div className="relative">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(fruit.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!fullSize && fruitData.length >= 3 && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total identified:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {fruitData.reduce((sum, f) => sum + f.count, 0)} fruits
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MostIdentified;