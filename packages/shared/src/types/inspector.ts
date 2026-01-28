import type { InspectorStatusCodeType } from '../enums/status.js';

export interface Inspector {
  id: number;
  identification: number;
  name: string;
  nameOrganism: string;
  codeCertificate: string;
  certificateEffectiveDate?: Date | null;
  email?: string | null;
  phone?: number | null;
  userId?: number | null;
  operatingUnitId?: number | null;
  status: InspectorStatusCodeType;
  comment?: string | null;
  oiaId: number;
  active?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InspectorFile {
  id: number;
  inspectorId: number;
  fileType: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInspectorInput {
  identification: number;
  name: string;
  nameOrganism: string;
  codeCertificate: string;
  certificateEffectiveDate?: Date;
  email?: string;
  phone?: number;
  oiaId: number;
  operatingUnitId?: number;
}

export interface UpdateInspectorInput {
  identification?: number;
  name?: string;
  nameOrganism?: string;
  codeCertificate?: string;
  certificateEffectiveDate?: Date;
  email?: string;
  phone?: number;
  status?: InspectorStatusCodeType;
  comment?: string;
  active?: boolean;
}

export interface InspectorListItem {
  id: number;
  identification: number;
  name: string;
  nameOrganism: string;
  codeCertificate: string;
  certificateEffectiveDate?: Date | null;
  status: InspectorStatusCodeType;
  statusName: string;
  oiaId: number;
  oiaName?: string;
}
