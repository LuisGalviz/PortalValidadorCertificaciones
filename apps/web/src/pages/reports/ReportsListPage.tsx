import { PageContainer, usePageHeader } from '@/components/layout';
import { ReportsTable } from '@/components/tables/ReportsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/features/auth';
import { Permissions, StatusCode, hasPermission } from '@portal/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: String(StatusCode.Pending), label: 'Pendientes' },
  { value: String(StatusCode.Approved), label: 'Aprobados' },
  { value: String(StatusCode.Rejected), label: 'Rechazados' },
  { value: String(StatusCode.Inconsistent), label: 'Inconsistentes' },
];

export function ReportsListPage() {
  usePageHeader({
    title: 'Reportes',
    subtitle: 'Gestión de reportes de certificación',
  });

  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const canCreateReport = hasPermission(user?.permission ?? null, Permissions.REPORTS_CREATE);

  const status = statusFilter === 'all' ? undefined : Number(statusFilter);

  return (
    <PageContainer className="space-y-4 lg:space-y-6 xl:space-y-8 min-w-0">
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base lg:text-lg xl:text-xl">Lista de Reportes</CardTitle>
            <div className="flex items-center gap-3 xl:gap-4 flex-wrap w-full sm:w-auto">
              <div className="flex items-center gap-2 xl:gap-3">
                <span className="text-sm xl:text-base text-slate-600">Estado:</span>
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
              {canCreateReport && (
                <Button asChild className="w-full sm:w-auto xl:h-10 xl:px-4">
                  <Link to="/reports/new">
                    <Plus className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
                    Nuevo Reporte
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <ReportsTable status={status} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
