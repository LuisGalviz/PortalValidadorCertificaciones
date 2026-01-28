import { z } from 'zod';
import { paginationSchema } from './common.js';

export const inspectorFilterSchema = paginationSchema.extend({
  status: z.coerce.number().int().optional(),
  oiaId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export const createInspectorSchema = z.object({
  identification: z.number().int(),
  name: z.string().min(1),
  nameOrganism: z.string().min(1),
  codeCertificate: z.string().min(1),
  certificateEffectiveDate: z.string().or(z.date()).optional(),
  email: z.string().email().optional(),
  phone: z.number().int().optional(),
  oiaId: z.number().int().positive(),
  operatingUnitId: z.number().int().optional(),
});

export const updateInspectorSchema = createInspectorSchema.partial().extend({
  status: z.number().int().optional(),
  comment: z.string().optional(),
  active: z.boolean().optional(),
});

export type InspectorFilterInput = z.infer<typeof inspectorFilterSchema>;
export type CreateInspectorInput = z.infer<typeof createInspectorSchema>;
export type UpdateInspectorInput = z.infer<typeof updateInspectorSchema>;
