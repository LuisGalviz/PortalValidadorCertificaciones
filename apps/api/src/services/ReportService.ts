import {
  InspectionResultName,
  InspectionTypeName,
  ReportStatusText,
  StatusCode,
} from '@portal/shared';
import { Op } from 'sequelize';
import {
  Causal,
  ConstructionCompany,
  InspectionTypeList,
  Inspector,
  Oia,
  Order,
  Report,
  ReportFile,
} from '../models/index.js';
import type {
  CreateReportInput,
  ReportFilterInput,
  ReviewReportInput,
} from '../validators/report.js';

export class ReportService {
  async findAll(filters: ReportFilterInput) {
    const { page, limit, sortBy, sortOrder, status, oiaId, inspectorId, inspectionType, search } =
      filters;

    const where: Record<string, unknown> = {};

    if (status !== undefined) {
      where.status = status;
    }

    if (oiaId) {
      where.oiaId = oiaId;
    }

    if (inspectorId) {
      where.inspectorId = inspectorId;
    }

    if (inspectionType) {
      where.inspectionType = inspectionType;
    }

    if (search) {
      where[Op.or as unknown as string] = [
        { orderExternal: { [Op.iLike]: `%${search}%` } },
        { certificate: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: Oia, as: 'oia', attributes: ['id', 'name'] },
        { model: Inspector, as: 'inspector', attributes: ['id', 'name'] },
      ],
      order: [[sortBy || 'createdAt', sortOrder]],
      limit,
      offset,
    });

    const data = rows.map((report) => ({
      id: report.id,
      orderExternal: report.orderExternal,
      certificate: report.certificate,
      status: report.status,
      statusName: ReportStatusText[report.status] || 'Desconocido',
      inspectionType: report.inspectionType,
      inspectionTypeName: report.inspectionType
        ? InspectionTypeName[report.inspectionType]
        : undefined,
      inspectionDate: report.inspectionDate,
      oiaId: report.oiaId,
      oiaName: (report as unknown as { oia?: { name: string } }).oia?.name,
      inspectorId: report.inspectorId,
      inspectorName: (report as unknown as { inspector?: { name: string } }).inspector?.name,
      address: report.address,
      subscriptionId: report.subscriptionId,
      createdAt: report.createdAt,
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
    const report = await Report.findByPk(id, {
      include: [
        { model: Oia, as: 'oia', attributes: ['id', 'name'] },
        { model: Inspector, as: 'inspector', attributes: ['id', 'name'] },
        { model: ReportFile, as: 'files' },
        { model: Causal, as: 'causal' },
        { model: InspectionTypeList, as: 'inspectionTypeData' },
        { model: ConstructionCompany, as: 'constructionCompany' },
      ],
    });

    if (!report) {
      return null;
    }

    return {
      ...report.toJSON(),
      statusName: ReportStatusText[report.status] || 'Desconocido',
      inspectionTypeName: report.inspectionType
        ? InspectionTypeName[report.inspectionType]
        : undefined,
      inspectionResultName: report.inspectionResult
        ? InspectionResultName[report.inspectionResult]
        : undefined,
      oiaName: (report as unknown as { oia?: { name: string } }).oia?.name,
      inspectorName: (report as unknown as { inspector?: { name: string } }).inspector?.name,
    };
  }

  async create(data: CreateReportInput) {
    const report = await Report.create({
      ...data,
      inspectionDate: data.inspectionDate ? new Date(data.inspectionDate) : undefined,
      status: StatusCode.Pending,
    });

    return report;
  }

  async review(id: number, data: ReviewReportInput, userId: number) {
    const report = await Report.findByPk(id);

    if (!report) {
      return null;
    }

    await report.update({
      status: data.status,
      comment: data.comment,
      causalId: data.causalId,
      userId,
      reviewDate: new Date(),
    });

    return report;
  }

  async getStats(oiaId?: number) {
    const where: Record<string, unknown> = {};
    if (oiaId) {
      where.oiaId = oiaId;
    }

    const pending = await Report.count({ where: { ...where, status: StatusCode.Pending } });
    const approved = await Report.count({ where: { ...where, status: StatusCode.Approved } });
    const rejected = await Report.count({ where: { ...where, status: StatusCode.Rejected } });
    const inconsistent = await Report.count({
      where: { ...where, status: StatusCode.Inconsistent },
    });

    return {
      pending,
      approved,
      rejected,
      inconsistent,
      total: pending + approved + rejected + inconsistent,
    };
  }

  async getPendingReports(limit = 10, oiaId?: number) {
    const where: Record<string, unknown> = {
      status: StatusCode.Pending,
      certificateIdOSF: { [Op.not]: null },
      inspectorId: { [Op.not]: null },
      oiaId: { [Op.not]: null },
    };
    if (oiaId) {
      where.oiaId = oiaId;
    }

    const reports = await Report.findAll({
      attributes: ['id', 'orderId', 'subscriptionId', 'orderExternal', 'createdAt'],
      where,
      include: [
        { model: Oia, as: 'oia', attributes: ['name'] },
        { model: Order, as: 'order', attributes: ['taskTypeId'] },
        { model: InspectionTypeList, as: 'inspectionTypeData', attributes: ['description'] },
      ],
      order: [['createdAt', 'ASC']],
      limit,
    });

    return reports.map((report) => {
      const reportData = report as unknown as {
        oia?: { name: string };
        order?: { taskTypeId: number };
        inspectionTypeData?: { description: string };
      };
      return {
        id: report.id,
        orderId: report.orderId,
        orderExternal: report.orderExternal,
        subscriptionId: report.subscriptionId,
        inspectionType: reportData.inspectionTypeData?.description,
        oiaName: reportData.oia?.name,
        createdAt: report.createdAt,
      };
    });
  }
}

export const reportService = new ReportService();
