import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../../hooks/useVoice';
import VoiceButton from './VoiceButton';

const VoiceSearch = ({ onSearch, placeholder = "Search...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const { transcript, interimTranscript, isListening, startListening, stopListening } = useVoice();

  // Handle voice transcript
  useEffect(() => {
    if (transcript && isVoiceActive) {
      setQuery(transcript);
      if (onSearch) {
        onSearch(transcript);
      }
      setIsVoiceActive(false);
      setShowVoiceModal(false);
    }
  }, [transcript, isVoiceActive, onSearch]);

  const handleVoiceSearch = () => {
    setIsVoiceActive(true);
    setShowVoiceModal(true);
    startListening();
  };

  const handleCloseModal = () => {
    stopListening();
    setIsVoiceActive(false);
    setShowVoiceModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && query) {
      onSearch(query);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={handleVoiceSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
        >
          🎤
        </button>
      </form>

      {/* Voice Search Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-3xl text-white">🎤</span>
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Listening...
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Speak clearly into your microphone
                </p>
              </div>

              {/* Live Transcript */}
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                <p className="text-gray-600 dark:text-gray-300 min-h-[60px]">
                  {interimTranscript || transcript || "Say something..."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                {transcript && (
                  <button
                    onClick={() => {
                      setQuery(transcript);
                      if (onSearch) onSearch(transcript);
                      handleCloseModal();
                    }}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Search "{transcript}"
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSearch;