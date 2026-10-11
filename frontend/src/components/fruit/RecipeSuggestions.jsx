import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RecipeSuggestions = ({ recipes, fruitName, className = '' }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const defaultRecipes = recipes || [
    {
      id: 1,
      name: `${fruitName || 'Fruit'} Smoothie Bowl`,
      prepTime: '10 mins',
      cookTime: '0 mins',
      difficulty: 'Easy',
      servings: 2,
      calories: 320,
      ingredients: [
        `2 cups fresh ${fruitName || 'fruit'}`,
        '1 banana',
        '1/2 cup yogurt',
        '1/4 cup milk',
        '1 tbsp honey',
        'Granola for topping',
      ],
      instructions: [
        'Add all ingredients to a blender',
        'Blend until smooth and creamy',
        'Pour into a bowl',
        'Top with granola and fresh fruit slices',
        'Serve immediately',
      ],
      image: '🍹',
      rating: 4.5,
    },
    {
      id: 2,
      name: `${fruitName || 'Fruit'} Salad`,
      prepTime: '15 mins',
      cookTime: '0 mins',
      difficulty: 'Easy',
      servings: 4,
      calories: 180,
      ingredients: [
        `2 cups ${fruitName || 'fruit'} chopped`,
        '1 cup strawberries sliced',
        '1 cup blueberries',
        '2 tbsp honey',
        '1 tbsp lemon juice',
        'Fresh mint leaves',
      ],
      instructions: [
        'Wash and chop all fruits',
        'Combine in a large bowl',
        'Drizzle with honey and lemon juice',
        'Gently toss to combine',
        'Garnish with mint leaves',
      ],
      image: '🥗',
      rating: 4.8,
    },
    {
      id: 3,
      name: `Baked ${fruitName || 'Fruit'} Crisp`,
      prepTime: '20 mins',
      cookTime: '30 mins',
      difficulty: 'Medium',
      servings: 6,
      calories: 280,
      ingredients: [
        `4 cups ${fruitName || 'fruit'} sliced`,
        '1/2 cup oats',
        '1/2 cup flour',
        '1/2 cup brown sugar',
        '1/2 cup butter',
        '1 tsp cinnamon',
      ],
      instructions: [
        'Preheat oven to 375°F',
        'Place fruit in baking dish',
        'Mix topping ingredients in a bowl',
        'Sprinkle topping over fruit',
        'Bake for 30 minutes until golden brown',
      ],
      image: '🍪',
      rating: 4.3,
    },
  ];

  const RecipeCard = ({ recipe, onClick }) => (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onClick(recipe)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 cursor-pointer hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{recipe.image}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">{recipe.name}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>⏱️ {recipe.prepTime}</span>
            <span>🔥 {recipe.calories} cal</span>
            <span>⭐ {recipe.rating}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">{recipe.difficulty}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{recipe.servings} servings</span>
          </div>
        </div>
        <span className="text-gray-400">→</span>
      </div>
    </motion.div>
  );

  const RecipeDetails = ({ recipe, onClose }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-secondary-500 p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl mb-2">{recipe.image}</div>
              <h3 className="text-xl font-bold">{recipe.name}</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
          </div>
        </div>

        <div className="p-5">
          {/* Quick Info */}
          <div className="grid grid-cols-4 gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-lg">⏱️</div>
              <div className="text-sm font-medium">{recipe.prepTime}</div>
              <div className="text-xs text-gray-500">Prep Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg">🔥</div>
              <div className="text-sm font-medium">{recipe.calories} cal</div>
              <div className="text-xs text-gray-500">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg">⭐</div>
              <div className="text-sm font-medium">{recipe.rating}</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg">🍽️</div>
              <div className="text-sm font-medium">{recipe.servings}</div>
              <div className="text-xs text-gray-500">Servings</div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h4>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-green-500">✓</span> {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Instructions</h4>
            <ol className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Nutrition Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              Nutritional information is an estimate and may vary based on ingredients used.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🍳</span> Recipe Suggestions
          <span className="text-xs opacity-80 ml-2">for {fruitName || 'Fruit'}</span>
        </h3>
      </div>

      {/* Recipe List */}
      <div className="p-4 space-y-3">
        {defaultRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={(r) => {
            setSelectedRecipe(r);
            setShowDetails(true);
          }} />
        ))}
      </div>

      {/* Tip Section */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <span>💡</span>
          <span>Try substituting other fruits in these recipes for variety!</span>
        </p>
      </div>

      {/* Recipe Details Modal */}
      <AnimatePresence>
        {showDetails && selectedRecipe && (
          <RecipeDetails recipe={selectedRecipe} onClose={() => setShowDetails(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick Recipe Card (compact version)
export const QuickRecipeCard = ({ recipe, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  >
    <div className="text-3xl">{recipe.image}</div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{recipe.name}</h4>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>⏱️ {recipe.prepTime}</span>
        <span>🔥 {recipe.calories} cal</span>
      </div>
    </div>
    <span className="text-primary-500">→</span>
  </div>
);

export default RecipeSuggestions;