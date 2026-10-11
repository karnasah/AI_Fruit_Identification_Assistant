import React from 'react';
import { motion } from 'framer-motion';

const NutritionalInfo = ({ nutrition, fruitName, className = '' }) => {
  if (!nutrition) return null;

  // Default nutrition data if not provided
  const nutritionData = nutrition || {
    calories: 52,
    caloriesFromFat: 2,
    totalFat: '0.2g',
    saturatedFat: '0g',
    cholesterol: '0mg',
    sodium: '1mg',
    totalCarbohydrates: '14g',
    dietaryFiber: '2.4g',
    sugars: '10g',
    protein: '0.3g',
    vitaminA: '2%',
    vitaminC: '7%',
    calcium: '1%',
    iron: '1%',
    potassium: '107mg',
  };

  const NutrientRow = ({ label, value, color = 'primary' }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`font-medium text-${color}-600 dark:text-${color}-400`}>{value}</span>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🥗</span> Nutritional Information
          <span className="text-xs opacity-80 ml-2">per 100g</span>
        </h3>
      </div>

      {/* Main Stats - Calories */}
      <div className="p-5 text-center border-b border-gray-100 dark:border-gray-700">
        <div className="inline-block">
          <div className="text-5xl font-bold text-primary-600 dark:text-primary-400">
            {nutritionData.calories}
          </div>
          <div className="text-sm text-gray-500">calories</div>
        </div>
        <div className="flex justify-center gap-4 mt-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{nutritionData.totalFat}</div>
            <div className="text-xs text-gray-500">Total Fat</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{nutritionData.protein}</div>
            <div className="text-xs text-gray-500">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{nutritionData.totalCarbohydrates}</div>
            <div className="text-xs text-gray-500">Carbs</div>
          </div>
        </div>
      </div>

      {/* Detailed Nutrients */}
      <div className="p-5">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Detailed Nutrients</h4>
        <div className="space-y-1">
          <NutrientRow label="Calories from Fat" value={nutritionData.caloriesFromFat} />
          <NutrientRow label="Saturated Fat" value={nutritionData.saturatedFat} />
          <NutrientRow label="Cholesterol" value={nutritionData.cholesterol} />
          <NutrientRow label="Sodium" value={nutritionData.sodium} />
          <NutrientRow label="Dietary Fiber" value={nutritionData.dietaryFiber} />
          <NutrientRow label="Sugars" value={nutritionData.sugars} />
        </div>
      </div>

      {/* Vitamins & Minerals */}
      <div className="p-5 bg-gray-50 dark:bg-gray-700/50">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Vitamins & Minerals</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Vitamin A</span>
            <span className="font-medium text-green-600">{nutritionData.vitaminA}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Vitamin C</span>
            <span className="font-medium text-green-600">{nutritionData.vitaminC}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Calcium</span>
            <span className="font-medium text-green-600">{nutritionData.calcium}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Iron</span>
            <span className="font-medium text-green-600">{nutritionData.iron}</span>
          </div>
          <div className="flex justify-between items-center col-span-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Potassium</span>
            <span className="font-medium text-green-600">{nutritionData.potassium}</span>
          </div>
        </div>
      </div>

      {/* Daily Value Note */}
      <div className="p-4 text-center border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400">
          * Percent Daily Values are based on a 2,000 calorie diet.
        </p>
      </div>
    </div>
  );
};

// Compact Nutritional Info (for cards)
export const CompactNutritionalInfo = ({ nutrition }) => {
  if (!nutrition) return null;
  
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1">
        <span>🔥</span>
        <span className="text-gray-700 dark:text-gray-300">{nutrition.calories} kcal</span>
      </div>
      <div className="flex items-center gap-1">
        <span>🍚</span>
        <span className="text-gray-700 dark:text-gray-300">{nutrition.totalCarbohydrates}</span>
      </div>
      <div className="flex items-center gap-1">
        <span>💪</span>
        <span className="text-gray-700 dark:text-gray-300">{nutrition.protein}</span>
      </div>
    </div>
  );
};

// Nutritional Score Badge
export const NutritionalScoreBadge = ({ score }) => {
  const getScoreInfo = (score) => {
    if (score >= 80) return { label: 'A+', color: 'green', text: 'Excellent' };
    if (score >= 60) return { label: 'B', color: 'blue', text: 'Good' };
    if (score >= 40) return { label: 'C', color: 'yellow', text: 'Average' };
    return { label: 'D', color: 'red', text: 'Poor' };
  };

  const info = getScoreInfo(score);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${info.color}-100 dark:bg-${info.color}-900/30 rounded-full`}>
      <span className={`text-sm font-bold text-${info.color}-600`}>{info.label}</span>
      <span className={`text-xs text-${info.color}-600`}>{info.text}</span>
    </div>
  );
};

export default NutritionalInfo;