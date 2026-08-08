import React from 'react';

const StatusIndicator = ({ status, label, size = 'md' }) => {
  const normalizedStatus = status?.toLowerCase() || 'draft';
  
  const statusColors = {
    active: 'bg-success',
    available: 'bg-success',
    completed: 'bg-success',
    confirmed: 'bg-success',
    
    pending: 'bg-info',
    reserved: 'bg-info',
    scheduled: 'bg-info',
    
    overdue: 'bg-danger',
    damaged: 'bg-danger',
    failed: 'bg-danger',
    
    cancelled: 'bg-text-muted',
    retired: 'bg-text-muted',
    
    warning: 'bg-warning',
    under_repair: 'bg-warning',
    
    draft: 'bg-text-muted',
  };

  const sizes = {
    sm: 'w-1.5 h-1.5 text-xs',
    md: 'w-2 h-2 text-sm',
  };

  const colorClass = statusColors[normalizedStatus] || statusColors.draft;
  const [dotSize, textSize] = sizes[size].split(' text-');

  return (
    <div className="flex items-center gap-2">
      <span className={`${dotSize} rounded-full ${colorClass} shrink-0`} />
      <span className={`text-${textSize} text-text-muted capitalize`}>
        {label || status.replace('_', ' ')}
      </span>
    </div>
  );
};

export default StatusIndicator;
