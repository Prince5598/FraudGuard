import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

interface Option {
  value: string;
  label: string;
}

interface AnimatedSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  forceFloatLabel?: boolean;
}

const AnimatedSelect: React.FC<AnimatedSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  icon,
  placeholder = "Select an option",
  className = '',
  forceFloatLabel = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  const hasValue = value !== '' && value !== null && value !== undefined;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setIsFocused(false);
  };

  // Label should float if there's a value, focused, or forced
  const shouldFloatLabel = forceFloatLabel || isFocused || hasValue;

  return (
    <div className={cn("relative mb-6", className)}>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
            {icon}
          </div>
        )}
        
        <button
          type="button"
          className={cn(
            'w-full bg-white/5 border border-white/20 rounded-xl px-4 pt-8 pb-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 flex items-center justify-between',
            icon && 'pl-12',
            error && 'border-red-500 focus:ring-red-500',
            isOpen && 'ring-2 ring-primary-500 border-primary-500'
          )}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsFocused(!isOpen);
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsOpen(false);
              setIsFocused(false);
            }, 150);
          }}
        >
          <span className={cn(
            "transition-all duration-200",
            !hasValue && "text-white/40"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="h-5 w-5 text-white/60" />
          </motion.div>
        </button>

        <motion.label
          className={cn(
            'absolute left-4 text-white/60 pointer-events-none transition-all duration-300',
            icon && 'left-12'
          )}
          animate={{
            top: shouldFloatLabel ? '10px' : '50%',
            fontSize: shouldFloatLabel ? '12px' : '16px',
            transform: shouldFloatLabel ? 'translateY(0)' : 'translateY(-50%)',
            color: isFocused ? '#0ea5e9' : error ? '#ef4444' : 'rgba(255, 255, 255, 0.6)',
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 z-[99999] mt-2 bg-dark-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-200 flex items-center justify-between",
                    value === option.value && "bg-primary-500/20 text-primary-300"
                  )}
                  onClick={() => handleSelect(option.value)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1, delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <CheckIcon className="h-4 w-4 text-primary-400" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          className="text-red-400 text-sm mt-3 ml-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedSelect;