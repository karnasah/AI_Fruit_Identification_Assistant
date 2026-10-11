import { useState, useCallback, useEffect, useRef } from 'react';
import voiceService from '../services/voiceService';

/**
 * Custom hook for voice functionality
 * Provides speech recognition and speech synthesis capabilities
 */
export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback((language = 'en-US') => {
    if (!voiceService.isSpeechSupported()) {
      setIsVoiceSupported(false);
      setVoiceError('Speech recognition is not supported in this browser');
      return null;
    }
    
    try {
      const recognition = voiceService.getSpeechRecognition(language);
      
      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        
        setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setVoiceError(`Recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      return recognition;
    } catch (error) {
      setVoiceError(error.message);
      return null;
    }
  }, []);

  // Start listening for voice input
  const startListening = useCallback((language = 'en-US') => {
    setTranscript('');
    setInterimTranscript('');
    setVoiceError(null);
    
    let recognition = recognitionRef.current;
    if (!recognition) {
      recognition = initSpeechRecognition(language);
    }
    
    if (recognition) {
      recognition.lang = language;
      recognition.start();
    } else {
      setVoiceError('Speech recognition not initialized');
    }
  }, [initSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Initialize speech synthesis
  const initSpeechSynthesis = useCallback(() => {
    if (!window.speechSynthesis) {
      setIsVoiceSupported(false);
      setVoiceError('Speech synthesis is not supported in this browser');
      return null;
    }
    
    synthRef.current = window.speechSynthesis;
    return synthRef.current;
  }, []);

  // Speak text using browser synthesis
  const speak = useCallback((text, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current) {
        initSpeechSynthesis();
      }
      
      if (!synthRef.current) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speed || 1;
      utterance.pitch = options.pitch || 1;
      utterance.lang = options.language || 'en-US';
      
      if (options.voice) {
        utterance.voice = options.voice;
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = (error) => {
        setIsSpeaking(false);
        reject(error);
      };
      
      synthRef.current.speak(utterance);
    });
  }, [initSpeechSynthesis]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // Speak using server-side TTS (more voices)
  const speakServer = useCallback(async (text, options = {}) => {
    try {
      setIsSpeaking(true);
      await voiceService.speakText(text, options);
      setIsSpeaking(false);
      return true;
    } catch (error) {
      console.error('Server TTS error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      return speak(text, options);
    }
  }, [speak]);

  // Process voice command
  const processCommand = useCallback(async (command) => {
    try {
      const response = await voiceService.processVoiceCommand(command);
      return response;
    } catch (error) {
      console.error('Command processing error:', error);
      return null;
    }
  }, []);

  // Get available voices from browser
  const getBrowserVoices = useCallback(async () => {
    try {
      const voices = await voiceService.getBrowserVoices();
      setAvailableVoices(voices);
      return voices;
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }, []);

  // Load voices on mount
  useEffect(() => {
    initSpeechSynthesis();
    getBrowserVoices();
    
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (synthRef.current && isSpeaking) {
        synthRef.current.cancel();
      }
    };
  }, [initSpeechSynthesis, getBrowserVoices, isListening, isSpeaking]);

  // Voice command shortcuts
  const voiceCommands = {
    'identify': () => {
      // Trigger identification
      window.dispatchEvent(new CustomEvent('voiceCommand', { detail: { command: 'identify' } }));
    },
    'capture': () => {
      window.dispatchEvent(new CustomEvent('voiceCommand', { detail: { command: 'capture' } }));
    },
    'dashboard': () => {
      window.location.href = '/dashboard';
    },
    'encyclopedia': () => {
      window.location.href = '/encyclopedia';
    },
    'chatbot': () => {
      window.location.href = '/chatbot';
    },
    'home': () => {
      window.location.href = '/';
    },
    'help': () => {
      window.location.href = '/help';
    },
  };

  // Auto-process recognized transcript
  useEffect(() => {
    if (transcript) {
      const lowerTranscript = transcript.toLowerCase();
      
      // Check for voice commands
      if (lowerTranscript.includes('identify') || lowerTranscript.includes('识别')) {
        voiceCommands.identify();
      } else if (lowerTranscript.includes('capture') || lowerTranscript.includes('拍照')) {
        voiceCommands.capture();
      } else if (lowerTranscript.includes('dashboard') || lowerTranscript.includes('仪表盘')) {
        voiceCommands.dashboard();
      } else if (lowerTranscript.includes('encyclopedia') || lowerTranscript.includes('百科')) {
        voiceCommands.encyclopedia();
      } else if (lowerTranscript.includes('chatbot') || lowerTranscript.includes('聊天')) {
        voiceCommands.chatbot();
      } else if (lowerTranscript.includes('help') || lowerTranscript.includes('帮助')) {
        voiceCommands.help();
      } else if (lowerTranscript.includes('home') || lowerTranscript.includes('首页')) {
        voiceCommands.home();
      }
    }
  }, [transcript]);

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    voiceError,
    availableVoices,
    isVoiceSupported,
    
    // Methods
    startListening,
    stopListening,
    speak,
    speakServer,
    stopSpeaking,
    processCommand,
    initSpeechRecognition,
    initSpeechSynthesis,
    getBrowserVoices,
    voiceCommands,
  };
};

export default useVoice;