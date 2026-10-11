import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuthSlice } from './slices/authSlice';
import { createFruitSlice } from './slices/fruitSlice';
import { createChatbotSlice } from './slices/chatbotSlice';
import { createUISlice } from './slices/uiSlice';

/**
 * Main Store Configuration
 * Combines all slices into a single store with persistence
 */
const useStore = create(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createFruitSlice(...args),
      ...createChatbotSlice(...args),
      ...createUISlice(...args),
    }),
    {
      name: 'fruit-ai-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,     // ← NEW
        refreshToken: state.refreshToken,   // ← NEW
        theme: state.theme,
        language: state.language,
        recentIdentifications: state.recentIdentifications?.slice(0, 10),
      }),
    }
  )
);

export default useStore;