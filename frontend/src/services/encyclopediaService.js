import api from './api';

/**
 * Encyclopedia Service
 * Handles all fruit encyclopedia-related API calls including browsing, searching, and filtering
 */
const encyclopediaService = {
  /**
   * Get all fruits with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search by fruit name
   * @param {string} params.category - Filter by category
   * @param {string} params.season - Filter by season
   * @param {string} params.nutrition - Filter by nutrition type (high_vitamin_c, etc.)
   * @param {string} params.sort - Sort by field (name, calories, etc.)
   * @param {string} params.order - Sort order (asc, desc)
   */
  getAllFruits: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.season) queryParams.append('season', params.season);
      if (params.nutrition) queryParams.append('nutrition', params.nutrition);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);
      
      const url = `encyclopedia/fruits${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single fruit details by name
   * @param {string} fruitName - Name of the fruit
   */
  getFruitDetails: async (fruitName) => {
    try {
      const response = await api.get(`encyclopedia/fruits/${encodeURIComponent(fruitName)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit by ID
   * @param {string} fruitId - Fruit ID
   */
  getFruitById: async (fruitId) => {
    try {
      const response = await api.get(`encyclopedia/fruits/id/${fruitId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all fruit categories
   */
  getCategories: async () => {
    try {
      const response = await api.get('encyclopedia/categories');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all seasons
   */
  getSeasons: async () => {
    try {
      const response = await api.get('encyclopedia/seasons');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruits by category
   * @param {string} category - Category name
   * @param {Object} params - Pagination parameters
   */
  getFruitsByCategory: async (category, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `encyclopedia/categories/${encodeURIComponent(category)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruits by season
   * @param {string} season - Season name
   * @param {Object} params - Pagination parameters
   */
  getFruitsBySeason: async (season, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/encyclopedia/seasons/${encodeURIComponent(season)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruits by nutrition filter
   * @param {string} filter - Nutrition filter (high_fiber, low_calorie, etc.)
   * @param {Object} params - Pagination parameters
   */
  getFruitsByNutrition: async (filter, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/encyclopedia/nutrition/${filter}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search fruits by name or description
   * @param {string} query - Search query
   * @param {Object} params - Pagination parameters
   */
  searchFruits: async (query, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/encyclopedia/search?${queryParams.toString()}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit nutritional information
   * @param {string} fruitName - Name of the fruit
   */
  getNutritionalInfo: async (fruitName) => {
    try {
      const response = await api.get(`/encyclopedia/nutrition/${encodeURIComponent(fruitName)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get seasonal fruits for current month
   */
  getCurrentSeasonFruits: async () => {
    try {
      const response = await api.get('/encyclopedia/seasonal/current');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruits by month
   * @param {number} month - Month number (1-12)
   */
  getFruitsByMonth: async (month) => {
    try {
      const response = await api.get(`/encyclopedia/seasonal/month/${month}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Compare two fruits
   * @param {string} fruit1 - First fruit name
   * @param {string} fruit2 - Second fruit name
   */
  compareFruits: async (fruit1, fruit2) => {
    try {
      const response = await api.get(`/encyclopedia/compare/${encodeURIComponent(fruit1)}/${encodeURIComponent(fruit2)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get random fruit of the day
   */
  getFruitOfTheDay: async () => {
    try {
      const response = await api.get('/encyclopedia/fruit-of-the-day');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruits with high nutritional value
   * @param {string} nutrient - Nutrient type (vitamin_c, fiber, etc.)
   * @param {number} limit - Number of fruits to return
   */
  getTopNutrientFruits: async (nutrient, limit = 10) => {
    try {
      const response = await api.get(`/encyclopedia/top-nutrients/${nutrient}?limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit growing tips and farming information
   * @param {string} fruitName - Name of the fruit
   */
  getGrowingTips: async (fruitName) => {
    try {
      const response = await api.get(`/encyclopedia/growing-tips/${encodeURIComponent(fruitName)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit storage guidelines
   * @param {string} fruitName - Name of the fruit
   */
  getStorageGuide: async (fruitName) => {
    try {
      const response = await api.get(`/encyclopedia/storage/${encodeURIComponent(fruitName)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit varieties and cultivars
   * @param {string} fruitName - Name of the fruit
   */
  getFruitVarieties: async (fruitName) => {
    try {
      const response = await api.get(`/encyclopedia/varieties/${encodeURIComponent(fruitName)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruits by health benefit
   * @param {string} benefit - Health benefit (heart_health, immunity, etc.)
   * @param {Object} params - Pagination parameters
   */
  getFruitsByHealthBenefit: async (benefit, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/encyclopedia/health-benefits/${benefit}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all health benefits list
   */
  getHealthBenefits: async () => {
    try {
      const response = await api.get('/encyclopedia/health-benefits');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit images gallery
   * @param {string} fruitName - Name of the fruit
   */
  getFruitImages: async (fruitName) => {
    try {
      const response = await api.get(`/encyclopedia/images/${encodeURIComponent(fruitName)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit fun facts
   * @param {string} fruitName - Name of the fruit
   * @param {number} limit - Number of facts to return
   */
  getFunFacts: async (fruitName, limit = 5) => {
    try {
      const response = await api.get(`/encyclopedia/fun-facts/${encodeURIComponent(fruitName)}?limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruits by origin country
   * @param {string} country - Country name
   * @param {Object} params - Pagination parameters
   */
  getFruitsByOrigin: async (country, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/encyclopedia/origin/${encodeURIComponent(country)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get popular/trending fruits
   * @param {number} limit - Number of fruits to return
   */
  getTrendingFruits: async (limit = 10) => {
    try {
      const response = await api.get(`/encyclopedia/trending?limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit recommendations based on user history
   */
  getRecommendedFruits: async () => {
    try {
      const response = await api.get('/encyclopedia/recommendations');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add fruit to user's favorites
   * @param {string} fruitId - Fruit ID
   */
  addToFavorites: async (fruitId) => {
    try {
      const response = await api.post(`/encyclopedia/favorites/${fruitId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove fruit from user's favorites
   * @param {string} fruitId - Fruit ID
   */
  removeFromFavorites: async (fruitId) => {
    try {
      const response = await api.delete(`/encyclopedia/favorites/${fruitId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's favorite fruits
   */
  getFavorites: async () => {
    try {
      const response = await api.get('/encyclopedia/favorites');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if fruit is in user's favorites
   * @param {string} fruitId - Fruit ID
   */
  isFavorite: async (fruitId) => {
    try {
      const response = await api.get(`/encyclopedia/favorites/check/${fruitId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit encyclopedia statistics
   */
  getStatistics: async () => {
    try {
      const response = await api.get('encyclopedia/statistics');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download fruit information as PDF
   * @param {string} fruitName - Name of the fruit
   */
  downloadFruitInfo: async (fruitName) => {
    try {
      const response = await api.get(`/encyclopedia/download/${encodeURIComponent(fruitName)}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fruitName}_info.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default encyclopediaService;