/**
 * Store Index File
 * Exports the main store and all slices for easy importing
 */

import useStoreDefault from './store';
export { useStoreDefault as useStore };

// Export main store as default
export default useStoreDefault;

// Export individual slices for direct access if needed
export { createAuthSlice } from './slices/authSlice';
export { createFruitSlice } from './slices/fruitSlice';
export { createChatbotSlice } from './slices/chatbotSlice';
export { createUISlice } from './slices/uiSlice';

// Export selectors for convenient state access
export const selectUser = (state) => state.user;
export const selectIsAuthenticated = (state) => state.isAuthenticated;
export const selectTheme = (state) => state.theme;
export const selectLanguage = (state) => state.language;
export const selectLoading = (state) => state.loading;
export const selectRecentIdentifications = (state) => state.recentIdentifications;
export const selectCurrentFruit = (state) => state.currentFruit;
export const selectIdentificationResult = (state) => state.identificationResult;
export const selectChatMessages = (state) => state.chatMessages;
export const selectChatSessionId = (state) => state.chatSessionId;