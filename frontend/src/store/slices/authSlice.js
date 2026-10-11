/**
 * Authentication Slice
 * Manages user authentication state, login, logout, and user profile
 */

const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('access_token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const createAuthSlice = (set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  accessToken: null,
  refreshToken: null,

  // Actions
  login: async (credentials, authService) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await authService.login(credentials);
      saveTokens(response.access_token, response.refresh_token);
      set({
        user: response.user,
        isAuthenticated: true,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isLoading: false,
        authError: null,
      });
      return { success: true, user: response.user };
    } catch (error) {
      set({
        isLoading: false,
        authError: error.message || 'Login failed',
      });
      return { success: false, error: error.message };
    }
  },

  register: async (userData, authService) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await authService.register(userData);
      set({ isLoading: false, authError: null });
      return { success: true, data: response };
    } catch (error) {
      set({
        isLoading: false,
        authError: error.message || 'Registration failed',
      });
      return { success: false, error: error.message };
    }
  },

  logout: async (authService) => {
    set({ isLoading: true });
    try {
      if (authService) await authService.logout();
    } catch (error) {
      // ignore
    } finally {
      clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        authError: null,
      });
    }
    return { success: true };
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  updateUserProfile: async (userData, authService) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await authService.updateProfile(userData);
      set({ user: response.user, isLoading: false });
      return { success: true, user: response.user };
    } catch (error) {
      set({
        isLoading: false,
        authError: error.message || 'Update failed',
      });
      return { success: false, error: error.message };
    }
  },

  changePassword: async (passwords, authService) => {
    set({ isLoading: true, authError: null });
    try {
      await authService.changePassword(passwords);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        authError: error.message || 'Password change failed',
      });
      return { success: false, error: error.message };
    }
  },

  forgotPassword: async (email, authService) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await authService.forgotPassword(email);
      set({ isLoading: false });
      return { success: true, message: response.message };
    } catch (error) {
      set({
        isLoading: false,
        authError: error.message || 'Request failed',
      });
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (token, newPassword, authService) => {
    set({ isLoading: true, authError: null });
    try {
      const response = await authService.resetPassword(token, newPassword);
      set({ isLoading: false });
      return { success: true, message: response.message };
    } catch (error) {
      set({
        isLoading: false,
        authError: error.message || 'Password reset failed',
      });
      return { success: false, error: error.message };
    }
  },

  refreshAccessToken: async (authService) => {
    const { refreshToken } = get();
    if (!refreshToken) return { success: false };

    set({ isLoading: true });
    try {
      const response = await authService.refreshToken();
      saveTokens(response.access_token, response.refresh_token);
      set({
        accessToken: response.access_token,
        refreshToken: response.refresh_token || refreshToken,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      clearTokens();
      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      return { success: false };
    }
  },

  clearAuthError: () => set({ authError: null }),

  getUser: () => get().user,
  isLoggedIn: () => get().isAuthenticated,
  getAccessToken: () => get().accessToken,
});