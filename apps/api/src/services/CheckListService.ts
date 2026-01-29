import { CheckList, InspectionTypeCheckList, ReportCheck } from '../models/index.js';

export interface CheckListItem {
  id: number;
  description: string;
  order: number;
  count: number;
  review?: boolean | null;
}

export class CheckListService {
  async getCheckListByInspectionType(inspectionType: number): Promise<CheckListItem[]> {
    const checkLists = await CheckList.findAll({
      include: [
        {
          model: InspectionTypeCheckList,
          as: 'inspectionTypes',
          where: { inspectionType },
          attributes: [],
        },
      ],
      where: { active: true },
      order: [['order', 'ASC']],
    });

    return checkLists.map((item, index) => ({
      id: item.id,
      description: item.description,
      order: item.order,
      count: index + 1,
    }));
  }

  async getCheckListWithReviews(
    inspectionType: number,
    reportId: number
  ): Promise<CheckListItem[]> {
    const checkLists = await this.getCheckListByInspectionType(inspectionType);

    const reviews = await ReportCheck.findAll({
      where: { reportId },
      raw: true,
    });

    const reviewMap = new Map(reviews.map((r) => [r.checkId, r.review]));

    return checkLists.map((item) => ({
      ...item,
      review: reviewMap.get(item.id) ?? null,
    }));
  }

  async saveCheckList(
    reportId: number,
    checks: Array<{ checkId: number; review: boolean }>
  ): Promise<void> {
    await ReportCheck.destroy({ where: { reportId } });

    await ReportCheck.bulkCreate(
      checks.map((check) => ({
        reportId,
        checkId: check.checkId,
        review: check.review,
      }))
    );
  }

  async countCheckList(inspectionType: number): Promise<number> {
    return CheckList.count({
      include: [
        {
          model: InspectionTypeCheckList,
          as: 'inspectionTypes',
          where: { inspectionType },
          attributes: [],
        },
      ],
      where: { active: true },
    });
  }
}

export const checkListService = new CheckListService();
