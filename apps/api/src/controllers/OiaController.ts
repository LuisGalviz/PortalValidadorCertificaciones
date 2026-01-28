import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { oiaService } from '../services/OiaService.js';
import {
  createOiaSchema,
  idParamSchema,
  oiaFilterSchema,
  updateOiaSchema,
} from '../validators/index.js';

export class OiaController {
  async findAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = oiaFilterSchema.parse(req.query);
      const result = await oiaService.findAll(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid query parameters' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching OIAs' });
    }
  }

  async findById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const oia = await oiaService.findById(id);

      if (!oia) {
        res.status(404).json({ success: false, error: 'OIA not found' });
        return;
      }

      res.json({
        success: true,
        data: oia,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid OIA ID' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching OIA' });
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = createOiaSchema.parse(req.body);

      // Check if OIA with same identification exists
      const existing = await oiaService.findByIdentification(data.identification);
      if (existing) {
        res
          .status(409)
          .json({ success: false, error: 'OIA with this identification already exists' });
        return;
      }

      const oia = await oiaService.create(data);

      res.status(201).json({
        success: true,
        data: oia,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid OIA data' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error creating OIA' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateOiaSchema.parse(req.body);

      const oia = await oiaService.update(id, data);

      if (!oia) {
        res.status(404).json({ success: false, error: 'OIA not found' });
        return;
      }

      res.json({
        success: true,
        data: oia,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid OIA data' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error updating OIA' });
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const users = await oiaService.getUsers(id);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid OIA ID' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching OIA users' });
    }
  }
}

export const oiaController = new OiaController();
