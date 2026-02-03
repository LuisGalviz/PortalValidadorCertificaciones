import { OiaStatusCode, Profile } from '@portal/shared';
import type { NextFunction, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { handleControllerError } from '../middleware/handleControllerError.js';
import { Oia, OiaUsers, Permission, User } from '../models/index.js';
import { OiaFileSaveError, OiaFileUploadError, oiaService } from '../services/OiaService.js';
import {
  createOiaSchema,
  idParamSchema,
  oiaFilterSchema,
  registerOiaSchema,
  updateOiaSchema,
  updateOwnOiaSchema,
} from '../validators/index.js';

type MulterFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

type OrganismCode = {
  gasera: string;
  codigo: string;
};

function isRegisterRequest(body?: Record<string, unknown>): boolean {
  if (!body) return false;
  return Boolean(body.userName || body.userEmail || body.userPhone);
}

async function respondIfOiaExists(identification: number, res: Response): Promise<boolean> {
  const existing = await oiaService.findByIdentification(identification);
  if (!existing) return false;

  res.status(409).json({ success: false, error: 'OIA with this identification already exists' });
  return true;
}

async function respondIfUserExists(email: string, res: Response): Promise<boolean> {
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ authEmail: email }, { email }],
    },
  });

  if (!existingUser) return false;

  res.status(409).json({
    success: false,
    error: 'Ya existe un usuario con el correo indicado',
  });
  return true;
}

function getRegisterFiles(
  req: AuthenticatedRequest & { files?: Record<string, MulterFile[]> },
  res: Response
): { fileOnac: MulterFile; fileCRT: MulterFile } | null {
  const fileOnac = req.files?.fileOnac?.[0];
  const fileCRT = req.files?.fileCRT?.[0] || req.files?.fileExistenceCertificate?.[0];

  if (!fileOnac || !fileCRT) {
    res.status(400).json({
      success: false,
      error: 'Debe cargar los certificados ONAC y de existencia',
    });
    return null;
  }

  return { fileOnac, fileCRT };
}

function getOrganismCodes(raw: unknown, res: Response): OrganismCode[] | undefined | null {
  try {
    return parseOrganismCodes(raw);
  } catch (parseError) {
    res.status(400).json({
      success: false,
      error: parseError instanceof Error ? parseError.message : 'Datos inválidos',
    });
    return null;
  }
}

function parseOrganismCodes(raw: unknown): OrganismCode[] | undefined {
  if (raw === undefined || raw === null || raw === '') {
    return undefined;
  }

  let parsed = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error('Formato inválido para los códigos de organismo');
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Formato inválido para los códigos de organismo');
  }

  const normalized = parsed.map((item) => ({
    gasera: String(item?.gasera ?? '').trim(),
    codigo: String(item?.codigo ?? '').trim(),
  }));

  if (normalized.some((item) => !item.gasera || !item.codigo)) {
    throw new Error('Formato inválido para los códigos de organismo');
  }

  const gaseras = normalized.map((item) => item.gasera);
  if (new Set(gaseras).size !== gaseras.length) {
    throw new Error('No puede haber gaseras repetidas');
  }

  return normalized;
}

