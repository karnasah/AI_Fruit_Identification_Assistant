/**
 * UI Slice
 * Manages UI state including theme, loading, modals, sidebar, notifications, and user preferences
 */

export const createUISlice = (set, get) => ({
  // Theme State
  theme: 'light', // 'light' or 'dark'
  
  // Loading States
  loadingStates: {
    global: false,
    page: false,
    button: false,
    identification: false,
    upload: false,
  },
  
  // Modal States
  modals: {
    loginModal: false,
    registerModal: false,
    settingsModal: false,
    confirmModal: {
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
    },
    imagePreviewModal: {
      isOpen: false,
      imageUrl: null,
    },
    fruitDetailsModal: {
      isOpen: false,
      fruitId: null,
    },
    shareModal: {
      isOpen: false,
      result: null,
    },
    feedbackModal: {
      isOpen: false,
      type: null, // 'identification', 'chatbot', 'general'
    },
  },
  
  // Sidebar State
  sidebar: {
    isOpen: false,
    activeTab: 'main', // 'main', 'history', 'favorites', 'settings'
    collapsed: false,
  },
  
  // Notification State
  notifications: [],
  unreadNotifications: 0,
  
  // User Preferences
  preferences: {
    language: 'en', // 'en', 'hi', 'es', etc.
    fontSize: 'medium', // 'small', 'medium', 'large'
    reducedMotion: false,
    highContrast: false,
    autoSave: true,
    autoDetectFruit: true,
    showConfidenceScore: true,
    showNutritionalInfo: true,
    voiceOutput: false,
    voiceInput: true,
  },
  
  // Search State
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  
  // Toast/Alert State
  toast: {
    isOpen: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    duration: 3000,
  },
  
  // Tutorial State
  tutorial: {
    showWelcome: true,
    completedSteps: [],
    currentStep: 0,
    isActive: false,
  },
  
  // Network State
  isOnline: navigator.onLine,
  lastSyncTime: null,
  
  // ==================== Theme Actions ====================
  
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    });
  },
  
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  // ==================== Loading Actions ====================
  
  setLoading: (key, isLoading) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    }));
  },
  
  setGlobalLoading: (isLoading) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        global: isLoading,
      },
    }));
  },
  
  // ==================== Modal Actions ====================
  
  openModal: (modalName, data = {}) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: typeof data === 'boolean' ? data : true,
        ...(modalName === 'confirmModal' && data.title && {
          confirmModal: {
            ...state.modals.confirmModal,
            isOpen: true,
            ...data,
          },
        }),
        ...(modalName === 'imagePreviewModal' && data.imageUrl && {
          imagePreviewModal: {
            isOpen: true,
            imageUrl: data.imageUrl,
          },
        }),
        ...(modalName === 'fruitDetailsModal' && data.fruitId && {
          fruitDetailsModal: {
            isOpen: true,
            fruitId: data.fruitId,
          },
        }),
        ...(modalName === 'shareModal' && data.result && {
          shareModal: {
            isOpen: true,
            result: data.result,
          },
        }),
      },
    }));
  },
  
  closeModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: modalName === 'confirmModal' 
          ? { ...state.modals.confirmModal, isOpen: false }
          : false,
      },
    }));
  },
  
  showConfirmModal: (title, message, onConfirm, onCancel = null) => {
    set({
      modals: {
        ...get().modals,
        confirmModal: {
          isOpen: true,
          title,
          message,
          onConfirm,
          onCancel,
        },
      },
    });
  },
  
  // ==================== Sidebar Actions ====================
  
  toggleSidebar: () => {
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        isOpen: !state.sidebar.isOpen,
      },
    }));
  },
  
  setSidebarOpen: (isOpen) => {
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        isOpen,
      },
    }));
  },
  
  setSidebarTab: (tab) => {
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        activeTab: tab,
      },
    }));
  },
  
  toggleSidebarCollapse: () => {
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        collapsed: !state.sidebar.collapsed,
      },
    }));
  },
  
  // ==================== Notification Actions ====================

  setNotifications: (notifications, unreadNotifications = null) => {
    set({
      notifications,
      ...(unreadNotifications === null ? {} : { unreadNotifications }),
    });
  },
  
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      read: false,
      persisted: false,
      createdAt: new Date().toISOString(),
      action: notification.action || null,
      data: notification.data || null,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
      unreadNotifications: state.unreadNotifications + 1,
    }));
    
    return newNotification.id;
  },
  
  markNotificationRead: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find((notif) => notif.id === notificationId);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        ),
        unreadNotifications: Math.max(0, state.unreadNotifications - 1),
      };
    });
  },
  
  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
      unreadNotifications: 0,
    }));
  },
  
  removeNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      return {
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadNotifications: notification && !notification.read 
          ? state.unreadNotifications - 1 
          : state.unreadNotifications,
      };
    });
  },
  
  clearAllNotifications: () => {
    set({ notifications: [], unreadNotifications: 0 });
  },
  
  // ==================== Preferences Actions ====================
  
  setPreference: (key, value) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        [key]: value,
      },
    }));
  },
  
  setLanguage: (language) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        language,
      },
    }));
  },
  
  // ==================== Search Actions ====================
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  setSearchResults: (results) => {
    set({ searchResults: results, isSearching: false });
  },
  
  setIsSearching: (isSearching) => {
    set({ isSearching });
  },
  
  clearSearch: () => {
    set({ searchQuery: '', searchResults: [], isSearching: false });
  },
  
  // ==================== Toast Actions ====================
  
  showToast: (message, type = 'info', duration = 3000) => {
    set({
      toast: {
        isOpen: true,
        message,
        type,
        duration,
      },
    });
    
    // Auto close after duration
    setTimeout(() => {
      if (get().toast.isOpen) {
        set({
          toast: {
            ...get().toast,
            isOpen: false,
          },
        });
      }
    }, duration);
  },
  
  hideToast: () => {
    set((state) => ({
      toast: {
        ...state.toast,
        isOpen: false,
      },
    }));
  },
  
  // ==================== Tutorial Actions ====================
  
  startTutorial: () => {
    set({ tutorial: { ...get().tutorial, isActive: true } });
  },
  
  endTutorial: () => {
    set({ tutorial: { ...get().tutorial, isActive: false } });
  },
  
  completeTutorialStep: (stepId) => {
    set((state) => ({
      tutorial: {
        ...state.tutorial,
        completedSteps: [...state.tutorial.completedSteps, stepId],
        currentStep: state.tutorial.currentStep + 1,
      },
    }));
  },
  
  skipTutorial: () => {
    set({
      tutorial: {
        showWelcome: false,
        completedSteps: [],
        currentStep: 0,
        isActive: false,
      },
    });
  },
  
  dismissWelcome: () => {
    set((state) => ({
      tutorial: {
        ...state.tutorial,
        showWelcome: false,
      },
    }));
  },
  
  // ==================== Network Actions ====================
  
  setOnlineStatus: (isOnline) => {
    set({ isOnline });
  },
  
  setLastSyncTime: (time) => {
    set({ lastSyncTime: time });
  },
  
  // ==================== Reset Actions ====================
  
  resetUIState: () => {
    set({
      modals: {
        loginModal: false,
        registerModal: false,
        settingsModal: false,
        confirmModal: {
          isOpen: false,
          title: '',
          message: '',
          onConfirm: null,
          onCancel: null,
        },
        imagePreviewModal: {
          isOpen: false,
          imageUrl: null,
        },
        fruitDetailsModal: {
          isOpen: false,
          fruitId: null,
        },
        shareModal: {
          isOpen: false,
          result: null,
        },
        feedbackModal: {
          isOpen: false,
          type: null,
        },
      },
      sidebar: {
        isOpen: false,
        activeTab: 'main',
        collapsed: false,
      },
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      toast: {
        isOpen: false,
        message: '',
        type: 'info',
        duration: 3000,
      },
    });
  },
  
  // ==================== Helper Getters ====================
  
  isAnyLoading: () => {
    const { loadingStates } = get();
    return Object.values(loadingStates).some((loading) => loading === true);
  },
  
  getTheme: () => get().theme,
  
  getLanguage: () => get().preferences.language,
});