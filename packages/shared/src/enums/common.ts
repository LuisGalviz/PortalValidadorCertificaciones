export const Environment = {
  Production: 'production',
  Test: 'testing',
  PreProduction: 'preproduction',
  Development: 'development',
} as const;

export type EnvironmentType = (typeof Environment)[keyof typeof Environment];

export const CodesTestEnvironment = [Environment.Test, Environment.PreProduction];

export const Integration = {
  ONBASE: 'onBase',
  LO: 'ludyOrder',
  OSF: 'osf',
  CAMUNDA: 'camunda',
  SALES: 'venta',
} as const;

export const Origin = {
  Integration: 1,
  Portal: 2,
  Other: 3,
  DigitalSale: 4,
  Movility: 5,
} as const;

export type OriginType = (typeof Origin)[keyof typeof Origin];

export const OriginName: Record<number, string> = {
  [Origin.Integration]: 'Integración',
  [Origin.Portal]: 'Portal',
  [Origin.Other]: 'Otro',
  [Origin.DigitalSale]: 'Venta Digital',
  [Origin.Movility]: 'Movilidad',
};

export const FileTypes = {
  Pdf: 'application/pdf',
  Jpg: 'image/jpeg',
  Png: 'image/png',
} as const;

export const FileExtensions = {
  Pdf: 'pdf',
  Jpg: 'jpg',
  Png: 'png',
  Jpeg: 'jpeg',
} as const;

export const fileTypeCode = {
  InspectionResult: 'RG',
  DynamicForm: 'FM',
} as const;

export const Departments = {
  Atlantico: 'ATLANTICO',
  Magdalena: 'MAGDALENA',
  Cesar: 'CESAR',
  Guajira: 'LA GUAJIRA',
  Bolivar: 'BOLIVAR',
} as const;

export type DepartmentType = (typeof Departments)[keyof typeof Departments];
