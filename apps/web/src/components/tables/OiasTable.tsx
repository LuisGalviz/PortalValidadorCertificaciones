import type { ColDef, SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { OiaStatusCode, StatusRequestText } from '@portal/shared';
import type { OiaListItem, PaginatedResponse } from '@portal/shared';
import { useQuery } from '@tanstack/react-query';
import { Pencil, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  canEdit?: boolean;
  canInspectors?: boolean;
  canUsers?: boolean;
}

export function OiasTable({ search, status, canEdit, canInspectors, canUsers }: OiasTableProps) {
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
      { field: 'name', headerName: 'Razón Social', minWidth: 220, sortable: true, flex: 1 },
      { field: 'typeOrganismName', headerName: 'Tipo', width: 160 },
      {
        field: 'effectiveDate',
        headerName: 'Vigencia ONAC',
        width: 140,
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString('es-CO') : '-',
      },
      {
        field: 'nameContact',
        headerName: 'Contacto',
        width: 180,
        valueFormatter: (params) => (params.value ? String(params.value) : '-'),
      },
      {
        field: 'createdAt',
        headerName: 'Fecha de Registro',
        width: 150,
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
        field: 'acceptedTermsAndConditions',
        headerName: 'TyC',
        width: 100,
        cellDataType: 'text',
        cellRenderer: (params: { value: boolean | null }) => (params.value ? 'SI' : 'NO'),
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 160,
        sortable: false,
        cellRenderer: (params: { data: OiaListItem }) => (
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => navigate(`/oias/${params.data.id}`)}
                title="Editar OIA"
                aria-label="Editar OIA"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canInspectors && (
              <button
                type="button"
                onClick={() => navigate(`/inspectors?oiaId=${params.data.id}`)}
                title="Ver inspectores"
                aria-label="Ver inspectores"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                <Users className="h-4 w-4" />
              </button>
            )}
            {canUsers && (
              <button
                type="button"
                onClick={() => navigate(`/oias/${params.data.id}/users`)}
                title="Ver usuarios"
                aria-label="Ver usuarios"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                <User className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [navigate, canEdit, canInspectors, canUsers]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      filter: true,
      suppressMovable: true,
    }),
    []
  );

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
      <div className="ag-theme-alpine h-[420px] sm:h-[480px] md:h-[calc(100vh-360px)] lg:h-[calc(100vh-320px)] xl:h-[calc(100vh-280px)] 2xl:h-[calc(100vh-240px)] min-h-[350px] w-full">
        <AgGridReact
          ref={gridRef}
          rowData={data?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
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
