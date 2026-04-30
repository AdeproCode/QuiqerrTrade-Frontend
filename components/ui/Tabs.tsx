'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/helpers';

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ElementType | undefined;
  disabled?: boolean | undefined;
  badge?: string | number | undefined;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline' | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  fullWidth?: boolean | undefined;
  className?: string | undefined;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  value,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
}) => {
  const variantClasses: Record<NonNullable<TabsProps['variant']>, string> = {
    default: 'bg-gray-100 dark:bg-dark-300 p-1 rounded-xl',
    pills: 'gap-2',
    underline: 'border-b border-gray-200 dark:border-gray-700',
  };

  const getTabClassName = (item: TabItem, isActive: boolean): string => {
    const baseClasses = cn(
      'relative flex items-center justify-center gap-2 font-medium transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      fullWidth && 'flex-1'
    );

    const sizeClasses: Record<NonNullable<TabsProps['size']>, string> = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-xl',
    };

    if (variant === 'pills') {
      return cn(
        baseClasses,
        sizeClasses[size],
        isActive
          ? 'bg-primary-500 text-white shadow-lg'
          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-400'
      );
    }

    if (variant === 'underline') {
      return cn(
        baseClasses,
        'px-4 py-2 rounded-none border-b-2 -mb-px',
        isActive
          ? 'border-primary-500 text-primary-500'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      );
    }

    return cn(
      baseClasses,
      sizeClasses[size],
      isActive
        ? 'bg-white dark:bg-dark-200 text-gray-900 dark:text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    );
  };

  return (
    <div className={cn(variantClasses[variant], fullWidth && 'flex', className)}>
      {items.map((item) => {
        const isActive = value === item.value;
        const Icon = item.icon;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => !item.disabled && onChange(item.value)}
            disabled={item.disabled}
            className={getTabClassName(item, isActive)}
            aria-selected={isActive}
            role="tab"
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className={cn(
                'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}>
                {item.badge}
              </span>
            )}
            {isActive && variant === 'default' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-dark-200 rounded-lg shadow-sm"
                style={{ zIndex: -1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

Tabs.displayName = 'Tabs';

export { Tabs };