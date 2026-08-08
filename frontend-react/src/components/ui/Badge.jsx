import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium';
  
  const variants = {
    default: 'badge-default',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    active: 'badge-success',
    overdue: 'badge-danger',
    pending: 'badge-warning',
    completed: 'badge-info',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  const dotColors = {
    default: 'bg-text-muted',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    active: 'bg-success',
    overdue: 'bg-danger',
    pending: 'bg-warning',
    completed: 'bg-info',
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={`${baseClasses} ${selectedVariant} ${sizes[size]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant] || dotColors.default}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
