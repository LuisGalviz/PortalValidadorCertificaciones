import { Op } from 'sequelize';
import { ConstructionCompany } from '../models/index.js';
import type {
  ConstructionCompanyFilterInput,
  CreateConstructionCompanyInput,
  UpdateConstructionCompanyInput,
} from '../validators/construction-company.js';

export class ConstructionCompanyService {
  async findAll(filters: ConstructionCompanyFilterInput) {
    const { page, limit, sortBy, sortOrder, search } = filters;

    const where: Record<string, unknown> = {};

    if (search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { nit: { [Op.iLike]: `%${search}%` } },
        { rufiCode: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ConstructionCompany.findAndCountAll({
      where,
      order: [[sortBy || 'createdAt', sortOrder]],
      limit,
      offset,
    });

    const data = rows.map((company) => ({
      id: company.id,
      nit: company.nit,
      name: company.name,
      rufiCode: company.rufiCode,
      category: company.category,
      contractStatus: company.contractStatus,
      cityCompany: company.cityCompany,
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
    return ConstructionCompany.findByPk(id);
  }

  async create(data: CreateConstructionCompanyInput) {
    return ConstructionCompany.create(data);
  }

  async update(id: number, data: UpdateConstructionCompanyInput) {
    const company = await ConstructionCompany.findByPk(id);

    if (!company) {
      return null;
    }

    await company.update(data);
    return company;
  }

  async findByNit(nit: string) {
    return ConstructionCompany.findOne({ where: { nit } });
  }

  async getActiveCompanies() {
    return ConstructionCompany.findAll({
      where: { contractStatus: 'ACTIVO' },
      order: [['name', 'ASC']],
    });
  }
}

export const constructionCompanyService = new ConstructionCompanyService();
