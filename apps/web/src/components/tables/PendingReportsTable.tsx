import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingReport {
  id: number;
  orderExternal?: string;
  address?: string;
  inspectionDate?: string;
  oiaName?: string;
  inspectorName?: string;
  createdAt: string;
}

interface PendingReportsResponse {
  success: boolean;
  data: PendingReport[];
}

interface PendingReportsTableProps {
  limit?: number;
}

export function PendingReportsTable({ limit = 10 }: PendingReportsTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['pending-reports', { limit }],
    queryFn: () => api.get<PendingReportsResponse>('/dashboard/pending-reports', { limit }),
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      {
        field: 'orderExternal',
        headerName: 'Orden',
        width: 120,
        valueFormatter: (p) => p.value || '-',
      },
      {
        field: 'address',
        headerName: 'Dirección',
        width: 200,
        flex: 1,
        valueFormatter: (p) => p.value || '-',
      },
      { field: 'oiaName', headerName: 'OIA', width: 150, valueFormatter: (p) => p.value || '-' },
      {
        field: 'inspectorName',
        headerName: 'Inspector',
        width: 150,
        valueFormatter: (p) => p.value || '-',
      },
      {
        field: 'status',
        headerName: 'Estado',
        width: 120,
        cellRenderer: () => <Badge variant="warning">Pendiente</Badge>,
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 100,
        cellRenderer: (params: { data: PendingReport }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/reports/${params.data.id}`)}
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
      sortable: false,
    }),
    []
  );

  const onGridReady = useCallback((_params: GridReadyEvent) => {
    // Grid is ready
  }, []);

  return (
    <div className="ag-theme-alpine h-[400px] w-full">
      <AgGridReact
        ref={gridRef}
        rowData={data?.data || []}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        animateRows={true}
        loading={isLoading}
        domLayout="autoHeight"
      />
    </div>
  );
}
