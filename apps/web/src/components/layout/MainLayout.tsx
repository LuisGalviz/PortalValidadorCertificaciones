import { useSidebar } from '@/hooks';
import { cn } from '@/lib/utils';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { PageHeaderProvider } from './PageHeaderContext';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const { state, isMobileOpen, closeMobile } = useSidebar();

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      <div
        className={cn(
          'hidden lg:flex flex-col border-r bg-slate-900 transition-all duration-300 ease-in-out flex-shrink-0',
          state === 'expanded' ? 'w-64 xl:w-72 2xl:w-80' : 'w-20'
        )}
      >
        <Sidebar />
      </div>
      {/* Mobile Drawer remains as is, but ensuring sidebar inside is correct */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ease-in-out',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div
          className={cn(
            'fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out',
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeMobile}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              closeMobile();
            }
          }}
          tabIndex={0}
          role="button"
        />
        <div
          className={cn(
            'relative flex w-full max-w-xs flex-col bg-slate-900 transition-transform duration-300 ease-in-out flex-shrink-0',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar />
        </div>
      </div>

      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <PageHeaderProvider>
          <Header />
          <main className="flex-1 overflow-auto min-h-0 flex flex-col">
            <Outlet />
          </main>
        </PageHeaderProvider>
      </div>
    </div>
  );
}
