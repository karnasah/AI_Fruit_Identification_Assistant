import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVoice } from '../../hooks/useVoice';
import { useStore } from '../../store';
import Button from '../common/Button';

const VoiceSettings = () => {
  const { 
    isVoiceSupported, 
    availableVoices, 
    getBrowserVoices,
    speak,
    isSpeaking,
    stopSpeaking
  } = useVoice();
  
  const { preferences, setPreference, showToast } = useStore();
  
  const [settings, setSettings] = useState({
    voiceInput: true,
    voiceOutput: false,
    voiceLanguage: 'en-US',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    autoSpeakResults: false,
    voiceCommandFeedback: true,
  });
  
  const [testText, setTestText] = useState('Hello! I am your Fruit AI Assistant.');
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Load settings from preferences
  useEffect(() => {
    setSettings({
      voiceInput: preferences?.voiceInput !== false,
      voiceOutput: preferences?.voiceOutput || false,
      voiceLanguage: preferences?.voiceLanguage || 'en-US',
      voiceSpeed: preferences?.voiceSpeed || 1.0,
      voicePitch: preferences?.voicePitch || 1.0,
      autoSpeakResults: preferences?.autoSpeakResults || false,
      voiceCommandFeedback: preferences?.voiceCommandFeedback !== false,
    });
  }, [preferences]);

  // Load available voices
  useEffect(() => {
    if (isVoiceSupported) {
      getBrowserVoices();
    }
  }, [isVoiceSupported]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setPreference(key, value);
  };

  const handleTestSpeech = async () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    
    const options = {
      speed: settings.voiceSpeed,
      pitch: settings.voicePitch,
      language: settings.voiceLanguage,
      voice: selectedVoice,
    };
    
    await speak(testText, options);
  };

  const handleStop = () => {
    stopSpeaking();
  };

  const languageOptions = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  ];

  if (!isVoiceSupported) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🎤</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Voice Not Supported
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your browser does not support voice features. Please try using Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>🎤</span> Voice Settings
      </h2>

      <div className="space-y-6">
        {/* Enable/Disable Voice Features */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Voice Features</h3>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700 dark:text-gray-300">Enable Voice Input</span>
              <p className="text-xs text-gray-500">Use microphone for voice commands and search</p>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceInput}
              onChange={(e) => handleChange('voiceInput', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700 dark:text-gray-300">Enable Voice Output</span>
              <p className="text-xs text-gray-500">System will speak responses and results</p>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceOutput}
              onChange={(e) => handleChange('voiceOutput', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700 dark:text-gray-300">Auto-speak Identification Results</span>
              <p className="text-xs text-gray-500">Automatically read out fruit identification results</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSpeakResults}
              onChange={(e) => handleChange('autoSpeakResults', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-700 dark:text-gray-300">Voice Command Feedback</span>
              <p className="text-xs text-gray-500">Get audio confirmation when voice commands are recognized</p>
            </div>
            <input
              type="checkbox"
              checked={settings.voiceCommandFeedback}
              onChange={(e) => handleChange('voiceCommandFeedback', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Voice Language
          </label>
          <select
            value={settings.voiceLanguage}
            onChange={(e) => handleChange('voiceLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Selection */}
        {availableVoices.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice Type
            </label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = availableVoices.find(v => v.name === e.target.value);
                setSelectedVoice(voice);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Default Voice</option>
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Speed Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Speech Speed: {settings.voiceSpeed}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voiceSpeed}
            onChange={(e) => handleChange('voiceSpeed', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Pitch Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Voice Pitch: {settings.voicePitch}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voicePitch}
            onChange={(e) => handleChange('voicePitch', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Low</span>
            <span>Normal</span>
            <span>High</span>
          </div>
        </div>

        {/* Test Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Test Voice</h3>
          
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            rows={2}
          />
          
          <div className="flex gap-3">
            <Button onClick={handleTestSpeech} disabled={isSpeaking}>
              {isSpeaking ? 'Speaking...' : '🔊 Test Speech'}
            </Button>
            {isSpeaking && (
              <Button variant="outline" onClick={handleStop}>
                Stop
              </Button>
            )}
          </div>
        </div>

        {/* Voice Commands List */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Voice Commands</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600 dark:text-gray-400">"Identify [fruit]"</div>
            <div className="text-gray-500">Identify a specific fruit</div>
            <div className="text-gray-600 dark:text-gray-400">"What is this?"</div>
            <div className="text-gray-500">Identify from camera</div>
            <div className="text-gray-600 dark:text-gray-400">"Go to dashboard"</div>
            <div className="text-gray-500">Navigate to dashboard</div>
            <div className="text-gray-600 dark:text-gray-400">"Open encyclopedia"</div>
            <div className="text-gray-500">Open fruit encyclopedia</div>
            <div className="text-gray-600 dark:text-gray-400">"Search for [fruit]"</div>
            <div className="text-gray-500">Search for a fruit</div>
            <div className="text-gray-600 dark:text-gray-400">"Help"</div>
            <div className="text-gray-500">Show voice commands</div>
            <div className="text-gray-600 dark:text-gray-400">"Stop"</div>
            <div className="text-gray-500">Stop voice output</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;