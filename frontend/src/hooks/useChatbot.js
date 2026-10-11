import { useStore } from '../store';
import chatbotService from '../services/chatbotService';

/**
 * Custom hook for chatbot functionality
 * Provides access to chatbot state and methods
 */
export const useChatbot = () => {
  const {
    chatMessages,
    currentSessionId,
    isTyping,
    chatbotError,
    suggestedQuestions,
    chatHistory,
    faqs,
    intentList,
    isChatbotOpen,
    unreadCount,
    conversationContext,
    sendMessage: storeSendMessage,
    startNewSession: storeStartNewSession,
    loadChatHistory: storeLoadChatHistory,
    getSuggestedQuestions: storeGetSuggestedQuestions,
    getFruitSuggestions: storeGetFruitSuggestions,
    getFAQs: storeGetFAQs,
    clearChatHistory: storeClearChatHistory,
    submitFeedback: storeSubmitFeedback,
    openChatbot: storeOpenChatbot,
    closeChatbot: storeCloseChatbot,
    toggleChatbot: storeToggleChatbot,
    incrementUnreadCount,
    resetUnreadCount,
    updateConversationContext: storeUpdateContext,
    setLastFruit: storeSetLastFruit,
    clearConversationContext,
    getAllIntents: storeGetAllIntents,
    addIntent: storeAddIntent,
    updateIntent: storeUpdateIntent,
    deleteIntent: storeDeleteIntent,
    trainChatbot: storeTrainChatbot,
    getChatbotAnalytics: storeGetAnalytics,
    searchChatHistory: storeSearchHistory,
    exportConversation: storeExportConversation,
    clearChatbotState,
  } = useStore();

  // Send a message to the chatbot
  const sendMessage = async (message, context = {}) => {
    return await storeSendMessage(message, chatbotService, context);
  };

  // Start a new conversation session
  const startNewSession = async () => {
    return await storeStartNewSession(chatbotService);
  };

  // Load chat history for current session
  const loadChatHistory = async (sessionId = null) => {
    return await storeLoadChatHistory(chatbotService, sessionId);
  };

  // Get suggested questions based on context
  const getSuggestedQuestions = async (context = null) => {
    return await storeGetSuggestedQuestions(chatbotService, context);
  };

  // Get fruit-specific suggestions
  const getFruitSuggestions = async (fruitName) => {
    return await storeGetFruitSuggestions(chatbotService, fruitName);
  };

  // Get frequently asked questions
  const getFAQs = async () => {
    return await storeGetFAQs(chatbotService);
  };

  // Clear all chat history
  const clearChatHistory = async (sessionId = null) => {
    return await storeClearChatHistory(chatbotService, sessionId);
  };

  // Submit feedback for a response
  const submitFeedback = async (messageId, helpful, feedback = null) => {
    return await storeSubmitFeedback(chatbotService, messageId, helpful, feedback);
  };

  // Update conversation context
  const updateConversationContext = (context) => {
    storeUpdateContext(context);
  };

  // Admin methods
  const getAllIntents = async () => {
    return await storeGetAllIntents(chatbotService);
  };

  const addIntent = async (intentData) => {
    return await storeAddIntent(chatbotService, intentData);
  };

  const updateIntent = async (intentId, intentData) => {
    return await storeUpdateIntent(chatbotService, intentId, intentData);
  };

  const deleteIntent = async (intentId) => {
    return await storeDeleteIntent(chatbotService, intentId);
  };

  const trainChatbot = async (trainingData) => {
    return await storeTrainChatbot(chatbotService, trainingData);
  };

  const getChatbotAnalytics = async (params = {}) => {
    return await storeGetAnalytics(chatbotService, params);
  };

  const searchChatHistory = async (query) => {
    return await storeSearchHistory(chatbotService, query);
  };

  const exportConversation = async (sessionId) => {
    return await storeExportConversation(chatbotService, sessionId);
  };

  // Helper method to send fruit context
  const sendWithFruitContext = async (message, fruitName) => {
    return await sendMessage(message, { lastFruit: fruitName });
  };

  // Helper method to send with identification context
  const sendWithIdentificationContext = async (message, identificationResult) => {
    return await sendMessage(message, {
      lastFruit: identificationResult?.fruitName,
      identificationConfidence: identificationResult?.confidence,
    });
  };

  return {
    // State
    chatMessages,
    currentSessionId,
    isTyping,
    chatbotError,
    suggestedQuestions,
    chatHistory,
    faqs,
    intentList,
    isChatbotOpen,
    unreadCount,
    conversationContext,
    
    // Methods
    sendMessage,
    sendWithFruitContext,
    sendWithIdentificationContext,
    startNewSession,
    loadChatHistory,
    getSuggestedQuestions,
    getFruitSuggestions,
    getFAQs,
    clearChatHistory,
    submitFeedback,
    openChatbot: storeOpenChatbot,
    closeChatbot: storeCloseChatbot,
    toggleChatbot: storeToggleChatbot,
    incrementUnreadCount,
    resetUnreadCount,
    updateConversationContext,
    setLastFruit: storeSetLastFruit,
    clearConversationContext,
    
    // Admin methods
    getAllIntents,
    addIntent,
    updateIntent,
    deleteIntent,
    trainChatbot,
    getChatbotAnalytics,
    searchChatHistory,
    exportConversation,
    
    // Reset
    clearChatbotState,
  };
};

export default useChatbot;