import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { constructionCompanyService } from '../services/ConstructionCompanyService.js';
import {
  constructionCompanyFilterSchema,
  createConstructionCompanySchema,
  idParamSchema,
} from '../validators/index.js';

export class ConstructionCompanyController {
  async findAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = constructionCompanyFilterSchema.parse(req.query);
      const result = await constructionCompanyService.findAll(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid query parameters' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching construction companies' });
    }
  }

  async findById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const company = await constructionCompanyService.findById(id);

      if (!company) {
        res.status(404).json({ success: false, error: 'Construction company not found' });
        return;
      }

      res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid ID' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching construction company' });
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = createConstructionCompanySchema.parse(req.body);

      // Check if company with same NIT exists
      const existing = await constructionCompanyService.findByNit(data.nit);
      if (existing) {
        res.status(409).json({
          success: false,
          error: 'Construction company with this NIT already exists',
        });
        return;
      }

      const company = await constructionCompanyService.create(data);

      res.status(201).json({
        success: true,
        data: company,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid construction company data' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error creating construction company' });
    }
  }

  async getActive(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const companies = await constructionCompanyService.getActiveCompanies();

      res.json({
        success: true,
        data: companies,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, error: 'Error fetching active construction companies' });
    }
  }
}

export const constructionCompanyController = new ConstructionCompanyController();
