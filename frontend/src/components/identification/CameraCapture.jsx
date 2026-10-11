import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCamera } from '../../hooks/useCamera';
import Button from '../common/Button';

const CameraCapture = ({ onCapture, capturedImage, isIdentifying }) => {
  const { 
    isCameraActive, 
    isCameraLoading, 
    cameraError, 
    startCamera, 
    stopCamera, 
    captureImage,
    videoRef,
    availableDevices,
    switchCamera
  } = useCamera();

  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    const imageData = await captureImage();
    if (imageData && onCapture) {
      onCapture(imageData);
    }
  };

  const handleSwitchCamera = async () => {
    setIsFlipping(true);
    await switchCamera();
    setTimeout(() => setIsFlipping(false), 500);
  };

  const handleRetry = () => {
    startCamera();
  };

  if (cameraError) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">📷</div>
        <p className="text-red-500 mb-3">{cameraError}</p>
        <p className="text-sm text-gray-500 mb-4">
          Please check your camera permissions and try again.
        </p>
        <Button onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (isCameraLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loader"></div>
        <p className="ml-3 text-gray-500">Starting camera...</p>
      </div>
    );
  }

  if (!capturedImage) {
    return (
      <div className="space-y-4">
        {/* Camera Preview */}
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Camera Controls Overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={handleCapture}
              disabled={!isCameraActive}
              className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-full bg-red-500 border-2 border-white"></div>
            </button>
          </div>

          {/* Switch Camera Button */}
          {availableDevices.length > 1 && (
            <button
              onClick={handleSwitchCamera}
              disabled={isFlipping}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              🔄
            </button>
          )}

          {/* Loading Overlay */}
          {isFlipping && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="loader-sm"></div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          Point your camera at a fruit and click the capture button
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="space-y-4"
      >
        {/* Captured Image Preview */}
        <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-auto rounded-xl"
          />
          {!isIdentifying && (
            <button
              onClick={() => onCapture(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
            >
              ✕
            </button>
          )}
        </div>

        {/* Retake Button */}
        {!isIdentifying && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => onCapture(null)}>
              📸 Take New Photo
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraCapture;