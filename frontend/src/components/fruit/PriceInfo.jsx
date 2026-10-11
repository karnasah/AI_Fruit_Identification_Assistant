import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

const PriceInfo = ({ priceData, fruitName, className = '' }) => {
  const [selectedRegion, setSelectedRegion] = useState('us');
  const [showAllMarkets, setShowAllMarkets] = useState(false);

  const defaultPriceData = priceData || {
    currentPrice: 2.99,
    unit: 'kg',
    currency: 'USD',
    priceRange: {
      min: 1.99,
      max: 4.99,
    },
    seasonal: {
      winter: 3.99,
      spring: 2.99,
      summer: 1.99,
      fall: 2.49,
    },
    byRegion: {
      us: { name: 'United States', price: 2.99, trend: 'stable' },
      eu: { name: 'Europe', price: 3.49, trend: 'up' },
      asia: { name: 'Asia', price: 1.99, trend: 'down' },
      india: { name: 'India', price: 1.49, trend: 'stable' },
    },
    nearbyStores: [
      { name: 'FreshMart', distance: '0.5 km', price: 2.79, rating: 4.5 },
      { name: 'Green Grocers', distance: '1.2 km', price: 2.99, rating: 4.2 },
      { name: 'Organic Valley', distance: '2.0 km', price: 3.49, rating: 4.8 },
      { name: 'Local Farmers Market', distance: '3.5 km', price: 2.49, rating: 4.6 },
    ],
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-red-500';
    if (trend === 'down') return 'text-green-500';
    return 'text-gray-500';
  };

  const formatPrice = (price) => {
    return formatCurrency(price, defaultPriceData.currency);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>💰</span> Price Information - {fruitName || 'Fruit'}
        </h3>
      </div>

      {/* Current Price */}
      <div className="p-5 text-center border-b border-gray-100 dark:border-gray-700">
        <div className="inline-block">
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(defaultPriceData.currentPrice)}
          </div>
          <div className="text-sm text-gray-500">per {defaultPriceData.unit}</div>
        </div>
        <div className="flex justify-center gap-4 mt-3">
          <div className="text-center">
            <div className="text-sm text-gray-500">Average Range</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatPrice(defaultPriceData.priceRange.min)} - {formatPrice(defaultPriceData.priceRange.max)}
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Price Chart */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Seasonal Price Trends</h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(defaultPriceData.seasonal).map(([season, price]) => (
            <div key={season} className="text-center">
              <div className="text-lg mb-1">
                {season === 'winter' && '❄️'}
                {season === 'spring' && '🌸'}
                {season === 'summer' && '☀️'}
                {season === 'fall' && '🍂'}
              </div>
              <div className="text-xs text-gray-500 capitalize">{season}</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatPrice(price)}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">
          💡 Best time to buy: Summer (lowest price)
        </p>
      </div>

      {/* Price by Region */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Price by Region</h4>
        <div className="space-y-2">
          {Object.entries(defaultPriceData.byRegion).map(([key, region]) => (
            <div key={key} className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {region.name}
                </span>
                <span className={`text-sm ${getTrendColor(region.trend)}`}>
                  {getTrendIcon(region.trend)}
                </span>
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatPrice(region.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Stores */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Nearby Stores</h4>
          <button
            onClick={() => setShowAllMarkets(!showAllMarkets)}
            className="text-xs text-primary-500 hover:text-primary-600"
          >
            {showAllMarkets ? 'Show Less' : 'View All'}
          </button>
        </div>
        <div className="space-y-3">
          {(showAllMarkets ? defaultPriceData.nearbyStores : defaultPriceData.nearbyStores.slice(0, 3)).map((store, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{store.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">📍 {store.distance}</span>
                  <span className="text-xs text-yellow-500">⭐ {store.rating}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary-600">{formatPrice(store.price)}</div>
                <button className="text-xs text-primary-500 hover:text-primary-600 mt-1">
                  Get Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Price Trend Indicator
export const PriceTrend = ({ currentPrice, previousPrice }) => {
  const change = ((currentPrice - previousPrice) / previousPrice) * 100;
  const isPositive = change > 0;
  
  return (
    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-red-500' : 'text-green-500'}`}>
      <span>{isPositive ? '📈' : '📉'}</span>
      <span>{Math.abs(change).toFixed(1)}%</span>
      <span className="text-xs text-gray-400">vs last month</span>
    </div>
  );
};

export default PriceInfo;