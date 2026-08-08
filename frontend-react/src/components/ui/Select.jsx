import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({
  label,
  options = [],
  error,
  hint,
  id,
  className = '',
  ...rest
}, ref) => {
  const selectId = id || React.useId();

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={`input-base appearance-none pr-10 ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-text-muted">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
