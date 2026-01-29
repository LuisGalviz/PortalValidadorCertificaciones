import { Permissions, hasPermission } from '@portal/shared';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { OiaUsers, Permission as PermissionModel, User } from '../models/index.js';

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  permission: string | null;
  oiaId?: number | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface JWTPayload {
  email?: string;
  preferred_username?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function ensureAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = decodeJWT(token);

    if (!payload) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      res.status(401).json({ success: false, error: 'Token expired' });
      return;
    }

    const email = payload.email || payload.preferred_username;

    if (!email) {
      res.status(401).json({ success: false, error: 'Invalid token content' });
      return;
    }

    const user = await User.findOne({
      where: { authEmail: email },
      include: [
        { model: PermissionModel, as: 'permission' },
        { model: OiaUsers, as: 'oiaUser' },
      ],
    });

    if (!user) {
      req.user = {
        id: 0,
        name: payload.name || email,
        email: email,
        permission: null,
        oiaId: null,
      };
      next();
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      permission: user.permission?.permission?.toString() || null,
      oiaId: (user as unknown as { oiaUser?: { oiaId: number } }).oiaUser?.oiaId || null,
    };

    next();
  } catch (error) {
    logger.error({ err: error }, 'Authentication error');
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
}

export function requirePermission(requiredPermission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const userRole = req.user.permission;

    if (!hasPermission(userRole, requiredPermission)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export const canReadReports = requirePermission(Permissions.REPORTS_READ);
export const canCreateReports = requirePermission(Permissions.REPORTS_CREATE);
export const canReviewReports = requirePermission(Permissions.REPORTS_REVIEW);

export const canReadOias = requirePermission(Permissions.OIAS_READ);
export const canReadOwnOia = requirePermission(Permissions.OIAS_READ_OWN);
export const canCreateOias = requirePermission(Permissions.OIAS_CREATE);
export const canUpdateOias = requirePermission(Permissions.OIAS_UPDATE);
export const canUpdateOwnOia = requirePermission(Permissions.OIAS_UPDATE_OWN);

export const canReadInspectors = requirePermission(Permissions.INSPECTORS_READ);
export const canCreateInspectors = requirePermission(Permissions.INSPECTORS_CREATE);
export const canUpdateInspectors = requirePermission(Permissions.INSPECTORS_UPDATE);

export const canReadCompanies = requirePermission(Permissions.COMPANIES_READ);
export const canCreateCompanies = requirePermission(Permissions.COMPANIES_CREATE);

export const canReadDashboard = requirePermission(Permissions.DASHBOARD_READ);
