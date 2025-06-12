import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
};

export default Card;