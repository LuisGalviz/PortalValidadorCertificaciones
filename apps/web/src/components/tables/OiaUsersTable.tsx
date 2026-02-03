import type { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useMemo, useRef } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { ApiResponse } from '@portal/shared';
import { useQuery } from '@tanstack/react-query';
import { Eye, Pencil } from 'lucide-react';

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
  onView?: (userId: number) => void;
  onEdit?: (userId: number) => void;
  canEdit?: boolean;
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

export function OiaUsersTable({ oiaId, onView, onEdit, canEdit }: OiaUsersTableProps) {
  const gridRef = useRef<AgGridReact>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['oia-users', oiaId],
    queryFn: () => api.get<OiaUsersResponse>(`/oias/${oiaId}/users`),
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'name', headerName: 'Nombre', minWidth: 220, sortable: true, flex: 1 },
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
        width: 140,
        sortable: false,
        cellRenderer: (params: { data: OiaUserListItem }) => {
          if (!onView && !onEdit) {
            return <span>-</span>;
          }

          return (
            <div className="flex items-center gap-2">
              {onView && (
                <button
                  type="button"
                  onClick={() => onView(params.data.id)}
                  title="Ver usuario"
                  aria-label="Ver usuario"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              {canEdit && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(params.data.id)}
                  title="Editar usuario"
                  aria-label="Editar usuario"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onView, onEdit, canEdit]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      filter: true,
      suppressMovable: true,
    }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="ag-theme-alpine h-[420px] sm:h-[480px] md:h-[calc(100vh-360px)] lg:h-[calc(100vh-320px)] xl:h-[calc(100vh-280px)] 2xl:h-[calc(100vh-240px)] min-h-[350px] w-full">
        <AgGridReact
          ref={gridRef}
          rowData={data?.data || []}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          loading={isLoading}
          suppressPaginationPanel={true}
        />
      </div>
    </div>
  );
}
