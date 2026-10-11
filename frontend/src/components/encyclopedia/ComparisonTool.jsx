import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFruitEmoji } from '../../utils/helpers';
import Button from '../common/Button';

const ComparisonTool = ({ fruits, onCompare, isLoading }) => {
  const [selectedFruits, setSelectedFruits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleSelectFruit = (fruit) => {
    if (selectedFruits.find(f => f.id === fruit.id)) {
      setSelectedFruits(selectedFruits.filter(f => f.id !== fruit.id));
    } else if (selectedFruits.length < 2) {
      setSelectedFruits([...selectedFruits, fruit]);
    }
  };

  const handleCompare = async () => {
    if (selectedFruits.length === 2) {
      const result = await onCompare(selectedFruits[0].name, selectedFruits[1].name);
      if (result.success) {
        setComparisonResult(result.data);
      }
    }
  };

  const handleClear = () => {
    setSelectedFruits([]);
    setComparisonResult(null);
    setSearchTerm('');
  };

  const filteredFruits = fruits?.filter(fruit =>
    fruit.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const NutritionBar = ({ label, value1, value2, unit = '' }) => {
    const maxValue = Math.max(value1, value2);
    const width1 = (value1 / maxValue) * 100;
    const width2 = (value2 / maxValue) * 100;

    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
        </div>
        <div className="space-y-1">
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-primary-600">{selectedFruits[0]?.name}</span>
              <span>{value1}{unit}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${width1}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-secondary-600">{selectedFruits[1]?.name}</span>
              <span>{value2}{unit}</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-secondary-500 rounded-full" style={{ width: `${width2}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🔍</span> Compare Fruits
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select two fruits to compare their nutritional values and benefits
        </p>
      </div>

      {/* Fruit Selection */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Selected Fruits Display */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Selected Fruits ({selectedFruits.length}/2)
            </h3>
            <div className="space-y-2">
              {selectedFruits.map((fruit) => (
                <div key={fruit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{fruit.emoji || getFruitEmoji(fruit.name)}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{fruit.name}</span>
                  </div>
                  <button
                    onClick={() => handleSelectFruit(fruit)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {selectedFruits.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No fruits selected. Click on fruits below to add.
                </p>
              )}
            </div>
          </div>

          {/* Fruit Search & List */}
          <div>
            <input
              type="text"
              placeholder="Search fruits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredFruits.slice(0, 10).map((fruit) => (
                <button
                  key={fruit.id}
                  onClick={() => handleSelectFruit(fruit)}
                  disabled={selectedFruits.length >= 2 && !selectedFruits.find(f => f.id === fruit.id)}
                  className={`
                    w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all
                    ${selectedFruits.find(f => f.id === fruit.id)
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                    ${selectedFruits.length >= 2 && !selectedFruits.find(f => f.id === fruit.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                    }
                  `}
                >
                  <span className="text-xl">{fruit.emoji || getFruitEmoji(fruit.name)}</span>
                  <span>{fruit.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5">
          <Button
            onClick={handleCompare}
            disabled={selectedFruits.length !== 2 || isLoading}
            className="flex-1"
          >
            {isLoading ? 'Comparing...' : 'Compare Fruits'}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Comparison Results */}
      <AnimatePresence>
        {comparisonResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-5"
          >
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📊</span> Comparison Results
            </h3>

            {/* Nutrition Comparison */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Nutritional Value</h4>
              <NutritionBar
                label="Calories"
                value1={comparisonResult.fruit1?.nutrition?.calories || 0}
                value2={comparisonResult.fruit2?.nutrition?.calories || 0}
                unit=" kcal"
              />
              <NutritionBar
                label="Fiber"
                value1={comparisonResult.fruit1?.nutrition?.fiber || 0}
                value2={comparisonResult.fruit2?.nutrition?.fiber || 0}
                unit="g"
              />
              <NutritionBar
                label="Vitamin C"
                value1={comparisonResult.fruit1?.nutrition?.vitaminC || 0}
                value2={comparisonResult.fruit2?.nutrition?.vitaminC || 0}
                unit="mg"
              />
            </div>

            {/* Winner Badge */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">🏆 Overall Winner</p>
              <p className="text-lg font-bold text-primary-600">
                {comparisonResult.winner || 'Tie!'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComparisonTool;