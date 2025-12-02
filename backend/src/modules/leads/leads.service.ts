import { Prisma, LeadStatus, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/hash';
import {
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
  AssignLeadInput,
  ConvertLeadInput,
  LeadQueryInput,
} from './leads.schema';
import { LeadResponse, LeadStats } from './leads.types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../middleware/error.middleware';
import { PaginatedResult } from '../../types';

const leadSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  company: true,
  source: true,
  status: true,
  notes: true,
  estimatedValue: true,
  createdAt: true,
  updatedAt: true,
  convertedAt: true,
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
};

class LeadsService {
  /**
   * Get all leads with pagination and filters
   */
  async findAll(
    query: LeadQueryInput,
    userId: string,
    userRole: Role
  ): Promise<PaginatedResult<LeadResponse>> {
    const { page, limit, status, source, assignedToId, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.LeadWhereInput = {};

    // Role-based filtering
    if (userRole === 'OPERATOR') {
      // Operators can only see leads assigned to them or created by them
      where.OR = [
        { assignedToId: userId },
        { createdById: userId },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = { contains: source, mode: 'insensitive' };
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (search) {
      where.AND = [
        ...(where.AND as Prisma.LeadWhereInput[] || []),
        {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Execute query
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: leadSelect,
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      data: leads as LeadResponse[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get lead by ID
   */
  async findById(id: string, userId: string, userRole: Role): Promise<LeadResponse> {
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: leadSelect,
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Check access for operators
    if (userRole === 'OPERATOR') {
      if (lead.assignedTo?.id !== userId && lead.createdBy.id !== userId) {
        throw new ForbiddenError('Access denied to this lead');
      }
    }

    return lead as LeadResponse;
  }

  /**
   * Create new lead
   */
  async create(input: CreateLeadInput, createdById: string): Promise<LeadResponse> {
    const lead = await prisma.lead.create({
      data: {
        ...input,
        estimatedValue: input.estimatedValue ? new Prisma.Decimal(input.estimatedValue) : null,
        createdById,
      },
      select: leadSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'CREATED',
        description: `Lead "${input.firstName} ${input.lastName}" created`,
        userId: createdById,
        leadId: lead.id,
      },
    });

    return lead as LeadResponse;
  }

  /**
   * Update lead
   */
  async update(
    id: string,
    input: UpdateLeadInput,
    userId: string,
    userRole: Role
  ): Promise<LeadResponse> {
    // Check if lead exists and user has access
    await this.findById(id, userId, userRole);

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...input,
        estimatedValue: input.estimatedValue !== undefined
          ? input.estimatedValue ? new Prisma.Decimal(input.estimatedValue) : null
          : undefined,
      },
      select: leadSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'UPDATED',
        description: `Lead "${lead.firstName} ${lead.lastName}" updated`,
        userId,
        leadId: lead.id,
      },
    });

    return lead as LeadResponse;
  }

  /**
   * Delete lead
   */
  async delete(id: string, userId: string, userRole: Role): Promise<void> {
    // Check if lead exists and user has access
    const lead = await this.findById(id, userId, userRole);

    // Only admins and supervisors can delete
    if (userRole === 'OPERATOR') {
      throw new ForbiddenError('Only admins and supervisors can delete leads');
    }

    await prisma.lead.delete({ where: { id } });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'DELETED',
        description: `Lead "${lead.firstName} ${lead.lastName}" deleted`,
        userId,
      },
    });
  }

