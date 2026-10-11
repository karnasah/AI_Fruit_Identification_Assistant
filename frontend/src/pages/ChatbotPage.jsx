import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useChatbot } from '../hooks/useChatbot';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import ChatMessage from '../components/chatbot/ChatMessage';
import ChatInput from '../components/chatbot/ChatInput';
import QuickReplies from '../components/chatbot/QuickReplies';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChatbotPage = () => {
  const { 
    chatMessages, 
    isTyping, 
    suggestedQuestions,
    getSuggestedQuestions,
    clearChatHistory,
    startNewSession
  } = useChatbot();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    // Load suggested questions
    getSuggestedQuestions();
  }, []);

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

  const suggestions = [
    { text: "What fruits are in season?", icon: "🌱" },
    { text: "How to identify a ripe mango?", icon: "🥭" },
    { text: "Tell me about apple nutrition", icon: "🍎" },
    { text: "Fruits good for diabetes", icon: "🩺" },
    { text: "How to store berries?", icon: "🫐" },
    { text: "Best fruits for weight loss", icon: "⚖️" },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container-custom max-w-6xl py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Chat History */}
            <div className={`lg:col-span-1 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Chat History</h3>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mb-4"
                >
                  <span>+</span> New Chat
                </button>
                
                <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {/* Chat history items would go here */}
                  <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">How to identify fruits?</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">Nutritional benefits of...</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">Seasonal fruits in summer</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                
                <hr className="my-4 border-gray-200 dark:border-gray-700" />
                
                <button
                  onClick={handleClearHistory}
                  className="w-full text-left text-sm text-red-500 hover:text-red-600 px-2 py-1"
                >
                  Clear History
                </button>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-120px)]">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                      ☰
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white">
                      🤖
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">Fruit AI Assistant</h2>
                      <p className="text-xs text-green-500">● Online</p>
                    </div>
                  </div>
                  <button
                    onClick={handleNewChat}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="New Chat"
                  >
                    ✨
                  </button>
                </div>

                {/* Chat Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-6xl mb-4">🍎</div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Welcome to Fruit AI Assistant!
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                        Ask me anything about fruits - identification, nutrition, recipes, farming tips, and more!
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-w-lg">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              // Send suggestion as message
                              const event = new CustomEvent('sendMessage', { detail: suggestion.text });
                              window.dispatchEvent(event);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <span>{suggestion.icon}</span>
                            <span className="text-left">{suggestion.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {chatMessages.map((message, index) => (
                        <ChatMessage key={message.id || index} message={message} />
                      ))}
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
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {suggestedQuestions.length > 0 && (
                  <QuickReplies replies={suggestedQuestions} />
                )}

                {/* Chat Input */}
                <ChatInput />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ChatbotPage;