import * as React from 'react';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: 'h-4 w-4 border-[1.5px]',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[2.5px]',
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeMap;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-spin rounded-full border-border border-t-accent',
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
);
Spinner.displayName = 'Spinner';

export { Spinner };
