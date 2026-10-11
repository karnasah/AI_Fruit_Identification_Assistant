import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getFruitEmoji, formatPercentage, formatDate } from '../../utils/helpers';
import Button from '../common/Button';
import VoiceOutput, { getIdentificationSpeechText } from '../voice/VoiceOutput';

const IdentificationResult = ({ result, onSave, onShare, onViewDetails }) => {
  const [isSaved, setIsSaved] = useState(false);

  if (!result) return null;

  const speechText = getIdentificationSpeechText(result.fruitName, result.confidence);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const handleSave = () => {
    setIsSaved(true);
    if (onSave) onSave(result);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleShare = () => {
    if (onShare) onShare(result);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            <h3 className="font-semibold">Identification Result</h3>
          </div>
          <VoiceOutput 
            text={speechText}
            autoSpeak={true}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Fruit Name & Confidence */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">
            {result.emoji || getFruitEmoji(result.fruitName)}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {result.fruitName}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence * 100)}`}>
              {formatPercentage(result.confidence)} confidence
            </span>
            {result.ripeness && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                {result.ripeness}
              </span>
            )}
          </div>
        </div>

        {/* Nutritional Info Preview */}
        {result.nutritionalInfo && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
              Quick Nutrition
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Calories</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.nutritionalInfo.calories} kcal
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Carbs</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.nutritionalInfo.carbs}g
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fiber</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {result.nutritionalInfo.fiber}g
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Timestamp */}
        {result.timestamp && (
          <p className="text-xs text-gray-400 text-center mb-4">
            Identified on {formatDate(result.timestamp, 'date')}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isSaved ? 'success' : 'outline'}
            onClick={handleSave}
            className="flex-1"
            disabled={isSaved}
          >
            {isSaved ? '✓ Saved!' : '💾 Save to History'}
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1"
          >
            📤 Share
          </Button>
          <Button
            variant="primary"
            onClick={() => onViewDetails && onViewDetails(result)}
            className="flex-1"
          >
            📖 Full Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default IdentificationResult;