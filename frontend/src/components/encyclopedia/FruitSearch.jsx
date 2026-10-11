import React, { useState, useEffect } from 'react';

const FruitSearch = ({ onSearch, placeholder = "Search fruits...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2 && query.length !== 0) return undefined;

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      setIsSearching(false);
      onSearch?.(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [onSearch, query]);

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const popularSearches = [
    { name: 'Apple', emoji: '🍎' },
    { name: 'Banana', emoji: '🍌' },
    { name: 'Mango', emoji: '🥭' },
    { name: 'Orange', emoji: '🍊' },
    { name: 'Strawberry', emoji: '🍓' },
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-lg">
            {isSearching ? '⏳' : '🔍'}
          </span>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Popular Searches */}
      {!query && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Popular searches:
          </p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((item) => (
              <button
                key={item.name}
                onClick={() => setQuery(item.name)}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-2">
        <p className="text-xs text-gray-400">
          💡 Tip: Search by fruit name, category, or season
        </p>
      </div>
    </div>
  );
};

export default FruitSearch;