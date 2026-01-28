import { z } from 'zod';
import { paginationSchema } from './common.js';

export const oiaFilterSchema = paginationSchema.extend({
  status: z.coerce.number().int().optional(),
  search: z.string().optional(),
});

export const createOiaSchema = z.object({
  identification: z.number().int(),
  name: z.string().min(1),
  codeAcred: z.string().min(1),
  effectiveDate: z.string().or(z.date()).optional(),
  cedRepLegal: z.number().int().optional(),
  nameRepLegal: z.string().optional(),
  addressRepLegal: z.string().optional(),
  typeOrganismId: z.number().int().optional(),
  addressOrganism: z.string().optional(),
  nameContact: z.string().optional(),
  phoneContact: z.number().int().optional(),
  phoneContactAlternative: z.number().int().optional(),
  emailContact: z.string().email().optional(),
  codeOrganism: z.number().int().optional(),
  organismCodes: z.record(z.unknown()).optional(),
});

export const updateOiaSchema = createOiaSchema.partial().extend({
  status: z.number().int().optional(),
  comment: z.string().optional(),
  active: z.boolean().optional(),
});

export type OiaFilterInput = z.infer<typeof oiaFilterSchema>;
export type CreateOiaInput = z.infer<typeof createOiaSchema>;
export type UpdateOiaInput = z.infer<typeof updateOiaSchema>;
