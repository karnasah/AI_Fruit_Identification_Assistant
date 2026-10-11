import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FruitGrid from './FruitGrid';
import FruitSearch from './FruitSearch';
import FruitFilters from './FruitFilters';
import FruitDetails from './FruitDetails';
import { SeasonFilter, NutritionFilter } from './FruitFilters';
import Modal from '../common/Modal';
import Loader from '../common/Loader';

const EncyclopediaView = ({ 
  fruits, 
  isLoading, 
  onSearch, 
  onFilter, 
  onLoadMore,
  totalCount,
  onAddToFavorites,
  favorites 
}) => {
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedNutrition, setSelectedNutrition] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'calories', label: 'Calories (Low to High)' },
    { value: 'calories_desc', label: 'Calories (High to Low)' },
    { value: 'popularity', label: 'Most Popular' },
  ];

  // Apply filters and sorting
  useEffect(() => {
    const filters = {
      category: selectedCategory !== 'all' ? selectedCategory : null,
      season: selectedSeason !== 'all' ? selectedSeason : null,
      nutrition: selectedNutrition !== 'all' ? selectedNutrition : null,
      sort: sortBy,
    };
    onFilter && onFilter(filters);
  }, [selectedCategory, selectedSeason, selectedNutrition, sortBy]);

  const handleFruitClick = (fruit) => {
    setSelectedFruit(fruit);
  };

  const isFavorite = (fruit) => {
    return favorites?.some(f => f.id === fruit.id || f.name === fruit.name);
  };

  return (
    <div className="container-custom max-w-7xl py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Fruit Encyclopedia
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore our comprehensive database of fruits with nutritional information, 
          seasonal data, and health benefits
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-white">{totalCount || fruits?.length || 0}</span> Fruits Available
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Grid View"
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="List View"
            >
              ≡ List
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <FruitSearch onSearch={onSearch} />
            <FruitFilters
              title="Categories"
              selected={selectedCategory}
              onChange={setSelectedCategory}
              icon="🏷️"
            />
            <SeasonFilter
              selected={selectedSeason}
              onChange={setSelectedSeason}
            />
            <NutritionFilter
              selected={selectedNutrition}
              onChange={setSelectedNutrition}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Sort Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {fruits?.length || 0} fruits
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader text="Loading fruits..." />
            </div>
          )}

          {/* Fruit Grid/List */}
          {!isLoading && (
            <>
              <FruitGrid
                fruits={fruits || []}
                viewMode={viewMode}
                onFruitClick={handleFruitClick}
              />
              
              {/* Load More Button */}
              {onLoadMore && fruits?.length < totalCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={onLoadMore}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Load More Fruits
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fruit Details Modal */}
      <AnimatePresence>
        {selectedFruit && (
          <Modal
            isOpen={!!selectedFruit}
            onClose={() => setSelectedFruit(null)}
            size="lg"
            showCloseButton={false}
          >
            <FruitDetails
              fruit={selectedFruit}
              onClose={() => setSelectedFruit(null)}
              onAddToFavorites={onAddToFavorites}
              isFavorite={isFavorite(selectedFruit)}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Fun Fact Section */}
      <div className="mt-12 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">💡</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Did You Know?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Bananas are technically berries, while strawberries are not! Botanically speaking, 
          a berry is a fruit produced from the ovary of a single flower with seeds embedded in the flesh.
        </p>
      </div>
    </div>
  );
};

export default EncyclopediaView;