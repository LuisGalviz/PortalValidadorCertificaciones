import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { useSidebar } from '@/hooks';
import { ProfileNames } from '@portal/shared';
import { LogOut, Menu, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const { toggleMobile } = useSidebar();

  return (
    <header className="flex h-14 xl:h-16 2xl:h-18 items-center justify-between border-b bg-white px-4 lg:px-6 xl:px-8 2xl:px-10">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleMobile}
          className="flex lg:hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-base lg:text-lg xl:text-xl font-semibold text-slate-900 border-l lg:border-l-0 pl-4 lg:pl-0">
          Portal Validador de Certificaciones
        </h2>
      </div>
      <div className="flex items-center gap-3 xl:gap-4 2xl:gap-6">
        <div className="hidden sm:flex items-center gap-2 xl:gap-3 text-sm xl:text-base text-slate-600">
          <User className="h-4 w-4 xl:h-5 xl:w-5" />
          <span>{user?.name}</span>
          {user?.permission && (
            <span className="rounded-full bg-slate-100 px-2 xl:px-3 py-0.5 xl:py-1 text-xs xl:text-sm">
              {ProfileNames[user.permission] || user.permission}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
}
