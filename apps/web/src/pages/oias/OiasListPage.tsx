import { OiasTable } from '@/components/tables/OiasTable';
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
import { OiaStatusCode, Profile } from '@portal/shared';
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

  const canCreate = user?.permission === Profile.Admin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">OIAs</h1>
          <p className="text-slate-600">Organismos de Inspección Acreditados</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link to="/oias/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo OIA
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de OIAs</CardTitle>
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
          <OiasTable
            search={search}
            status={statusFilter === 'all' ? undefined : Number(statusFilter)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
