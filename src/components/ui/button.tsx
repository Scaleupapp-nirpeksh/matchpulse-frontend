'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-lg font-medium text-sm',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/50',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white shadow-sm shadow-accent/25 hover:bg-accent/90 active:bg-accent/85 active:shadow-none',
        primary:
          'bg-accent text-white shadow-sm shadow-accent/25 hover:bg-accent/90 active:bg-accent/85 active:shadow-none',
        secondary:
          'bg-surface border border-border text-text-primary shadow-sm hover:bg-surface/80 hover:border-border-active active:bg-surface/60',
        outline:
          'border border-border text-text-primary bg-transparent hover:bg-surface hover:border-border-active active:bg-surface/80',
        ghost:
          'text-text-secondary hover:text-text-primary hover:bg-surface active:bg-surface/80',
        danger:
          'bg-danger text-white shadow-sm shadow-danger/25 hover:bg-danger/90 active:bg-danger/85 active:shadow-none',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, asChild, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classes, (children as React.ReactElement<any>).props.className),
        ref,
        ...props,
      });
    }

    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
