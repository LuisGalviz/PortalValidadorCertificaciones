import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { handleControllerError } from '../middleware/handleControllerError.js';
import { constructionCompanyService } from '../services/ConstructionCompanyService.js';
import {
  constructionCompanyFilterSchema,
  createConstructionCompanySchema,
  idParamSchema,
} from '../validators/index.js';

export class ConstructionCompanyController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = constructionCompanyFilterSchema.parse(req.query);
      const result = await constructionCompanyService.findAll(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching construction companies', {
        zodMessage: 'Invalid query parameters',
      });
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
      handleControllerError(error, next, 'Error fetching construction company', {
        zodMessage: 'Invalid ID',
      });
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
      handleControllerError(error, next, 'Error creating construction company', {
        zodMessage: 'Invalid construction company data',
      });
    }
  }

  async getActive(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companies = await constructionCompanyService.getActiveCompanies();

      res.json({
        success: true,
        data: companies,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching active construction companies');
    }
  }
}

export const constructionCompanyController = new ConstructionCompanyController();
