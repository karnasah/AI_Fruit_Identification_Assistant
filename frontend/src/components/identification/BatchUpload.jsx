import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';

const BatchUpload = ({ onUpload, isIdentifying }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const newErrors = rejectedFiles.map(rej => ({
        name: rej.file.name,
        error: rej.errors[0].message
      }));
      setErrors(prev => [...prev, ...newErrors]);
    }

    // Add accepted files
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    files.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
    setErrors([]);
    setUploadProgress({});
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file.file);
    });

    // Simulate upload progress
    files.forEach(file => {
      setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
    });

    // Simulate progress updates
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        let allComplete = true;
        Object.keys(newProgress).forEach(key => {
          if (newProgress[key] < 100) {
            newProgress[key] = Math.min(newProgress[key] + 10, 100);
            allComplete = false;
          }
        });
        if (allComplete) clearInterval(interval);
        return newProgress;
      });
    }, 300);

    setTimeout(() => {
      if (onUpload) {
        onUpload(formData);
      }
      clearInterval(interval);
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">{isDragActive ? '📂' : '📤'}</span>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {isDragActive ? 'Drop images here' : 'Drag & drop multiple images'}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Supports JPG, PNG, WEBP (Max 10MB each)
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
          <ul className="text-xs text-red-500 space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err.name}: {err.error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={clearAllFiles}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                {/* Preview */}
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  
                  {/* Progress Bar */}
                  {uploadProgress[file.id] !== undefined && (
                    <div className="mt-1">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${uploadProgress[file.id]}%` }}
                        />
                      </div>
                      <p className="text-xs text-primary-500 mt-0.5">
                        {uploadProgress[file.id]}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                {!uploadProgress[file.id] && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isIdentifying || files.length === 0}
            fullWidth
            className="mt-3"
          >
            {isIdentifying ? 'Uploading...' : `Upload ${files.length} Image${files.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BatchUpload;