import React from 'react';
import { motion } from 'framer-motion';

const TopPredictions = ({ predictions }) => {
  if (!predictions || predictions.length === 0) return null;

  // Default predictions if none provided
  const defaultPredictions = [
    { name: 'Apple', confidence: 92, emoji: '🍎' },
    { name: 'Pear', confidence: 5, emoji: '🍐' },
    { name: 'Quince', confidence: 3, emoji: '🍏' },
  ];

  const predictionData = predictions.length > 0 ? predictions : defaultPredictions;

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-gray-500';
  };

  // Get bar color based on confidence
  const getBarColor = (confidence) => {
    if (confidence >= 70) return 'bg-green-500';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <span>🎯</span> Top Predictions
      </h3>

      <div className="space-y-3">
        {predictionData.map((pred, index) => (
          <motion.div
            key={pred.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-1"
          >
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">{pred.emoji || '🍎'}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {pred.name}
                </span>
              </div>
              <span className={`font-semibold ${getConfidenceColor(pred.confidence)}`}>
                {pred.confidence}%
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pred.confidence}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`absolute inset-y-0 left-0 ${getBarColor(pred.confidence)} rounded-full`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Note */}
      <div className="mt-3 pt-2 text-xs text-gray-400 flex items-center gap-1">
        <span>💡</span>
        <span>Based on AI model analysis. Higher confidence means more accurate match.</span>
      </div>
    </motion.div>
  );
};

export default TopPredictions;