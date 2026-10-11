import api from './api';

/**
 * Unwrap backend responses that may or may not be wrapped in { success, data }.
 * Handles both shapes so this works whether or not the backend envelope is on.
 */
const unwrap = (res) => {
  if (res && typeof res === 'object' && !Array.isArray(res) && 'success' in res) {
    if (res.success === false) {
      throw new Error(res.error || res.detail || 'Request failed');
    }
    return res.data;
  }
  return res;
};

const mapHistoryItem = (item) => ({
  id: item.id,
  fruitName: item.fruit_name || item.fruitName || 'Unknown',
  confidence: Math.round((item.confidence || 0) * 100),
  timestamp: item.created_at || item.timestamp || null,
  imageUrl: item.image_url || item.imageUrl || '',
  type: 'identification',
});

const fruitService = {
  // ---------------- identification ----------------

  identifyFruit: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await api.post('/fruits/identify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  identifyFruitFromBase64: async (base64Image) => {
    console.debug('[camera] sending captured image', { bytes: base64Image?.length || 0 });
    const formData = new FormData();
    formData.append('image', base64Image);
    const res = await api.post('/fruits/identify-base64', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  identifyMultipleFruits: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await api.post('/fruits/identify-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  batchIdentify: async (imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    const res = await api.post('/fruits/batch-identify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  // ---------------- fruit info ----------------

  getFruitInfo: async (fruitName) => {
    const res = await api.get(`/fruits/info/${encodeURIComponent(fruitName)}`);
    return unwrap(res);
  },

  getNutritionalInfo: async (fruitName) => {
    const res = await api.get(`/fruits/nutrition/${encodeURIComponent(fruitName)}`);
    return unwrap(res);
  },

  // ---------------- history (dashboard) ----------------
  // BUG FIX 1: was calling '/dashboard/activity' (timeline endpoint), now
  //            calls '/dashboard/history' with fallback to '/fruits/history'.
  // BUG FIX 4: leading slashes on every path.

  getIdentificationHistory: async (params = {}) => {
    const apiParams = {
      limit: params.limit || 10,
      ...(params.page ? { page: params.page } : {}),
    };

    let payload;
    try {
      const res = await api.get('/dashboard/history', { params: apiParams });
      payload = unwrap(res);
    } catch (err) {
      // If dashboard route missing (404), fall back to /fruits/history
      if (err?.response?.status === 404) {
        const res = await api.get('/fruits/history', { params: apiParams });
        payload = unwrap(res);
      } else {
        throw err;
      }
    }

    // payload could be: array, { items: [...] }, { data: [...] }
    const items = Array.isArray(payload)
      ? payload
      : payload?.items || payload?.data || [];

    return {
      items: items.map(mapHistoryItem),
      total: payload?.total ?? items.length,
      page: payload?.page ?? 1,
      limit: payload?.limit ?? apiParams.limit,
      pages: payload?.pages ?? 1,
    };
  },

  getIdentificationById: async (id) => {
    const res = await api.get(`/fruits/history/${id}`);
    return unwrap(res);
  },

  deleteIdentification: async (id) => {
    const res = await api.delete(`/fruits/history/${id}`);
    return unwrap(res);
  },

  clearAllHistory: async () => {
    const res = await api.delete('/fruits/history');
    return unwrap(res);
  },

  // ---------------- favorites ----------------
  // BUG FIX 3: addToFavorites now sends multipart FormData to match the
  //            backend's `Form(...)` parameters.

  addToFavorites: async (data) => {
    const formData = new FormData();
    formData.append('fruit_name', data.fruitName || data.fruit_name);
    if (data.notes) formData.append('notes', data.notes);
    const res = await api.post('/fruits/favorites', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  getFavorites: async () => {
    const res = await api.get('/fruits/favorites');
    return unwrap(res);
  },

  removeFromFavorites: async (favoriteId) => {
    const res = await api.delete(`/fruits/favorites/${favoriteId}`);
    return unwrap(res);
  },

  // ---------------- encyclopedia ----------------

  getAllFruits: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.season) queryParams.append('season', params.season);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const sortMap = {
      name: { sort: 'name', order: 'asc' },
      name_desc: { sort: 'name', order: 'desc' },
      calories: { sort: 'calories', order: 'asc' },
      calories_desc: { sort: 'calories', order: 'desc' },
      popularity: { sort: 'popularity', order: 'desc' },
    };
    const sortConfig = sortMap[params.sort] || sortMap.name;
    queryParams.append('sort', sortConfig.sort);
    queryParams.append('order', sortConfig.order);

    const qs = queryParams.toString();
    const res = await api.get(`/encyclopedia/fruits${qs ? `?${qs}` : ''}`);
    return unwrap(res);
  },

  getFruitCategories: async () => {
    const res = await api.get('/encyclopedia/categories');
    return unwrap(res);
  },

  getSeasons: async () => {
    const res = await api.get('/encyclopedia/seasons');
    return unwrap(res);
  },

  getCurrentSeasonFruits: async (limit = 10) => {
    const res = await api.get(`/encyclopedia/seasonal/current?limit=${limit}`);
    return unwrap(res);
  },

  getFruitsBySeason: async (season) => {
    const res = await api.get(`/encyclopedia/seasons/${season}`);
    return unwrap(res);
  },

  compareFruits: async (fruit1, fruit2) => {
    const res = await api.get(
      `/fruits/compare/${encodeURIComponent(fruit1)}/${encodeURIComponent(fruit2)}`
    );
    return unwrap(res);
  },

  getRecipeSuggestions: async (fruitName, limit = 5) => {
    const res = await api.get(
      `/fruits/recipes/${encodeURIComponent(fruitName)}?limit=${limit}`
    );
    return unwrap(res);
  },

  getPriceInfo: async (fruitName, location = null) => {
    const url = `/fruits/price/${encodeURIComponent(fruitName)}${
      location ? `?location=${location}` : ''
    }`;
    const res = await api.get(url);
    return unwrap(res);
  },

  // ---------------- ML extras ----------------

  detectRipeness: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await api.post('/fruits/ripeness', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  detectDisease: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await api.post('/fruits/disease', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res);
  },

  // ---------------- stats (dashboard) ----------------
  // BUG FIX 2: unwrap the response before reading fields, and normalize
  //            `mostIdentified` into an array so <MostIdentified> gets what
  //            it expects.
  // BUG FIX 4: leading slashes on all dashboard endpoints.

  getIdentificationStats: async () => {
    const statsRes = await api.get('/dashboard/stats');
    const statsData = unwrap(statsRes) || {};

    let mostIdentified =
      statsData.mostIdentified || statsData.most_identified || null;

    // If backend didn't inline mostIdentified, fetch it separately.
    if (!Array.isArray(mostIdentified)) {
      try {
        const mostRes = await api.get('/dashboard/most-identified', {
          params: { limit: 5 },
        });
        const mostData = unwrap(mostRes);
        mostIdentified = Array.isArray(mostData)
          ? mostData
          : mostData?.items || mostData?.data || [];
      } catch (e) {
        mostIdentified = [];
      }
    }

    return {
      total: statsData.total ?? statsData.total_identifications ?? 0,
      uniqueFruits: statsData.unique_fruits ?? statsData.uniqueFruits ?? 0,
      successRate: statsData.success_rate ?? statsData.successRate ?? 0,
      streak: statsData.streak ?? 0,
      favoritesCount: statsData.favorites_count ?? statsData.favoritesCount ?? 0,
      activeDays: statsData.active_days ?? statsData.activeDays ?? 0,
      totalIdentificationsChange:
        statsData.total_identifications_change ??
        statsData.totalIdentificationsChange ??
        0,
      uniqueFruitsChange:
        statsData.unique_fruits_change ?? statsData.uniqueFruitsChange ?? 0,
      successRateChange:
        statsData.success_rate_change ?? statsData.successRateChange ?? 0,
      streakChange: statsData.streak_change ?? statsData.streakChange ?? 0,
      mostIdentified: Array.isArray(mostIdentified) ? mostIdentified : [],
      weeklyActivity: statsData.weeklyActivity || [],
    };
  },

  getStatistics: async () => fruitService.getIdentificationStats(),

  // ---------------- misc ----------------

  downloadReport: async (identificationId) => {
    const response = await api.get(`/fruits/report/${identificationId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fruit_report_${identificationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return response;
  },

  shareResult: async (result) => {
    const res = await api.post('/fruits/share', result);
    return unwrap(res);
  },
};

export default fruitService;