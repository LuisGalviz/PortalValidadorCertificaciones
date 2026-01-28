export const InspectionType = {
  RevPerio: 2,
  ServNuev: 3,
  Reform: 4,
  RevPrev: 5,
  MedPrep: 6,
} as const;

export type InspectionTypeValue = (typeof InspectionType)[keyof typeof InspectionType];

export const InspectionTypeName: Record<number, string> = {
  [InspectionType.RevPerio]: 'Revisión Periódica',
  [InspectionType.ServNuev]: 'Servicios Nuevos',
  [InspectionType.Reform]: 'Reforma',
  [InspectionType.RevPrev]: 'Revisión Previa',
  [InspectionType.MedPrep]: 'Medidor Prepago',
};

export const InspectionResult = {
  InstallCert: 1,
  NonCriticalDefects: 2,
  CriticalFlaws: 3,
  NoFlawsAndNoArtifacts: 4,
  NonCriticalDefectsAndNoArtifacts: 5,
  CriticalFlawsAndNoArtifacts: 6,
} as const;

export type InspectionResultValue = (typeof InspectionResult)[keyof typeof InspectionResult];

export const InspectionResultName: Record<number, string> = {
  [InspectionResult.InstallCert]: 'Instalación Certificada',
  [InspectionResult.NonCriticalDefects]: 'Defectos No Críticos',
  [InspectionResult.CriticalFlaws]: 'Defectos Críticos',
  [InspectionResult.NoFlawsAndNoArtifacts]: 'Sin Defectos y Sin Artefactos',
  [InspectionResult.NonCriticalDefectsAndNoArtifacts]: 'Defectos No Críticos y Sin Artefactos',
  [InspectionResult.CriticalFlawsAndNoArtifacts]: 'Defectos Críticos y Sin Artefactos',
};

export const InspectionTypeActivity: Record<number, string> = {
  [InspectionType.Reform]: 'CERTIFICACIÓN POR REFORMA',
  [InspectionType.RevPerio]: 'INSPECCIÓN Y/O CERTIFICACION TRABAJOS REVISIÓN PERIODICA',
  [InspectionType.ServNuev]: 'INSPECCION Y/O CERTIFICACION INSTALACIONES',
};

export const CodesInspectionResultWithDefects = [
  InspectionResult.NonCriticalDefects,
  InspectionResult.CriticalFlaws,
  InspectionResult.NonCriticalDefectsAndNoArtifacts,
  InspectionResult.CriticalFlawsAndNoArtifacts,
];

export const TaskType = {
  VisitIdentCert: 10444,
  RevSuspAut: 110444,
  CertSuspAut: 310795,
  VisitCertRepar: 10795,
  CertFirstVisit: 11198,
  CertSecondVisit: 11200,
  NewServiceCertification: 12162,
  RevPeriodicas: 12161,
  PrepaidMeter: 11367,
} as const;

export const TypeArtifactsDefects = {
  CriticalDefects: 1,
  NoCriticalDefects: 2,
  Artifacts: 3,
} as const;
