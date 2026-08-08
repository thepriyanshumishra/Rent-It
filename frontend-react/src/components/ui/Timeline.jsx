import React from 'react';

const Timeline = ({ steps = [] }) => {
  return (
    <div className="relative border-l border-border ml-3 my-4 space-y-6">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        let dotColor = 'bg-bg-subtle border-border';
        if (step.status === 'complete') dotColor = 'bg-accent border-accent';
        if (step.status === 'current') dotColor = 'bg-bg border-accent animate-pulse';
        if (step.status === 'failed') dotColor = 'bg-danger border-danger';

        return (
          <div key={step.id || index} className="relative pl-6">
            <span 
              className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${dotColor}`} 
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${step.status === 'upcoming' ? 'text-text-muted' : 'text-text'}`}>
                  {step.label}
                </h4>
                {step.timestamp && (
                  <time className="text-xs text-text-muted">{step.timestamp}</time>
                )}
              </div>
              {step.description && (
                <p className="text-sm text-text-muted">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
