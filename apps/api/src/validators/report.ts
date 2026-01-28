import { z } from 'zod';
import { paginationSchema } from './common.js';

export const reportFilterSchema = paginationSchema.extend({
  status: z.coerce.number().int().optional(),
  oiaId: z.coerce.number().int().positive().optional(),
  inspectorId: z.coerce.number().int().positive().optional(),
  inspectionType: z.coerce.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export const createReportSchema = z.object({
  orderExternal: z.string().optional(),
  orderId: z.number().int().optional(),
  inspectionType: z.number().int(),
  inspectionResult: z.number().int(),
  inspectionDate: z.string().or(z.date()),
  oiaId: z.number().int().positive(),
  inspectorId: z.number().int().positive(),
  subscriptionId: z.number().int().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  lineType: z.number().int().optional(),
  causalCriticalDefects: z.record(z.unknown()).optional(),
  causalNoCriticalDefects: z.record(z.unknown()).optional(),
  causalArtifacts: z.record(z.unknown()).optional(),
  origin: z.number().int().optional(),
  project: z.string().optional(),
  constructionCompanyId: z.number().int().optional(),
  unregisteredConstructionCompany: z.string().optional(),
  department: z.string().optional(),
});

export const reviewReportSchema = z.object({
  status: z.number().int(),
  comment: z.string().optional(),
  causalId: z.number().int().optional(),
});

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
