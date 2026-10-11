import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUploader = ({ onImageSelect, selectedImage, isIdentifying }) => {
  const [preview, setPreview] = useState(selectedImage || null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError('File is too large. Max size is 10MB.');
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Invalid file type. Please upload JPEG, PNG, or WEBP image.');
      } else {
        setError('Please upload a valid image file.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setError(null);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    onImageSelect(null);
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
            }
            ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl">
              {isDragActive ? '📸' : '📤'}
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-400">
              <span>JPEG</span>
              <span>•</span>
              <span>PNG</span>
              <span>•</span>
              <span>WEBP</span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-xl shadow-lg"
            />
            {!isIdentifying && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                aria-label="Clear image"
              >
                ✕
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;