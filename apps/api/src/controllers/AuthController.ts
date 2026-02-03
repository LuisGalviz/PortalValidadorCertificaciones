import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { handleControllerError } from '../middleware/handleControllerError.js';

export class AuthController {
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      res.json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching user info');
    }
  }

  async logout(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      handleControllerError(error, next, 'Error logging out');
    }
  }
}

export const authController = new AuthController();
