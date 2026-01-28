import { useMemo, useRef, useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, SortChangedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { OiaStatusCode, StatusRequestText } from '@portal/shared';
import type { OiaListItem, PaginatedResponse } from '@portal/shared';

interface OiasResponse {
  success: boolean;
  data: OiaListItem[];
  pagination: PaginatedResponse<OiaListItem>['pagination'];
}

const StatusCellRenderer = (props: { value: number }) => {
  const status = props.value;
  let variant: 'default' | 'success' | 'destructive' | 'warning' | 'secondary' = 'default';
  let text: string = StatusRequestText.Pending;

  switch (status) {
    case OiaStatusCode.Approved:
      variant = 'success';
      text = StatusRequestText.Approved;
      break;
    case OiaStatusCode.Rejected:
      variant = 'destructive';
      text = StatusRequestText.Rejected;
      break;
    case OiaStatusCode.Pending:
      variant = 'warning';
      text = StatusRequestText.Pending;
      break;
    case OiaStatusCode.Suspended:
      variant = 'secondary';
      text = StatusRequestText.Suspended;
      break;
    case OiaStatusCode.Expired:
      variant = 'secondary';
      text = StatusRequestText.Expired;
      break;
  }

  return <Badge variant={variant}>{text}</Badge>;
};

interface OiasTableProps {
  search?: string;
  status?: number;
}

export function OiasTable({ search, status }: OiasTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['oias', { page, search, status, sortBy, sortOrder }],
    queryFn: async () => {
      const queryParams: Record<string, string | number | undefined> = {
        page,
        limit: pageSize,
        search: search || undefined,
        status,
        sortBy,
        sortOrder,
      };
      return api.get<OiasResponse>('/oias', queryParams);
    },
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'identification', headerName: 'NIT', width: 120, sortable: true },
      { field: 'name', headerName: 'Nombre', width: 200, sortable: true, flex: 1 },
      { field: 'codeAcred', headerName: 'Código Acreditación', width: 160 },
      {
        field: 'effectiveDate',
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
        cellRenderer: (params: { data: OiaListItem }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/oias/${params.data.id}`)}
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
      <div className="ag-theme-alpine h-[500px] w-full">
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
        <div className="text-sm text-muted-foreground">
          {data?.pagination && (
            <>
              Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, data.pagination.total)} de {data.pagination.total} registros
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
