import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  icon,
  action,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footer,
  hoverable = true,
  onClick,
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-xl 
        overflow-hidden
        transition-all duration-300
        ${hoverable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : 'shadow-soft'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      {(title || subtitle || icon || action) && (
        <div
          className={`
            px-5 py-4 
            border-b border-gray-100 dark:border-gray-700
            flex items-center justify-between
            ${headerClassName}
          `}
        >
          <div className="flex items-center gap-3">
            {icon && <div className="text-2xl">{icon}</div>}
            <div>
              {title && (
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Body */}
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

// Stat Card Component
export const StatCard = ({ title, value, icon, trend, color = 'primary', onClick }) => {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  };

  return (
    <Card
      className="text-center"
      hoverable={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// Fruit Card Component
export const FruitCard = ({ fruit, onClick }) => {
  return (
    <Card
      className="text-center"
      hoverable
      onClick={() => onClick && onClick(fruit)}
    >
      <div className="text-5xl mb-3">{fruit.emoji || '🍎'}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white">
        {fruit.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {fruit.category}
      </p>
      {fruit.confidence && (
        <div className="mt-2">
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
            {Math.round(fruit.confidence * 100)}% match
          </span>
        </div>
      )}
    </Card>
  );
};

export default Card;