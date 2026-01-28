import { z } from 'zod';
import { paginationSchema } from './common.js';

export const constructionCompanyFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const createConstructionCompanySchema = z.object({
  nit: z.string().min(1),
  name: z.string().min(1),
  rufiCode: z.string().min(1),
  category: z.number().int(),
  stateSIC: z.number().int(),
  contractStatus: z.string().min(1),
  addressCompany: z.string().min(1),
  cityCompany: z.string().min(1),
});

export const updateConstructionCompanySchema = createConstructionCompanySchema.partial();

export type ConstructionCompanyFilterInput = z.infer<typeof constructionCompanyFilterSchema>;
export type CreateConstructionCompanyInput = z.infer<typeof createConstructionCompanySchema>;
export type UpdateConstructionCompanyInput = z.infer<typeof updateConstructionCompanySchema>;
