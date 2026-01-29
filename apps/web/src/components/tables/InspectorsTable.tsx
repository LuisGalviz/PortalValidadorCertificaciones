import type { ColDef, GridReadyEvent, SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { InspectorStatusCode, StatusRequestText } from '@portal/shared';
import type { InspectorListItem, PaginatedResponse } from '@portal/shared';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InspectorsResponse {
  success: boolean;
  data: InspectorListItem[];
  pagination: PaginatedResponse<InspectorListItem>['pagination'];
}

const StatusCellRenderer = (props: { value: number }) => {
  const status = props.value;
  let variant: 'default' | 'success' | 'destructive' | 'warning' | 'secondary' = 'default';
  let text: string = StatusRequestText.Pending;

  switch (status) {
    case InspectorStatusCode.Approved:
      variant = 'success';
      text = StatusRequestText.Approved;
      break;
    case InspectorStatusCode.Rejected:
      variant = 'destructive';
      text = StatusRequestText.Rejected;
      break;
    case InspectorStatusCode.Pending:
      variant = 'warning';
      text = StatusRequestText.Pending;
      break;
    case InspectorStatusCode.Suspended:
      variant = 'secondary';
      text = StatusRequestText.Suspended;
      break;
    case InspectorStatusCode.Expired:
      variant = 'secondary';
      text = StatusRequestText.Expired;
      break;
  }

  return <Badge variant={variant}>{text}</Badge>;
};

interface InspectorsTableProps {
  search?: string;
  status?: number;
  oiaId?: number;
}

export function InspectorsTable({ search, status, oiaId }: InspectorsTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['inspectors', { page, search, status, oiaId, sortBy, sortOrder }],
    queryFn: async () => {
      const queryParams: Record<string, string | number | undefined> = {
        page,
        limit: pageSize,
        search: search || undefined,
        status,
        oiaId,
        sortBy,
        sortOrder,
      };
      return api.get<InspectorsResponse>('/inspectors', queryParams);
    },
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'identification', headerName: 'Identificación', width: 130, sortable: true },
      { field: 'name', headerName: 'Nombre', width: 200, sortable: true, flex: 1 },
      { field: 'codeCertificate', headerName: 'Código Certificado', width: 150 },
      { field: 'oiaName', headerName: 'OIA', width: 150 },
      {
        field: 'certificateEffectiveDate',
        headerName: 'Fecha Vigencia',
        width: 140,
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString('es-CO') : '-',
      },
      {
        field: 'status',
        headerName: 'Estado',
        width: 130,
        cellRenderer: StatusCellRenderer,
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 100,
        sortable: false,
        cellRenderer: (params: { data: InspectorListItem }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/inspectors/${params.data.id}`)}
          >
            <Eye className="h-4 w-4" />
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
    }),
    []
  );

  const onGridReady = useCallback((_params: GridReadyEvent) => {
    // Grid is ready
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
      <div className="ag-theme-alpine h-[500px] lg:h-[550px] xl:h-[600px] 2xl:h-[700px] w-full">
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

      {/* Custom Pagination */}
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
