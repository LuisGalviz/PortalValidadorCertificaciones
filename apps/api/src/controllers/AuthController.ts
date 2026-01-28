import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export class AuthController {
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    res.json({
      success: true,
      data: req.user,
    });
  }

  async logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

export const authController = new AuthController();
