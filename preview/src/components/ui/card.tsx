import type React from 'react';
import { cn } from '@/lib/utils';

export const Card: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => (
  <div className={cn('bg-card border border-border rounded-lg', className)} {...props} />
);

export const CardHeader: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => (
  <div className={cn('p-4 border-b border-border', className)} {...props} />
);

export const CardContent: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => (
  <div className={cn('p-4', className)} {...props} />
);
