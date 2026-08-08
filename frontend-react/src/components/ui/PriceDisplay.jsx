import React from 'react';

const PriceDisplay = ({ amount, currency = '₹', period = null, size = 'md', highlight = false, strikethrough = false }) => {
  const sizes = {
    sm: { amount: 'text-sm', currency: 'text-xs' },
    md: { amount: 'text-lg', currency: 'text-sm' },
    lg: { amount: 'text-3xl', currency: 'text-xl' },
  };

  const colorClass = strikethrough ? 'text-text-muted line-through' : highlight ? 'text-accent' : 'text-text';

  const formattedAmount = Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });

  return (
    <div className="inline-flex items-baseline gap-1">
      <span className={`${sizes[size].currency} font-medium ${colorClass} opacity-80`}>
        {currency}
      </span>
      <span className={`${sizes[size].amount} font-bold ${colorClass}`}>
        {formattedAmount}
      </span>
      {period && (
        <span className="text-sm text-text-muted ml-1 font-normal">
          / {period}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
