import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useMemo, useRef } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingReport {
  id: number;
  orderId?: number;
  orderExternal?: string;
  subscriptionId?: number;
  inspectionType?: string;
  oiaName?: string;
  createdAt: string;
}

interface PendingReportsResponse {
  success: boolean;
  data: PendingReport[];
}

interface PendingReportsTableProps {
  limit?: number;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
      {
        headerName: '#',
        width: 60,
        valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
        cellClass: 'text-center',
      },
      {
        field: 'id',
        headerName: 'Reporte',
        minWidth: 90,
        flex: 1,
        cellClass: 'text-center',
      },
      {
        field: 'orderId',
        headerName: 'Orden',
        minWidth: 100,
        flex: 1,
        cellClass: 'text-center',
        valueFormatter: (p: ValueFormatterParams) => p.value || '-',
      },
      {
        field: 'orderExternal',
        headerName: 'Cio',
        minWidth: 120,
        flex: 1,
        cellClass: 'text-center',
        valueFormatter: (p: ValueFormatterParams) => p.value || '-',
      },
      {
        field: 'subscriptionId',
        headerName: 'Contrato',
        minWidth: 100,
        flex: 1,
        cellClass: 'text-center',
        valueFormatter: (p: ValueFormatterParams) => p.value || '-',
      },
      {
        field: 'inspectionType',
        headerName: 'Tipo inspección',
        minWidth: 150,
        flex: 2,
        valueFormatter: (p: ValueFormatterParams) => p.value || '-',
      },
      {
        field: 'oiaName',
        headerName: 'OIA',
        minWidth: 150,
        flex: 2,
        cellClass: 'text-center',
        valueFormatter: (p: ValueFormatterParams) => p.value || '-',
      },
      {
        field: 'createdAt',
        headerName: 'Fecha de creación',
        minWidth: 140,
        flex: 1.5,
        cellClass: 'text-center',
        valueFormatter: (p: ValueFormatterParams) => formatDate(p.value),
      },
      {
        field: 'actions',
        headerName: 'Gestionar',
        width: 100,
        cellClass: 'text-center',
        cellRenderer: (params: { data: PendingReport }) => (
          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate(`/reports/${params.data.id}`)}
          >
            <ExternalLink className="h-4 w-4" />
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
      suppressMovable: true,
    }),
    []
  );

  return (
    <div className="ag-theme-alpine w-full">
      <AgGridReact
        ref={gridRef}
        rowData={data?.data || []}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        animateRows={true}
        loading={isLoading}
        domLayout="autoHeight"
        onGridReady={(params) => params.api.sizeColumnsToFit()}
      />
    </div>
  );
}
