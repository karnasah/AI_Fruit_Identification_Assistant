import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FruitFilters = ({ 
  title = "Filters", 
  options = [], 
  selected = "all", 
  onChange, 
  icon = "🏷️",
  collapsible = true 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Default options if none provided
  const defaultOptions = [
    { id: 'all', name: 'All Fruits', icon: '🍎' },
    { id: 'citrus', name: 'Citrus', icon: '🍊' },
    { id: 'berries', name: 'Berries', icon: '🫐' },
    { id: 'tropical', name: 'Tropical', icon: '🥭' },
    { id: 'stone_fruits', name: 'Stone Fruits', icon: '🍑' },
    { id: 'melons', name: 'Melons', icon: '🍈' },
  ];

  const filterOptions = options.length > 0 ? options : defaultOptions;

  const toggleOpen = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
      {/* Header */}
      <button
        onClick={toggleOpen}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {collapsible && (
          <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        )}
      </button>

      {/* Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onChange && onChange(option.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                    ${selected === option.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="flex-1 text-left">{option.name}</span>
                  {selected === option.id && (
                    <span className="text-primary-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Season Filter Component
export const SeasonFilter = ({ selected, onChange }) => {
  const seasons = [
    { id: 'all', name: 'All Seasons', icon: '📅' },
    { id: 'spring', name: 'Spring', icon: '🌸' },
    { id: 'summer', name: 'Summer', icon: '☀️' },
    { id: 'autumn', name: 'Autumn', icon: '🍂' },
    { id: 'winter', name: 'Winter', icon: '❄️' },
  ];

  return (
    <FruitFilters
      title="Season"
      options={seasons}
      selected={selected}
      onChange={onChange}
      icon="🌱"
    />
  );
};

// Nutrition Filter Component
export const NutritionFilter = ({ selected, onChange }) => {
  const nutritionOptions = [
    { id: 'all', name: 'All', icon: '📊' },
    { id: 'low_calorie', name: 'Low Calorie', icon: '🔥' },
    { id: 'high_fiber', name: 'High Fiber', icon: '🌾' },
    { id: 'high_vitamin_c', name: 'High Vitamin C', icon: '🍊' },
    { id: 'high_antioxidant', name: 'High Antioxidant', icon: '💪' },
  ];

  return (
    <FruitFilters
      title="Nutrition"
      options={nutritionOptions}
      selected={selected}
      onChange={onChange}
      icon="🥗"
    />
  );
};

export default FruitFilters;