import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { hashPassword } from '../../utils/hash';
import { CreateUserInput, UpdateUserInput, ResetPasswordInput, UserQueryInput } from './users.schema';
import { UserResponse, UserWithStats } from './users.types';
import { BadRequestError, NotFoundError } from '../../middleware/error.middleware';
import { PaginatedResult } from '../../types';

class UsersService {
  /**
   * Get all users with pagination and filters
   */
  async findAll(query: UserQueryInput): Promise<PaginatedResult<UserResponse>> {
    const { page, limit, role, isActive, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute query
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<UserWithStats> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdLeads: true,
            assignedLeads: true,
            assignedClaims: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Create new user
   */
  async create(input: CreateUserInput): Promise<UserResponse> {
    const { email, password, ...rest } = input;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        ...rest,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, input: UpdateUserInput): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if updating email
    if (input.email && input.email.toLowerCase() !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (emailExists) {
        throw new BadRequestError('Email already in use');
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...input,
        email: input.email?.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async delete(id: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Soft delete - deactivate instead of hard delete
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Toggle user active status
   */
  async toggleStatus(id: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Reset user password (admin action)
   */
  async resetPassword(id: string, input: ResetPasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const hashedPassword = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  /**
   * Get users for assignment dropdown (operators and supervisors)
   */
  async getAssignableUsers(): Promise<Pick<UserResponse, 'id' | 'firstName' | 'lastName' | 'role'>[]> {
    return prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ['OPERATOR', 'SUPERVISOR', 'ADMIN'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: { firstName: 'asc' },
    });
  }
}

export const usersService = new UsersService();

