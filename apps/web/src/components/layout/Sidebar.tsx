import { useAuth } from '@/features/auth';
import { useSidebar } from '@/hooks';
import { cn } from '@/lib/utils';
import { Permissions, Profile, hasPermission } from '@portal/shared';
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: Permissions.DASHBOARD_READ,
  },
  { name: 'Reportes', href: '/reports', icon: FileText, permission: Permissions.REPORTS_READ },
  { name: 'Mi Empresa', href: '/my-oia', icon: Briefcase, permission: Permissions.OIAS_READ_OWN },
  { name: 'OIAs', href: '/oias', icon: Building2, permission: Permissions.OIAS_READ },
  {
    name: 'Inspectores',
    href: '/inspectors',
    icon: UserCheck,
    permission: Permissions.INSPECTORS_READ,
  },
  {
    name: 'Firmas Instaladoras',
    href: '/construction-companies',
    icon: Users,
    permission: Permissions.COMPANIES_READ,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { state, toggle, closeMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const filteredNavigation = navigation.filter((item) => {
    if (item.permission === Permissions.OIAS_READ_OWN && user?.permission !== Profile.Oia) {
      return false;
    }

    return hasPermission(user?.permission ?? null, item.permission);
  });

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div
        className={cn(
          'flex h-16 xl:h-20 items-center border-b border-slate-800 transition-all duration-300',
          isCollapsed ? 'justify-center px-0' : 'justify-between px-4 xl:px-6'
        )}
      >
        {!isCollapsed && (
          <h1 className="truncate text-lg xl:text-xl font-bold text-white">Portal Validador</h1>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={closeMobile}
            className="flex lg:hidden rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={toggle}
            className="hidden lg:flex rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => closeMobile()}
              className={cn(
                'group flex items-center rounded-lg transition-all duration-200',
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 xl:py-3',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 xl:h-6 xl:w-6 flex-shrink-0 transition-colors',
                  isActive ? 'text-white' : 'group-hover:text-white'
                )}
              />
              {!isCollapsed && (
                <span className="ml-3 truncate text-sm xl:text-base font-medium transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3 space-y-1">
        <Link
          to="/settings"
          onClick={() => closeMobile()}
          className={cn(
            'group flex items-center rounded-lg transition-all duration-200',
            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 xl:py-3',
            location.pathname === '/settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}
          title={isCollapsed ? 'Configuración' : undefined}
        >
          <Settings
            className={cn(
              'h-5 w-5 xl:h-6 xl:w-6 flex-shrink-0 transition-colors',
              location.pathname === '/settings' ? 'text-white' : 'group-hover:text-white'
            )}
          />
          {!isCollapsed && (
            <span className="ml-3 truncate text-sm xl:text-base font-medium">Configuración</span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => {
            logout();
            closeMobile();
          }}
          className={cn(
            'flex lg:hidden w-full items-center rounded-lg p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3 text-sm font-medium">Salir</span>}
        </button>
      </div>
    </div>
  );
}
