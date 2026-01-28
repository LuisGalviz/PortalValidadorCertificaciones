export const JobsTypeText = {
  uploadReportFiles: 'uploadReportFiles',
  uploadReportFilesMOV: 'uploadReportFilesMOV',
  uploadReportFile: 'uploadReportFile',
  uploadReportFileIndependent: 'uploadReportFileIndependent',
  updateCertificateStatusOSF: 'updateCertificateStatusOSF',
  updateCertificateStatusOSFIndependent: 'updateCertificateStatusOSFIndependent',
  updateReportCertificate: 'updateReportCertificate',
  GetCertificateOSF: 'getCertificateOSF',
  CreateCertificateOSF: 'createCertificateOSF',
  uploadcertificatesOIA: 'uploadcertificatesOIA',
  uploadcertificatesInspector: 'uploadcertificatesInspector',
  uploadReportJSon: 'uploadReportJson',
  updateReportProject: 'updateReportProject',
  getReportFilesLO: 'getReportCertificateLO',
  OnBaseNotification: 'OnBaseNotification',
  OnBaseNotificationStandalone: 'OnBaseNotificationStandalone',
  OnBaseNotificationIndependent: 'OnBaseNotificationIndependent',
  ReportValidatedLO: 'reportValidatedLO',
  ReportValidatedMOV: 'reportValidatedMOV',
  DigitalSaleNotification: 'digitalSaleNotification',
  RevisarInspeccion: 'revisarInspeccion',
  AssociateInspector: 'associateInspector',
  UpdateStatusCertificateExpired: 'updateStatusCertificateExpired',
  SendEmail: 'sendEmail',
} as const;

export type JobsTypeTextValue = (typeof JobsTypeText)[keyof typeof JobsTypeText];

export const StatusJobs = {
  Pending: 'P',
  Completed: 'C',
  Failure: 'F',
} as const;

export type StatusJobsValue = (typeof StatusJobs)[keyof typeof StatusJobs];
