import { InspectorStatusCode, StatusRequestText } from '@portal/shared';
import { Op } from 'sequelize';
import { Inspector, Oia } from '../models/index.js';
import type {
  CreateInspectorInput,
  InspectorFilterInput,
  UpdateInspectorInput,
} from '../validators/inspector.js';

const getStatusName = (status: number): string => {
  switch (status) {
    case InspectorStatusCode.Pending:
      return StatusRequestText.Pending;
    case InspectorStatusCode.Approved:
      return StatusRequestText.Approved;
    case InspectorStatusCode.Rejected:
      return StatusRequestText.Rejected;
    case InspectorStatusCode.Expired:
      return StatusRequestText.Expired;
    case InspectorStatusCode.Suspended:
      return StatusRequestText.Suspended;
    case InspectorStatusCode.Retired:
      return StatusRequestText.Retired;
    default:
      return 'Desconocido';
  }
};

export class InspectorService {
  async findAll(filters: InspectorFilterInput) {
    const { page, limit, sortBy, sortOrder, status, oiaId, search } = filters;

    const where: Record<string, unknown> = {};

    if (status !== undefined) {
      where.status = status;
    }

    if (oiaId) {
      where.oiaId = oiaId;
    }

    if (search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { codeCertificate: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Inspector.findAndCountAll({
      where,
      include: [{ model: Oia, as: 'oia', attributes: ['id', 'name'] }],
      order: [[sortBy || 'createdAt', sortOrder]],
      limit,
      offset,
    });

    const data = rows.map((inspector) => ({
      id: inspector.id,
      identification: inspector.identification,
      name: inspector.name,
      nameOrganism: inspector.nameOrganism,
      codeCertificate: inspector.codeCertificate,
      certificateEffectiveDate: inspector.certificateEffectiveDate,
      status: inspector.status,
      statusName: getStatusName(inspector.status),
      oiaId: inspector.oiaId,
      oiaName: (inspector as unknown as { oia?: { name: string } }).oia?.name,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: number) {
    const inspector = await Inspector.findByPk(id, {
      include: [{ model: Oia, as: 'oia', attributes: ['id', 'name'] }],
    });

    if (!inspector) {
      return null;
    }

    return {
      ...inspector.toJSON(),
      statusName: getStatusName(inspector.status),
      oiaName: (inspector as unknown as { oia?: { name: string } }).oia?.name,
    };
  }

  async create(data: CreateInspectorInput) {
    const inspector = await Inspector.create({
      ...data,
      certificateEffectiveDate: data.certificateEffectiveDate
        ? new Date(data.certificateEffectiveDate)
        : undefined,
      status: InspectorStatusCode.Pending,
      active: true,
    });

    return inspector;
  }

  async update(id: number, data: UpdateInspectorInput) {
    const inspector = await Inspector.findByPk(id);

    if (!inspector) {
      return null;
    }

    await inspector.update({
      ...data,
      certificateEffectiveDate: data.certificateEffectiveDate
        ? new Date(data.certificateEffectiveDate)
        : inspector.certificateEffectiveDate,
    });

    return inspector;
  }

  async findByOia(oiaId: number) {
    const inspectors = await Inspector.findAll({
      where: { oiaId, active: true },
      order: [['name', 'ASC']],
    });

    return inspectors.map((inspector) => ({
      id: inspector.id,
      identification: inspector.identification,
      name: inspector.name,
      codeCertificate: inspector.codeCertificate,
      status: inspector.status,
      statusName: getStatusName(inspector.status),
    }));
  }

  async findByIdentification(identification: number, oiaId: number) {
    return Inspector.findOne({ where: { identification, oiaId } });
  }
}

export const inspectorService = new InspectorService();
