'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils/helpers';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  options: SelectOption[];
  placeholder?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder,
      onChange,
      id,
      required,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id ?? `select-${generatedId}`;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full" suppressHydrationWarning>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            suppressHydrationWarning
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative" suppressHydrationWarning>
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={onChange ? handleChange : undefined}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
            }
            className={cn(
              'w-full px-4 py-3 bg-white dark:bg-dark-200 border rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'appearance-none cursor-pointer',
              !value && 'text-gray-400 dark:text-gray-500',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-700',
              className
            )}
            suppressHydrationWarning
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-500" suppressHydrationWarning>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${selectId}-hint`} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400" suppressHydrationWarning>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };