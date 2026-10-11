/**
 * Chatbot Slice
 * Manages chatbot conversation state, messages, sessions, and intent handling
 */

export const createChatbotSlice = (set, get) => ({
  // State
  chatMessages: [],
  currentSessionId: null,
  isTyping: false,
  chatbotError: null,
  suggestedQuestions: [],
  chatHistory: [],
  faqs: [],
  intentList: [],
  isChatbotOpen: false,
  unreadCount: 0,
  conversationContext: {
    lastFruit: null,
    lastIntent: null,
    userPreferences: {},
  },

  // Chat Actions
  sendMessage: async (message, chatbotService, context = {}) => {
    set({ isTyping: true, chatbotError: null });
    
    // Add user message to chat immediately
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    set((state) => ({
      chatMessages: [...state.chatMessages, userMessage],
    }));
    
    try {
      const sessionId = get().currentSessionId;
      let response;
      
      if (Object.keys(context).length > 0) {
        response = await chatbotService.sendMessageWithContext(message, {
          ...context,
          session_id: sessionId,
        });
      } else {
        response = await chatbotService.sendMessage(message, sessionId);
      }
      
      const botMessage = {
        id: response.id || Date.now().toString() + '_bot',
        text: response.reply,
        sender: 'bot',
        intent: response.intent,
        confidence: response.confidence,
        suggestions: response.suggestions,
        timestamp: new Date().toISOString(),
      };
      
      set((state) => ({
        chatMessages: [...state.chatMessages, botMessage],
        currentSessionId: response.session_id || state.currentSessionId,
        isTyping: false,
        conversationContext: {
          ...state.conversationContext,
          lastIntent: response.intent,
          ...(response.fruit_context && { lastFruit: response.fruit_context }),
        },
      }));
      
      return { success: true, response: botMessage };
    } catch (error) {
      const errorMessage = {
        id: Date.now().toString() + '_error',
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        isError: true,
        timestamp: new Date().toISOString(),
      };
      
      set((state) => ({
        chatMessages: [...state.chatMessages, errorMessage],
        isTyping: false,
        chatbotError: error.message,
      }));
      
      return { success: false, error: error.message };
    }
  },

  startNewSession: async (chatbotService) => {
    try {
      const response = await chatbotService.startNewSession();
      set({
        currentSessionId: response.session_id,
        chatMessages: [],
        conversationContext: {
          lastFruit: null,
          lastIntent: null,
          userPreferences: {},
        },
      });
      return { success: true, sessionId: response.session_id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  loadChatHistory: async (chatbotService, sessionId = null) => {
    set({ isLoading: true });
    try {
      const response = await chatbotService.getChatHistory({
        sessionId: sessionId || get().currentSessionId,
      });
      
      // Format messages for display
      const messages = [];
      response.messages.forEach((msg) => {
        messages.push({
          id: msg.id,
          text: msg.message,
          sender: msg.sender,
          timestamp: msg.created_at,
        });
      });
      
      set({
        chatHistory: response.data || [],
        chatMessages: messages.length > 0 ? messages : get().chatMessages,
        currentSessionId: response.session_id || get().currentSessionId,
        isLoading: false,
      });
      
      return { success: true, data: response };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  getSuggestedQuestions: async (chatbotService, context = null) => {
    try {
      const response = await chatbotService.getSuggestedQuestions(context);
      set({ suggestedQuestions: response });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getFruitSuggestions: async (chatbotService, fruitName) => {
    try {
      const response = await chatbotService.getFruitSuggestions(fruitName);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getFAQs: async (chatbotService) => {
    try {
      const response = await chatbotService.getFAQs();
      set({ faqs: response });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  clearChatHistory: async (chatbotService, sessionId = null) => {
    try {
      await chatbotService.clearChatHistory(sessionId);
      set({
        chatMessages: [],
        chatHistory: [],
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  submitFeedback: async (chatbotService, messageId, helpful, feedback = null) => {
    try {
      await chatbotService.submitFeedback(messageId, helpful, feedback);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // UI Actions
  openChatbot: () => {
    set({ isChatbotOpen: true, unreadCount: 0 });
  },

  closeChatbot: () => {
    set({ isChatbotOpen: false });
  },

  toggleChatbot: () => {
    set((state) => ({ isChatbotOpen: !state.isChatbotOpen }));
  },

  incrementUnreadCount: () => {
    if (!get().isChatbotOpen) {
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
    }
  },

  resetUnreadCount: () => {
    set({ unreadCount: 0 });
  },

  // Context Management
  updateConversationContext: (context) => {
    set((state) => ({
      conversationContext: {
        ...state.conversationContext,
        ...context,
      },
    }));
  },

  setLastFruit: (fruitName) => {
    set((state) => ({
      conversationContext: {
        ...state.conversationContext,
        lastFruit: fruitName,
      },
    }));
  },

  clearConversationContext: () => {
    set({
      conversationContext: {
        lastFruit: null,
        lastIntent: null,
        userPreferences: {},
      },
    });
  },

  // Admin Actions (for training)
  getAllIntents: async (chatbotService) => {
    try {
      const response = await chatbotService.getAllIntents();
      set({ intentList: response });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addIntent: async (chatbotService, intentData) => {
    try {
      const response = await chatbotService.addIntent(intentData);
      set((state) => ({
        intentList: [...state.intentList, response],
      }));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  updateIntent: async (chatbotService, intentId, intentData) => {
    try {
      const response = await chatbotService.updateIntent(intentId, intentData);
      set((state) => ({
        intentList: state.intentList.map((intent) =>
          intent.id === intentId ? response : intent
        ),
      }));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteIntent: async (chatbotService, intentId) => {
    try {
      await chatbotService.deleteIntent(intentId);
      set((state) => ({
        intentList: state.intentList.filter((intent) => intent.id !== intentId),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  trainChatbot: async (chatbotService, trainingData) => {
    set({ isLoading: true });
    try {
      const response = await chatbotService.trainChatbot(trainingData);
      set({ isLoading: false });
      return { success: true, data: response };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  getChatbotAnalytics: async (chatbotService, params = {}) => {
    try {
      const response = await chatbotService.getChatbotAnalytics(params);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  searchChatHistory: async (chatbotService, query) => {
    set({ isLoading: true });
    try {
      const response = await chatbotService.searchChatHistory(query);
      set({ isLoading: false });
      return { success: true, data: response };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  exportConversation: async (chatbotService, sessionId) => {
    try {
      const response = await chatbotService.exportConversation(sessionId);
      return { success: true, blob: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Clear chatbot state (on logout)
  clearChatbotState: () => {
    set({
      chatMessages: [],
      currentSessionId: null,
      isTyping: false,
      chatbotError: null,
      suggestedQuestions: [],
      chatHistory: [],
      conversationContext: {
        lastFruit: null,
        lastIntent: null,
        userPreferences: {},
      },
      isChatbotOpen: false,
      unreadCount: 0,
    });
  },
});