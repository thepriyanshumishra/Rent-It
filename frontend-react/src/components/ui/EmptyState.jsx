import React from 'react';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in Icon)) {
      return <Icon className="w-10 h-10 stroke-[1.5]" />;
    }
    return Icon;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[260px]">
      <div className="text-[var(--text-muted)] mb-3 opacity-60 flex items-center justify-center">
        {renderIcon()}
      </div>
      <h3 className="text-base font-bold text-[var(--text)] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 font-medium leading-relaxed">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
