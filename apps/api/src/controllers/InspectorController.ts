import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { inspectorService } from '../services/InspectorService.js';
import {
  inspectorFilterSchema,
  createInspectorSchema,
  updateInspectorSchema,
  idParamSchema,
} from '../validators/index.js';
import { Profile } from '@portal/shared';

export class InspectorController {
  async findAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = inspectorFilterSchema.parse(req.query);

      // OIA users can only see their own inspectors
      if (req.user?.permission === Profile.Oia && req.user.oiaId) {
        filters.oiaId = req.user.oiaId;
      }

      const result = await inspectorService.findAll(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid query parameters' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching inspectors' });
    }
  }

  async findById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const inspector = await inspectorService.findById(id);

      if (!inspector) {
        res.status(404).json({ success: false, error: 'Inspector not found' });
        return;
      }

      // OIA users can only see their own inspectors
      if (req.user?.permission === Profile.Oia && inspector.oiaId !== req.user.oiaId) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      res.json({
        success: true,
        data: inspector,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid inspector ID' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error fetching inspector' });
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = createInspectorSchema.parse(req.body);

      // OIA users can only create inspectors for their OIA
      if (req.user?.permission === Profile.Oia) {
        if (!req.user.oiaId) {
          res.status(403).json({ success: false, error: 'OIA not assigned' });
          return;
        }
        data.oiaId = req.user.oiaId;
      }

      // Check if inspector with same identification exists in the OIA
      const existing = await inspectorService.findByIdentification(data.identification, data.oiaId);
      if (existing) {
        res.status(409).json({
          success: false,
          error: 'Inspector with this identification already exists in this OIA',
        });
        return;
      }

      const inspector = await inspectorService.create(data);

      res.status(201).json({
        success: true,
        data: inspector,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid inspector data' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error creating inspector' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateInspectorSchema.parse(req.body);

      // Check if inspector exists and user has access
      const existing = await inspectorService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Inspector not found' });
        return;
      }

      // OIA users can only update their own inspectors
      if (req.user?.permission === Profile.Oia && existing.oiaId !== req.user.oiaId) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      const inspector = await inspectorService.update(id, data);

      res.json({
        success: true,
        data: inspector,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid inspector data' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error updating inspector' });
    }
  }
}

export const inspectorController = new InspectorController();
