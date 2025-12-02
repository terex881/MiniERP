import { z } from 'zod';
import { LeadStatus } from '@prisma/client';

export const createLeadSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  phone: z
    .string()
    .optional(),
  company: z
    .string()
    .optional(),
  source: z
    .string()
    .optional(),
  notes: z
    .string()
    .optional(),
  estimatedValue: z
    .number()
    .positive('Estimated value must be positive')
    .optional(),
  assignedToId: z
    .string()
    .uuid('Invalid user ID')
    .optional(),
});

export const updateLeadSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  phone: z
    .string()
    .optional()
    .nullable(),
  company: z
    .string()
    .optional()
    .nullable(),
  source: z
    .string()
    .optional()
    .nullable(),
  notes: z
    .string()
    .optional()
    .nullable(),
  estimatedValue: z
    .number()
    .positive('Estimated value must be positive')
    .optional()
    .nullable(),
});

export const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
});

export const assignLeadSchema = z.object({
  assignedToId: z
    .string()
    .uuid('Invalid user ID')
    .nullable(),
});

export const convertLeadSchema = z.object({
  createPortalAccount: z
    .boolean()
    .default(false),
  address: z
    .string()
    .optional(),
  city: z
    .string()
    .optional(),
  state: z
    .string()
    .optional(),
  zipCode: z
    .string()
    .optional(),
  country: z
    .string()
    .optional(),
  taxId: z
    .string()
    .optional(),
});

export const leadQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.union([z.nativeEnum(LeadStatus), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  source: z.string().optional().transform(val => val === '' ? undefined : val),
  assignedToId: z.string().uuid().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  search: z.string().optional().transform(val => val === '' ? undefined : val),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'status', 'estimatedValue']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type AssignLeadInput = z.infer<typeof assignLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;

