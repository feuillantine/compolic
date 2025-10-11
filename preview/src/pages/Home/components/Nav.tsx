import type * as React from 'react';
import { cn } from '@/lib/utils';

export const Nav: React.FC<React.ComponentProps<'nav'>> = ({ className, ...props }) => (
  <nav
    className={cn('bg-card border overflow-hidden border-border rounded-lg p-1', className)}
    {...props}
  >
    <div className="max-h-[calc(100vh-32px)] overflow-auto p-1">{props.children}</div>
  </nav>
);
