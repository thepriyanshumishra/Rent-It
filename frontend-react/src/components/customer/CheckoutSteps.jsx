import React from 'react';
import { Check } from 'lucide-react';

const CheckoutSteps = ({ currentStep = 1, steps = [] }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Mobile: Show only current step */}
        <div className="md:hidden w-full text-center font-medium text-accent">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.label}
        </div>

        {/* Desktop: Show full tracker */}
        <div className="hidden md:flex items-center justify-between w-full relative z-10">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-subtle -z-10" />
          
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const isUpcoming = stepNum > currentStep;
            
            return (
              <div key={stepNum} className="flex flex-col items-center gap-2 bg-bg px-2">
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${isCompleted ? 'bg-accent text-white border-2 border-accent' : ''}
                    ${isCurrent ? 'bg-bg text-accent border-2 border-accent' : ''}
                    ${isUpcoming ? 'bg-bg text-muted border-2 border-subtle' : ''}
                  `}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span 
                  className={`
                    text-xs font-medium 
                    ${isCompleted || isCurrent ? 'text-text' : 'text-muted'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
