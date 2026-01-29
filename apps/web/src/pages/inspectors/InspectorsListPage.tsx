import { InspectorsTable } from '@/components/tables/InspectorsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/features/auth';
import { InspectorStatusCode, Profile } from '@portal/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: String(InspectorStatusCode.Pending), label: 'Pendientes' },
  { value: String(InspectorStatusCode.Approved), label: 'Aprobados' },
  { value: String(InspectorStatusCode.Rejected), label: 'Rechazados' },
  { value: String(InspectorStatusCode.Suspended), label: 'Suspendidos' },
  { value: String(InspectorStatusCode.Expired), label: 'Vencidos' },
];

import { PageContainer } from '@/components/layout';

export function InspectorsListPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const canCreate = user?.permission === Profile.Admin || user?.permission === Profile.Oia;

  return (
    <PageContainer className="space-y-4 lg:space-y-6 xl:space-y-8 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 truncate">
            Inspectores
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-slate-600 truncate">
            Gestión de inspectores certificados
          </p>
        </div>
        {canCreate && (
          <Button asChild className="xl:h-11 xl:px-6 xl:text-base flex-shrink-0">
            <Link to="/inspectors/new">
              <Plus className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
              Nuevo Inspector
            </Link>
          </Button>
        )}
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base lg:text-lg xl:text-xl">Lista de Inspectores</CardTitle>
            <div className="flex items-center gap-3 xl:gap-4 flex-wrap">
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <InspectorsTable
            search={search}
            status={statusFilter === 'all' ? undefined : Number(statusFilter)}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
