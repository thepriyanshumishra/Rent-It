import React from 'react';
import Timeline from '../ui/Timeline';

const RentalTimeline = ({ rental }) => {
  if (!rental || !rental.status_history) return null;

  // Expected statuses in order
  const lifecycle = [
    { key: 'booked', label: 'Booked', desc: 'Order confirmed' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Preparing item' },
    { key: 'delivery', label: 'Pickup/Delivery', desc: 'Item handed over' },
    { key: 'active', label: 'Active', desc: 'Currently rented' },
    { key: 'return_due', label: 'Return Due', desc: 'Time to return' },
    { key: 'returned', label: 'Returned', desc: 'Item returned' },
    { key: 'inspected', label: 'Inspected', desc: 'Condition checked' },
    { key: 'settled', label: 'Deposit Settled', desc: 'Refund processed' }
  ];

  const currentStatusIndex = lifecycle.findIndex(s => s.key === rental.status);
  
  const timelineItems = lifecycle.map((step, index) => {
    // Find if this step is in history
    const historyItem = rental.status_history.find(h => h.status === step.key);
    
    const isCompleted = index < currentStatusIndex || historyItem;
    const isCurrent = index === currentStatusIndex;
    const isFuture = !isCompleted && !isCurrent;

    return {
      title: step.label,
      description: step.desc,
      timestamp: historyItem?.timestamp || null,
      status: isCompleted ? 'completed' : isCurrent ? 'current' : 'future'
    };
  });

  return (
    <div className="bg-elevated border border-subtle rounded-2xl p-6">
      <h3 className="font-semibold text-lg text-text mb-6">Rental Lifecycle</h3>
      <Timeline items={timelineItems} />
    </div>
  );
};

export default RentalTimeline;
