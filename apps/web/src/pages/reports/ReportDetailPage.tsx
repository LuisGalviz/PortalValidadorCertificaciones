import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { dismissLoading, showError, showLoading, showSuccess } from '@/lib/toast';
import { ReportStatusText, StatusCode } from '@portal/shared';
import type { Causal, CheckListItem, ReportDetail } from '@portal/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface ReportDetailResponse {
  success: boolean;
  data: ReportDetail;
}

interface CausalsResponse {
  success: boolean;
  data: Causal[];
}

type CheckAnswer = 'yes' | 'no' | null;

function initializeAnswers(checkList?: CheckListItem[]): Record<number, CheckAnswer> {
  if (!checkList) return {};
  const answers: Record<number, CheckAnswer> = {};
  for (const item of checkList) {
    if (item.review != null) {
      answers[item.id] = item.review ? 'yes' : 'no';
    }
  }
  return answers;
}

function getPdfUrl(files?: ReportDetail['files']): string | null {
  if (!files || files.length === 0) return null;
  const pdf = files.find(
    (f) => f.type?.toLowerCase() === 'application/pdf' || f.name?.toLowerCase().endsWith('.pdf')
  );
  return pdf?.path || files[0]?.path || null;
}

function getStatusBadge(status: number) {
  const variantMap: Record<number, 'success' | 'destructive' | 'warning' | 'secondary'> = {
    [StatusCode.Approved]: 'success',
    [StatusCode.Rejected]: 'destructive',
    [StatusCode.Pending]: 'warning',
    [StatusCode.Inconsistent]: 'secondary',
  };
  return (
    <Badge variant={variantMap[status] || 'default'}>
      {ReportStatusText[status] || 'Desconocido'}
    </Badge>
  );
}

function useReportReview(id: string | undefined, report: ReportDetail | undefined) {
  const queryClient = useQueryClient();
  const [checkAnswers, setCheckAnswers] = useState<Record<number, CheckAnswer>>({});
  const [selectedCausal, setSelectedCausal] = useState('');
  const [comment, setComment] = useState('');

  const checkList = report?.checkList || [];
  const canReview = report?.status === StatusCode.Pending;

  useEffect(() => {
    if (!report) return;
    setCheckAnswers(initializeAnswers(report.checkList ?? undefined));
    if (report.comment) setComment(report.comment);
    if (report.causalId) setSelectedCausal(String(report.causalId));
  }, [report]);

  const { allAnswered, hasAnyNo, allYes } = useMemo(() => {
    const values = Object.values(checkAnswers);
    const answered = values.filter((a) => a != null).length;
    const anyNo = values.some((a) => a === 'no');
    const all = checkList.length > 0 && answered === checkList.length;
    return { allAnswered: all, hasAnyNo: anyNo, allYes: all && !anyNo };
  }, [checkAnswers, checkList.length]);

  const reviewMutation = useMutation({
    mutationFn: (data: {
      status: number;
      comment?: string;
      causalId?: number;
      checks: Array<{ checkId: number; review: boolean }>;
    }) => api.post(`/reports/${id}/review`, data),
    onMutate: () => showLoading('Procesando revisión...'),
    onSuccess: (_d, vars, toastId) => {
      dismissLoading(toastId as string | number);
      const msg = vars.status === StatusCode.Approved ? 'aprobado' : 'rechazado';
      showSuccess(`Reporte ${msg}`, `El reporte #${id} ha sido ${msg} correctamente`);
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
    },
    onError: (err: Error, _v, toastId) => {
      dismissLoading(toastId as string | number);
      showError('Error al procesar la revisión', err.message);
    },
  });

  const handleCheckChange = useCallback((checkId: number, value: CheckAnswer) => {
    setCheckAnswers((prev) => ({ ...prev, [checkId]: value }));
  }, []);

  const buildChecks = useCallback(
    () => checkList.map((item) => ({ checkId: item.id, review: checkAnswers[item.id] === 'yes' })),
    [checkList, checkAnswers]
  );

  const handleApprove = useCallback(() => {
    reviewMutation.mutate({ status: StatusCode.Approved, checks: buildChecks() });
  }, [buildChecks, reviewMutation]);

  const handleReject = useCallback(() => {
    if (!allAnswered) {
      showError('Error', 'Debe responder todos los ítems');
      return;
    }
    if (!selectedCausal) {
      showError('Error', 'Debe seleccionar una causal');
      return;
    }
    if (!comment.trim()) {
      showError('Error', 'Debe ingresar un comentario');
      return;
    }
    reviewMutation.mutate({
      status: StatusCode.Rejected,
      causalId: Number(selectedCausal),
      comment: comment.trim(),
      checks: buildChecks(),
    });
  }, [allAnswered, selectedCausal, comment, buildChecks, reviewMutation]);

  return {
    checkAnswers,
    selectedCausal,
    setSelectedCausal,
    comment,
    setComment,
    checkList,
    canReview,
    hasAnyNo,
    canApprove: canReview && allYes,
    canReject: canReview && hasAnyNo,
    isPending: reviewMutation.isPending,
    handleCheckChange,
    handleApprove,
    handleReject,
  };
}

