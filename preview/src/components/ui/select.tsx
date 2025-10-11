import * as React from 'react';
import { cn } from '@/lib/utils';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-9 px-3 rounded-md border border-border bg-card text-sm appearance-none',
        'bg-no-repeat bg-[length:12px_8px] pr-8',
        'bg-[right_10px_center]',
        'outline-none ring-ring focus:ring',
        className,
      )}
      style={{
        backgroundImage:
          'url(\'data:image/svg+xml;utf8, %3Csvg xmlns="http://www.w3.org/2000/svg" width="12" height="8"%3E%3Cpolygon points="0,0 12,0 6,8" fill="%23999"/%3E%3C/svg%3E\')',
      }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
