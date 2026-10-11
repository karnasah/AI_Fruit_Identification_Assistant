import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getFruitEmoji, formatNumber } from '../../utils/helpers';
import Button from '../common/Button';

const FruitDetails = ({ fruit, onClose, onAddToFavorites, isFavorite }) => {
  const [activeTab, setActiveTab] = useState('nutrition');

  if (!fruit) return null;

  const tabs = [
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { id: 'benefits', label: 'Benefits', icon: '💪' },
    { id: 'seasonal', label: 'Seasonal', icon: '📅' },
    { id: 'storage', label: 'Storage', icon: '📦' },
  ];

  const nutritionInfo = fruit.nutrition || {
    calories: 52,
    carbs: '14g',
    protein: '0.3g',
    fat: '0.2g',
    fiber: '2.4g',
    vitaminC: '4.6mg',
  };

  const benefits = fruit.benefits || [
    'Rich in antioxidants',
    'Supports heart health',
    'Boosts immune system',
    'Good for digestion',
  ];

  const seasonalInfo = fruit.seasonal || {
    seasons: ['Summer', 'Fall'],
    peakMonths: ['August', 'September', 'October'],
    availability: 'Widely available',
  };

  const storageInfo = fruit.storage || {
    temperature: 'Room temperature',
    shelfLife: '1-2 weeks',
    tips: 'Store in cool, dry place away from direct sunlight',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-2xl w-full mx-4"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          ✕
        </button>
        <div className="flex items-center gap-4">
          <div className="text-6xl">{fruit.emoji || getFruitEmoji(fruit.name)}</div>
          <div>
            <h2 className="text-2xl font-bold">{fruit.name}</h2>
            <p className="text-white/80 text-sm">{fruit.scientificName || 'Fruit'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Nutritional Information (per 100g)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nutritionInfo.calories} kcal
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Carbohydrates</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nutritionInfo.carbs}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nutritionInfo.protein}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nutritionInfo.fat}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Fiber</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nutritionInfo.fiber}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Vitamin C</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {nutritionInfo.vitaminC}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Health Benefits
            </h3>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Seasonal Tab */}
        {activeTab === 'seasonal' && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Seasonal Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Seasons</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {seasonalInfo.seasons?.join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Peak Months</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {seasonalInfo.peakMonths?.join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Availability</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {seasonalInfo.availability}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Storage Tips
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Temperature</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {storageInfo.temperature}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Shelf Life</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {storageInfo.shelfLife}
                </span>
              </div>
              <div className="py-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {storageInfo.tips}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
        <Button
          variant={isFavorite ? 'secondary' : 'outline'}
          onClick={() => onAddToFavorites && onAddToFavorites(fruit)}
          className="flex-1"
        >
          {isFavorite ? '❤️ Saved' : '🤍 Save to Favorites'}
        </Button>
        <Button
          variant="primary"
          onClick={() => window.location.href = `/identify?fruit=${fruit.name}`}
          className="flex-1"
        >
          Identify This Fruit
        </Button>
      </div>
    </motion.div>
  );
};

export default FruitDetails;