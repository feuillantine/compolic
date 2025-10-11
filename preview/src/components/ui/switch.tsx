import * as React from 'react';
import { cn } from '@/lib/utils';

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & { id?: string };

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, ...props }, ref) => {
    const trackOn = 'bg-primary';
    const trackOff = 'bg-secondary';
    const knobOn = 'left-4';
    const knobOff = 'left-0.5';
    return (
      <label className={cn('inline-flex items-center gap-2 cursor-pointer select-none', className)}>
        <input ref={ref} type="checkbox" className="sr-only" checked={checked} {...props} />
        <span
          className={cn(
            'w-10 h-6 rounded-full relative transition-colors',
            checked ? trackOn : trackOff,
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-all',
              checked ? knobOn : knobOff,
            )}
          />
        </span>
      </label>
    );
  },
);
Switch.displayName = 'Switch';
