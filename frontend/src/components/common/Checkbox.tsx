import React, { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
          {label && (
            <label className="mr-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 text-right">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
