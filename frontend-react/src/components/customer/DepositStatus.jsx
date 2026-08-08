import React from 'react';
import Badge from '../ui/Badge';
import PriceDisplay from '../ui/PriceDisplay';

const DepositStatus = ({ deposit, lateFee = 0 }) => {
  if (!deposit) return null;

  const { amount, status, refund_amount } = deposit;

  const getStatusVariant = (status) => {
    switch(status?.toLowerCase()) {
      case 'refunded': return 'success';
      case 'held': return 'warning';
      case 'forfeited': return 'danger';
      case 'partially refunded': return 'accent';
      default: return 'subtle';
    }
  };

  return (
    <div className="bg-subtle border border-border rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-text text-sm uppercase tracking-wider">Security Deposit</h4>
        <Badge variant={getStatusVariant(status)}>{status}</Badge>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted">Original Deposit</span>
          <PriceDisplay amount={amount} className="font-medium text-text" />
        </div>
        
        {lateFee > 0 && (
          <div className="flex justify-between items-center text-danger">
            <span>Late Fee</span>
            <span>-<PriceDisplay amount={lateFee} /></span>
          </div>
        )}

        {(status === 'refunded' || status === 'partially refunded') && refund_amount !== undefined && (
          <div className="flex justify-between items-center text-success border-t border-border pt-3 mt-3">
            <span className="font-medium">Refund Amount</span>
            <PriceDisplay amount={refund_amount} className="font-semibold" />
          </div>
        )}
        
        {status === 'held' && (
          <div className="flex justify-between items-center border-t border-border pt-3 mt-3">
            <span className="text-muted text-xs">Awaiting return & inspection</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositStatus;
