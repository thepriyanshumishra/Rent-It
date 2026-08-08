import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
}) => {
  const baseClasses = hover ? 'card-hover' : 'card';
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${baseClasses} ${paddings[padding]} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
