import { OiaStatusCode, StatusRequestText } from '@portal/shared';
import { Op } from 'sequelize';
import { OiaFileTypeCode, type OiaFileTypeCodeType } from '../models/OiaFile.js';
import {
  Inspector,
  Oia,
  OiaFile,
  OiaUsers,
  Permission,
  TypeOrganism,
  User,
} from '../models/index.js';
import type { CreateOiaInput, OiaFilterInput, UpdateOiaInput } from '../validators/oia.js';
import { s3Service } from './S3Service.js';

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

  async findById(id: number, includeFileUrls = false) {
    const baseIncludes = [
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
      { model: TypeOrganism, as: 'typeOrganism' },
    ];

    let oia: Oia | null = null;
    let files: Array<{ name: string; fileTypeCode: string }> = [];

    if (includeFileUrls) {
      try {
        oia = await Oia.findByPk(id, {
          include: [...baseIncludes, { model: OiaFile, as: 'files' }],
        });
        if (oia) {
          const oiaJson = oia.toJSON();
          files =
            (oiaJson as { files?: Array<{ name: string; fileTypeCode: string }> }).files || [];
        }
      } catch {
        oia = await Oia.findByPk(id, { include: baseIncludes });
      }
    } else {
      oia = await Oia.findByPk(id, { include: baseIncludes });
    }

    if (!oia) {
      return null;
    }

    const oiaData = oia.toJSON();
    const fileData = await this.getFileUrls(includeFileUrls, files);
    const notificationUser = await this.getNotificationUser(oia.userId);

    return {
      ...oiaData,
      statusName: getStatusName(oia.status),
      typeOrganismName: (oiaData as { typeOrganism?: { name: string } }).typeOrganism?.name || null,
      ...fileData,
      notificationUser,
    };
  }

  private async getFileUrls(
    includeFileUrls: boolean,
    files: Array<{ name: string; fileTypeCode: string }>
  ) {
    let fileONACUrl: string | null = null;
    let fileONACName: string | null = null;
    let fileCRTUrl: string | null = null;
    let fileCRTName: string | null = null;

    if (includeFileUrls && files.length > 0) {
      for (const file of files) {
        try {
          if (file.fileTypeCode === OiaFileTypeCode.ONAC) {
            fileONACUrl = await s3Service.getSignedUrl(file.name);
            fileONACName = file.name.split('/').pop() || file.name;
          } else if (file.fileTypeCode === OiaFileTypeCode.CRT) {
            fileCRTUrl = await s3Service.getSignedUrl(file.name);
            fileCRTName = file.name.split('/').pop() || file.name;
          }
        } catch {}
      }
    }

    return { fileONACUrl, fileONACName, fileCRTUrl, fileCRTName };
  }

  private async getNotificationUser(userId: number | null | undefined) {
    if (!userId) return null;
    const user = await User.findByPk(userId);
    if (!user) return null;

    return {
      name: user.name,
      phone: user.phone,
      email: user.email,
      authEmail: user.authEmail,
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

  async saveFile(
    oiaId: number,
    file: { data: Buffer; name: string; mimetype: string },
    typeCode: OiaFileTypeCodeType
  ) {
    const oia = await Oia.findByPk(oiaId);
    if (!oia) throw new Error('OIA not found');

    // Count existing files of same type to increment suffix
    const count = await OiaFile.count({
      where: {
        oiaId,
        fileTypeCode: typeCode,
      },
    });

    const suffix = count + 1;
    const typeLabel =
      typeCode === OiaFileTypeCode.ONAC ? 'Certificado_ONAC' : 'Certificado_Existencia_Legal';
    const s3Key = `CertificadosOIA/${oia.identification}/${oia.identification}_${typeLabel}_${suffix}.pdf`;

    // Upload to S3
    await s3Service.uploadFile(s3Key, file.data, file.mimetype);

    // Save record in DB
    return OiaFile.create({
      oiaId,
      name: s3Key,
      type: file.mimetype,
      fileTypeCode: typeCode,
      path: s3Key,
    });
  }
}

export const oiaService = new OiaService();
