import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border mb-4">
        <Icon className="h-6 w-6 text-text-tertiary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-xs mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
