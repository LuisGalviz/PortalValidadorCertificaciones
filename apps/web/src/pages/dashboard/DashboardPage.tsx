import { PendingReportsTable } from '@/components/tables/PendingReportsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { ReportStats } from '@portal/shared';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, FileText, XCircle } from 'lucide-react';

interface DashboardStats {
  success: boolean;
  data: ReportStats;
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
  });

  const statCards = [
    {
      title: 'Pendientes',
      value: stats?.data?.pending || 0,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Aprobados',
      value: stats?.data?.approved || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Rechazados',
      value: stats?.data?.rejected || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Inconsistentes',
      value: stats?.data?.inconsistent || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6 xl:space-y-8">
      <div>
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm lg:text-base xl:text-lg text-slate-600">
          Resumen de reportes de certificación
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 lg:gap-4 xl:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 xl:pb-3">
              <CardTitle className="text-sm xl:text-base font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 xl:p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 xl:h-5 xl:w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl xl:text-3xl 2xl:text-4xl font-bold">
                {statsLoading ? '...' : stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg xl:text-xl">Reportes Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <PendingReportsTable limit={10} />
        </CardContent>
      </Card>
    </div>
  );
}
