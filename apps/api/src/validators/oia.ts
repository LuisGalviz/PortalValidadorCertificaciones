import { z } from 'zod';
import { paginationSchema } from './common.js';

export const oiaFilterSchema = paginationSchema.extend({
  status: z.coerce.number().int().optional(),
  search: z.string().optional(),
});

export const createOiaSchema = z.object({
  identification: z.coerce.number().int(),
  name: z.string().min(1),
  codeAcred: z.string().min(1),
  effectiveDate: z.string().or(z.date()).optional(),
  cedRepLegal: z.coerce.number().int().optional(),
  nameRepLegal: z.string().optional(),
  addressRepLegal: z.string().optional(),
  typeOrganismId: z.coerce.number().int().optional(),
  addressOrganism: z.string().optional(),
  nameContact: z.string().optional(),
  phoneContact: z.coerce.number().int().optional(),
  phoneContactAlternative: z.coerce.number().int().optional(),
  emailContact: z.string().email().optional(),
  codeOrganism: z.coerce.number().int().optional(),
  organismCodes: z.union([z.record(z.unknown()), z.array(z.record(z.unknown()))]).optional(),
});

export const updateOiaSchema = createOiaSchema.partial().extend({
  status: z.coerce.number().int().optional(),
  comment: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export const registerOiaSchema = createOiaSchema.extend({
  userName: z.string().min(1),
  userPhone: z.coerce.number().int(),
  userEmail: z.string().email(),
  acceptedTermsAndConditions: z.coerce.boolean().optional(),
});

export const updateOwnOiaSchema = z.object({
  // OIA data
  name: z.string().min(1).optional(),
  codeAcred: z.string().min(1).optional(),
  effectiveDate: z.string().or(z.date()).optional(),
  cedRepLegal: z.coerce.number().int().optional(),
  nameRepLegal: z.string().optional(),
  addressRepLegal: z.string().optional(),
  typeOrganismId: z.coerce.number().int().optional(),
  addressOrganism: z.string().optional(),
  // Contact data (OIA)
  nameContact: z.string().optional(),
  phoneContact: z.coerce.number().int().optional(),
  phoneContactAlternative: z.coerce.number().int().optional(),
  // Notification user data
  userName: z.string().min(1),
  userPhone: z.coerce.number().int(),
  userEmail: z.string().email(),
});

export const oiaUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  authEmail: z.string().email().optional().or(z.literal('')),
  phone: z.coerce.number().int(),
  active: z.coerce.boolean(),
});

export type OiaFilterInput = z.infer<typeof oiaFilterSchema>;
export type CreateOiaInput = z.infer<typeof createOiaSchema>;
export type UpdateOiaInput = z.infer<typeof updateOiaSchema>;
export type UpdateOwnOiaInput = z.infer<typeof updateOwnOiaSchema>;
export type RegisterOiaInput = z.infer<typeof registerOiaSchema>;
export type OiaUserInput = z.infer<typeof oiaUserSchema>;
