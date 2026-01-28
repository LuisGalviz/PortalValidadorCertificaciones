import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { User, Permission, OiaUsers } from '../models/index.js';
import { Profile } from '@portal/shared';

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

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      res.status(401).json({ success: false, error: 'Token expired' });
      return;
    }

    // Get user email from token
    const email = payload.email || payload.preferred_username;

    if (!email) {
      res.status(401).json({ success: false, error: 'Invalid token content' });
      return;
    }

    // Find user in database
    const user = await User.findOne({
      where: { authEmail: email },
      include: [
        { model: Permission, as: 'permission' },
        { model: OiaUsers, as: 'oiaUser' },
      ],
    });

    if (!user) {
      // User exists in Keycloak but not in DB - return basic info from token
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
      permission: user.permission?.permission || null,
      oiaId: (user as unknown as { oiaUser?: { oiaId: number } }).oiaUser?.oiaId || null,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
}

export function requireRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const userPermission = req.user.permission;

    // Admin has access to everything
    if (userPermission === Profile.Admin) {
      next();
      return;
    }

    if (!userPermission || !allowedRoles.includes(userPermission)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export const requireAdmin = requireRoles([Profile.Admin]);
export const requireAdminOrStrategy = requireRoles([Profile.Admin, Profile.Strategy]);
export const requireAdminOrOia = requireRoles([Profile.Admin, Profile.Oia]);
export const requireOia = requireRoles([Profile.Oia]);

export function requireOiaOnly(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  if (req.user.permission !== Profile.Oia) {
    res.status(403).json({ success: false, error: 'OIA access only' });
    return;
  }

  next();
}
