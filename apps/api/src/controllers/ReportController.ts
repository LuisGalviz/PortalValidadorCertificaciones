import { Profile } from '@portal/shared';
import type { Response } from 'express';
import { logger } from '../config/index.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { reportService } from '../services/ReportService.js';
import {
  createReportSchema,
  idParamSchema,
  reportFilterSchema,
  reviewReportSchema,
} from '../validators/index.js';

export class ReportController {
  async findAll(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid query parameters' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching reports' });
    }
  }

  async findById(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid report ID' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching report' });
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid report data' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error creating report' });
    }
  }

  async review(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid review data' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error reviewing report' });
    }
  }

  async getIndependent(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      res.status(500).json({ success: false, error: 'Error fetching independent reports' });
    }
  }
}

export const reportController = new ReportController();
