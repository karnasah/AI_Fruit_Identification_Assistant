import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { useVoice } from '../../hooks/useVoice';

const ChatInput = () => {
  const { sendMessage, isTyping } = useChatbot();
  const { isListening, startListening, stopListening, transcript, interimTranscript } = useVoice();
  
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setMessage(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

  // Handle interim transcript for live display
  useEffect(() => {
    if (interimTranscript && isListening) {
      // Show interim transcript while speaking
      setMessage(prev => prev.replace(/\s*\(listening\.\.\.\)$/, '') + (prev ? ' ' : '') + interimTranscript + ' (listening...)');
    }
  }, [interimTranscript, isListening]);

  const handleSend = async () => {
    if (!message.trim() || isSending || isTyping) return;
    
    setIsSending(true);
    await sendMessage(message.trim());
    setMessage('');
    setIsSending(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSuggestion = (suggestion) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  const quickSuggestions = [
    'What fruits are in season?',
    'How to identify a ripe mango?',
    'Tell me about apple nutrition',
    'Best fruits for weight loss',
  ];

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestion(suggestion)}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about fruits..."
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Voice Input Button */}
          <button
            onClick={handleVoiceInput}
            className={`absolute right-3 bottom-3 p-1 rounded-full transition-colors ${
              isListening 
                ? 'bg-primary-500 text-white animate-pulse' 
                : 'text-gray-400 hover:text-primary-500'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            🎤
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending || isTyping}
          className="px-5 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSending || isTyping ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Send</span>
          )}
          <span>→</span>
        </button>
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span>AI is thinking...</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;