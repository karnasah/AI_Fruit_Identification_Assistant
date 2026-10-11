import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getFruitEmoji } from '../../utils/helpers';

const FruitGrid = ({ fruits, viewMode = 'grid', onFruitClick }) => {
  const [hoveredFruit, setHoveredFruit] = useState(null);

  if (fruits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">🍎</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No fruits found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {fruits.map((fruit, index) => (
          <motion.div
            key={fruit.id || fruit.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredFruit(fruit.id || fruit.name)}
            onMouseLeave={() => setHoveredFruit(null)}
            onClick={() => onFruitClick && onFruitClick(fruit)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="p-4 text-center">
              <div className="text-5xl mb-3">
                {fruit.emoji || getFruitEmoji(fruit.name)}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {fruit.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fruit.category || 'Fruit'}
              </p>
              {fruit.calories && (
                <div className="mt-2 text-xs text-gray-400">
                  🔥 {fruit.calories} kcal
                </div>
              )}
            </div>
            {hoveredFruit === (fruit.id || fruit.name) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-4 pb-4 text-center"
              >
                <button className="text-primary-500 text-sm font-medium">
                  View Details →
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-2">
      {fruits.map((fruit, index) => (
        <motion.div
          key={fruit.id || fruit.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onFruitClick && onFruitClick(fruit)}
          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-soft cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {fruit.emoji || getFruitEmoji(fruit.name)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {fruit.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fruit.category || 'Fruit'} • {fruit.calories || 'N/A'} kcal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {fruit.season && (
              <span className="text-xs text-gray-400">
                {fruit.season}
              </span>
            )}
            <span className="text-primary-500">→</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FruitGrid;