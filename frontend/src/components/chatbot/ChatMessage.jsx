import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/helpers';

const ChatMessage = ({ message, onFeedback }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  const isUser = message.sender === 'user';
  const isError = message.isError;

  const handleFeedback = (helpful) => {
    setFeedbackGiven(true);
    setShowFeedback(false);
    if (onFeedback) {
      onFeedback(message.id, helpful);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-primary-500 text-white' 
            : isError 
            ? 'bg-red-500 text-white'
            : 'bg-secondary-500 text-white'
        }`}>
          {isUser ? '👤' : isError ? '⚠️' : '🤖'}
        </div>

        {/* Message Bubble */}
        <div>
          <div className={`rounded-2xl px-4 py-2 ${
            isUser 
              ? 'bg-primary-500 text-white rounded-tr-none' 
              : isError
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-tl-none'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
          }`}>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>
          </div>

          {/* Timestamp */}
          <div className={`flex items-center gap-2 mt-1 text-xs text-gray-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span>{formatDate(message.timestamp, 'time')}</span>
            
            {/* Feedback buttons (only for bot messages) */}
            {!isUser && !isError && !feedbackGiven && (
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-gray-400 hover:text-gray-600"
              >
                👍
              </button>
            )}
          </div>

          {/* Feedback Popup */}
          {showFeedback && !isUser && !isError && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Was this response helpful?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback(true)}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Yes 👍
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  No 👎
                </button>
              </div>
            </div>
          )}

          {/* Intent/Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const event = new CustomEvent('sendMessage', { detail: suggestion });
                    window.dispatchEvent(event);
                  }}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;