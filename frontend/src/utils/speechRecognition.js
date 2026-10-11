/**
 * Speech Recognition Utilities
 * Handles speech-to-text functionality with fallbacks
 */

// Check if speech recognition is supported
export const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Get Speech Recognition constructor
export const getSpeechRecognition = () => {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('Speech recognition is not supported in this browser');
  }
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

// Create speech recognition instance with configuration
export const createSpeechRecognition = (options = {}) => {
  const SpeechRecognition = getSpeechRecognition();
  const recognition = new SpeechRecognition();
  
  // Default options
  recognition.continuous = options.continuous || false;
  recognition.interimResults = options.interimResults !== false;
  recognition.lang = options.lang || 'en-US';
  recognition.maxAlternatives = options.maxAlternatives || 1;
  
  return recognition;
};

// Speech recognition class for easier management
export class SpeechRecognizer {
  constructor(options = {}) {
    this.options = {
      continuous: false,
      interimResults: true,
      lang: 'en-US',
      maxAlternatives: 1,
      ...options,
    };
    
    this.recognition = null;
    this.isListening = false;
    this.onResult = null;
    this.onError = null;
    this.onEnd = null;
    this.onStart = null;
  }
  
  init() {
    if (!isSpeechRecognitionSupported()) {
      throw new Error('Speech recognition not supported');
    }
    
    this.recognition = createSpeechRecognition(this.options);
    
    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStart) this.onStart();
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };
    
    this.recognition.onerror = (event) => {
      if (this.onError) this.onError(event.error);
    };
    
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (this.onResult) {
        this.onResult({
          final: finalTranscript,
          interim: interimTranscript,
          isFinal: !!finalTranscript,
        });
      }
    };
  }
  
  start() {
    if (!this.recognition) {
      this.init();
    }
    
    if (this.isListening) {
      this.stop();
    }
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      return false;
    }
  }
  
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
  
  abort() {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }
  
  setLanguage(lang) {
    this.options.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
  
  destroy() {
    if (this.recognition) {
      this.stop();
      this.recognition = null;
    }
  }
}

// Command recognition patterns
export const commandPatterns = {
  identify: /(identify|recognize|what is this|tell me about)/i,
  capture: /(capture|take photo|snap|picture)/i,
  search: /(search|find|look up)/i,
  back: /(back|go back|previous)/i,
  next: /(next|continue|forward)/i,
  home: /(home|go home|main menu)/i,
  dashboard: /(dashboard|stats|statistics)/i,
  encyclopedia: /(encyclopedia|database|fruit list)/i,
  chatbot: /(chatbot|assistant|help me)/i,
  settings: /(settings|preferences|options)/i,
  profile: /(profile|account|my account)/i,
  logout: /(logout|sign out|exit)/i,
  help: /(help|support|what can I do)/i,
};

// Extract command from transcript
export const extractCommand = (transcript) => {
  const lowerTranscript = transcript.toLowerCase();
  
  for (const [command, pattern] of Object.entries(commandPatterns)) {
    if (pattern.test(lowerTranscript)) {
      return command;
    }
  }
  
  return null;
};

// Extract fruit name from transcript
export const extractFruitName = (transcript) => {
  const fruitPatterns = [
    /(apple|banana|orange|mango|grape|strawberry|watermelon|pineapple|peach|pear|kiwi|lemon|lime|coconut|avocado|blueberry|raspberry|blackberry|cranberry|cherry|plum|apricot|fig|date|pomegranate|papaya|guava|lychee|dragon fruit|passion fruit)/i,
    /(fruit is|identify (?:a|an) )(\w+)/i,
    /(this is a|that is a|it's a) (\w+)/i,
  ];
  
  for (const pattern of fruitPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      // Return the captured fruit name or the match itself
      const fruit = match[1] || match[0];
      return fruit.toLowerCase();
    }
  }
  
  return null;
};

// Get confidence level of recognition
export const getConfidenceLevel = (confidence) => {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
};

// Supported languages for speech recognition
export const supportedLanguages = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'ko-KR', name: 'Korean (Korea)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian (Russia)' },
];

// Get browser's default language for speech recognition
export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const supported = supportedLanguages.find(lang => lang.code === browserLang);
  return supported ? browserLang : 'en-US';
};

// Check if specific language is supported
export const isLanguageSupported = (langCode) => {
  return supportedLanguages.some(lang => lang.code === langCode);
};