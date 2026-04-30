'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils/helpers';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  leftIcon?: React.ReactElement | undefined;
  rightIcon?: React.ReactElement | undefined;
  onRightIconClick?: (() => void) | undefined;
  // Support both react-hook-form's onChange and our custom string-based onChange
  onChange?: React.ChangeEventHandler<HTMLInputElement> | ((value: string) => void) | undefined;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      onChange,
      id,
      required,
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    // Use React's useId for stable IDs across server and client
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (!onChange) return;
      
      // Check if onChange is a react-hook-form ChangeHandler (expects event)
      // or our custom string-based handler
      if (typeof onChange === 'function') {
        // react-hook-form handlers have a length of 1 and expect an event
        // Custom handlers have length > 1 or we can check the first parameter name
        const funcStr = onChange.toString();
        const expectsEvent = funcStr.includes('event') || funcStr.includes('e.target') || onChange.length === 1;
        
        if (expectsEvent) {
          // It's a react-hook-form handler expecting the full event
          (onChange as React.ChangeEventHandler<HTMLInputElement>)(e);
        } else {
          // It's our custom string-based handler
          (onChange as (value: string) => void)(e.target.value);
        }
      }
    };

    return (
      <div className="w-full" suppressHydrationWarning>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            suppressHydrationWarning
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative" suppressHydrationWarning>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            onChange={onChange ? handleChange : undefined}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              'w-full px-4 py-3 bg-white dark:bg-dark-200 border rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-700',
              className
            )}
            suppressHydrationWarning
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {onRightIconClick ? (
                <button
                  type="button"
                  onClick={onRightIconClick}
                  className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                  disabled={disabled}
                  tabIndex={-1}
                  suppressHydrationWarning
                >
                  {rightIcon}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-red-500"
            suppressHydrationWarning
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
            suppressHydrationWarning
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };