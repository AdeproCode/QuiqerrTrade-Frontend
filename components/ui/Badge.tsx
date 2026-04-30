import React from 'react';
import { cn } from '@/lib/utils/helpers';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
        primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
        outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300',
        glass: 'bg-white/20 backdrop-blur-sm text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  removable?: boolean;
  onRemove?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  icon,
  iconPosition = 'left',
  removable = false,
  onRemove,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-1">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !removable && (
        <span className="ml-1">{icon}</span>
      )}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-75 transition-opacity"
          aria-label="Remove"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

Badge.displayName = 'Badge';

export { Badge, badgeVariants };