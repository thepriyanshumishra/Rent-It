import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  hint,
  id,
  className = '',
  ...rest
}, ref) => {
  const inputId = id || React.useId();

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`input-base ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
        {...rest}
      />
      {error && (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-text-muted">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
