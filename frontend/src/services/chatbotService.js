import api from './api';

/**
 * Chatbot Service
 * Handles all chatbot-related API calls including conversations, messages, and NLP processing
 */
const chatbotService = {
  /**
   * Send a message to the chatbot and get response
   * @param {string} message - User message
   * @param {string} sessionId - Optional session ID for conversation continuity
   * @returns {Promise} Chatbot response with reply and intent
   */
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await api.post('/chatbot/message', {
        message,
        session_id: sessionId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send a message with context (including fruit identification context)
   * @param {string} message - User message
   * @param {Object} context - Additional context (e.g., last identified fruit)
   */
  sendMessageWithContext: async (message, context = {}) => {
    try {
      const response = await api.post('/chatbot/message-with-context', {
        message,
        context,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get chat history for current user
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sessionId - Filter by session ID
   */
  getChatHistory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sessionId) queryParams.append('session_id', params.sessionId);
      
      const url = `/chatbot/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single conversation session
   * @param {string} sessionId - Session ID
   */
  getConversationSession: async (sessionId) => {
    try {
      const response = await api.get(`/chatbot/session/${sessionId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Start a new conversation session
   */
  startNewSession: async () => {
    try {
      const response = await api.post('/chatbot/new-session');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear chat history
   * @param {string} sessionId - Optional session ID (clears all if not provided)
   */
  clearChatHistory: async (sessionId = null) => {
    try {
      const payload = sessionId ? { session_id: sessionId } : {};
      const response = await api.delete('/chatbot/history', { data: payload });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a specific message
   * @param {string} messageId - Message ID
   */
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/chatbot/message/${messageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get suggested questions / quick replies
   * @param {string} context - Optional context for suggestions
   */
  getSuggestedQuestions: async (context = null) => {
    try {
      const url = context 
        ? `/chatbot/suggestions?context=${encodeURIComponent(context)}`
        : '/chatbot/suggestions';
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fruit-specific suggestions based on identified fruit
   * @param {string} fruitName - Name of the identified fruit
   */
  getFruitSuggestions: async (fruitName) => {
    try {
      const response = await api.get(`/chatbot/fruit-suggestions/${encodeURIComponent(fruitName)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Provide feedback on chatbot response
   * @param {string} messageId - Message ID
   * @param {boolean} helpful - Whether the response was helpful
   * @param {string} feedback - Optional feedback text
   */
  submitFeedback: async (messageId, helpful, feedback = null) => {
    try {
      const response = await api.post(`/chatbot/feedback/${messageId}`, {
        helpful,
        feedback,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Train chatbot with custom Q&A (admin only)
   * @param {Object} trainingData - Training data with questions and answers
   */
  trainChatbot: async (trainingData) => {
    try {
      const response = await api.post('/chatbot/train', trainingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get chatbot analytics (admin only)
   * @param {Object} params - Date range parameters
   */
  getChatbotAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const url = `/chatbot/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all intents and their sample questions (admin only)
   */
  getAllIntents: async () => {
    try {
      const response = await api.get('/chatbot/intents');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add new intent (admin only)
   * @param {Object} intentData - Intent data with name, questions, and responses
   */
  addIntent: async (intentData) => {
    try {
      const response = await api.post('/chatbot/intents', intentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing intent (admin only)
   * @param {string} intentId - Intent ID
   * @param {Object} intentData - Updated intent data
   */
  updateIntent: async (intentId, intentData) => {
    try {
      const response = await api.put(`/chatbot/intents/${intentId}`, intentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete intent (admin only)
   * @param {string} intentId - Intent ID
   */
  deleteIntent: async (intentId) => {
    try {
      const response = await api.delete(`/chatbot/intents/${intentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get common fruit-related FAQs
   */
  getFAQs: async () => {
    try {
      const response = await api.get('/chatbot/faqs');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search through chat history
   * @param {string} query - Search query
   */
  searchChatHistory: async (query) => {
    try {
      const response = await api.get(`/chatbot/search?q=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export chat conversation as text
   * @param {string} sessionId - Session ID to export
   */
  exportConversation: async (sessionId) => {
    try {
      const response = await api.get(`/chatbot/export/${sessionId}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chat_conversation_${sessionId}.txt`);
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

export default chatbotService;