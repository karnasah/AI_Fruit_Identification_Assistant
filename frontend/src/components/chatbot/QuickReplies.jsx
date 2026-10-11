import React from 'react';
import { motion } from 'framer-motion';

const QuickReplies = ({ replies, onSelect }) => {
  if (!replies || replies.length === 0) return null;

  // Default quick replies if none provided
  const defaultReplies = [
    { text: 'What fruits are in season?', icon: '🌱' },
    { text: 'How to identify a ripe mango?', icon: '🥭' },
    { text: 'Tell me about apple nutrition', icon: '🍎' },
    { text: 'Best fruits for weight loss', icon: '⚖️' },
    { text: 'How to store berries?', icon: '🫐' },
    { text: 'Fruits good for diabetes', icon: '🩺' },
  ];

  const quickReplies = replies.length > 0 ? replies : defaultReplies;

  const handleSelect = (reply) => {
    const text = typeof reply === 'string' ? reply : reply.text;
    if (onSelect) {
      onSelect(text);
    } else {
      // Dispatch custom event for the chatbot to handle
      const event = new CustomEvent('sendMessage', { detail: text });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
        <span>💡</span> Quick Replies
      </p>
      <div className="flex flex-wrap gap-2">
        {quickReplies.map((reply, index) => {
          const text = typeof reply === 'string' ? reply : reply.text;
          const icon = typeof reply === 'object' ? reply.icon : null;
          
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelect(reply)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-primary-300 dark:hover:border-primary-500 transition-all"
            >
              {icon && <span>{icon}</span>}
              <span>{text}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// Contextual Quick Replies based on last identified fruit
export const ContextualQuickReplies = ({ fruitName, onSelect }) => {
  const contextualReplies = [
    { text: `What are the health benefits of ${fruitName}?`, icon: '💪' },
    { text: `How to store ${fruitName}?`, icon: '📦' },
    { text: `Recipes using ${fruitName}`, icon: '🍳' },
    { text: `When is ${fruitName} in season?`, icon: '📅' },
    { text: `How many calories in ${fruitName}?`, icon: '🔥' },
  ];

  if (!fruitName) return null;

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
        <span>🍎</span> Questions about {fruitName}
      </p>
      <div className="flex flex-wrap gap-2">
        {contextualReplies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onSelect ? onSelect(reply.text) : null}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
          >
            <span>{reply.icon}</span>
            <span>{reply.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;