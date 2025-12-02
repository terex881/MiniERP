import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters'),
  description: z
    .string()
    .optional(),
  price: z
    .number()
    .positive('Price must be positive'),
  billingCycle: z
    .enum(['monthly', 'yearly', 'one-time'])
    .default('monthly'),
  isActive: z
    .boolean()
    .default(true),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .optional()
    .nullable(),
  price: z
    .number()
    .positive('Price must be positive')
    .optional(),
  billingCycle: z
    .enum(['monthly', 'yearly', 'one-time'])
    .optional(),
  isActive: z
    .boolean()
    .optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  isActive: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : undefined,
    z.boolean().optional()
  ),
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'price']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;

