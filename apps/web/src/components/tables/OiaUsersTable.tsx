import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { api } from '@/lib/api';
import type { ApiResponse } from '@portal/shared';
import { ProfileNames } from '@portal/shared';
import { useQuery } from '@tanstack/react-query';

interface OiaUserListItem {
  id: number;
  name: string;
  email: string;
  phone: number | string | null;
  active: boolean | null;
  permission?: string | number | null;
}

interface OiaUsersResponse extends ApiResponse<OiaUserListItem[]> {}

interface OiaUsersTableProps {
  oiaId: number;
}

function formatPermission(value: OiaUserListItem['permission']) {
  if (value === null || value === undefined) return '-';
  const key = String(value);
  return ProfileNames[key] || key;
}

export function OiaUsersTable({ oiaId }: OiaUsersTableProps) {
  const gridRef = useRef<AgGridReact>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['oia-users', oiaId],
    queryFn: () => api.get<OiaUsersResponse>(`/oias/${oiaId}/users`),
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'name', headerName: 'Nombre', width: 220, sortable: true, flex: 1 },
      { field: 'email', headerName: 'Correo', width: 240 },
      { field: 'phone', headerName: 'Teléfono', width: 140 },
      {
        field: 'permission',
        headerName: 'Perfil',
        width: 140,
        valueFormatter: (params) => formatPermission(params.value),
      },
      {
        field: 'active',
        headerName: 'Activo',
        width: 110,
        valueFormatter: (params) => (params.value ? 'SI' : 'NO'),
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
