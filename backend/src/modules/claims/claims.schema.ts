import { z } from 'zod';
import { ClaimStatus, ClaimPriority } from '@prisma/client';

export const createClaimSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required'),
  priority: z
    .nativeEnum(ClaimPriority)
    .default(ClaimPriority.MEDIUM),
  clientId: z
    .string()
    .uuid('Invalid client ID'),
  assignedToId: z
    .string()
    .uuid('Invalid user ID')
    .optional(),
});

export const updateClaimSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .optional(),
  priority: z
    .nativeEnum(ClaimPriority)
    .optional(),
  resolution: z
    .string()
    .optional()
    .nullable(),
});

export const updateClaimStatusSchema = z.object({
  status: z.nativeEnum(ClaimStatus),
  resolution: z
    .string()
    .optional(),
});

export const assignClaimSchema = z.object({
  assignedToId: z
    .string()
    .uuid('Invalid user ID')
    .nullable(),
});

export const claimQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.union([z.nativeEnum(ClaimStatus), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  priority: z.union([z.nativeEnum(ClaimPriority), z.literal('')]).optional().transform(val => val === '' ? undefined : val),
  clientId: z.string().uuid().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  assignedToId: z.string().uuid().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  search: z.string().optional().transform(val => val === '' ? undefined : val),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// For client portal - simplified claim creation
export const createPortalClaimSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required'),
  priority: z
    .nativeEnum(ClaimPriority)
    .default(ClaimPriority.MEDIUM),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
export type AssignClaimInput = z.infer<typeof assignClaimSchema>;
export type ClaimQueryInput = z.infer<typeof claimQuerySchema>;
export type CreatePortalClaimInput = z.infer<typeof createPortalClaimSchema>;

