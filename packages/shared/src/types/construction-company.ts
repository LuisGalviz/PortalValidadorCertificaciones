export interface ConstructionCompany {
  id: number;
  nit: string;
  name: string;
  rufiCode: string;
  category: number;
  stateSIC: number;
  contractStatus: string;
  addressCompany: string;
  cityCompany: string;
  userId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConstructionCompanyInput {
  nit: string;
  name: string;
  rufiCode: string;
  category: number;
  stateSIC: number;
  contractStatus: string;
  addressCompany: string;
  cityCompany: string;
}

export interface UpdateConstructionCompanyInput {
  nit?: string;
  name?: string;
  rufiCode?: string;
  category?: number;
  stateSIC?: number;
  contractStatus?: string;
  addressCompany?: string;
  cityCompany?: string;
}

export interface ConstructionCompanyListItem {
  id: number;
  nit: string;
  name: string;
  rufiCode: string;
  category: number;
  contractStatus: string;
  cityCompany: string;
}
