import { cn } from '@/lib/utils';
import type React from 'react';

interface TableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function TableWrapper({ children, className }: TableWrapperProps) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-slate-200', className)}>
      <div className="min-w-full inline-block align-middle">{children}</div>
    </div>
  );
}
