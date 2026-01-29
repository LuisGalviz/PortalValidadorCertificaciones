import type { ColDef, GridReadyEvent, SortChangedEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { ConstructionCompanyListItem, PaginatedResponse } from '@portal/shared';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConstructionCompaniesResponse {
  success: boolean;
  data: ConstructionCompanyListItem[];
  pagination: PaginatedResponse<ConstructionCompanyListItem>['pagination'];
}

interface ConstructionCompaniesTableProps {
  search?: string;
}

export function ConstructionCompaniesTable({ search }: ConstructionCompaniesTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['construction-companies', { page, search, sortBy, sortOrder }],
    queryFn: async () => {
      const queryParams: Record<string, string | number | undefined> = {
        page,
        limit: pageSize,
        search: search || undefined,
        sortBy,
        sortOrder,
      };
      return api.get<ConstructionCompaniesResponse>('/construction-companies', queryParams);
    },
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80, sortable: true },
      { field: 'nit', headerName: 'NIT', width: 120, sortable: true },
      { field: 'name', headerName: 'Nombre', width: 200, sortable: true, flex: 1 },
      { field: 'rufiCode', headerName: 'Código RUFI', width: 120 },
      { field: 'category', headerName: 'Categoría', width: 120 },
      { field: 'contractStatus', headerName: 'Estado Contrato', width: 140 },
      { field: 'cityCompany', headerName: 'Ciudad', width: 140 },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 100,
        sortable: false,
        cellRenderer: (params: { data: ConstructionCompanyListItem }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/construction-companies/${params.data.id}`)}
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
