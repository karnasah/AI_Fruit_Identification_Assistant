import React, { createContext, useContext, useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';

// Create context
const VoiceContext = createContext(null);

// Provider component
export const VoiceProvider = ({ children }) => {
  const voice = useVoice();

  // Check voice support on mount
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = voice.isVoiceSupported !== false;
      localStorage.setItem('voice_supported', isSupported.toString());
    };
    
    checkSupport();
  }, [voice.isVoiceSupported]);

  // Auto-stop listening when component unmounts
  useEffect(() => {
    return () => {
      if (voice.isListening) {
        voice.stopListening();
      }
      if (voice.isSpeaking) {
        voice.stopSpeaking();
      }
    };
  }, []);

  // Listen for global voice command events
  useEffect(() => {
    const handleVoiceCommand = (event) => {
      const { command } = event.detail;
      
      switch (command) {
        case 'startListening':
          voice.startListening();
          break;
        case 'stopListening':
          voice.stopListening();
          break;
        case 'speak':
          if (event.detail.text) {
            voice.speak(event.detail.text);
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('voiceCommand', handleVoiceCommand);
    
    return () => {
      window.removeEventListener('voiceCommand', handleVoiceCommand);
    };
  }, [voice]);

  return (
    <VoiceContext.Provider value={voice}>
      {children}
    </VoiceContext.Provider>
  );
};

// Custom hook to use voice context
export const useVoiceContext = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within VoiceProvider');
  }
  return context;
};

export default VoiceContext;