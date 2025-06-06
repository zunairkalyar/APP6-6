
import React from 'react';
import { cn } from '../../lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  className,
  labelClassName,
  containerClassName,
  ...props
}) => {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn("flex items-center", containerClassName)}>
      <input
        id={checkboxId}
        type="checkbox"
        className={cn(
          "h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-0",
          props.disabled ? "cursor-not-allowed opacity-50" : "",
          className
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            "ml-2 block text-sm text-gray-700",
            props.disabled ? "cursor-not-allowed opacity-75" : "",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
