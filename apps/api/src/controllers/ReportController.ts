import { Profile } from '@portal/shared';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { handleControllerError } from '../middleware/handleControllerError.js';
import { reportService } from '../services/ReportService.js';
import {
  createReportSchema,
  idParamSchema,
  reportFilterSchema,
  reviewReportSchema,
} from '../validators/index.js';

export class ReportController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = reportFilterSchema.parse(req.query);

      // OIA users can only see their own reports
      if (req.user?.permission === Profile.Oia && req.user.oiaId) {
        filters.oiaId = req.user.oiaId;
      }

      const result = await reportService.findAll(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching reports', {
        zodMessage: 'Invalid query parameters',
      });
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);

      const report = await reportService.findById(id);

      if (!report) {
        res.status(404).json({ success: false, error: 'Report not found' });
        return;
      }

      // OIA users can only see their own reports
      if (req.user?.permission === Profile.Oia && report.oiaId !== req.user.oiaId) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching report', {
        zodMessage: 'Invalid report ID',
      });
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createReportSchema.parse(req.body);

      // OIA users can only create reports for their OIA
      if (req.user?.permission === Profile.Oia) {
        if (!req.user.oiaId) {
          res.status(403).json({ success: false, error: 'OIA not assigned' });
          return;
        }
        data.oiaId = req.user.oiaId;
      }

      const report = await reportService.create(data);

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error creating report', {
        zodMessage: 'Invalid report data',
      });
    }
  }

  async review(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = reviewReportSchema.parse(req.body);

      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const report = await reportService.review(id, data, req.user.id);

      if (!report) {
        res.status(404).json({ success: false, error: 'Report not found' });
        return;
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error reviewing report', {
        zodMessage: 'Invalid review data',
      });
    }
  }

  async getIndependent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = reportFilterSchema.parse(req.query);

      // Independent reports have no orderId
      const result = await reportService.findAll({
        ...filters,
        // Additional filter for independent reports would go here
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching independent reports');
    }
  }
}

export const reportController = new ReportController();
