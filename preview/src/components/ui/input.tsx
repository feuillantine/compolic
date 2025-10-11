import * as React from 'react';
import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-border bg-card px-3 text-sm',
        'outline-none ring-ring focus:ring',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
