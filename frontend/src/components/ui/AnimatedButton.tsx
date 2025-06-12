import React from 'react';
import {motion} from 'framer-motion';
import { cn } from '../../utils/cn';
import LoadingSpinner from './LoadingSpinner';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-gradient text-white shadow-lg hover:shadow-xl focus:ring-primary-500',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 focus:ring-white/50',
    ghost: 'text-white hover:bg-white/10 focus:ring-white/50',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'text-sm px-4 py-2',
    md: 'text-base px-6 py-3',
    lg: 'text-lg px-8 py-4',
  };

  return (
    <motion.button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default AnimatedButton;