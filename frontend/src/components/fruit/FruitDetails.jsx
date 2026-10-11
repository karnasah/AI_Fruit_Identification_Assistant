import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFruitEmoji, formatNumber } from '../../utils/helpers';
import Button from '../common/Button';
import VoiceOutput from '../voice/VoiceOutput';

const FruitDetails = ({ fruit, onClose, onAddToFavorites, isFavorite, onIdentify }) => {
  const [activeTab, setActiveTab] = useState('nutrition');
  const [imageError, setImageError] = useState(false);

  if (!fruit) return null;

  const tabs = [
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { id: 'benefits', label: 'Benefits', icon: '💪' },
    { id: 'seasonal', label: 'Seasonal', icon: '📅' },
    { id: 'storage', label: 'Storage', icon: '📦' },
    { id: 'recipes', label: 'Recipes', icon: '🍳' },
  ];

  const nutritionInfo = fruit.nutrition || {
    calories: 52,
    carbs: '14g',
    protein: '0.3g',
    fat: '0.2g',
    fiber: '2.4g',
    vitaminC: '4.6mg',
    vitaminA: '54IU',
    potassium: '107mg',
    calcium: '6mg',
    iron: '0.1mg',
  };

  const benefits = fruit.benefits || [
    'Rich in antioxidants that protect cells from damage',
    'Supports heart health and reduces cholesterol',
    'Boosts immune system with high vitamin C content',
    'Good for digestion due to high fiber content',
    'May help with weight management',
    'Promotes healthy skin and hair',
  ];

  const seasonalInfo = fruit.seasonal || {
    seasons: ['Summer', 'Fall'],
    peakMonths: ['August', 'September', 'October'],
    availability: 'Widely available',
    storageTip: 'Store in cool, dry place',
  };

  const storageInfo = fruit.storage || {
    temperature: 'Room temperature',
    shelfLife: '1-2 weeks',
    tips: 'Store in cool, dry place away from direct sunlight. Refrigerate after cutting.',
    ripeningTip: 'Leave at room temperature to ripen',
  };

  const recipes = fruit.recipes || [
    { name: 'Fresh Fruit Salad', prepTime: '10 min', difficulty: 'Easy' },
    { name: 'Smoothie Bowl', prepTime: '5 min', difficulty: 'Easy' },
    { name: 'Baked Fruit Dessert', prepTime: '30 min', difficulty: 'Medium' },
  ];

  const NutritionBar = ({ label, value, unit = '', maxValue = null }) => {
    const percentage = maxValue ? (value / maxValue) * 100 : value;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="text-gray-900 dark:text-white font-medium">{value}{unit}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 p-5 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-5xl md:text-6xl">
            {fruit.emoji || getFruitEmoji(fruit.name)}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{fruit.name}</h2>
            <p className="text-white/80 text-sm">{fruit.scientificName || 'Fruit'}</p>
            <VoiceOutput 
              text={`${fruit.name}. ${nutritionInfo.calories} calories per 100 grams.`}
              autoSpeak={false}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-4 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <AnimatePresence mode="wait">
          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Nutritional Information (per 100g)
              </h3>
              
              <NutritionBar label="Calories" value={nutritionInfo.calories} unit=" kcal" maxValue={200} />
              <NutritionBar label="Carbohydrates" value={nutritionInfo.carbs} unit="g" maxValue={30} />
              <NutritionBar label="Protein" value={nutritionInfo.protein} unit="g" maxValue={10} />
              <NutritionBar label="Fat" value={nutritionInfo.fat} unit="g" maxValue={15} />
              <NutritionBar label="Fiber" value={nutritionInfo.fiber} unit="g" maxValue={10} />
              <NutritionBar label="Vitamin C" value={nutritionInfo.vitaminC} unit="mg" maxValue={100} />
              
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Vitamin A</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{nutritionInfo.vitaminA}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Potassium</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{nutritionInfo.potassium}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Calcium</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{nutritionInfo.calcium}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Iron</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{nutritionInfo.iron}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Benefits Tab */}
          {activeTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Health Benefits
              </h3>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Seasonal Tab */}
          {activeTab === 'seasonal' && (
            <motion.div
              key="seasonal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
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
            </motion.div>
          )}

          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <motion.div
              key="storage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
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
                    <span className="font-medium">Storage Tips:</span> {storageInfo.tips}
                  </p>
                </div>
                <div className="py-2">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-medium">Ripening Tip:</span> {storageInfo.ripeningTip}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <motion.div
              key="recipes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Popular Recipes
              </h3>
              <div className="space-y-2">
                {recipes.map((recipe, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{recipe.name}</p>
                      <p className="text-xs text-gray-500">{recipe.prepTime} • {recipe.difficulty}</p>
                    </div>
                    <button className="text-primary-500 text-sm">View →</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
          onClick={() => onIdentify && onIdentify(fruit.name)}
          className="flex-1"
        >
          Identify This Fruit
        </Button>
      </div>
    </motion.div>
  );
};

export default FruitDetails;