export class OiaController {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = oiaFilterSchema.parse(req.query);
      const result = await oiaService.findAll(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching OIAs', {
        zodMessage: 'Invalid query parameters',
      });
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const includeFiles = req.query.includeFiles === 'true' || req.query.includeFiles === '1';
      const oia = await oiaService.findById(id, includeFiles);

      if (!oia) {
        res.status(404).json({ success: false, error: 'OIA not found' });
        return;
      }

      res.json({
        success: true,
        data: oia,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching OIA', {
        zodMessage: 'Invalid OIA ID',
      });
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (isRegisterRequest(req.body)) {
        await this.createWithRegistration(req, res);
        return;
      }

      await this.createSimple(req, res);
    } catch (error) {
      if (error instanceof OiaFileUploadError || error instanceof OiaFileSaveError) {
        handleControllerError(error, next, error.message, { statusCode: 500 });
        return;
      }
      handleControllerError(error, next, 'Error creating OIA', {
        zodMessage: 'Invalid OIA data',
      });
    }
  }

  private async createSimple(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = createOiaSchema.parse(req.body);

    if (await respondIfOiaExists(data.identification, res)) {
      return;
    }

    const oia = await oiaService.create(data);

    res.status(201).json({
      success: true,
      data: oia,
    });
  }

  private async createWithRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
    const files = getRegisterFiles(
      req as AuthenticatedRequest & { files?: Record<string, MulterFile[]> },
      res
    );
    if (!files) {
      await transaction.rollback();
      return;
    }

    const parsedOrganismCodes = getOrganismCodes(req.body?.organismCodes, res);
    if (parsedOrganismCodes === null) {
      await transaction.rollback();
      return;
    }

    try {
      const data = registerOiaSchema.parse({
        ...req.body,
        organismCodes: parsedOrganismCodes,
      });

      if (await respondIfOiaExists(data.identification, res)) {
        await transaction.rollback();
        return;
      }

      if (await respondIfUserExists(data.userEmail, res)) {
        await transaction.rollback();
        return;
      }

      const status = OiaStatusCode.Approved;
      const active = true;

      const user = await User.create(
        {
          name: data.userName,
          phone: data.userPhone,
          email: data.userEmail,
          authEmail: data.userEmail,
          active,
        },
        { transaction }
      );

      await Permission.create(
        {
          userId: user.id,
          permission: Profile.Oia as unknown as number,
        },
        { transaction }
      );

      const oia = await Oia.create(
        {
          identification: data.identification,
          name: data.name,
          codeAcred: data.codeAcred,
          effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
          cedRepLegal: data.cedRepLegal,
          nameRepLegal: data.nameRepLegal,
          addressRepLegal: data.addressRepLegal,
          typeOrganismId: data.typeOrganismId,
          addressOrganism: data.addressOrganism,
          nameContact: data.nameContact,
          phoneContact: data.phoneContact,
          phoneContactAlternative: data.phoneContactAlternative,
          emailContact: data.emailContact || data.userEmail,
          codeOrganism: data.codeOrganism,
          organismCodes: data.organismCodes ?? null,
          acceptedTermsAndConditions: data.acceptedTermsAndConditions ?? false,
          userId: user.id,
          status,
          active,
        },
        { transaction }
      );

      await OiaUsers.create(
        {
          oiaId: oia.id,
          userId: user.id,
          createdAt: new Date(),
        },
        { transaction }
      );

      await oiaService.saveFile(
        oia.id,
        {
          data: files.fileOnac.buffer,
          name: files.fileOnac.originalname,
          mimetype: files.fileOnac.mimetype,
        },
        'ONAC',
        transaction
      );

      await oiaService.saveFile(
        oia.id,
        {
          data: files.fileCRT.buffer,
          name: files.fileCRT.originalname,
          mimetype: files.fileCRT.mimetype,
        },
        'CRT',
        transaction
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        data: oia,
        message: 'OIA registrado correctamente',
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const parsedOrganismCodes = getOrganismCodes(req.body?.organismCodes, res);
      if (parsedOrganismCodes === null) {
        return;
      }

      const data = updateOiaSchema.parse({
        ...req.body,
        organismCodes: parsedOrganismCodes,
      });

      const oia = await oiaService.update(id, data);

      if (!oia) {
        res.status(404).json({ success: false, error: 'OIA not found' });
        return;
      }

      const files = (
        req as AuthenticatedRequest & {
          files?: Record<string, { buffer: Buffer; originalname: string; mimetype: string }[]>;
        }
      ).files;

      if (files) {
        if (files.fileOnac?.[0]) {
          await oiaService.saveFile(
            oia.id,
            {
              data: files.fileOnac[0].buffer,
              name: files.fileOnac[0].originalname,
              mimetype: files.fileOnac[0].mimetype,
            },
            'ONAC'
          );
        }

        const fileCRT = files.fileCRT?.[0] || files.fileExistenceCertificate?.[0];
        if (fileCRT) {
          await oiaService.saveFile(
            oia.id,
            {
              data: fileCRT.buffer,
              name: fileCRT.originalname,
              mimetype: fileCRT.mimetype,
            },
            'CRT'
          );
        }
      }

      res.json({
        success: true,
        data: oia,
      });
    } catch (error) {
      if (error instanceof OiaFileUploadError || error instanceof OiaFileSaveError) {
        handleControllerError(error, next, error.message, { statusCode: 500 });
        return;
      }
      handleControllerError(error, next, 'Error updating OIA', {
        zodMessage: 'Invalid OIA data',
      });
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const users = await oiaService.getUsers(id);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      handleControllerError(error, next, 'Error fetching OIA users', {
        zodMessage: 'Invalid OIA ID',
      });
    }
  }

  async findOwn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
      handleControllerError(error, next, 'Error fetching OIA data');
    }
  }

  async updateOwn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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
      handleControllerError(err, next, 'Error updating OIA data', {
        zodMessage: 'Invalid OIA data',
      });
    }
  }
}

export const oiaController = new OiaController();
