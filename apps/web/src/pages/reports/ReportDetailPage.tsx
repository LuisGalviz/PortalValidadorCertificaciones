import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { dismissLoading, showError, showLoading, showSuccess } from '@/lib/toast';
import { ReportStatusText, StatusCode } from '@portal/shared';
import type { ReportDetail } from '@portal/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, FileText, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ReportDetailResponse {
  success: boolean;
  data: ReportDetail;
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api.get<ReportDetailResponse>(`/reports/${id}`),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: (reviewData: { status: number; comment?: string }) =>
      api.post(`/reports/${id}/review`, reviewData),
    onMutate: () => {
      return showLoading('Procesando revisión...');
    },
    onSuccess: (_data, variables, toastId) => {
      dismissLoading(toastId as string | number);
      const isApproved = variables.status === StatusCode.Approved;
      showSuccess(
        isApproved ? 'Reporte aprobado' : 'Reporte rechazado',
        `El reporte #${id} ha sido ${isApproved ? 'aprobado' : 'rechazado'} correctamente`
      );
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
    },
    onError: (error: Error, _variables, toastId) => {
      dismissLoading(toastId as string | number);
      showError('Error al procesar la revisión', error.message);
    },
  });

  const report = data?.data;

  const getStatusBadge = (status: number) => {
    let variant: 'default' | 'success' | 'destructive' | 'warning' | 'secondary' = 'default';
    switch (status) {
      case StatusCode.Approved:
        variant = 'success';
        break;
      case StatusCode.Rejected:
        variant = 'destructive';
        break;
      case StatusCode.Pending:
        variant = 'warning';
        break;
      case StatusCode.Inconsistent:
        variant = 'secondary';
        break;
    }
    return <Badge variant={variant}>{ReportStatusText[status] || 'Desconocido'}</Badge>;
  };

  const canReview = report?.status === StatusCode.Pending;

  const handleApprove = () => {
    reviewMutation.mutate({ status: StatusCode.Approved });
  };

  const handleReject = () => {
    reviewMutation.mutate({ status: StatusCode.Rejected, comment: 'Rechazado por el validador' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error al cargar el reporte</p>
        <Button variant="outline" onClick={() => navigate('/reports')} className="mt-4">
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Reporte #{report.id}</h1>
          <p className="text-slate-600">Detalle del reporte de certificación</p>
        </div>
        {getStatusBadge(report.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Orden Externa</p>
                <p className="font-medium">{report.orderExternal || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Certificado</p>
                <p className="font-medium">{report.certificate || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Suscripción</p>
                <p className="font-medium">{report.subscriptionId || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Dirección</p>
                <p className="font-medium">{report.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Ubicación</p>
                <p className="font-medium">{report.location || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Departamento</p>
                <p className="font-medium">{report.department || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Inspección */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Inspección</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Tipo de Inspección</p>
                <p className="font-medium">{report.inspectionTypeName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Resultado</p>
                <p className="font-medium">{report.inspectionResultName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Fecha de Inspección</p>
                <p className="font-medium">
                  {report.inspectionDate
                    ? new Date(report.inspectionDate).toLocaleDateString('es-CO')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">OIA</p>
                <p className="font-medium">{report.oiaName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Inspector</p>
                <p className="font-medium">{report.inspectorName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Firma Instaladora</p>
                <p className="font-medium">{report.constructionCompanyName || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comentarios */}
        {report.comment && (
          <Card>
            <CardHeader>
              <CardTitle>Comentarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{report.comment}</p>
            </CardContent>
          </Card>
        )}

        {/* Archivos */}
        {report.files && report.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Archivos Adjuntos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.files.map((file) => (
                  <li key={file.id} className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <a
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {file.name}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Acciones de Revisión */}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones de Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleApprove}
                disabled={reviewMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar
              </Button>
              <Button
                onClick={handleReject}
                disabled={reviewMutation.isPending}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
