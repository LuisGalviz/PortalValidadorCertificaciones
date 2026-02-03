import { PageContainer, usePageHeader } from '@/components/layout';
import { OiasTable } from '@/components/tables/OiasTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/features/auth';
import { OiaStatusCode, Permissions, hasPermission } from '@portal/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: String(OiaStatusCode.Pending), label: 'Pendientes' },
  { value: String(OiaStatusCode.Approved), label: 'Aprobados' },
  { value: String(OiaStatusCode.Rejected), label: 'Rechazados' },
  { value: String(OiaStatusCode.Suspended), label: 'Suspendidos' },
  { value: String(OiaStatusCode.Expired), label: 'Vencidos' },
];

export function OiasListPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  usePageHeader({
    title: 'OIAs',
    subtitle: 'Organismos de Inspección Acreditados',
  });

  const canCreate = hasPermission(user?.permission ?? null, Permissions.OIAS_CREATE);
  const canEdit = hasPermission(user?.permission ?? null, Permissions.OIAS_UPDATE);
  const canInspectors = hasPermission(user?.permission ?? null, Permissions.INSPECTORS_READ);
  const canUsers = hasPermission(user?.permission ?? null, Permissions.OIAS_READ);

  return (
    <PageContainer className="min-w-0" fullHeight={true}>
      <div className="min-w-0 flex flex-col flex-1 min-h-0 space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base lg:text-lg xl:text-xl font-semibold text-slate-900">
            Lista de OIAs
          </h2>
          <div className="flex items-center gap-3 xl:gap-4 flex-wrap w-full sm:w-auto">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 lg:w-64 xl:w-72 xl:h-10"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36 lg:w-40 xl:w-48 xl:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canCreate && (
              <Button asChild className="w-full sm:w-auto xl:h-10 xl:px-4">
                <Link to="/oias/new">
                  <Plus className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
                  Nuevo OIA
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 min-h-0">
          <OiasTable
            search={search}
            status={statusFilter === 'all' ? undefined : Number(statusFilter)}
            canEdit={canEdit}
            canInspectors={canInspectors}
            canUsers={canUsers}
          />
        </div>
      </div>
    </PageContainer>
  );
}
