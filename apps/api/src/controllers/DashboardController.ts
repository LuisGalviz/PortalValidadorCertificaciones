import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { reportService } from '../services/ReportService.js';
import { Profile } from '@portal/shared';

export class DashboardController {
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const oiaId =
        req.user?.permission === Profile.Oia ? req.user.oiaId ?? undefined : undefined;

      const stats = await reportService.getStats(oiaId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error fetching dashboard stats' });
    }
  }

  async getPendingReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;
      const oiaId =
        req.user?.permission === Profile.Oia ? req.user.oiaId ?? undefined : undefined;

      const reports = await reportService.getPendingReports(limit, oiaId);

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error fetching pending reports' });
    }
  }
}

export const dashboardController = new DashboardController();
