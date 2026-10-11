import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useFruitIdentification } from '../hooks/useFruitIdentification';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import ImageUploader from '../components/identification/ImageUploader';
import CameraCapture from '../components/identification/CameraCapture';
import IdentificationResult from '../components/identification/IdentificationResult';
import TopPredictions from '../components/identification/TopPredictions';
import LoadingSpinner from '../components/common/LoadingSpinner';

const IdentificationPage = () => {
  const { identificationResult, isIdentifying, identificationError, clearIdentificationResult } = useStore();
  const { identifyFruit, identifyFruitFromBase64 } = useFruitIdentification();
  
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'camera'
  const [selectedImage, setSelectedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Clear result when component unmounts or new identification starts
  useEffect(() => {
    return () => {
      clearIdentificationResult();
    };
  }, [clearIdentificationResult]);

  const handleImageSelect = async (file) => {
    if (!file) {
      setSelectedImage(null);
      setShowResult(false);
      clearIdentificationResult();
      return;
    }

    setSelectedImage(URL.createObjectURL(file));
    setShowResult(false);
    
    const result = await identifyFruit(file);
    if (result.success) {
      setShowResult(true);
    }
  };

  const handleCameraCapture = async (imageData) => {
    if (!imageData) {
      setCapturedImage(null);
      return;
    }

    console.debug('[camera] frame captured', { bytes: imageData.length });
    setCapturedImage(imageData);
    setShowResult(false);

    const result = await identifyFruitFromBase64(imageData);
    if (result.success) {
      console.debug('[camera] identification completed');
      setShowResult(true);
    }
  };

  const handleNewIdentification = () => {
    setSelectedImage(null);
    setCapturedImage(null);
    setShowResult(false);
    clearIdentificationResult();
  };

  const tabs = [
    { id: 'upload', label: 'Upload Image', icon: '📤' },
    { id: 'camera', label: 'Live Camera', icon: '📷' },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Identify Fruit
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-gray-400"
            >
              Upload a photo or use your camera to identify any fruit instantly
            </motion.p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-soft">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedImage(null);
                    setCapturedImage(null);
                    setShowResult(false);
                    clearIdentificationResult();
                  }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Input Area */}
            <div className="lg:col-span-2">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
              >
                {activeTab === 'upload' && (
                  <ImageUploader
                    onImageSelect={handleImageSelect}
                    selectedImage={selectedImage}
                    isIdentifying={isIdentifying}
                  />
                )}
                
                {activeTab === 'camera' && (
                  <CameraCapture
                    onCapture={handleCameraCapture}
                    capturedImage={capturedImage}
                    isIdentifying={isIdentifying}
                  />
                )}

                {/* Loading State */}
                {isIdentifying && (
                  <div className="mt-6 flex justify-center">
                    <LoadingSpinner text="Analyzing fruit image..." />
                  </div>
                )}

                {/* Error State */}
                {identificationError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-center"
                  >
                    <span className="text-2xl mr-2">⚠️</span>
                    {identificationError}
                    <button
                      onClick={handleNewIdentification}
                      className="ml-3 text-sm underline hover:no-underline"
                    >
                      Try again
                    </button>
                  </motion.div>
                )}

                {/* New Identification Button */}
                {(selectedImage || capturedImage) && !isIdentifying && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={handleNewIdentification}
                      className="gap-2"
                    >
                      <span>🔄</span>
                      New Identification
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Results Area */}
            <div className="lg:col-span-1">
              <AnimatePresence mode="wait">
                {showResult && identificationResult && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <IdentificationResult result={identificationResult} />
                    <TopPredictions predictions={identificationResult.topPredictions} />
                  </motion.div>
                )}
                
                {!showResult && !isIdentifying && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center"
                  >
                    <div className="text-6xl mb-4">🍎</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to Identify
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {activeTab === 'upload' 
                        ? 'Upload an image of a fruit to get started'
                        : 'Point your camera at a fruit and click capture'}
                    </p>
                    <div className="mt-4 flex justify-center gap-2 text-xs text-gray-400">
                      <span>🍎 Apple</span>
                      <span>🍌 Banana</span>
                      <span>🍊 Orange</span>
                      <span>🥝 Kiwi</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>💡</span> Tips for Best Results
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex gap-3">
                <span className="text-2xl">📸</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Good Lighting</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Use natural light or bright indoor lighting</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Clear Focus</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Make sure the fruit is in sharp focus</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🍎</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Single Fruit</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Focus on one fruit at a time for best accuracy</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default IdentificationPage;