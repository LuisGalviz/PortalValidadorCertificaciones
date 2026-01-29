import { Profile, type ProfileType } from '../enums/profile.js';

export const Permissions = {
  // Reportes
  REPORTS_READ: 'reports:read',
  REPORTS_CREATE: 'reports:create',
  REPORTS_REVIEW: 'reports:review',

  // OIAs
  OIAS_READ: 'oias:read',
  OIAS_READ_OWN: 'oias:read:own',
  OIAS_CREATE: 'oias:create',
  OIAS_UPDATE: 'oias:update',
  OIAS_UPDATE_OWN: 'oias:update:own',

  // Inspectores
  INSPECTORS_READ: 'inspectors:read',
  INSPECTORS_CREATE: 'inspectors:create',
  INSPECTORS_UPDATE: 'inspectors:update',

  // Empresas Constructoras
  COMPANIES_READ: 'companies:read',
  COMPANIES_CREATE: 'companies:create',

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',
} as const;

export type PermissionType = (typeof Permissions)[keyof typeof Permissions];

const ALL = '*';

export const RolePermissions: Record<ProfileType, readonly string[]> = {
  [Profile.Admin]: [ALL],

  [Profile.Funcional]: [
    Permissions.REPORTS_READ,
    Permissions.REPORTS_REVIEW,
    Permissions.OIAS_READ,
    Permissions.OIAS_CREATE,
    Permissions.OIAS_UPDATE,
    Permissions.INSPECTORS_READ,
    Permissions.INSPECTORS_CREATE,
    Permissions.INSPECTORS_UPDATE,
    Permissions.COMPANIES_READ,
    Permissions.COMPANIES_CREATE,
    Permissions.DASHBOARD_READ,
  ],

  [Profile.Oia]: [
    Permissions.REPORTS_READ,
    Permissions.REPORTS_CREATE,
    Permissions.OIAS_READ_OWN,
    Permissions.OIAS_UPDATE_OWN,
    Permissions.INSPECTORS_READ,
    Permissions.INSPECTORS_CREATE,
    Permissions.INSPECTORS_UPDATE,
    Permissions.DASHBOARD_READ,
  ],
};

export function hasPermission(role: string | null, permission: string): boolean {
  if (!role) return false;

  const permissions = RolePermissions[role as ProfileType];
  if (!permissions) return false;

  if (permissions.includes(ALL)) return true;

  if (permissions.includes(permission)) return true;

  const [category] = permission.split(':');
  if (permissions.includes(`${category}:*`)) return true;

  return false;
}

export function getPermissionsForRole(role: string | null): readonly string[] {
  if (!role) return [];
  return RolePermissions[role as ProfileType] || [];
}
