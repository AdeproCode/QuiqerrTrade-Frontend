import React from 'react';
import { cn } from '@/lib/utils/helpers';

export interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabel = false,
  labelPosition = 'outside',
  size = 'md',
  color = 'from-primary-500 to-accent-500',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses: Record<NonNullable<ProgressBarProps['size']>, string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && labelPosition === 'outside' && (
        <div className="flex justify-between text-xs mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={cn(
        'relative w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        sizeClasses[size],
        className
      )}>
        <div
          className={cn(
            'absolute top-0 left-0 h-full bg-gradient-to-r rounded-full transition-all duration-300',
            color
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && labelPosition === 'inside' && (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export { ProgressBar };