import { z } from 'zod';

export const createClientSchema = z.object({
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

export const updateClientSchema = z.object({
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
  address: z
    .string()
    .optional()
    .nullable(),
  city: z
    .string()
    .optional()
    .nullable(),
  state: z
    .string()
    .optional()
    .nullable(),
  zipCode: z
    .string()
    .optional()
    .nullable(),
  country: z
    .string()
    .optional()
    .nullable(),
  taxId: z
    .string()
    .optional()
    .nullable(),
  isActive: z
    .boolean()
    .optional(),
});

export const addProductSchema = z.object({
  productId: z
    .string()
    .uuid('Invalid product ID'),
  quantity: z
    .number()
    .int()
    .positive('Quantity must be positive')
    .default(1),
  customPrice: z
    .number()
    .positive('Custom price must be positive')
    .optional(),
  startDate: z
    .string()
    .datetime()
    .optional(),
  endDate: z
    .string()
    .datetime()
    .optional()
    .nullable(),
});

export const updateProductSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive('Quantity must be positive')
    .optional(),
  customPrice: z
    .number()
    .positive('Custom price must be positive')
    .optional()
    .nullable(),
  isActive: z
    .boolean()
    .optional(),
  endDate: z
    .string()
    .datetime()
    .optional()
    .nullable(),
});

export const createPortalAccountSchema = z.object({
  sendEmail: z
    .boolean()
    .default(true),
});

export const clientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  isActive: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val === '' ? undefined : undefined,
    z.boolean().optional()
  ),
  search: z.string().optional().transform(val => val === '' ? undefined : val),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email', 'company']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type AddProductInput = z.infer<typeof addProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreatePortalAccountInput = z.infer<typeof createPortalAccountSchema>;
export type ClientQueryInput = z.infer<typeof clientQuerySchema>;