  /**
   * Update lead status
   */
  async updateStatus(
    id: string,
    input: UpdateLeadStatusInput,
    userId: string,
    userRole: Role
  ): Promise<LeadResponse> {
    // Check if lead exists and user has access
    const existingLead = await this.findById(id, userId, userRole);
    const oldStatus = existingLead.status;

    // Cannot change status of converted leads
    if (existingLead.status === 'CONVERTED') {
      throw new BadRequestError('Cannot change status of converted leads');
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status: input.status },
      select: leadSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'STATUS_CHANGED',
        description: `Lead status changed from ${oldStatus} to ${input.status}`,
        metadata: { oldStatus, newStatus: input.status },
        userId,
        leadId: lead.id,
      },
    });

    return lead as LeadResponse;
  }

  /**
   * Assign lead to user
   */
  async assign(
    id: string,
    input: AssignLeadInput,
    userId: string,
    userRole: Role
  ): Promise<LeadResponse> {
    // Only admins and supervisors can assign
    if (userRole === 'OPERATOR') {
      throw new ForbiddenError('Only admins and supervisors can assign leads');
    }

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({ where: { id } });
    if (!existingLead) {
      throw new NotFoundError('Lead not found');
    }

    // If assigning to someone, verify that user exists
    if (input.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: input.assignedToId },
      });
      if (!assignee) {
        throw new BadRequestError('Assignee user not found');
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { assignedToId: input.assignedToId },
      select: leadSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'ASSIGNED',
        description: input.assignedToId
          ? `Lead assigned to ${lead.assignedTo?.firstName} ${lead.assignedTo?.lastName}`
          : 'Lead unassigned',
        userId,
        leadId: lead.id,
      },
    });

    return lead as LeadResponse;
  }

  /**
   * Convert lead to client
   */
  async convert(
    id: string,
    input: ConvertLeadInput,
    userId: string,
    userRole: Role
  ): Promise<{ lead: LeadResponse; clientId: string }> {
    // Only admins and supervisors can convert
    if (userRole === 'OPERATOR') {
      throw new ForbiddenError('Only admins and supervisors can convert leads');
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: leadSelect,
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    if (lead.status === 'CONVERTED') {
      throw new BadRequestError('Lead is already converted');
    }

    // Check if a client with this email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: lead.email },
    });

    if (existingClient) {
      throw new BadRequestError('A client with this email already exists');
    }

    // Create client and update lead in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create portal user account if requested
      let portalUserId: string | undefined;

      if (input.createPortalAccount) {
        // Generate a random password - user will need to reset it
        const tempPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await hashPassword(tempPassword);

        const portalUser = await tx.user.create({
          data: {
            email: lead.email,
            password: hashedPassword,
            firstName: lead.firstName,
            lastName: lead.lastName,
            phone: lead.phone,
            role: 'CLIENT',
          },
        });

        portalUserId = portalUser.id;
      }

      // Create client
      const client = await tx.client.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          country: input.country,
          taxId: input.taxId,
          convertedFromId: lead.id,
          userId: portalUserId,
        },
      });

      // Update lead status
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedAt: new Date(),
        },
        select: leadSelect,
      });

      // Log activity
      await tx.activity.create({
        data: {
          action: 'CONVERTED',
          description: `Lead converted to client "${client.firstName} ${client.lastName}"`,
          userId,
          leadId: lead.id,
          clientId: client.id,
        },
      });

      return { lead: updatedLead, clientId: client.id };
    });

    return {
      lead: result.lead as LeadResponse,
      clientId: result.clientId,
    };
  }

  /**
   * Get lead statistics
   */
  async getStats(userId: string, userRole: Role): Promise<LeadStats> {
    // Build where clause based on role
    const where: Prisma.LeadWhereInput = {};
    if (userRole === 'OPERATOR') {
      where.OR = [
        { assignedToId: userId },
        { createdById: userId },
      ];
    }

    // Get counts by status
    const statusCounts = await prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    // Get total estimated value
    const valueSum = await prisma.lead.aggregate({
      where,
      _sum: { estimatedValue: true },
    });

    // Calculate totals
    const total = statusCounts.reduce((sum, item) => sum + item._count.status, 0);
    const converted = statusCounts.find((s) => s.status === 'CONVERTED')?._count.status || 0;

    return {
      total,
      byStatus: statusCounts.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      totalEstimatedValue: valueSum._sum.estimatedValue?.toNumber() || 0,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
    };
  }

  /**
   * Get lead sources for dropdown
   */
  async getSources(): Promise<string[]> {
    const leads = await prisma.lead.findMany({
      where: { source: { not: null } },
      select: { source: true },
      distinct: ['source'],
    });

    return leads.map((l) => l.source!).filter(Boolean);
  }
}

export const leadsService = new LeadsService();

