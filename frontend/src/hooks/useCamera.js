import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for camera functionality
 * Provides access to device camera for capturing images
 */
export const useCamera = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Get available camera devices
  const getAvailableDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
      return videoDevices;
    } catch (error) {
      console.error('Error getting devices:', error);
      setCameraError('Failed to get camera devices');
      return [];
    }
  }, [selectedDevice]);

  // Start camera stream
  const startCamera = useCallback(async (deviceId = null) => {
    setIsCameraLoading(true);
    setCameraError(null);
    
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser or requires HTTPS/localhost');
      }

      // Stop any existing stream
      if (stream) {
        stopCamera();
      }
      
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setIsCameraActive(true);
      setIsCameraLoading(false);
      console.debug('[camera] stream started', {
        deviceId: deviceId || 'default',
        videoWidth: videoRef.current?.videoWidth,
        videoHeight: videoRef.current?.videoHeight,
      });
      
      // Get available devices if not already
      if (availableDevices.length === 0) {
        await getAvailableDevices();
      }
      
      return true;
    } catch (error) {
      console.error('[camera] stream start failed', {
        name: error.name,
        message: error.message,
      });
      const messages = {
        NotAllowedError: 'Camera permission was denied. Allow camera access in the browser and retry.',
        NotFoundError: 'No camera was found on this device.',
        NotReadableError: 'The camera is already in use by another application.',
        SecurityError: 'Camera access is blocked. Use HTTPS or localhost.',
      };
      setCameraError(messages[error.name] || error.message || 'Failed to start camera');
      setIsCameraActive(false);
      setIsCameraLoading(false);
      return false;
    }
  }, [stream, availableDevices, getAvailableDevices]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, [stream]);

  // Capture image from camera
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !isCameraActive) {
      setCameraError('Camera is not active');
      return null;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      console.debug('[camera] image encoded', {
        width: canvas.width,
        height: canvas.height,
        bytes: imageData.length,
      });
      return imageData;
    } catch (error) {
      console.error('Error capturing image:', error);
      setCameraError('Failed to capture image');
      return null;
    }
  }, [isCameraActive]);

  // Capture image and return as blob
  const captureImageAsBlob = useCallback(async () => {
    if (!videoRef.current || !isCameraActive) {
      setCameraError('Camera is not active');
      return null;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    } catch (error) {
      console.error('Error capturing image:', error);
      setCameraError('Failed to capture image');
      return null;
    }
  }, [isCameraActive]);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    if (availableDevices.length <= 1) {
      setCameraError('No other camera device available');
      return false;
    }
    
    const currentIndex = availableDevices.findIndex(d => d.deviceId === selectedDevice);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDevice = availableDevices[nextIndex];
    
    setSelectedDevice(nextDevice.deviceId);
    return await startCamera(nextDevice.deviceId);
  }, [availableDevices, selectedDevice, startCamera]);

  // Check if camera is supported
  const isCameraSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  // Request camera permission
  const requestPermission = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser or requires HTTPS/localhost');
      }
      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true });
      permissionStream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.error('[camera] permission request failed', {
        name: error.name,
        message: error.message,
      });
      setCameraError('Camera permission denied or unavailable');
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stopCamera();
      }
    };
  }, [stream, stopCamera]);

  return {
    // State
    isCameraActive,
    isCameraLoading,
    cameraError,
    availableDevices,
    selectedDevice,
    videoRef,
    canvasRef,
    
    // Methods
    startCamera,
    stopCamera,
    captureImage,
    captureImageAsBlob,
    switchCamera,
    getAvailableDevices,
    isCameraSupported,
    requestPermission,
  };
};

export default useCamera;