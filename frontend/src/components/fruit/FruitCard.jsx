import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getFruitEmoji, formatNumber } from '../../utils/helpers';
import Button from '../common/Button';

const FruitCard = ({ fruit, onClick, onAddToFavorites, isFavorite, size = 'md' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const titleClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const emojiClasses = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onAddToFavorites) {
      onAddToFavorites(fruit);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden cursor-pointer
        transition-all duration-300 hover:shadow-lg
        ${sizeClasses[size]}
      `}
      onClick={() => onClick && onClick(fruit)}
    >
      {/* Image/Emoji Section */}
      <div className="relative">
        {fruit.imageUrl && !imageError ? (
          <img
            src={fruit.imageUrl}
            alt={fruit.name}
            className="w-full h-32 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-32 ${emojiClasses[size]} flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg`}>
            {fruit.emoji || getFruitEmoji(fruit.name)}
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors hover:bg-white"
        >
          <span className={isFavorite ? 'text-red-500' : 'text-gray-400'}>
            {isFavorite ? '❤️' : '🤍'}
          </span>
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-semibold text-gray-900 dark:text-white ${titleClasses[size]}`}>
            {fruit.name}
          </h3>
          {fruit.confidence && (
            <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              {Math.round(fruit.confidence)}%
            </span>
          )}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {fruit.category || 'Fresh Fruit'}
        </p>
        
        {fruit.calories && (
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>🔥 {fruit.calories} kcal</span>
            {fruit.season && <span>• {fruit.season}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Horizontal Fruit Card (for lists)
export const HorizontalFruitCard = ({ fruit, onClick, onAddToFavorites, isFavorite }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-all"
      onClick={() => onClick && onClick(fruit)}
    >
      {/* Image/Emoji */}
      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center text-3xl flex-shrink-0">
        {fruit.emoji || getFruitEmoji(fruit.name)}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {fruit.name}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToFavorites && onAddToFavorites(fruit);
            }}
            className="flex-shrink-0"
          >
            <span className={isFavorite ? 'text-red-500' : 'text-gray-400'}>
              {isFavorite ? '❤️' : '🤍'}
            </span>
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {fruit.category || 'Fresh Fruit'}
        </p>
        {fruit.calories && (
          <p className="text-xs text-gray-400 mt-1">
            🔥 {fruit.calories} kcal • {fruit.season || 'All season'}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default FruitCard;