function BasicInfoCard({ report }: { report: ReportDetail }) {
  const inspectionTypeValue = report.inspectionType
    ? `${report.inspectionType} - ${report.inspectionTypeName || ''}`
    : '-';

  return (
    <Card>
      <CardHeader className="py-3 xl:py-4">
        <CardTitle className="text-base xl:text-lg font-bold">Información básica</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 xl:px-4 pb-3 xl:pb-4 space-y-2">
        <div className="grid grid-cols-2 gap-2 xl:gap-3">
          <div>
            <Label className="text-xs xl:text-sm text-slate-500">Contrato</Label>
            <Input
              value={report.subscriptionId || '-'}
              readOnly
              className="h-9 xl:h-10 bg-slate-50"
            />
          </div>
          <div>
            <Label className="text-xs xl:text-sm text-slate-500">Orden</Label>
            <Input value={report.orderId || '-'} readOnly className="h-9 xl:h-10 bg-slate-50" />
          </div>
          <div>
            <Label className="text-xs xl:text-sm text-slate-500">Tipo Inspección</Label>
            <Input value={inspectionTypeValue} readOnly className="h-9 xl:h-10 bg-slate-50" />
          </div>
          <div>
            <Label className="text-xs xl:text-sm text-slate-500">Resultado</Label>
            <Input
              value={report.inspectionResultName || '-'}
              readOnly
              className="h-9 xl:h-10 bg-slate-50"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-xs xl:text-sm text-slate-500">Dirección</Label>
            <Input value={report.address || '-'} readOnly className="h-9 xl:h-10 bg-slate-50" />
          </div>
          <div>
            <Label className="text-xs xl:text-sm text-slate-500">Departamento</Label>
            <Input value={report.department || '-'} readOnly className="h-9 xl:h-10 bg-slate-50" />
          </div>
          <div>
            <Label className="text-xs xl:text-sm text-slate-500">Localidad</Label>
            <Input value={report.location || '-'} readOnly className="h-9 xl:h-10 bg-slate-50" />
          </div>
          <div>
            <Label className="text-xs xl:text-sm text-slate-500">OIA</Label>
            <Input value={report.oiaName || '-'} readOnly className="h-9 xl:h-10 bg-slate-50" />
          </div>
          <div>
            <Label className="text-xs xl:text-sm text-slate-500">Proyecto</Label>
            <Input value={report.project || '-'} readOnly className="h-9 xl:h-10 bg-slate-50" />
          </div>
          {report.constructionCompanyName && (
            <div className="col-span-2">
              <Label className="text-xs xl:text-sm text-slate-500">Firma Instaladora</Label>
              <Input
                value={report.constructionCompanyName}
                readOnly
                className="h-9 xl:h-10 bg-slate-50"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CheckListCard({
  checkList,
  checkAnswers,
  canReview,
  onCheckChange,
}: {
  checkList: CheckListItem[];
  checkAnswers: Record<number, CheckAnswer>;
  canReview: boolean;
  onCheckChange: (checkId: number, value: CheckAnswer) => void;
}) {
  if (checkList.length === 0) return null;

  return (
    <Card>
      <CardHeader className="py-2 xl:py-3 px-3 xl:px-4">
        <CardTitle className="text-sm xl:text-base font-bold">Lista de chequeo</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 xl:px-4 pb-3 xl:pb-4">
        <div className="grid grid-cols-[1fr_40px_40px] xl:grid-cols-[1fr_50px_50px] gap-2 xl:gap-3 items-center pb-2 mb-2 border-b-2 border-slate-200 font-semibold text-sm xl:text-base">
          <div>Ítem</div>
          <div className="text-center">SI</div>
          <div className="text-center">NO</div>
        </div>
        {checkList.map((item) => (
          <CheckListRow
            key={item.id}
            item={item}
            answer={checkAnswers[item.id]}
            canReview={canReview}
            onCheckChange={onCheckChange}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function CheckListRow({
  item,
  answer,
  canReview,
  onCheckChange,
}: {
  item: CheckListItem;
  answer: CheckAnswer;
  canReview: boolean;
  onCheckChange: (checkId: number, value: CheckAnswer) => void;
}) {
  if (canReview) {
    return (
      <div className="grid grid-cols-[1fr_40px_40px] xl:grid-cols-[1fr_50px_50px] gap-2 xl:gap-3 items-center py-2 xl:py-3 border-b border-slate-100">
        <span className="text-sm xl:text-base leading-tight">
          {item.count}. {item.description}
        </span>
        <div className="flex justify-center">
          <input
            type="radio"
            name={`check-${item.id}`}
            checked={answer === 'yes'}
            onChange={() => onCheckChange(item.id, 'yes')}
            className="w-4 h-4 xl:w-5 xl:h-5 cursor-pointer accent-blue-600"
          />
        </div>
        <div className="flex justify-center">
          <input
            type="radio"
            name={`check-${item.id}`}
            checked={answer === 'no'}
            onChange={() => onCheckChange(item.id, 'no')}
            className="w-4 h-4 xl:w-5 xl:h-5 cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_40px_40px] xl:grid-cols-[1fr_50px_50px] gap-2 xl:gap-3 items-center py-2 xl:py-3 border-b border-slate-100">
      <span className="text-sm xl:text-base leading-tight">
        {item.count}. {item.description}
      </span>
      <div className="flex justify-center">
        <input
          type="radio"
          checked={item.review === true}
          disabled
          className="w-4 h-4 xl:w-5 xl:h-5 opacity-60"
        />
      </div>
      <div className="flex justify-center">
        <input
          type="radio"
          checked={item.review === false}
          disabled
          className="w-4 h-4 xl:w-5 xl:h-5 opacity-60"
        />
      </div>
    </div>
  );
}

function CausalCard({
  causals,
  selectedCausal,
  onCausalChange,
  canReview,
  causalName,
}: {
  causals: Causal[];
  selectedCausal: string;
  onCausalChange: (value: string) => void;
  canReview: boolean;
  causalName?: string;
}) {
  if (canReview) {
    return (
      <Card>
        <CardHeader className="py-2 xl:py-3 px-3 xl:px-4">
          <CardTitle className="text-sm xl:text-base">Causal</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 xl:px-4 pb-3 xl:pb-4">
          <Select value={selectedCausal} onValueChange={onCausalChange}>
            <SelectTrigger className="xl:h-10">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {causals.map((causal) => (
                <SelectItem key={causal.id} value={String(causal.id)}>
                  {causal.id} - {causal.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-2 xl:py-3 px-3 xl:px-4">
        <CardTitle className="text-sm xl:text-base">Causal</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 xl:px-4 pb-3 xl:pb-4">
        <Input value={causalName || '-'} readOnly className="bg-slate-50 xl:h-10" />
      </CardContent>
    </Card>
  );
}

function CommentCard({
  comment,
  onCommentChange,
  canReview,
  savedComment,
}: {
  comment: string;
  onCommentChange: (value: string) => void;
  canReview: boolean;
  savedComment?: string | null;
}) {
  if (canReview) {
    return (
      <Card>
        <CardHeader className="py-2 xl:py-3 px-3 xl:px-4">
          <CardTitle className="text-sm xl:text-base">Comentario</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-3 xl:px-4 pb-3 xl:pb-4">
          <Input
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Ingrese un comentario"
            className="xl:h-10"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-2 xl:py-3 px-3 xl:px-4">
        <CardTitle className="text-sm xl:text-base">Comentario</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 xl:px-4 pb-3 xl:pb-4">
        <Input value={savedComment || '-'} readOnly className="bg-slate-50 xl:h-10" />
      </CardContent>
    </Card>
  );
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api.get<ReportDetailResponse>(`/reports/${id}`),
    enabled: !!id,
  });

  const { data: causalsData } = useQuery({
    queryKey: ['causals'],
    queryFn: () => api.get<CausalsResponse>('/catalogs/causals'),
  });

  const report = data?.data;
  const causals = causalsData?.data || [];
  const pdfUrl = useMemo(() => getPdfUrl(report?.files), [report?.files]);

  const review = useReportReview(id, report);

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
    <div className="h-[calc(100vh-7rem)] lg:h-[calc(100vh-8rem)] xl:h-[calc(100vh-9rem)] 2xl:h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center gap-3 xl:gap-4 pb-2 xl:pb-3 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-slate-900">
            Reporte #{report.id}
          </h1>
        </div>
        {getStatusBadge(report.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 xl:gap-4 2xl:gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-7 xl:col-span-8 overflow-hidden">
          <CardContent className="p-0 h-full">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full border-0" title="Certificado PDF" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 xl:text-lg">
                No hay archivo PDF disponible
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3 xl:space-y-4 pr-1">
            <BasicInfoCard report={report} />
            <CheckListCard
              checkList={review.checkList}
              checkAnswers={review.checkAnswers}
              canReview={review.canReview}
              onCheckChange={review.handleCheckChange}
            />
            {(review.hasAnyNo || (!review.canReview && report.causalId)) && (
              <CausalCard
                causals={causals}
                selectedCausal={review.selectedCausal}
                onCausalChange={review.setSelectedCausal}
                canReview={review.canReview}
                causalName={report.causalName}
              />
            )}
            {(review.hasAnyNo || (!review.canReview && report.comment)) && (
              <CommentCard
                comment={review.comment}
                onCommentChange={review.setComment}
                canReview={review.canReview}
                savedComment={report.comment}
              />
            )}
          </div>

          <div className="flex-shrink-0 pt-3 xl:pt-4 border-t mt-2 flex gap-2 xl:gap-3 justify-end flex-wrap">
            <Button variant="outline" onClick={() => navigate('/reports')} className="xl:h-10">
              <ArrowLeft className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
              {review.canReview ? 'Cancelar Gestión' : 'Regresar al Listado'}
            </Button>
            {review.canReject && (
              <Button
                onClick={review.handleReject}
                disabled={review.isPending || !review.selectedCausal || !review.comment.trim()}
                variant="destructive"
                className="xl:h-10"
              >
                <X className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
                RECHAZAR
              </Button>
            )}
            {review.canApprove && (
              <Button
                onClick={review.handleApprove}
                disabled={review.isPending}
                className="bg-green-600 hover:bg-green-700 xl:h-10"
              >
                <Check className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
                APROBAR
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
