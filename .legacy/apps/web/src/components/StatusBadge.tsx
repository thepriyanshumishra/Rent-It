import React from 'react';

export type StatusType =
  | 'DRAFT'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'OVERDUE'
  | 'RETURNED'
  | 'UNDER_INSPECTION'
  | 'PENDING_SETTLEMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'UNDER_REPAIR'
  | 'UNAVAILABLE';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'CONFIRMED':
    case 'SCHEDULED':
      badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'ACTIVE':
    case 'RENTED':
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'OVERDUE':
    case 'DAMAGED':
      badgeStyle = 'bg-red-50 text-red-700 border-red-200 font-semibold animate-pulse';
      label = '⚠ ' + label;
      break;
    case 'RETURNED':
    case 'UNDER_INSPECTION':
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'PENDING_SETTLEMENT':
      badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200 font-medium';
      break;
    case 'COMPLETED':
    case 'AVAILABLE':
    case 'OK':
      badgeStyle = 'bg-green-50 text-green-700 border-green-200';
      break;
    case 'CANCELLED':
    case 'UNAVAILABLE':
      badgeStyle = 'bg-slate-100 text-slate-500 border-slate-200 line-through';
      break;
    case 'UNDER_REPAIR':
      badgeStyle = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      {label}
    </span>
  );
};
