import React from 'react';
import Loader from './Loader';

const LoadingSpinner = ({ size = 'md', fullScreen = false, className = '' }) => {
  return (
    <Loader 
      size={size}
      fullScreen={fullScreen}
      className={`animate-spin ${className}`}
    />
  );
};

export default LoadingSpinner;
