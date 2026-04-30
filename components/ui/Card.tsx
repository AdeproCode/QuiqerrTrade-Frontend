import React from 'react';
import { cn } from '@/lib/utils/helpers';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow' | 'outline' | undefined;
  padding?: 'none' | 'sm' | 'md' | 'lg' | undefined;
  hoverable?: boolean | undefined;
  clickable?: boolean | undefined;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
      default: 'bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700',
      glass: 'bg-white/10 backdrop-blur-lg border border-white/20',
      glow: 'relative overflow-hidden bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary-500/0 before:to-accent-500/0 hover:before:from-primary-500/10 hover:before:to-accent-500/10 before:transition-all before:duration-300',
      outline: 'border-2 border-gray-200 dark:border-gray-700 bg-transparent',
    };

    const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-7',
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (onClick) {
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-200',
          variantClasses[variant],
          paddingClasses[padding],
          hoverable && 'hover:shadow-xl hover:-translate-y-1',
          clickable && 'cursor-pointer',
          className
        )}
        onClick={clickable ? onClick : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? handleKeyDown : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// ============================================
// CARD HEADER
// ============================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string | undefined;
  subtitle?: string | undefined;
  action?: React.ReactNode | undefined;
  icon?: React.ElementType | undefined;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  title,
  subtitle,
  action,
  icon: Icon,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-start justify-between mb-4', className)}
      {...props}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary-500" />}
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

// ============================================
// CARD CONTENT
// ============================================

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string | undefined;
  children?: React.ReactNode | undefined;
}

const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

CardContent.displayName = 'CardContent';

// ============================================
// CARD FOOTER
// ============================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string | undefined;
  children?: React.ReactNode | undefined;
}

const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };