'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const sportColorMap: Record<string, string> = {
  cricket: 'bg-sport-cricket/10 text-sport-cricket border-sport-cricket/20',
  football: 'bg-sport-football/10 text-sport-football border-sport-football/20',
  'basketball-5v5': 'bg-sport-basketball-5v5/10 text-sport-basketball-5v5 border-sport-basketball-5v5/20',
  'basketball-3x3': 'bg-sport-basketball-3x3/10 text-sport-basketball-3x3 border-sport-basketball-3x3/20',
  volleyball: 'bg-sport-volleyball/10 text-sport-volleyball border-sport-volleyball/20',
  tennis: 'bg-sport-tennis/10 text-sport-tennis border-sport-tennis/20',
  'table-tennis': 'bg-sport-table-tennis/10 text-sport-table-tennis border-sport-table-tennis/20',
  badminton: 'bg-sport-badminton/10 text-sport-badminton border-sport-badminton/20',
  squash: 'bg-sport-squash/10 text-sport-squash border-sport-squash/20',
};

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface border-border text-text-secondary',
        accent: 'bg-accent-light text-accent border-accent/20',
        danger: 'bg-danger-light text-danger border-danger/20',
        warning: 'bg-warning-light text-warning border-warning/20',
        orange: 'bg-orange-light text-orange border-orange/20',
        purple: 'bg-purple-light text-purple border-purple/20',
        cyan: 'bg-cyan-light text-cyan border-cyan/20',
        live: 'bg-danger-light text-danger border-danger/20',
        outline: 'bg-transparent border-border text-text-secondary',
        sport: 'border',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] leading-tight',
        md: 'px-2.5 py-0.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  sportType?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, sportType, children, ...props }, ref) => {
    const sportClasses = variant === 'sport' && sportType
      ? sportColorMap[sportType] || 'bg-surface border-border text-text-secondary'
      : undefined;

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          sportClasses,
          className
        )}
        {...props}
      >
        {variant === 'live' && (
          <span className="relative mr-1.5 flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
          </span>
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants, sportColorMap };
