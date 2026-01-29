import { PageContainer } from '@/components/layout';
import { PendingReportsTable } from '@/components/tables/PendingReportsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
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
    <PageContainer className="space-y-4 lg:space-y-6 xl:space-y-8 min-w-0" fullHeight={true}>
      <div className="min-w-0">
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 truncate">
          Dashboard
        </h1>
        <p className="text-sm lg:text-base xl:text-lg text-slate-600 truncate">
          Resumen de reportes de certificación
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 lg:gap-4 xl:gap-6 md:grid-cols-2 lg:grid-cols-4 min-w-0">
        {statCards.map((stat) => (
          <Card key={stat.title} className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2 xl:pb-3 space-x-2">
              <CardTitle className="text-sm xl:text-base font-medium text-slate-600 truncate">
                {stat.title}
              </CardTitle>
              <div className={cn('rounded-full p-2 xl:p-3 flex-shrink-0', stat.bgColor)}>
                <stat.icon className={cn('h-4 w-4 xl:h-5 xl:w-5', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl xl:text-3xl 2xl:text-4xl font-bold truncate">
                {statsLoading ? '...' : stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Reports Table */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg xl:text-xl">Reportes Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <PendingReportsTable limit={10} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
