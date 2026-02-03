import { Profile } from '@portal/shared';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { handleControllerError } from '../middleware/handleControllerError.js';
import { reportService } from '../services/ReportService.js';

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const oiaId =
        req.user?.permission === Profile.Oia ? (req.user.oiaId ?? undefined) : undefined;

      const stats = await reportService.getStats(oiaId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching dashboard stats');
    }
  }

  async getPendingReports(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;
      const oiaId =
        req.user?.permission === Profile.Oia ? (req.user.oiaId ?? undefined) : undefined;

      const reports = await reportService.getPendingReports(limit, oiaId);

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching pending reports');
    }
  }
}

export const dashboardController = new DashboardController();
