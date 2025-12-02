import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/hash';
import {
  CreateClientInput,
  UpdateClientInput,
  AddProductInput,
  UpdateProductInput,
  ClientQueryInput,
} from './clients.schema';
import { ClientResponse, ClientWithSubscriptions, ClientIncome, IncomeReport } from './clients.types';
import { BadRequestError, NotFoundError } from '../../middleware/error.middleware';
import { PaginatedResult } from '../../types';

const clientSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  company: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  taxId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  convertedFrom: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
};

class ClientsService {
  /**
   * Get all clients with pagination and filters
   */
  async findAll(query: ClientQueryInput): Promise<PaginatedResult<ClientResponse>> {
    const { page, limit, isActive, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ClientWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute query
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: clientSelect,
      }),
      prisma.client.count({ where }),
    ]);

    const formatted = clients.map((c) => ({
      ...c,
      hasPortalAccess: !!c.userId,
    }));

    return {
      data: formatted as ClientResponse[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get client by ID with subscriptions
   */
  async findById(id: string): Promise<ClientWithSubscriptions> {
    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        ...clientSelect,
        subscriptions: {
          select: {
            id: true,
            quantity: true,
            customPrice: true,
            startDate: true,
            endDate: true,
            isActive: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                billingCycle: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    return {
      ...client,
      hasPortalAccess: !!client.userId,
    } as ClientWithSubscriptions;
  }

  /**
   * Create new client
   */
  async create(input: CreateClientInput, userId: string): Promise<ClientResponse> {
    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingClient) {
      throw new BadRequestError('A client with this email already exists');
    }

    const client = await prisma.client.create({
      data: {
        ...input,
        email: input.email.toLowerCase(),
      },
      select: clientSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'CREATED',
        description: `Client "${input.firstName} ${input.lastName}" created`,
        userId,
        clientId: client.id,
      },
    });

    return {
      ...client,
      hasPortalAccess: !!client.userId,
    } as ClientResponse;
  }

  /**
   * Update client
   */
  async update(id: string, input: UpdateClientInput, userId: string): Promise<ClientResponse> {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      throw new NotFoundError('Client not found');
    }

    // Check email uniqueness if updating email
    if (input.email && input.email.toLowerCase() !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (emailExists) {
        throw new BadRequestError('A client with this email already exists');
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...input,
        email: input.email?.toLowerCase(),
      },
      select: clientSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'UPDATED',
        description: `Client "${client.firstName} ${client.lastName}" updated`,
        userId,
        clientId: client.id,
      },
    });

    return {
      ...client,
      hasPortalAccess: !!client.userId,
    } as ClientResponse;
  }

  /**
   * Delete client (soft delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    // Soft delete
    await prisma.client.update({
      where: { id },
      data: { isActive: false },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'DELETED',
        description: `Client "${client.firstName} ${client.lastName}" deactivated`,
        userId,
        clientId: client.id,
      },
    });
  }

  /**
   * Add product subscription to client
   */
  async addProduct(
    clientId: string,
    input: AddProductInput,
    userId: string
  ): Promise<ClientWithSubscriptions> {
    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if subscription already exists
    const existingSub = await prisma.clientProduct.findUnique({
      where: {
        clientId_productId: {
          clientId,
          productId: input.productId,
        },
      },
    });

    if (existingSub) {
      throw new BadRequestError('Client already has this product');
    }

    // Create subscription
    await prisma.clientProduct.create({
      data: {
        clientId,
        productId: input.productId,
        quantity: input.quantity,
        customPrice: input.customPrice ? new Prisma.Decimal(input.customPrice) : null,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'PRODUCT_ADDED',
        description: `Product "${product.name}" added to client`,
        userId,
        clientId,
      },
    });

    return this.findById(clientId);
  }

  /**
   * Update client product subscription
   */
  async updateProduct(
    clientId: string,
    productId: string,
    input: UpdateProductInput,
    userId: string
  ): Promise<ClientWithSubscriptions> {
    // Check if subscription exists
    const subscription = await prisma.clientProduct.findUnique({
      where: {
        clientId_productId: { clientId, productId },
      },
      include: { product: true },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Update subscription
    await prisma.clientProduct.update({
      where: {
        clientId_productId: { clientId, productId },
      },
      data: {
        quantity: input.quantity,
        customPrice: input.customPrice !== undefined
          ? input.customPrice ? new Prisma.Decimal(input.customPrice) : null
          : undefined,
        isActive: input.isActive,
        endDate: input.endDate !== undefined
          ? input.endDate ? new Date(input.endDate) : null
          : undefined,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'PRODUCT_UPDATED',
        description: `Product "${subscription.product.name}" subscription updated`,
        userId,
        clientId,
      },
    });

    return this.findById(clientId);
  }

  /**
   * Remove product from client
   */
  async removeProduct(
    clientId: string,
    productId: string,
    userId: string
  ): Promise<ClientWithSubscriptions> {
    // Check if subscription exists
    const subscription = await prisma.clientProduct.findUnique({
      where: {
        clientId_productId: { clientId, productId },
      },
      include: { product: true },
    });

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Delete subscription
    await prisma.clientProduct.delete({
      where: {
        clientId_productId: { clientId, productId },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'PRODUCT_REMOVED',
        description: `Product "${subscription.product.name}" removed from client`,
        userId,
        clientId,
      },
    });

    return this.findById(clientId);
  }

  /**
   * Get client income calculation
   */
  async getClientIncome(clientId: string): Promise<ClientIncome> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        subscriptions: {
          where: { isActive: true },
          select: {
            quantity: true,
            customPrice: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                billingCycle: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    let monthlyIncome = 0;
    const products: ClientIncome['products'] = [];

    for (const sub of client.subscriptions) {
      const price = sub.customPrice?.toNumber() || sub.product.price.toNumber();
      const quantity = sub.quantity;
      let monthlyPrice = price * quantity;

      // Convert to monthly if yearly
      if (sub.product.billingCycle === 'yearly') {
        monthlyPrice = monthlyPrice / 12;
      } else if (sub.product.billingCycle === 'one-time') {
        monthlyPrice = 0; // One-time payments don't count as recurring income
      }

      monthlyIncome += monthlyPrice;

      products.push({
        productId: sub.product.id,
        productName: sub.product.name,
        price,
        quantity,
        billingCycle: sub.product.billingCycle,
        totalMonthly: monthlyPrice,
      });
    }

    return {
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      monthlyIncome,
      yearlyIncome: monthlyIncome * 12,
      products,
    };
  }

  /**
   * Get total income report
   */
  async getIncomeReport(): Promise<IncomeReport> {
    // Get all active subscriptions with client and product info
    const subscriptions = await prisma.clientProduct.findMany({
      where: { isActive: true },
      select: {
        quantity: true,
        customPrice: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            billingCycle: true,
          },
        },
      },
    });

    // Calculate totals
    const clientIncomes: Map<string, { name: string; total: number }> = new Map();
    const productStats: Map<string, { name: string; clients: Set<string>; total: number }> = new Map();
    let totalMonthlyIncome = 0;

    for (const sub of subscriptions) {
      const price = sub.customPrice?.toNumber() || sub.product.price.toNumber();
      let monthlyPrice = price * sub.quantity;

      if (sub.product.billingCycle === 'yearly') {
        monthlyPrice = monthlyPrice / 12;
      } else if (sub.product.billingCycle === 'one-time') {
        monthlyPrice = 0;
      }

      totalMonthlyIncome += monthlyPrice;

      // Track client income
      const clientKey = sub.client.id;
      const clientData = clientIncomes.get(clientKey) || {
        name: `${sub.client.firstName} ${sub.client.lastName}`,
        total: 0,
      };
      clientData.total += monthlyPrice;
      clientIncomes.set(clientKey, clientData);

      // Track product stats
      const productKey = sub.product.id;
      const productData = productStats.get(productKey) || {
        name: sub.product.name,
        clients: new Set<string>(),
        total: 0,
      };
      productData.clients.add(sub.client.id);
      productData.total += monthlyPrice;
      productStats.set(productKey, productData);
    }

    // Get unique client count
    const uniqueClients = await prisma.client.count({
      where: {
        isActive: true,
        subscriptions: { some: { isActive: true } },
      },
    });

    // Sort and get top clients
    const topClients = Array.from(clientIncomes.entries())
      .map(([id, data]) => ({
        clientId: id,
        clientName: data.name,
        totalMonthly: data.total,
      }))
      .sort((a, b) => b.totalMonthly - a.totalMonthly)
      .slice(0, 10);

    // Product breakdown
    const productBreakdown = Array.from(productStats.entries())
      .map(([id, data]) => ({
        productId: id,
        productName: data.name,
        clientCount: data.clients.size,
        totalMonthlyRevenue: data.total,
      }))
      .sort((a, b) => b.totalMonthlyRevenue - a.totalMonthlyRevenue);

    return {
      totalMonthlyIncome,
      totalYearlyIncome: totalMonthlyIncome * 12,
      clientCount: uniqueClients,
      activeSubscriptions: subscriptions.length,
      topClients,
      productBreakdown,
    };
  }

  /**
   * Create portal account for client
   */
  async createPortalAccount(clientId: string, userId: string): Promise<ClientResponse> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    if (client.userId) {
      throw new BadRequestError('Client already has portal access');
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: client.email },
    });

    if (existingUser) {
      throw new BadRequestError('A user account with this email already exists');
    }

    // Create portal user account with temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await hashPassword(tempPassword);

    const result = await prisma.$transaction(async (tx) => {
      const portalUser = await tx.user.create({
        data: {
          email: client.email,
          password: hashedPassword,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          role: 'CLIENT',
        },
      });

      const updatedClient = await tx.client.update({
        where: { id: clientId },
        data: { userId: portalUser.id },
        select: clientSelect,
      });

      return updatedClient;
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'PORTAL_CREATED',
        description: `Portal account created for client`,
        userId,
        clientId,
      },
    });

    // TODO: Send email with credentials

    return {
      ...result,
      hasPortalAccess: true,
    } as ClientResponse;
  }
}

export const clientsService = new ClientsService();

