import type { OriginType } from '../enums/common.js';
import type { InspectionResultValue, InspectionTypeValue } from '../enums/inspection.js';
import type { StatusCodeType } from '../enums/status.js';

export interface Report {
  id: number;
  orderExternal?: string | null;
  orderId?: number | null;
  certificateIdOSF?: number | null;
  certificate?: string | null;
  data?: Record<string, unknown> | null;
  status: StatusCodeType;
  reviewDate?: Date | null;
  userId?: number | null;
  comment?: string | null;
  causalId?: number | null;
  inspectionType?: InspectionTypeValue | null;
  inspectionResult?: InspectionResultValue | null;
  inspectionDate?: Date | null;
  oiaId?: number | null;
  subscriptionId?: number | null;
  address?: string | null;
  location?: string | null;
  lineType?: number | null;
  inspectorId?: number | null;
  causalCriticalDefects?: Record<string, unknown> | null;
  causalNoCriticalDefects?: Record<string, unknown> | null;
  causalArtifacts?: Record<string, unknown> | null;
  origin?: OriginType | null;
  internalVacuum?: number | null;
  project?: string | null;
  osfDate?: Date | null;
  ludyOrderDate?: Date | null;
  onBaseDate?: Date | null;
  camundaDate?: Date | null;
  salesDate?: Date | null;
  retries?: number | null;
  lastError?: string | null;
  constructionCompanyId?: number | null;
  unregisteredConstructionCompany?: string | null;
  department?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportFile {
  id: number;
  reportId: number;
  name: string;
  type?: string | null;
  path?: string | null;
  fileTypeCode?: string | null;
}

export interface ReportCheck {
  id: number;
  reportId: number;
  checkListId: number;
  value?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportInput {
  orderExternal?: string;
  orderId?: number;
  inspectionType: InspectionTypeValue;
  inspectionResult: InspectionResultValue;
  inspectionDate: Date;
  oiaId: number;
  inspectorId: number;
  subscriptionId?: number;
  address?: string;
  location?: string;
  lineType?: number;
  causalCriticalDefects?: Record<string, unknown>;
  causalNoCriticalDefects?: Record<string, unknown>;
  causalArtifacts?: Record<string, unknown>;
  origin?: OriginType;
  project?: string;
  constructionCompanyId?: number;
  unregisteredConstructionCompany?: string;
  department?: string;
}

export interface ReviewReportInput {
  status: StatusCodeType;
  comment?: string;
  causalId?: number;
}

export interface ReportListItem {
  id: number;
  orderExternal?: string | null;
  certificate?: string | null;
  status: StatusCodeType;
  statusName: string;
  inspectionType?: InspectionTypeValue | null;
  inspectionTypeName?: string;
  inspectionDate?: Date | null;
  oiaId?: number | null;
  oiaName?: string;
  inspectorId?: number | null;
  inspectorName?: string;
  address?: string | null;
  subscriptionId?: number | null;
  createdAt: Date;
}

export interface ReportDetail extends Report {
  oiaName?: string;
  inspectorName?: string;
  inspectionTypeName?: string;
  inspectionResultName?: string;
  statusName?: string;
  causalName?: string;
  constructionCompanyName?: string;
  files?: ReportFile[];
  checks?: ReportCheck[];
}

export interface ReportStats {
  pending: number;
  approved: number;
  rejected: number;
  inconsistent: number;
  total: number;
}
