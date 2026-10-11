import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = ({
  trigger,
  items,
  placement = 'bottom-start',
  onSelect,
  className = '',
  menuClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
    'left-start': 'right-full top-0 mr-1',
    'right-start': 'left-full top-0 ml-1',
  };

  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
  };

  // Clone trigger with onClick handler
  const TriggerElement = React.cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e) => {
      setIsOpen(!isOpen);
      if (trigger.props.onClick) trigger.props.onClick(e);
    },
  });

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {TriggerElement}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${placementClasses[placement]} ${menuClassName}`}
          >
            {items.map((item, index) => (
              <button
                key={item.value || index}
                onClick={() => handleSelect(item)}
                className={`
                  w-full flex items-center gap-2 px-4 py-2 text-sm text-left
                  transition-colors duration-150
                  ${item.disabled 
                    ? 'opacity-50 cursor-not-allowed text-gray-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                  ${item.danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
                `}
                disabled={item.disabled}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-xs text-gray-400">{item.shortcut}</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Dropdown Divider
export const DropdownDivider = () => (
  <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
);

// Dropdown Header
export const DropdownHeader = ({ children }) => (
  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
    {children}
  </div>
);

export default Dropdown;