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
    <div className="space-y-4 lg:space-y-6 xl:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900">OIAs</h1>
          <p className="text-sm lg:text-base xl:text-lg text-slate-600">
            Organismos de Inspección Acreditados
          </p>
        </div>
        {canCreate && (
          <Button asChild className="xl:h-11 xl:px-6 xl:text-base">
            <Link to="/oias/new">
              <Plus className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
              Nuevo OIA
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg xl:text-xl">Lista de OIAs</CardTitle>
            <div className="flex items-center gap-3 xl:gap-4">
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 lg:w-64 xl:w-72 xl:h-10"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 lg:w-40 xl:w-48 xl:h-10">
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
