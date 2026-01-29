import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';
import { Profile } from '@portal/shared';
import { Building2, FileText, LayoutDashboard, Settings, UserCheck, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reportes', href: '/reports', icon: FileText },
  { name: 'OIAs', href: '/oias', icon: Building2, roles: [Profile.Admin, Profile.Strategy] },
  { name: 'Inspectores', href: '/inspectors', icon: UserCheck },
  {
    name: 'Firmas Instaladoras',
    href: '/construction-companies',
    icon: Users,
    roles: [Profile.Admin, Profile.Strategy],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    if (user?.permission === Profile.Admin) return true;
    return user?.permission ? item.roles.some((role) => role === user.permission) : false;
  });

  return (
    <div className="flex h-full w-60 xl:w-64 2xl:w-72 flex-col bg-slate-900">
      <div className="flex h-16 xl:h-18 2xl:h-20 items-center px-4 xl:px-5 2xl:px-6">
        <h1 className="text-lg xl:text-xl 2xl:text-2xl font-bold text-white">Portal Validador</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 xl:px-3 2xl:px-4 py-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 xl:px-3 py-2 xl:py-2.5 2xl:py-3 text-sm xl:text-base font-medium',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 flex-shrink-0',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700 p-4 xl:p-5">
        <Link
          to="/settings"
          className="group flex items-center rounded-md px-2 xl:px-3 py-2 xl:py-2.5 2xl:py-3 text-sm xl:text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Settings className="mr-3 h-5 w-5 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 text-slate-400 group-hover:text-white" />
          Configuración
        </Link>
      </div>
    </div>
  );
}
