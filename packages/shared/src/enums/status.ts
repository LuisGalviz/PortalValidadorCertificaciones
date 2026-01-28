export const Status = {
  PendingAuto: -2,
  Pending: -1,
  Rejected: 0,
  Approved: 1,
  PreviousApproved: 4,
  Started: 2,
  Inconsistent: 3,
  ExpiredOiaAndInspector: 3,
  Suspended: 4,
  All: 5,
  Retired: 6,
  Canceled: 12,
} as const;

export type StatusType = (typeof Status)[keyof typeof Status];

export const StatusCode = {
  PendingAuto: Status.PendingAuto,
  Pending: Status.Pending,
  Rejected: Status.Rejected,
  Approved: Status.Approved,
  PreviousApproved: Status.PreviousApproved,
  Inconsistent: Status.Inconsistent,
  Started: Status.Started,
  Canceled: Status.Canceled,
} as const;

export type StatusCodeType = (typeof StatusCode)[keyof typeof StatusCode];

export const CodeStatusOSF = {
  legalized: 8,
  Canceled: 12,
} as const;

export const OiaStatusCode = {
  Pending: Status.Pending,
  Rejected: Status.Rejected,
  Approved: Status.Approved,
  Started: Status.Started,
  Expired: Status.ExpiredOiaAndInspector,
  Suspended: Status.Suspended,
  All: Status.All,
  Retired: Status.Retired,
} as const;

export type OiaStatusCodeType = (typeof OiaStatusCode)[keyof typeof OiaStatusCode];

export const InspectorStatusCode = {
  Pending: Status.Pending,
  Rejected: Status.Rejected,
  Approved: Status.Approved,
  Started: Status.Started,
  Expired: Status.ExpiredOiaAndInspector,
  Suspended: Status.Suspended,
  Retired: Status.Retired,
} as const;

export type InspectorStatusCodeType =
  (typeof InspectorStatusCode)[keyof typeof InspectorStatusCode];

export const StatusCodeReportsOia = {
  Pending: Status.Pending,
  Rejected: Status.Rejected,
  Approved: Status.Approved,
  Inconsistent: Status.Inconsistent,
  All: Status.All,
} as const;

export const StatusCertification = {
  Approved: 'A',
  Rejected: 'R',
} as const;

export const StatusRequestCode = {
  Pending: 'P',
  Rejected: 'R',
  Approved: 'A',
  Expired: 'E',
  Suspended: 'S',
} as const;

export const StatusRequestText = {
  Pending: 'Pendiente',
  Rejected: 'Rechazado',
  Approved: 'Aprobado',
  Expired: 'Vencido',
  Suspended: 'Suspendido',
  Retired: 'Retirado',
} as const;

export const ReportStatusText: Record<number, string> = {
  [StatusCode.Rejected]: 'Rechazado',
  [StatusCode.Approved]: 'Aprobado',
  [StatusCode.Pending]: 'Pendiente',
  [StatusCode.Inconsistent]: 'Inconsistente',
  [StatusCode.Started]: 'En proceso',
};

export const StatusFilterCodes = {
  All: 'all',
  Pending: 'pending',
  Rejected: 'rejected',
  Approved: 'approved',
  PreviousApproved: 'previousApproved',
  Started: 'started',
  Inconsistent: 'inconsistent',
} as const;

export type StatusFilterCodeType = (typeof StatusFilterCodes)[keyof typeof StatusFilterCodes];

export const StatusCodeCanNotValidate = [
  StatusCode.Rejected,
  StatusCode.Approved,
  StatusCode.Inconsistent,
  StatusCode.PreviousApproved,
];

export const StatusCodeOiaCanNotRegisterReport = [
  OiaStatusCode.Pending,
  OiaStatusCode.Rejected,
  OiaStatusCode.Suspended,
  OiaStatusCode.Retired,
  OiaStatusCode.Expired,
];
