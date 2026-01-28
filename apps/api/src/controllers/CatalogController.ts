import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { catalogService } from '../services/CatalogService.js';

export class CatalogController {
  async getInspectionTypes(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const types = await catalogService.getInspectionTypes();

      res.json({
        success: true,
        data: types,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error fetching inspection types' });
    }
  }

  async getCausals(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const causals = await catalogService.getCausals();

      res.json({
        success: true,
        data: causals,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error fetching causals' });
    }
  }
}

export const catalogController = new CatalogController();
