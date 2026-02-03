import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { ApiResponse } from '@portal/shared';
import { useQuery } from '@tanstack/react-query';

interface OiaUserListItem {
  id: number;
  name: string;
  authEmail?: string | null;
  email: string;
  phone: number | string | null;
  active: boolean | null;
  createdAt?: string | Date | null;
}

interface OiaUsersResponse extends ApiResponse<OiaUserListItem[]> {}

interface OiaUsersTableProps {
  oiaId: number;
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OiaUsersTable({ oiaId }: OiaUsersTableProps) {
  const gridRef = useRef<AgGridReact>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['oia-users', oiaId],
    queryFn: () => api.get<OiaUsersResponse>(`/oias/${oiaId}/users`),
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'name', headerName: 'Nombre', width: 220, sortable: true, flex: 1 },
      {
        field: 'authEmail',
        headerName: 'Correo de acceso',
        width: 230,
        valueFormatter: (params) => (params.value ? String(params.value) : ''),
      },
      {
        field: 'email',
        headerName: 'Correo de notificaciones',
        width: 230,
        valueFormatter: (params) => (params.value ? String(params.value) : ''),
      },
      { field: 'phone', headerName: 'Teléfono', width: 140 },
      {
        field: 'active',
        headerName: 'Estado',
        width: 130,
        cellRenderer: (params: { value: boolean | null }) => (
          <Badge variant={params.value ? 'success' : 'secondary'}>
            {params.value ? 'Activo' : 'Inactivo'}
          </Badge>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Fecha de creación',
        width: 170,
        valueFormatter: (params) => formatDateTime(params.value),
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        valueFormatter: () => '-',
      },
    ],
    []
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

  return (
    <div className="space-y-4">
      <div className="ag-theme-alpine h-[450px] lg:h-[calc(100vh-380px)] xl:h-[calc(100vh-400px)] min-h-[350px] w-full">
        <AgGridReact
          ref={gridRef}
          rowData={data?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          animateRows={true}
          loading={isLoading}
          suppressPaginationPanel={true}
        />
      </div>
    </div>
  );
}
