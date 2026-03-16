'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: {
    dot: 'h-2 w-2',
    ring: 'h-2 w-2',
    text: 'text-[10px]',
    gap: 'gap-1.5',
  },
  md: {
    dot: 'h-2.5 w-2.5',
    ring: 'h-2.5 w-2.5',
    text: 'text-xs',
    gap: 'gap-2',
  },
  lg: {
    dot: 'h-3 w-3',
    ring: 'h-3 w-3',
    text: 'text-sm',
    gap: 'gap-2',
  },
};

export interface LiveIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const LiveIndicator = React.forwardRef<HTMLDivElement, LiveIndicatorProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const s = sizeMap[size];

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center', s.gap, className)}
        {...props}
      >
        <span className="relative flex">
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full bg-danger opacity-75 animate-ping',
              s.ring
            )}
          />
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full bg-danger opacity-50 animate-ping animation-delay-150',
              s.ring
            )}
          />
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full bg-danger opacity-25 animate-ping animation-delay-300',
              s.ring
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full bg-danger',
              s.dot
            )}
          />
        </span>
        <span className={cn('font-bold text-danger uppercase tracking-wider', s.text)}>
          LIVE
        </span>
      </div>
    );
  }
);
LiveIndicator.displayName = 'LiveIndicator';

export { LiveIndicator };
