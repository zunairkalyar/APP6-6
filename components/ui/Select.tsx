import React from 'react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  containerClassName?: string;
  placeholder?: string; // Added placeholder to props
}

const Select: React.FC<SelectProps> = ({ 
  className, 
  label, 
  id, 
  options, 
  error, 
  containerClassName, 
  placeholder, // Destructured placeholder
  ...otherProps // 나머지 props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm',
          error ? 'border-danger focus:ring-danger focus:border-danger' : 'focus:ring-primary focus:border-primary',
          otherProps.disabled ? 'bg-gray-100 cursor-not-allowed' : '',
          className
        )}
        {...otherProps} // Spread otherProps here
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Select;