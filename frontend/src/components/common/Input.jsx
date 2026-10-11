import React, { useState } from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error = '',
  icon = null,
  rightElement = null,
  className = '',
  inputClassName = '',
  labelClassName = '',
  size = 'md',
  fullWidth = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine input type (for password toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Size styles
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Error styles
  const errorStyles = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500';

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`${widthStyles} ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">{icon}</span>
          </div>
        )}

        {/* Input Field */}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={`
            ${sizes[size]}
            ${widthStyles}
            ${errorStyles}
            ${icon ? 'pl-10' : 'pl-3'}
            ${rightElement || type === 'password' ? 'pr-10' : 'pr-3'}
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            rounded-lg
            border
            transition-all
            duration-200
            focus:outline-none
            focus:ring-2
            disabled:bg-gray-100 dark:disabled:bg-gray-900
            disabled:cursor-not-allowed
            ${inputClassName}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}

        {/* Right Element */}
        {rightElement && !(type === 'password') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}

      {/* Hint/Helper Text */}
      {props.hint && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{props.hint}</p>
      )}
    </div>
  );
};

export default Input;