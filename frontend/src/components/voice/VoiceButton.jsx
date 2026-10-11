import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../../hooks/useVoice';

const VoiceButton = ({ size = 'md', onResult, className = '' }) => {
  const { 
    isListening, 
    isSpeaking, 
    startListening, 
    stopListening, 
    transcript,
    interimTranscript,
    voiceError,
    isVoiceSupported 
  } = useVoice();

  const [showTooltip, setShowTooltip] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);

  // Auto-stop after 10 seconds
  useEffect(() => {
    let interval;
    if (isListening) {
      setListeningTime(0);
      interval = setInterval(() => {
        setListeningTime(prev => {
          if (prev >= 10) {
            stopListening();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening, stopListening]);

  // Handle transcript result
  useEffect(() => {
    if (transcript && onResult) {
      onResult(transcript);
    }
  }, [transcript, onResult]);

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isVoiceSupported) {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          disabled
          className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed`}
          title="Voice not supported in this browser"
        >
          🎤
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          transition-all duration-300 relative
          ${isListening 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
            : isSpeaking
            ? 'bg-green-500 text-white'
            : 'bg-primary-500 text-white hover:bg-primary-600'
          }
        `}
      >
        {isListening ? (
          <div className="relative">
            <span>🎤</span>
            <motion.span
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ zIndex: -1 }}
            />
          </div>
        ) : isSpeaking ? (
          '🔊'
        ) : (
          '🎤'
        )}
      </motion.button>

      {/* Listening Timer */}
      <AnimatePresence>
        {isListening && listeningTime > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
          >
            Listening... {10 - listeningTime}s
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isListening && !isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap"
          >
            Click to speak
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {voiceError && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
          {voiceError}
        </div>
      )}
    </div>
  );
};

export default VoiceButton;