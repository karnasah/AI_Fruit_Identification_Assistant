import api from './api';

/**
 * Voice Service
 * Handles all voice-related API calls including speech-to-text, text-to-speech, and voice commands
 */
const voiceService = {
  /**
   * Convert speech audio to text
   * @param {Blob} audioBlob - Audio recording blob
   * @param {string} language - Language code (default: 'en-US')
   * @returns {Promise} Transcribed text
   */
  speechToText: async (audioBlob, language = 'en-US') => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);
      
      const response = await api.post('/voice/speech-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Convert text to speech audio
   * @param {string} text - Text to convert to speech
   * @param {Object} options - Speech options
   * @param {string} options.voice - Voice type (default: 'en-US-Neural2-F')
   * @param {number} options.speed - Speech speed (0.5 - 2.0)
   * @param {number} options.pitch - Speech pitch (0.5 - 2.0)
   * @returns {Promise} Audio blob
   */
  textToSpeech: async (text, options = {}) => {
    try {
      const response = await api.post('/voice/text-to-speech', {
        text,
        voice: options.voice || 'en-US-Neural2-F',
        speed: options.speed || 1.0,
        pitch: options.pitch || 1.0,
      }, {
        responseType: 'blob',
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Play text-to-speech audio
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   */
  speakText: async (text, options = {}) => {
    try {
      const audioBlob = await voiceService.textToSpeech(text, options);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        audio.play();
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Process voice command
   * @param {string} command - Voice command text
   * @returns {Promise} Processed command result
   */
  processVoiceCommand: async (command) => {
    try {
      const response = await api.post('/voice/process-command', {
        command,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get available voice options
   * @param {string} language - Language code (optional)
   */
  getAvailableVoices: async (language = null) => {
    try {
      const url = language 
        ? `/voice/voices?language=${language}`
        : '/voice/voices';
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get supported languages for speech recognition
   */
  getSupportedLanguages: async () => {
    try {
      const response = await api.get('/voice/languages');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save voice preferences for user
   * @param {Object} preferences - Voice preferences
   * @param {string} preferences.voice - Preferred voice
   * @param {number} preferences.speed - Preferred speed
   * @param {number} preferences.pitch - Preferred pitch
   * @param {string} preferences.language - Preferred language
   */
  saveVoicePreferences: async (preferences) => {
    try {
      const response = await api.post('/voice/preferences', preferences);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's voice preferences
   */
  getVoicePreferences: async () => {
    try {
      const response = await api.get('/voice/preferences');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Detect language from speech audio
   * @param {Blob} audioBlob - Audio recording blob
   */
  detectLanguage: async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await api.post('/voice/detect-language', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get voice command suggestions
   * @param {string} context - Current app context (e.g., 'identify', 'encyclopedia')
   */
  getVoiceCommands: async (context = null) => {
    try {
      const url = context 
        ? `/voice/commands?context=${context}`
        : '/voice/commands';
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Train custom voice command (admin only)
   * @param {Object} commandData - Command data with phrase and action
   */
  addCustomCommand: async (commandData) => {
    try {
      const response = await api.post('/voice/commands', commandData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete custom voice command (admin only)
   * @param {string} commandId - Command ID
   */
  deleteCustomCommand: async (commandId) => {
    try {
      const response = await api.delete(`/voice/commands/${commandId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get voice activity history
   * @param {Object} params - Query parameters
   */
  getVoiceHistory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const url = `/voice/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear voice history
   */
  clearVoiceHistory: async () => {
    try {
      const response = await api.delete('/voice/history');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if browser supports Web Speech API (client-side)
   * This is a client-side check, not an API call
   */
  isSpeechSupported: () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  /**
   * Get browser's speech recognition instance (client-side)
   * Returns a configured SpeechRecognition object
   */
  getSpeechRecognition: (language = 'en-US') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    
    return recognition;
  },

  /**
   * Get browser's speech synthesis (client-side)
   */
  getSpeechSynthesis: () => {
    if (!window.speechSynthesis) {
      throw new Error('Speech synthesis not supported in this browser');
    }
    return window.speechSynthesis;
  },

  /**
   * Get available voices from browser (client-side)
   */
  getBrowserVoices: () => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) {
        resolve([]);
        return;
      }
      
      const voices = synth.getVoices();
      if (voices.length) {
        resolve(voices);
      } else {
        synth.onvoiceschanged = () => {
          resolve(synth.getVoices());
        };
      }
    });
  },

  /**
   * Speak text using browser's speech synthesis (client-side fallback)
   */
  speakWithBrowser: (text, options = {}) => {
    return new Promise((resolve, reject) => {
      const synth = window.speechSynthesis;
      if (!synth) {
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
      
      utterance.onend = resolve;
      utterance.onerror = reject;
      
      synth.speak(utterance);
    });
  },
};

export default voiceService;