import { OiaStatusCode, StatusRequestText } from '@portal/shared';
import { Op } from 'sequelize';
import { Inspector, Oia, OiaUsers, Permission, User } from '../models/index.js';
import type { CreateOiaInput, OiaFilterInput, UpdateOiaInput } from '../validators/oia.js';

const getStatusName = (status: number): string => {
  switch (status) {
    case OiaStatusCode.Pending:
      return StatusRequestText.Pending;
    case OiaStatusCode.Approved:
      return StatusRequestText.Approved;
    case OiaStatusCode.Rejected:
      return StatusRequestText.Rejected;
    case OiaStatusCode.Expired:
      return StatusRequestText.Expired;
    case OiaStatusCode.Suspended:
      return StatusRequestText.Suspended;
    case OiaStatusCode.Retired:
      return StatusRequestText.Retired;
    default:
      return 'Desconocido';
  }
};

export class OiaService {
  async findAll(filters: OiaFilterInput) {
    const { page, limit, sortBy, sortOrder, status, search } = filters;

    const where: Record<string, unknown> = {};

    if (status !== undefined) {
      where.status = status;
    }

    if (search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { codeAcred: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Oia.findAndCountAll({
      where,
      order: [[sortBy || 'createdAt', sortOrder]],
      limit,
      offset,
    });

    const data = rows.map((oia) => ({
      id: oia.id,
      identification: oia.identification,
      name: oia.name,
      codeAcred: oia.codeAcred,
      effectiveDate: oia.effectiveDate,
      status: oia.status,
      statusName: getStatusName(oia.status),
      active: oia.active,
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
    const oia = await Oia.findByPk(id, {
      include: [
        {
          model: OiaUsers,
          as: 'oiaUsers',
          include: [
            {
              model: User,
              include: [{ model: Permission, as: 'permission' }],
            },
          ],
        },
        { model: Inspector, as: 'inspectors' },
      ],
    });

    if (!oia) {
      return null;
    }

    return {
      ...oia.toJSON(),
      statusName: getStatusName(oia.status),
    };
  }

  async create(data: CreateOiaInput) {
    const oia = await Oia.create({
      ...data,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
      status: OiaStatusCode.Pending,
      active: true,
    });

    return oia;
  }

  async update(id: number, data: UpdateOiaInput) {
    const oia = await Oia.findByPk(id);

    if (!oia) {
      return null;
    }

    await oia.update({
      ...data,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : oia.effectiveDate,
    });

    return oia;
  }

  async getUsers(oiaId: number) {
    const oiaUsers = await OiaUsers.findAll({
      where: { oiaId },
      include: [
        {
          model: User,
          include: [{ model: Permission, as: 'permission' }],
        },
      ],
    });

    return oiaUsers.map((ou) => {
      const user = (ou as unknown as { user: User }).user;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        active: user.active,
        permission: (user as unknown as { permission?: Permission }).permission?.permission,
      };
    });
  }

  async findByIdentification(identification: number) {
    return Oia.findOne({ where: { identification } });
  }
}

export const oiaService = new OiaService();
