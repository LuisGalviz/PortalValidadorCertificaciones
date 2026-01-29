import { cn } from '@/lib/utils';
import type React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  fullHeight?: boolean;
}

export function PageContainer({
  children,
  className,
  scrollable = false,
  fullHeight = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col w-full max-w-full min-w-0',
        fullHeight ? 'flex-1 min-h-0' : '',
        scrollable ? 'overflow-y-auto' : '',
        'overflow-x-hidden',
        'p-4 lg:p-6 xl:p-8 2xl:p-10',
        className
      )}
    >
      <div className={cn('min-w-0 w-full flex flex-col', fullHeight ? 'flex-1 min-h-0' : '')}>
        {children}
      </div>
    </div>
  );
}
