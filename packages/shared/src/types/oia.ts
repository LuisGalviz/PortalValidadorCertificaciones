import type { OiaStatusCodeType } from '../enums/status.js';

export interface Oia {
  id: number;
  identification: number;
  name: string;
  codeAcred: string;
  effectiveDate?: Date | null;
  cedRepLegal?: number | null;
  nameRepLegal?: string | null;
  addressRepLegal?: string | null;
  typeOrganismId?: number | null;
  addressOrganism?: string | null;
  nameContact?: string | null;
  phoneContact?: number | null;
  phoneContactAlternative?: number | null;
  emailContact?: string | null;
  userId?: number | null;
  codeOrganism?: number | null;
  organismCodes?: Record<string, unknown> | Record<string, unknown>[] | null;
  acceptedTermsAndConditions?: boolean | null;
  status: OiaStatusCodeType;
  comment?: string | null;
  active?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OiaUser {
  id: number;
  oiaId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OiaFile {
  id: number;
  oiaId: number;
  fileType: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOiaInput {
  identification: number;
  name: string;
  codeAcred: string;
  effectiveDate?: Date;
  cedRepLegal?: number;
  nameRepLegal?: string;
  addressRepLegal?: string;
  typeOrganismId?: number;
  addressOrganism?: string;
  nameContact?: string;
  phoneContact?: number;
  phoneContactAlternative?: number;
  emailContact?: string;
  codeOrganism?: number;
  organismCodes?: Record<string, unknown> | Record<string, unknown>[];
}

export interface UpdateOiaInput {
  identification?: number;
  name?: string;
  codeAcred?: string;
  effectiveDate?: Date;
  cedRepLegal?: number;
  nameRepLegal?: string;
  addressRepLegal?: string;
  typeOrganismId?: number;
  addressOrganism?: string;
  nameContact?: string;
  phoneContact?: number;
  phoneContactAlternative?: number;
  emailContact?: string;
  codeOrganism?: number;
  organismCodes?: Record<string, unknown> | Record<string, unknown>[];
  status?: OiaStatusCodeType;
  comment?: string;
  active?: boolean;
}

export interface OiaListItem {
  id: number;
  identification: number;
  name: string;
  codeAcred: string;
  effectiveDate?: Date | null;
  typeOrganismName?: string | null;
  nameContact?: string | null;
  createdAt?: Date;
  acceptedTermsAndConditions?: boolean | null;
  status: OiaStatusCodeType;
  statusName: string;
  active?: boolean | null;
}
