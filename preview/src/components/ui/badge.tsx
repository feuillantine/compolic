import type React from 'react';
import { cn } from '@/lib/utils';

export const Badge: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs',
      className,
    )}
  >
    {children}
  </span>
);
