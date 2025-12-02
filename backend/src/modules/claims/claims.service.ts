import { Prisma, ClaimStatus, Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { deleteFile, getFileInfo } from '../../middleware/upload.middleware';
import {
  CreateClaimInput,
  UpdateClaimInput,
  UpdateClaimStatusInput,
  AssignClaimInput,
  ClaimQueryInput,
  CreatePortalClaimInput,
} from './claims.schema';
import { ClaimResponse, ClaimStats } from './claims.types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../middleware/error.middleware';
import { PaginatedResult } from '../../types';

const claimSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  resolution: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  client: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
    },
  },
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
  attachments: {
    select: {
      id: true,
      filename: true,
      originalName: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

class ClaimsService {
  /**
   * Get all claims with pagination and filters
   */
  async findAll(
    query: ClaimQueryInput,
    userId: string,
    userRole: Role,
    clientId?: string
  ): Promise<PaginatedResult<ClaimResponse>> {
    const { page, limit, status, priority, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ClaimWhereInput = {};

    // Role-based filtering
    if (userRole === 'CLIENT' && clientId) {
      // Clients can only see their own claims
      where.clientId = clientId;
    } else if (userRole === 'OPERATOR') {
      // Operators can only see claims assigned to them
      where.assignedToId = userId;
    } else if (query.clientId) {
      // Admin/Supervisor can filter by client
      where.clientId = query.clientId;
    }

    if (query.assignedToId && userRole !== 'CLIENT') {
      where.assignedToId = query.assignedToId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.AND = [
        ...(where.AND as Prisma.ClaimWhereInput[] || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Execute query
    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: claimSelect,
      }),
      prisma.claim.count({ where }),
    ]);

    return {
      data: claims as ClaimResponse[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get claim by ID
   */
  async findById(
    id: string,
    userId: string,
    userRole: Role,
    clientId?: string
  ): Promise<ClaimResponse> {
    const claim = await prisma.claim.findUnique({
      where: { id },
      select: claimSelect,
    });

    if (!claim) {
      throw new NotFoundError('Claim not found');
    }

    // Check access
    if (userRole === 'CLIENT' && clientId) {
      if (claim.client.id !== clientId) {
        throw new ForbiddenError('Access denied to this claim');
      }
    } else if (userRole === 'OPERATOR') {
      if (claim.assignedTo?.id !== userId) {
        throw new ForbiddenError('Access denied to this claim');
      }
    }

    return claim as ClaimResponse;
  }

  /**
   * Create new claim (staff)
   */
  async create(input: CreateClaimInput, userId: string): Promise<ClaimResponse> {
    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: input.clientId },
    });

    if (!client) {
      throw new BadRequestError('Client not found');
    }

    // Verify assignee if provided
    if (input.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: input.assignedToId },
      });
      if (!assignee) {
        throw new BadRequestError('Assignee user not found');
      }
    }

    const claim = await prisma.claim.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        clientId: input.clientId,
        createdById: userId,
        assignedToId: input.assignedToId,
      },
      select: claimSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'CREATED',
        description: `Claim "${input.title}" created`,
        userId,
        claimId: claim.id,
        clientId: input.clientId,
      },
    });

    return claim as ClaimResponse;
  }

  /**
   * Create new claim (client portal)
   */
  async createPortalClaim(
    input: CreatePortalClaimInput,
    userId: string,
    clientId: string
  ): Promise<ClaimResponse> {
    const claim = await prisma.claim.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        clientId,
        createdById: userId,
      },
      select: claimSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'CREATED',
        description: `Claim "${input.title}" created via portal`,
        userId,
        claimId: claim.id,
        clientId,
      },
    });

    return claim as ClaimResponse;
  }

  /**
   * Update claim
   */
  async update(
    id: string,
    input: UpdateClaimInput,
    userId: string,
    userRole: Role
  ): Promise<ClaimResponse> {
    // Check if claim exists and user has access
    const existingClaim = await prisma.claim.findUnique({ where: { id } });

    if (!existingClaim) {
      throw new NotFoundError('Claim not found');
    }

    // Operators can only update claims assigned to them
    if (userRole === 'OPERATOR' && existingClaim.assignedToId !== userId) {
      throw new ForbiddenError('Access denied to this claim');
    }

    const claim = await prisma.claim.update({
      where: { id },
      data: input,
      select: claimSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'UPDATED',
        description: `Claim "${claim.title}" updated`,
        userId,
        claimId: claim.id,
        clientId: claim.client.id,
      },
    });

    return claim as ClaimResponse;
  }

  /**
   * Delete claim
   */
  async delete(id: string, userId: string): Promise<void> {
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!claim) {
      throw new NotFoundError('Claim not found');
    }

    // Delete attachment files
    for (const attachment of claim.attachments) {
      await deleteFile(attachment.path);
    }

    await prisma.claim.delete({ where: { id } });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'DELETED',
        description: `Claim "${claim.title}" deleted`,
        userId,
        clientId: claim.clientId,
      },
    });
  }

  /**
   * Update claim status
   */
  async updateStatus(
    id: string,
    input: UpdateClaimStatusInput,
    userId: string,
    userRole: Role
  ): Promise<ClaimResponse> {
    const existingClaim = await prisma.claim.findUnique({ where: { id } });

    if (!existingClaim) {
      throw new NotFoundError('Claim not found');
    }

    // Operators can only update claims assigned to them
    if (userRole === 'OPERATOR' && existingClaim.assignedToId !== userId) {
      throw new ForbiddenError('Access denied to this claim');
    }

    const oldStatus = existingClaim.status;

    // Set resolvedAt when moving to RESOLVED or CLOSED
    const resolvedAt = ['RESOLVED', 'CLOSED'].includes(input.status) && !existingClaim.resolvedAt
      ? new Date()
      : existingClaim.resolvedAt;

    const claim = await prisma.claim.update({
      where: { id },
      data: {
        status: input.status,
        resolution: input.resolution || existingClaim.resolution,
        resolvedAt,
      },
      select: claimSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'STATUS_CHANGED',
        description: `Claim status changed from ${oldStatus} to ${input.status}`,
        metadata: { oldStatus, newStatus: input.status },
        userId,
        claimId: claim.id,
        clientId: claim.client.id,
      },
    });

    return claim as ClaimResponse;
  }

  /**
   * Assign claim to user
   */
  async assign(
    id: string,
    input: AssignClaimInput,
    userId: string,
    userRole: Role
  ): Promise<ClaimResponse> {
    // Only admins and supervisors can assign
    if (!['ADMIN', 'SUPERVISOR'].includes(userRole)) {
      throw new ForbiddenError('Only admins and supervisors can assign claims');
    }

    const existingClaim = await prisma.claim.findUnique({ where: { id } });

    if (!existingClaim) {
      throw new NotFoundError('Claim not found');
    }

    // Verify assignee if provided
    if (input.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: input.assignedToId },
      });
      if (!assignee) {
        throw new BadRequestError('Assignee user not found');
      }
    }

    const claim = await prisma.claim.update({
      where: { id },
      data: { assignedToId: input.assignedToId },
      select: claimSelect,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'ASSIGNED',
        description: input.assignedToId
          ? `Claim assigned to ${claim.assignedTo?.firstName} ${claim.assignedTo?.lastName}`
          : 'Claim unassigned',
        userId,
        claimId: claim.id,
        clientId: claim.client.id,
      },
    });

    return claim as ClaimResponse;
  }

  /**
   * Add attachment to claim
   */
  async addAttachment(
    claimId: string,
    file: Express.Multer.File,
    userId: string,
    userRole: Role,
    clientId?: string
  ): Promise<ClaimResponse> {
    const claim = await prisma.claim.findUnique({ where: { id: claimId } });

    if (!claim) {
      throw new NotFoundError('Claim not found');
    }

    // Check access
    if (userRole === 'CLIENT' && clientId) {
      if (claim.clientId !== clientId) {
        throw new ForbiddenError('Access denied to this claim');
      }
    } else if (userRole === 'OPERATOR') {
      if (claim.assignedToId !== userId) {
        throw new ForbiddenError('Access denied to this claim');
      }
    }

    const fileInfo = getFileInfo(file);

    await prisma.claimAttachment.create({
      data: {
        claimId,
        ...fileInfo,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'ATTACHMENT_ADDED',
        description: `Attachment "${fileInfo.originalName}" added`,
        userId,
        claimId,
        clientId: claim.clientId,
      },
    });

    return this.findById(claimId, userId, userRole, clientId);
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(
    claimId: string,
    attachmentId: string,
    userId: string,
    userRole: Role
  ): Promise<ClaimResponse> {
    // Only admins and supervisors can delete attachments
    if (!['ADMIN', 'SUPERVISOR'].includes(userRole)) {
      throw new ForbiddenError('Only admins and supervisors can delete attachments');
    }

    const attachment = await prisma.claimAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.claimId !== claimId) {
      throw new NotFoundError('Attachment not found');
    }

    // Delete file
    await deleteFile(attachment.path);

    // Delete record
    await prisma.claimAttachment.delete({ where: { id: attachmentId } });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'ATTACHMENT_DELETED',
        description: `Attachment "${attachment.originalName}" deleted`,
        userId,
        claimId,
      },
    });

    return this.findById(claimId, userId, userRole);
  }

  /**
   * Get attachment for download
   */
  async getAttachment(
    claimId: string,
    attachmentId: string,
    userId: string,
    userRole: Role,
    clientId?: string
  ): Promise<{ path: string; originalName: string; mimeType: string }> {
    // First verify access to the claim
    await this.findById(claimId, userId, userRole, clientId);

    const attachment = await prisma.claimAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.claimId !== claimId) {
      throw new NotFoundError('Attachment not found');
    }

    return {
      path: attachment.path,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
    };
  }

  /**
   * Get claim statistics
   */
  async getStats(userId: string, userRole: Role): Promise<ClaimStats> {
    // Build where clause based on role
    const where: Prisma.ClaimWhereInput = {};
    if (userRole === 'OPERATOR') {
      where.assignedToId = userId;
    }

    // Get counts by status
    const statusCounts = await prisma.claim.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    // Get counts by priority
    const priorityCounts = await prisma.claim.groupBy({
      by: ['priority'],
      where,
      _count: { priority: true },
    });

    // Get resolved claims this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const resolvedThisMonth = await prisma.claim.count({
      where: {
        ...where,
        resolvedAt: { gte: startOfMonth },
      },
    });

    // Calculate average resolution time
    const resolvedClaims = await prisma.claim.findMany({
      where: {
        ...where,
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
      take: 100, // Limit for performance
      orderBy: { resolvedAt: 'desc' },
    });

    let averageResolutionTime = 0;
    if (resolvedClaims.length > 0) {
      const totalTime = resolvedClaims.reduce((sum, claim) => {
        const diff = claim.resolvedAt!.getTime() - claim.createdAt.getTime();
        return sum + diff;
      }, 0);
      averageResolutionTime = totalTime / resolvedClaims.length / (1000 * 60 * 60); // Convert to hours
    }

    // Calculate totals
    const total = statusCounts.reduce((sum, item) => sum + item._count.status, 0);
    const openClaims = statusCounts
      .filter((s) => ['OPEN', 'IN_PROGRESS'].includes(s.status))
      .reduce((sum, s) => sum + s._count.status, 0);

    return {
      total,
      byStatus: statusCounts.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      byPriority: priorityCounts.map((item) => ({
        priority: item.priority,
        count: item._count.priority,
      })),
      averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
      resolvedThisMonth,
      openClaims,
    };
  }
}

export const claimsService = new ClaimsService();

