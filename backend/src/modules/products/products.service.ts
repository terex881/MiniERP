import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from './products.schema';
import { ProductResponse, ProductWithStats } from './products.types';
import { BadRequestError, NotFoundError } from '../../middleware/error.middleware';
import { PaginatedResult } from '../../types';

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  billingCycle: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

class ProductsService {
  /**
   * Get all products with pagination and filters
   */
  async findAll(query: ProductQueryInput): Promise<PaginatedResult<ProductResponse>> {
    const { page, limit, isActive, billingCycle, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (billingCycle) {
      where.billingCycle = billingCycle;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute query
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: productSelect,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products as ProductResponse[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all active products (for dropdowns)
   */
  async findAllActive(): Promise<ProductResponse[]> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: productSelect,
      orderBy: { name: 'asc' },
    });

    return products as ProductResponse[];
  }

  /**
   * Get product by ID with stats
   */
  async findById(id: string): Promise<ProductWithStats> {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        ...productSelect,
        _count: {
          select: {
            clientProducts: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product as ProductWithStats;
  }

  /**
   * Create new product
   */
  async create(input: CreateProductInput): Promise<ProductResponse> {
    // Check if product name already exists
    const existing = await prisma.product.findFirst({
      where: { name: { equals: input.name, mode: 'insensitive' } },
    });

    if (existing) {
      throw new BadRequestError('A product with this name already exists');
    }

    const product = await prisma.product.create({
      data: {
        ...input,
        price: new Prisma.Decimal(input.price),
      },
      select: productSelect,
    });

    return product as ProductResponse;
  }

  /**
   * Update product
   */
  async update(id: string, input: UpdateProductInput): Promise<ProductResponse> {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    // Check name uniqueness if updating name
    if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
      const nameExists = await prisma.product.findFirst({
        where: {
          name: { equals: input.name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new BadRequestError('A product with this name already exists');
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...input,
        price: input.price ? new Prisma.Decimal(input.price) : undefined,
      },
      select: productSelect,
    });

    return product as ProductResponse;
  }

  /**
   * Delete product (soft delete)
   */
  async delete(id: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clientProducts: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if product has active subscriptions
    if (product._count.clientProducts > 0) {
      throw new BadRequestError(
        `Cannot delete product with ${product._count.clientProducts} active subscription(s). Deactivate it instead.`
      );
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get product usage stats
   */
  async getUsageStats(id: string): Promise<{
    activeClients: number;
    totalClients: number;
    monthlyRevenue: number;
  }> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        clientProducts: {
          select: {
            quantity: true,
            customPrice: true,
            isActive: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const activeClients = product.clientProducts.filter((cp) => cp.isActive).length;
    const totalClients = product.clientProducts.length;

    // Calculate monthly revenue
    let monthlyRevenue = 0;
    for (const cp of product.clientProducts.filter((c) => c.isActive)) {
      const price = cp.customPrice?.toNumber() || product.price.toNumber();
      let monthly = price * cp.quantity;

      if (product.billingCycle === 'yearly') {
        monthly = monthly / 12;
      } else if (product.billingCycle === 'one-time') {
        monthly = 0;
      }

      monthlyRevenue += monthly;
    }

    return {
      activeClients,
      totalClients,
      monthlyRevenue,
    };
  }
}

export const productsService = new ProductsService();

