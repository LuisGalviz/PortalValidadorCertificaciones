import { Causal, InspectionTypeList } from '../models/index.js';

export class CatalogService {
  async getInspectionTypes() {
    return InspectionTypeList.findAll({
      where: { active: true },
      order: [['description', 'ASC']],
    });
  }

  async getCausals() {
    return Causal.findAll({
      where: { active: true },
      order: [['description', 'ASC']],
    });
  }
}

export const catalogService = new CatalogService();
