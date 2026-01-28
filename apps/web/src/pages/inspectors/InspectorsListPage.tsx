import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InspectorsTable } from '@/components/tables/InspectorsTable';
import { useAuth } from '@/features/auth';
import { Profile, InspectorStatusCode } from '@portal/shared';

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: String(InspectorStatusCode.Pending), label: 'Pendientes' },
  { value: String(InspectorStatusCode.Approved), label: 'Aprobados' },
  { value: String(InspectorStatusCode.Rejected), label: 'Rechazados' },
  { value: String(InspectorStatusCode.Suspended), label: 'Suspendidos' },
  { value: String(InspectorStatusCode.Expired), label: 'Vencidos' },
];

export function InspectorsListPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const canCreate =
    user?.permission === Profile.Admin || user?.permission === Profile.Oia;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inspectores</h1>
          <p className="text-slate-600">Gestión de inspectores certificados</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/inspectors/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Inspector
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Inspectores</CardTitle>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
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
        <CardContent>
          <InspectorsTable
            search={search}
            status={statusFilter === 'all' ? undefined : Number(statusFilter)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
