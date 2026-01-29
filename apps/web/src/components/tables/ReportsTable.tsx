import type { ColDef, GridReadyEvent, SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { ReportStatusText, StatusCode } from '@portal/shared';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface ReportListItem {
  id: number;
  orderExternal?: string;
  certificate?: string;
  status: number;
  statusName: string;
  inspectionTypeName?: string;
  inspectionDate?: string;
  oiaName?: string;
  inspectorName?: string;
  address?: string;
  subscriptionId?: number;
  createdAt: string;
}

interface ReportsResponse {
  success: boolean;
  data: ReportListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const StatusCellRenderer = (props: { value: number }) => {
  const status = props.value;
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

interface ReportsTableProps {
  oiaId?: number;
  status?: number;
}

export function ReportsTable({ oiaId, status }: ReportsTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['reports', { page, oiaId, status, sortBy, sortOrder }],
    queryFn: async () => {
      const queryParams: Record<string, string | number | undefined> = {
        page,
        limit: pageSize,
        oiaId,
        status,
        sortBy,
        sortOrder,
      };
      return api.get<ReportsResponse>('/reports', queryParams);
    },
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'orderExternal', headerName: 'Orden', width: 120, sortable: true },
      { field: 'certificate', headerName: 'Certificado', width: 120 },
      {
        field: 'status',
        headerName: 'Estado',
        width: 130,
        cellRenderer: StatusCellRenderer,
      },
      { field: 'inspectionTypeName', headerName: 'Tipo Inspección', width: 150 },
      {
        field: 'inspectionDate',
        headerName: 'Fecha Inspección',
        width: 140,
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString('es-CO') : '-',
      },
      { field: 'oiaName', headerName: 'OIA', width: 150 },
      { field: 'inspectorName', headerName: 'Inspector', width: 150 },
      { field: 'address', headerName: 'Dirección', width: 200, flex: 1 },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        cellRenderer: (params: { data: ReportListItem }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/reports/${params.data.id}`)}
          >
            Ver
          </Button>
        ),
      },
    ],
    [navigate]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      filter: true,
      suppressMovable: true,
    }),
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  const onSortChanged = useCallback((event: SortChangedEvent) => {
    const sortState = event.api.getColumnState().find((col) => col.sort);
    if (sortState) {
      setSortBy(sortState.colId);
      setSortOrder(sortState.sort || undefined);
    } else {
      setSortBy(undefined);
      setSortOrder(undefined);
    }
    setPage(1);
  }, []);

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-4">
      <div className="ag-theme-alpine h-[450px] lg:h-[calc(100vh-380px)] xl:h-[calc(100vh-400px)] min-h-[350px] w-full">
        <AgGridReact
          ref={gridRef}
          rowData={data?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onSortChanged={onSortChanged}
          animateRows={true}
          loading={isLoading}
          suppressPaginationPanel={true}
        />
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm xl:text-base text-muted-foreground">
          {data?.pagination && (
            <>
              Mostrando {(page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, data.pagination.total)} de {data.pagination.total}{' '}
              registros
            </>
          )}
        </div>
        <div className="flex items-center gap-2 xl:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="xl:h-9 xl:px-4"
          >
            Anterior
          </Button>
          <span className="text-sm xl:text-base">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="xl:h-9 xl:px-4"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
