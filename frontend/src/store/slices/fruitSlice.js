/**
 * Fruit Slice
 * Manages fruit identification state, history, encyclopedia, and favorites
 *
 * NOTE: The loading flag here is `fruitLoading`, NOT `isLoading`.
 * `isLoading` belongs exclusively to authSlice. Mixing them caused an
 * infinite render loop on the dashboard.
 */

export const createFruitSlice = (set, get) => ({
  normalizeTopPredictions: (predictions = []) => predictions.map((prediction) => ({
    ...prediction,
    confidence: prediction.confidence <= 1
      ? prediction.confidence * 100
      : prediction.confidence,
  })),
  // State
  identificationResult: null,
  identificationHistory: [],
  currentFruit: null,
  favoriteFruits: [],
  fruitCategories: [],
  seasonalFruits: [],
  encyclopediaFruits: [],
  fruitLoading: false,
  isIdentifying: false,
  identificationError: null,
  fruitInfo: null,
  nutritionalInfo: null,
  recipeSuggestions: [],
  priceInfo: null,
  ripenessResult: null,
  diseaseResult: null,
  identificationStats: {
    total: 0,
    uniqueFruits: 0,
    mostIdentified: [],
    weeklyActivity: [],
  },

  // Fruit Identification Actions
  identifyFruit: async (imageFile, fruitService) => {
    set({ isIdentifying: true, identificationError: null });
    try {
      const result = await fruitService.identifyFruit(imageFile);
      const newIdentification = {
        id: result.id,
        fruitName: result.fruit_name,
        confidence: result.confidence,
        topPredictions: get().normalizeTopPredictions(result.top_predictions || result.top_3_predictions),
        imageUrl: result.image_url,
        timestamp: new Date().toISOString(),
        ripeness: result.ripeness,
        nutritionalInfo: result.nutritional_info,
      };

      set((state) => ({
        identificationResult: newIdentification,
        identificationHistory: [newIdentification, ...state.identificationHistory].slice(0, 50),
        isIdentifying: false,
        identificationError: null,
      }));

      return { success: true, result: newIdentification };
    } catch (error) {
      set({
        isIdentifying: false,
        identificationError: error.message || 'Identification failed',
      });
      return { success: false, error: error.message };
    }
  },

  identifyFruitFromBase64: async (base64Image, fruitService) => {
    set({ isIdentifying: true, identificationError: null });
    try {
      const result = await fruitService.identifyFruitFromBase64(base64Image);
      const newIdentification = {
        id: result.id,
        fruitName: result.fruit_name,
        confidence: result.confidence,
        topPredictions: get().normalizeTopPredictions(result.top_predictions || result.top_3_predictions),
        imageUrl: result.image_url,
        timestamp: new Date().toISOString(),
        ripeness: result.ripeness,
      };

      set({
        identificationResult: newIdentification,
        identificationHistory: [newIdentification, ...get().identificationHistory].slice(0, 50),
        isIdentifying: false,
      });

      return { success: true, result: newIdentification };
    } catch (error) {
      set({
        isIdentifying: false,
        identificationError: error.message,
      });
      return { success: false, error: error.message };
    }
  },

  clearIdentificationResult: () => {
    set({ identificationResult: null, identificationError: null });
  },

  // History Actions
  getIdentificationHistory: async (fruitService, params = {}) => {
    set({ fruitLoading: true });
    try {
      const response = await fruitService.getIdentificationHistory(params);

      // Service may return { items: [...] } or { data: [...] } or [...]
      const items = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];

      set({
        identificationHistory: Array.isArray(items) ? items : [],
        fruitLoading: false,
      });
      return { success: true, data: response };
    } catch (error) {
      set({
        fruitLoading: false,
        identificationError: error.message || 'Failed to load history',
      });
      throw error;
    }
  },

  deleteIdentification: async (id, fruitService) => {
    try {
      await fruitService.deleteIdentification(id);
      set((state) => ({
        identificationHistory: state.identificationHistory.filter((item) => item.id !== id),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  clearAllHistory: async (fruitService) => {
    try {
      await fruitService.clearAllHistory();
      set({ identificationHistory: [] });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Fruit Info Actions
  getFruitInfo: async (fruitName, fruitService) => {
    set({ fruitLoading: true });
    try {
      const response = await fruitService.getFruitInfo(fruitName);
      set({
        currentFruit: response,
        fruitInfo: response,
        nutritionalInfo: response.nutrition,
        fruitLoading: false,
      });
      return { success: true, data: response };
    } catch (error) {
      set({ fruitLoading: false });
      return { success: false, error: error.message };
    }
  },

  getNutritionalInfo: async (fruitName, fruitService) => {
    try {
      const response = await fruitService.getNutritionalInfo(fruitName);
      set({ nutritionalInfo: response });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getRecipeSuggestions: async (fruitName, fruitService, limit = 5) => {
    try {
      const response = await fruitService.getRecipeSuggestions(fruitName, limit);
      set({ recipeSuggestions: response });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getPriceInfo: async (fruitName, fruitService, location = null) => {
    try {
      const response = await fruitService.getPriceInfo(fruitName, location);
      set({ priceInfo: response });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  detectRipeness: async (imageFile, fruitService) => {
    set({ isIdentifying: true });
    try {
      const response = await fruitService.detectRipeness(imageFile);
      set({
        ripenessResult: response,
        isIdentifying: false,
      });
      return { success: true, data: response };
    } catch (error) {
      set({ isIdentifying: false });
      return { success: false, error: error.message };
    }
  },

  detectDisease: async (imageFile, fruitService) => {
    set({ isIdentifying: true });
    try {
      const response = await fruitService.detectDisease(imageFile);
      set({
        diseaseResult: response,
        isIdentifying: false,
      });
      return { success: true, data: response };
    } catch (error) {
      set({ isIdentifying: false });
      return { success: false, error: error.message };
    }
  },

  // Encyclopedia Actions
  getAllFruits: async (fruitService, params = {}) => {
    set({ fruitLoading: true });
    try {
      const response = await fruitService.getAllFruits(params);
      set({
        encyclopediaFruits: response,
        fruitLoading: false,
      });
      return { success: true, data: response };
    } catch (error) {
      set({ fruitLoading: false });
      return { success: false, error: error.message };
    }
  },

  getFruitCategories: async (fruitService) => {
    try {
      const response = await fruitService.getFruitCategories();
      set({ fruitCategories: response });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getSeasonalFruits: async (fruitService, season = null) => {
    try {
      let response;
      if (season) {
        response = await fruitService.getFruitsBySeason(season);
      } else {
        response = await fruitService.getCurrentSeasonFruits();
      }
      const fruits = response.data || response;
      set({ seasonalFruits: fruits });
      return { success: true, data: fruits };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Favorites Actions
  getFavorites: async (fruitService) => {
    try {
      const response = await fruitService.getFavorites();
      set({ favoriteFruits: response });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addToFavorites: async (fruitService, fruitData) => {
    try {
      const response = await fruitService.addToFavorites(fruitData);
      set((state) => ({
        favoriteFruits: [response, ...state.favoriteFruits],
      }));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  removeFromFavorites: async (fruitService, favoriteId) => {
    try {
      await fruitService.removeFromFavorites(favoriteId);
      set((state) => ({
        favoriteFruits: state.favoriteFruits.filter((f) => f.id !== favoriteId),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  isFavorite: (fruitId) => {
    const { favoriteFruits } = get();
    return favoriteFruits.some((f) => f.fruitId === fruitId || f.fruitName === fruitId);
  },

  // Statistics Actions
  getIdentificationStats: async (fruitService) => {
    try {
      const response = await fruitService.getStatistics();
      set({ identificationStats: response.data || response });
      return { success: true, data: response };
    } catch (error) {
      set({ identificationError: error.message || 'Failed to load stats' });
      throw error;
    }
  },

  // Comparison Actions
  compareFruits: async (fruitService, fruit1, fruit2) => {
    set({ fruitLoading: true });
    try {
      const response = await fruitService.compareFruits(fruit1, fruit2);
      set({ fruitLoading: false });
      return { success: true, data: response };
    } catch (error) {
      set({ fruitLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Download Report
  downloadReport: async (fruitService, identificationId) => {
    try {
      const response = await fruitService.downloadReport(identificationId);
      return { success: true, blob: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Clear all fruit state (on logout)
  clearFruitState: () => {
    set({
      identificationResult: null,
      currentFruit: null,
      fruitInfo: null,
      nutritionalInfo: null,
      recipeSuggestions: [],
      priceInfo: null,
      ripenessResult: null,
      diseaseResult: null,
      identificationError: null,
    });
  },
});