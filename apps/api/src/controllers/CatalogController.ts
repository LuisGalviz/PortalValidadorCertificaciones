import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { TypeOrganism } from '../models/index.js';
import { catalogService } from '../services/CatalogService.js';
import { checkListService } from '../services/CheckListService.js';

export class CatalogController {
  async getTypeOrganisms(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const types = await TypeOrganism.findAll({
        where: { active: true },
        order: [['name', 'ASC']],
      });

      res.json({
        success: true,
        data: types,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error fetching organism types' });
    }
  }

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

  async getCheckList(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const inspectionTypeParam = req.params.inspectionType;
      const inspectionType = Number.parseInt(
        Array.isArray(inspectionTypeParam) ? inspectionTypeParam[0] : inspectionTypeParam,
        10
      );
      if (Number.isNaN(inspectionType)) {
        res.status(400).json({ success: false, error: 'Invalid inspection type' });
        return;
      }

      const checkList = await checkListService.getCheckListByInspectionType(inspectionType);

      res.json({
        success: true,
        data: checkList,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error fetching checklist' });
    }
  }
}

export const catalogController = new CatalogController();
