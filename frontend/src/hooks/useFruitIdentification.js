import { useCallback } from 'react';
import { useStore } from '../store';
import fruitService from '../services/fruitService';

/**
 * Custom hook for fruit identification
 * Provides access to fruit identification state and methods
 */
export const useFruitIdentification = () => {
  const {
    identificationResult,
    identificationHistory,
    currentFruit,
    favoriteFruits,
    isIdentifying,
    identificationError,
    fruitInfo,
    nutritionalInfo,
    recipeSuggestions,
    priceInfo,
    ripenessResult,
    diseaseResult,
    identificationStats,
    encyclopediaFruits,
    fruitCategories,
    seasonalFruits,
    identifyFruit: storeIdentifyFruit,
    identifyFruitFromBase64: storeIdentifyFruitFromBase64,
    clearIdentificationResult,
    getIdentificationHistory: storeGetHistory,
    deleteIdentification: storeDeleteIdentification,
    clearAllHistory: storeClearHistory,
    getFruitInfo: storeGetFruitInfo,
    getNutritionalInfo: storeGetNutritionalInfo,
    getRecipeSuggestions: storeGetRecipeSuggestions,
    getPriceInfo: storeGetPriceInfo,
    detectRipeness: storeDetectRipeness,
    detectDisease: storeDetectDisease,
    getIdentificationStats: storeGetStats,
    getAllFruits: storeGetAllFruits,
    getFruitCategories: storeGetCategories,
    getSeasonalFruits: storeGetSeasonalFruits,
    getFavorites: storeGetFavorites,
    addToFavorites: storeAddToFavorites,
    removeFromFavorites: storeRemoveFromFavorites,
    compareFruits: storeCompareFruits,
    downloadReport: storeDownloadReport,
    clearFruitState,
  } = useStore();

  // Identify a fruit from image file
  const identifyFruit = async (imageFile) => {
    return await storeIdentifyFruit(imageFile, fruitService);
  };

  // Identify a fruit from base64 image (camera capture)
  const identifyFruitFromBase64 = async (base64Image) => {
    return await storeIdentifyFruitFromBase64(base64Image, fruitService);
  };

  // Get identification history
  const getIdentificationHistory = useCallback(async (params = {}) => {
    return await storeGetHistory(fruitService, params);
  }, [storeGetHistory]);

  // Delete a specific identification
  const deleteIdentification = async (id) => {
    return await storeDeleteIdentification(id, fruitService);
  };

  // Clear all identification history
  const clearAllHistory = async () => {
    return await storeClearHistory(fruitService);
  };

  // Get detailed fruit information
  const getFruitInfo = async (fruitName) => {
    return await storeGetFruitInfo(fruitName, fruitService);
  };

  // Get nutritional information for a fruit
  const getNutritionalInfo = async (fruitName) => {
    return await storeGetNutritionalInfo(fruitName, fruitService);
  };

  // Get recipe suggestions for a fruit
  const getRecipeSuggestions = async (fruitName, limit = 5) => {
    return await storeGetRecipeSuggestions(fruitName, fruitService, limit);
  };

  // Get price information for a fruit
  const getPriceInfo = async (fruitName, location = null) => {
    return await storeGetPriceInfo(fruitName, fruitService, location);
  };

  // Detect fruit ripeness from image
  const detectRipeness = async (imageFile) => {
    return await storeDetectRipeness(imageFile, fruitService);
  };

  // Detect fruit disease from image
  const detectDisease = async (imageFile) => {
    return await storeDetectDisease(imageFile, fruitService);
  };

  // Get identification statistics
  const getIdentificationStats = useCallback(async () => {
    return await storeGetStats(fruitService);
  }, [storeGetStats]);

  // Get all fruits from encyclopedia
  const getAllFruits = useCallback(async (params = {}) => {
    return await storeGetAllFruits(fruitService, params);
  }, [storeGetAllFruits]);

  // Get fruit categories
  const getFruitCategories = useCallback(async () => {
    return await storeGetCategories(fruitService);
  }, [storeGetCategories]);

  // Get all seasons
  const getSeasons = async () => {
    return await fruitService.getSeasons();
  };

  // Get seasonal fruits
  const getSeasonalFruits = async (season = null) => {
    return await storeGetSeasonalFruits(fruitService, season);
  };

  // Get current season fruits
  const getCurrentSeasonFruits = async (limit = 10) => {
    return await fruitService.getCurrentSeasonFruits(limit);
  };

  // Get user's favorite fruits
  const getFavorites = async () => {
    return await storeGetFavorites(fruitService);
  };

  // Add fruit to favorites
  const addToFavorites = async (fruitData) => {
    return await storeAddToFavorites(fruitService, fruitData);
  };

  // Remove fruit from favorites
  const removeFromFavorites = async (favoriteId) => {
    return await storeRemoveFromFavorites(fruitService, favoriteId);
  };

  // Compare two fruits
  const compareFruits = async (fruit1, fruit2) => {
    return await storeCompareFruits(fruitService, fruit1, fruit2);
  };

  // Download identification report as PDF
  const downloadReport = async (identificationId) => {
    return await storeDownloadReport(fruitService, identificationId);
  };

  // Check if a fruit is in favorites
  const isFavorite = (fruitId) => {
    return favoriteFruits.some((f) => f.fruitId === fruitId || f.fruitName === fruitId);
  };

  return {
    // State
    identificationResult,
    identificationHistory,
    currentFruit,
    favoriteFruits,
    encyclopediaFruits,
    fruitCategories,
    seasonalFruits,
    isIdentifying,
    identificationError,
    fruitInfo,
    nutritionalInfo,
    recipeSuggestions,
    priceInfo,
    ripenessResult,
    diseaseResult,
    identificationStats,
    
    // Methods
    identifyFruit,
    identifyFruitFromBase64,
    clearIdentificationResult,
    getIdentificationHistory,
    deleteIdentification,
    clearAllHistory,
    getFruitInfo,
    getNutritionalInfo,
    getRecipeSuggestions,
    getPriceInfo,
    detectRipeness,
    detectDisease,
    getIdentificationStats,
    getAllFruits,
    getFruitCategories,
    getSeasons,
    getSeasonalFruits,
    getCurrentSeasonFruits,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    compareFruits,
    downloadReport,
    isFavorite,
    clearFruitState,
  };
};

export default useFruitIdentification;