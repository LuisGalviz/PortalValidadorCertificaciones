import { OiaStatusCode } from '@portal/shared';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/index.js';
import { oiaService } from '../services/OiaService.js';
import {
  createOiaSchema,
  idParamSchema,
  oiaFilterSchema,
  updateOiaSchema,
  updateOwnOiaSchema,
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

  async findOwn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const oiaId = req.user?.oiaId;

      if (!oiaId) {
        res.status(403).json({ success: false, error: 'No OIA assigned to user' });
        return;
      }

      const oia = await oiaService.findById(oiaId, true);

      if (!oia) {
        res.status(404).json({ success: false, error: 'OIA not found' });
        return;
      }

      res.json({
        success: true,
        data: oia,
      });
    } catch (error) {
      console.error('Error fetching OIA data:', error);
      res.status(500).json({ success: false, error: 'Error fetching OIA data' });
    }
  }

  async updateOwn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const oiaId = req.user?.oiaId;
      const userId = req.user?.id;

      if (!oiaId) {
        res.status(403).json({ success: false, error: 'No OIA assigned to user' });
        return;
      }

      const files = (
        req as AuthenticatedRequest & {
          files?: Record<string, { buffer: Buffer; originalname: string; mimetype: string }[]>;
        }
      ).files;

      const data = updateOwnOiaSchema.parse(req.body);

      const { userName, userPhone, userEmail, ...oiaData } = data;

      const updateOiaData = {
        ...oiaData,
        status: OiaStatusCode.Pending,
      };

      const oia = await oiaService.update(oiaId, updateOiaData);

      if (!oia) {
        res.status(404).json({ success: false, error: 'OIA not found' });
        return;
      }

      if (files) {
        if (files.fileOnac?.[0]) {
          await oiaService.saveFile(
            oiaId,
            {
              data: files.fileOnac[0].buffer,
              name: files.fileOnac[0].originalname,
              mimetype: files.fileOnac[0].mimetype,
            },
            'ONAC'
          );
        }
        if (files.fileCRT?.[0]) {
          await oiaService.saveFile(
            oiaId,
            {
              data: files.fileCRT[0].buffer,
              name: files.fileCRT[0].originalname,
              mimetype: files.fileCRT[0].mimetype,
            },
            'CRT'
          );
        }
      }

      if (userId && userId > 0) {
        await User.update(
          {
            name: userName,
            phone: userPhone,
            email: userEmail,
          },
          { where: { id: userId } }
        );
      }

      const updatedOia = await oiaService.findById(oiaId, true);

      res.json({
        success: true,
        data: updatedOia,
        message: 'Datos actualizados. Su solicitud está pendiente de revisión.',
      });
    } catch (err) {
      console.error('Error updating OIA data:', err);
      if (err instanceof Error && err.name === 'ZodError') {
        res.status(400).json({ success: false, error: 'Invalid OIA data' });
        return;
      }
      res.status(500).json({ success: false, error: 'Error updating OIA data' });
    }
  }
}

export const oiaController = new OiaController();
