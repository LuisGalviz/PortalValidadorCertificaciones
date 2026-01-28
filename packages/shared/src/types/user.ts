import type { ProfileType } from '../enums/profile.js';

export interface User {
  id: number;
  name: string;
  shortName?: string | null;
  phone: number;
  email: string;
  authEmail?: string | null;
  otpCode?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: number;
  userId: number;
  permission: ProfileType | null;
  status: number | null;
  comment?: string | null;
}

export interface UserWithPermission extends User {
  permission?: Permission | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  permission: ProfileType | null;
  oiaId?: number | null;
}

export interface CreateUserInput {
  name: string;
  shortName?: string;
  phone: number;
  email: string;
  authEmail?: string;
  active?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  shortName?: string;
  phone?: number;
  email?: string;
  authEmail?: string;
  active?: boolean;
}
