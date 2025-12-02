import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { CreateUserInput, UpdateUserInput, ResetPasswordInput, UserQueryInput } from './users.schema';
import { sendSuccess, sendCreated } from '../../utils/response';

class UsersController {
  /**
   * GET /api/users
   * List all users with pagination and filters
   */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as UserQueryInput;
      const result = await usersService.findAll(query);

      sendSuccess(res, result.data, 'Users retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/assignable
   * Get users available for assignment
   */
  async getAssignable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await usersService.getAssignableUsers();

      sendSuccess(res, users, 'Assignable users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await usersService.findById(id);

      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users
   * Create new user
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateUserInput = req.body;
      const user = await usersService.create(input);

      sendCreated(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * Update user
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateUserInput = req.body;
      const user = await usersService.update(id, input);

      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete user (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await usersService.delete(id);

      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id/toggle-status
   * Toggle user active status
   */
  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await usersService.toggleStatus(id);

      sendSuccess(res, user, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id/reset-password
   * Reset user password (admin action)
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input: ResetPasswordInput = req.body;
      await usersService.resetPassword(id, input);

      sendSuccess(res, null, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

