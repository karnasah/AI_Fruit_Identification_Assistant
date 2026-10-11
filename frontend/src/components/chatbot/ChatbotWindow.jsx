import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatbot } from '../../hooks/useChatbot';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';

const ChatbotWindow = ({ isOpen, onClose, floating = true }) => {
  const { 
    chatMessages, 
    isTyping, 
    suggestedQuestions,
    loadChatHistory,
    clearChatHistory,
    startNewSession,
    submitFeedback
  } = useChatbot();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history when opened
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewChat = async () => {
    await startNewSession();
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      await clearChatHistory();
    }
  };

  const handleFeedback = (messageId, helpful) => {
    submitFeedback(messageId, helpful);
  };

  // Floating Chatbot Window
  if (floating) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-20 right-4 z-50 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold">Fruit AI Assistant</h3>
                  <p className="text-xs opacity-90">Online • Ready to help</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  {isMinimized ? '□' : '−'}
                </button>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-5xl mb-3">🍎</div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Hello! I'm your Fruit AI Assistant
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ask me anything about fruits - identification, nutrition, recipes, and more!
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onFeedback={handleFeedback}
                      />
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <QuickReplies replies={suggestedQuestions} />

                {/* Input Area */}
                <ChatInput />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full Page Chatbot
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-semibold">Fruit AI Assistant</h3>
            <p className="text-xs opacity-90">Powered by AI • Ready to help</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNewChat}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            title="New Chat"
          >
            ✨
          </button>
          <button
            onClick={handleClearHistory}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            title="Clear History"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">🍎</div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to Fruit AI Assistant!
            </h4>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Ask me anything about fruits - identification, nutrition, recipes, farming tips, and more!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  const event = new CustomEvent('sendMessage', { detail: 'What fruits are in season?' });
                  window.dispatchEvent(event);
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200"
              >
                What fruits are in season?
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('sendMessage', { detail: 'How to identify a ripe mango?' });
                  window.dispatchEvent(event);
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200"
              >
                How to identify a ripe mango?
              </button>
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onFeedback={handleFeedback}
            />
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <QuickReplies replies={suggestedQuestions} />

      {/* Input Area */}
      <ChatInput />
    </div>
  );
};

export default ChatbotWindow;