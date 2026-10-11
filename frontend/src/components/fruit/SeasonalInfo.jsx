import React from 'react';
import { motion } from 'framer-motion';

const SeasonalInfo = ({ seasonalData, fruitName, className = '' }) => {
  const currentMonth = new Date().getMonth(); // 0-11

  const defaultSeasonalData = seasonalData || {
    seasons: ['Summer', 'Fall'],
    peakMonths: [7, 8, 9], // August, September, October (0-indexed)
    availability: 'Widely available',
    plantingSeason: 'Spring',
    harvestSeason: 'Late Summer to Early Fall',
    growingTips: 'Thrives in warm climates with well-drained soil',
    countries: ['USA', 'Mexico', 'Spain', 'Italy', 'China'],
    nutritionalPeak: 'Harvest season offers highest vitamin content',
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const isPeakMonth = (month) => {
    return defaultSeasonalData.peakMonths?.includes(month + 1);
  };

  const getSeasonName = (month) => {
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  const getSeasonColor = (season) => {
    switch(season) {
      case 'Spring': return 'bg-green-500';
      case 'Summer': return 'bg-yellow-500';
      case 'Fall': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  const SeasonBadge = ({ season }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getSeasonColor(season)}`}>
      {season}
    </span>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>📅</span> Seasonal Information - {fruitName || 'Fruit'}
        </h3>
      </div>

      {/* Current Season Status */}
      <div className="p-5 text-center border-b border-gray-100 dark:border-gray-700">
        <div className="inline-block mb-3">
          <div className={`w-16 h-16 rounded-full ${getSeasonColor(getSeasonName(currentMonth))} flex items-center justify-center text-2xl mx-auto`}>
            {getSeasonName(currentMonth) === 'Spring' && '🌸'}
            {getSeasonName(currentMonth) === 'Summer' && '☀️'}
            {getSeasonName(currentMonth) === 'Fall' && '🍂'}
            {getSeasonName(currentMonth) === 'Winter' && '❄️'}
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {isPeakMonth(currentMonth) ? '🎉 In Season Now!' : '📅 Coming Soon'}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {isPeakMonth(currentMonth) 
            ? `Best time to enjoy ${fruitName || 'this fruit'} is right now!` 
            : `${fruitName || 'This fruit'} is typically in season during ${defaultSeasonalData.seasons?.join(' & ')}`}
        </p>
      </div>

      {/* Peak Months Calendar */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Peak Season Calendar</h4>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
          {monthNames.map((month, idx) => (
            <div key={month} className="text-center">
              <div className={`text-xs font-medium mb-1 ${isPeakMonth(idx) ? 'text-primary-600' : 'text-gray-400'}`}>
                {month}
              </div>
              <div className={`w-full h-8 rounded ${isPeakMonth(idx) ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Peak Season</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Off Season</span>
          </div>
        </div>
      </div>

      {/* Seasonal Details */}
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Seasons</span>
          <div className="flex gap-2">
            {defaultSeasonalData.seasons?.map((season) => (
              <SeasonBadge key={season} season={season} />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Planting Season</span>
          <span className="font-medium text-gray-900 dark:text-white">{defaultSeasonalData.plantingSeason}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Harvest Season</span>
          <span className="font-medium text-gray-900 dark:text-white">{defaultSeasonalData.harvestSeason}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
          <span className="font-medium text-gray-900 dark:text-white">{defaultSeasonalData.availability}</span>
        </div>
        
        <div className="py-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Growing Tips:</span> {defaultSeasonalData.growingTips}
          </p>
        </div>
        
        <div className="py-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Nutritional Note:</span> {defaultSeasonalData.nutritionalPeak}
          </p>
        </div>
      </div>

      {/* Top Producing Countries */}
      <div className="p-5 bg-gray-50 dark:bg-gray-700/50">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Top Producing Countries</h4>
        <div className="flex flex-wrap gap-2">
          {defaultSeasonalData.countries?.map((country) => (
            <span key={country} className="px-3 py-1 bg-white dark:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-200">
              {country}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Seasonal Status Badge
export const SeasonalStatusBadge = ({ isInSeason }) => (
  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isInSeason ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
    <span>{isInSeason ? '🌿' : '⏳'}</span>
    <span>{isInSeason ? 'In Season' : 'Out of Season'}</span>
  </div>
);

export default SeasonalInfo;