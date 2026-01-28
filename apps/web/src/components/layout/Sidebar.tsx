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
    <div className="flex h-full w-64 flex-col bg-slate-900">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold text-white">Portal Validador</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700 p-4">
        <Link
          to="/settings"
          className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-white" />
          Configuración
        </Link>
      </div>
    </div>
  );
}
