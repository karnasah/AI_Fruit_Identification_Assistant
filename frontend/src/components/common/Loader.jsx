import React from 'react';

const Loader = ({ 
  size = 'md', 
  fullScreen = false, 
  text = 'Loading...',
  variant = 'primary'
}) => {
  // Size variants
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  };

  // Color variants
  const colors = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
  };

  // Spinner component
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizes[size]} 
          ${colors[variant]}
          rounded-full 
          animate-spin
        `}
      />
      {text && (
        <p className={`text-gray-500 dark:text-gray-400 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          {text}
        </p>
      )}
    </div>
  );

  // Full screen loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

// Skeleton Loader Component
export const Skeleton = ({ type = 'text', className = '' }) => {
  const skeletons = {
    text: 'h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
    title: 'h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
    card: 'h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse',
    avatar: 'w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse',
    button: 'h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse',
    image: 'w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse',
  };

  return <div className={`${skeletons[type] || skeletons.text} ${className}`} />;
};

// Card Skeleton
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-soft">
    <Skeleton type="image" className="h-40 mb-4" />
    <Skeleton type="title" className="w-3/4 mb-2" />
    <Skeleton type="text" className="w-full mb-1" />
    <Skeleton type="text" className="w-2/3" />
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }) => (
  <div className="flex gap-4 py-3">
    {Array(columns).fill(0).map((_, i) => (
      <Skeleton key={i} type="text" className="flex-1" />
    ))}
  </div>
);

// Page Skeleton
export const PageSkeleton = () => (
  <div className="container-custom py-8">
    <Skeleton type="title" className="w-64 mb-4" />
    <Skeleton type="text" className="w-full mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Button Loader (inline)
export const ButtonLoader = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default Loader;