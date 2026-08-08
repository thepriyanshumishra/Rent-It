import React from 'react';
import Input from './Input';

const DatePicker = React.forwardRef((props, ref) => {
  // Use a customized type="date" input with our Input wrapper
  return (
    <Input
      type="date"
      ref={ref}
      {...props}
      className={`[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert ${props.className || ''}`}
    />
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
