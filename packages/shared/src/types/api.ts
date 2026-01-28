export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

export interface FilterParams {
  status?: number | string;
  oiaId?: number;
  inspectorId?: number;
  inspectionType?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ReportFilterParams extends FilterParams, PaginationParams {
  status?: number;
  oiaId?: number;
  inspectorId?: number;
  inspectionType?: number;
}

export interface OiaFilterParams extends FilterParams, PaginationParams {
  status?: number;
}

export interface InspectorFilterParams extends FilterParams, PaginationParams {
  status?: number;
  oiaId?: number;
}
