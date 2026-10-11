import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const normalizedBaseURL = API_BASE_URL.endsWith('/')
  ? API_BASE_URL
  : `${API_BASE_URL}/`;

const api = axios.create({
  baseURL: normalizedBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Clear persisted Zustand auth state so a 401 doesn't bounce us back in.
const clearPersistedAuth = () => {
  try {
    const raw = localStorage.getItem('fruit-ai-storage');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.state) {
      parsed.state.user = null;
      parsed.state.isAuthenticated = false;
      parsed.state.accessToken = null;
      parsed.state.refreshToken = null;
      localStorage.setItem('fruit-ai-storage', JSON.stringify(parsed));
    }
  } catch (e) {
    // ignore
  }
};

api.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      clearPersistedAuth();

      if (
        !window.location.pathname.includes('/login') &&
        !window.__authRedirecting
      ) {
        window.__authRedirecting = true;
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;