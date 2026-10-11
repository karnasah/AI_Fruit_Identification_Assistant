import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../../hooks/useVoice';
import Button from '../common/Button';

export const getIdentificationSpeechText = (fruitName, confidence) => {
  const hasValidConfidence = typeof confidence === 'number'
    && Number.isFinite(confidence)
    && confidence >= 0
    && confidence <= 1;

  return hasValidConfidence
    ? `Identified ${fruitName} with ${Math.round(confidence * 100)} percent confidence`
    : `Identified ${fruitName}`;
};

const VoiceOutput = ({ text, autoSpeak = false, onSpeakComplete, className = '' }) => {
  const { speak, stopSpeaking, isSpeaking, isVoiceSupported } = useVoice();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (autoSpeak && text && !isSpeaking) {
      speakText();
    }
  }, [text, autoSpeak]);

  const speakText = async () => {
    if (text && isVoiceSupported) {
      await speak(text);
      if (onSpeakComplete) onSpeakComplete();
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText();
    }
  };

  if (!isVoiceSupported) {
    return null;
  }

  return (
    <div className={`inline-block ${className}`}>
      <button
        onClick={handleSpeak}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
          ${isSpeaking 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }
        `}
        title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
      >
        {isSpeaking ? (
          <>
            <span className="animate-pulse">🔊</span>
            <span className="text-sm">Speaking...</span>
          </>
        ) : (
          <>
            <span>🔊</span>
            <span className="text-sm">Read Aloud</span>
          </>
        )}
      </button>

      {/* Expandable Text Preview */}
      <AnimatePresence>
        {isExpanded && text && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {text && text.length > 100 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary-500 hover:text-primary-600 mt-1"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

// Voice Output for Identification Results
export const IdentificationVoiceOutput = ({ fruitName, confidence, onSpeakComplete }) => {
  const { speak, isSpeaking, stopSpeaking, isVoiceSupported } = useVoice();
  const [isEnabled, setIsEnabled] = useState(false);

  const message = getIdentificationSpeechText(fruitName, confidence);

  const handleToggle = () => {
    if (isEnabled) {
      stopSpeaking();
    }
    setIsEnabled(!isEnabled);
  };

  useEffect(() => {
    if (isEnabled && fruitName) {
      speak(message);
    }
  }, [isEnabled, fruitName]);

  if (!isVoiceSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className={`
          flex items-center gap-1 px-2 py-1 rounded text-xs transition-all
          ${isEnabled 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }
        `}
      >
        {isSpeaking ? '🔊' : '🔈'}
        <span>{isEnabled ? 'Voice ON' : 'Voice OFF'}</span>
      </button>
      {isSpeaking && (
        <span className="text-xs text-green-500 animate-pulse">
          Speaking...
        </span>
      )}
    </div>
  );
};

// Voice Command Help
export const VoiceCommandHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const commands = [
    { command: "Identify [fruit name]", action: "Identify a specific fruit" },
    { command: "What is this?", action: "Identify fruit from camera" },
    { command: "Go to dashboard", action: "Navigate to dashboard" },
    { command: "Open encyclopedia", action: "Open fruit encyclopedia" },
    { command: "Search for [fruit]", action: "Search for a fruit" },
    { command: "Help", action: "Show voice commands" },
    { command: "Stop", action: "Stop voice output" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-500"
      >
        <span>🎤</span>
        <span>Voice Commands</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-10"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
              Voice Commands
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {commands.map((cmd, idx) => (
                <div key={idx} className="text-xs">
                  <span className="text-primary-500 font-mono">{cmd.command}</span>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{cmd.action}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              Click the microphone button and speak naturally
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceOutput;