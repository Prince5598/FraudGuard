import React, { useState, forwardRef ,useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  forceFloatLabel?: boolean;
}

const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, icon, className = '', onChange, onBlur,forceFloatLabel = false, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    useEffect(() => {
    const checkValue = () => {
      const inputValue = props.value || props.defaultValue || '';
      const hasInputValue = inputValue !== '' && inputValue !== null && inputValue !== undefined;
      
      // Special handling for number inputs with value 0
      const isNumberWithZero = props.type === 'number' && (inputValue === 0 || inputValue === '0');
      
      setHasValue(hasInputValue || isNumberWithZero);
    };

    checkValue();
  }, [props.value, props.defaultValue, props.type]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const inputValue = e.target.value;
    const hasInputValue = inputValue !== '' && inputValue !== null && inputValue !== undefined;
    const isNumberWithZero = props.type === 'number' && (inputValue === 0 || inputValue === '0');
    setHasValue(hasInputValue || isNumberWithZero);
  };
    const shouldFloatLabel = 
    forceFloatLabel || 
    isFocused || 
    hasValue || 
    props.type === 'date' || 
    props.type === 'datetime-local' || 
    props.type === 'time' ||
    props.type === 'month' ||
    props.type === 'week';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
            const hasInputValue = inputValue !== '' && inputValue !== null && inputValue !== undefined;
            const isNumberWithZero = props.type === 'number' && (inputValue === 0 || inputValue === '0');
            setHasValue(hasInputValue || isNumberWithZero);
          
      onChange?.(e); // forward onChange
    };
    

    return (
      <div className="relative mb-6">
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            {...props}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={cn(
               'w-full bg-white/5 border border-white/20 rounded-xl px-4 pt-8 pb-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300',
              icon && 'pl-12',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
          />
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
  }
);

AnimatedInput.displayName = 'AnimatedInput'; // 👈 important for debugging

export default AnimatedInput; // ✅ default export
