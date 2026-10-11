import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useFruitIdentification } from '../hooks/useFruitIdentification';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FruitGrid from '../components/encyclopedia/FruitGrid';
import FruitSearch from '../components/encyclopedia/FruitSearch';
import FruitFilters from '../components/encyclopedia/FruitFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EncyclopediaPage = () => {
  const { 
    encyclopediaFruits, 
    fruitCategories, 
    getAllFruits, 
    getFruitCategories 
  } = useFruitIdentification();

  const { isLoading } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const categoryOptions = [
    { id: 'all', name: 'All Fruits', icon: '🍎' },
    ...(fruitCategories || []).map((category) => ({
      ...category,
      id: category.name,
    })),
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const params = {
          page: currentPage,
          limit: 20,
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          season: selectedSeason !== 'all' ? selectedSeason : undefined,
          sort: sortBy,
        };

        setError(null);
        const [fruitsResult, categoriesResult] = await Promise.all([
          getAllFruits(params),
          getFruitCategories(),
        ]);

        if (!fruitsResult?.success) {
          throw new Error(fruitsResult?.error || 'Unable to load fruits');
        }

        if (!categoriesResult?.success) {
          throw new Error(categoriesResult?.error || 'Unable to load fruit categories');
        }

        setTotalPages(fruitsResult.data?.pages || 1);
      } catch (loadError) {
      setError(loadError.message || 'Unable to load encyclopedia data');
      }
      };

    loadData();
  }, [getAllFruits, getFruitCategories, searchQuery, selectedCategory, selectedSeason, sortBy, currentPage]);

  const handleSearch = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleCategoryChange = (c) => {
    setSelectedCategory(c);
    setCurrentPage(1);
  };

  const handleSeasonChange = (s) => {
    setSelectedSeason(s);
    setCurrentPage(1);
  };

  const handleSortChange = (s) => {
    setSortBy(s);
    setCurrentPage(1);
  };

  const handlePageChange = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const seasons = [
    { value: 'all', label: 'All Seasons', icon: '📅' },
    { value: 'Summer', label: 'Summer', icon: '☀️' },
    { value: 'Winter', label: 'Winter', icon: '❄️' },
    { value: 'Spring', label: 'Spring', icon: '🌸' },
    { value: 'Fall', label: 'Fall', icon: '🍂' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'calories', label: 'Calories Low-High' },
    { value: 'calories_desc', label: 'Calories High-Low' },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen p-6">

        {/* Stats */}
        <div className="mb-6">
          🍎 {encyclopediaFruits?.total || 0} Fruits Available
        </div>

        {/* Layout */}
        <div className="grid lg:grid-cols-4 gap-6">

          {/* LEFT */}
          <div>
            <FruitSearch onSearch={handleSearch} />

            <FruitFilters
              title="Categories"
              options={categoryOptions}
              selected={selectedCategory}
              onChange={handleCategoryChange}
            />

            <div>
              {seasons.map((s) => (
                <button key={s.value} onClick={() => handleSeasonChange(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-3">

            <select onChange={(e) => handleSortChange(e.target.value)}>
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <p className="text-center text-red-600 dark:text-red-400">{error}</p>
            ) : (
              <>
                <FruitGrid
                  fruits={encyclopediaFruits?.data || []}
                />

                {totalPages > 1 && (
                  <div>
                    <button onClick={() => handlePageChange(currentPage - 1)}>
                      Prev
                    </button>
                    <button onClick={() => handlePageChange(currentPage + 1)}>
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Fun Fact */}
        <div className="mt-10">
          💡 Bananas are berries, strawberries are not!
        </div>

      </div>

      <Footer />
    </>
  );
};

export default EncyclopediaPage;