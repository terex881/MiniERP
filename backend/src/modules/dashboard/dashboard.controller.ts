import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess, sendForbidden } from '../../utils/response';

class DashboardController {
  /**
   * GET /api/dashboard/admin
   * Get admin dashboard statistics
   */
  async getAdminStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getAdminStats();
      sendSuccess(res, stats, 'Admin dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/supervisor
   * Get supervisor dashboard statistics
   */
  async getSupervisorStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dashboardService.getSupervisorStats();
      sendSuccess(res, stats, 'Supervisor dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/operator
   * Get operator dashboard statistics
   */
  async getOperatorStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.user!;
      const stats = await dashboardService.getOperatorStats(userId);
      sendSuccess(res, stats, 'Operator dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/client
   * Get client portal dashboard statistics
   */
  async getClientStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientId } = req.user!;
      
      if (!clientId) {
        sendForbidden(res, 'Client profile not found');
        return;
      }

      const stats = await dashboardService.getClientPortalStats(clientId);
      sendSuccess(res, stats, 'Client dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard
   * Get dashboard based on user role
   */
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, role, clientId } = req.user!;
      let stats;

      switch (role) {
        case 'ADMIN':
          stats = await dashboardService.getAdminStats();
          break;
        case 'SUPERVISOR':
          stats = await dashboardService.getSupervisorStats();
          break;
        case 'OPERATOR':
          stats = await dashboardService.getOperatorStats(userId);
          break;
        case 'CLIENT':
          if (!clientId) {
            sendForbidden(res, 'Client profile not found');
            return;
          }
          stats = await dashboardService.getClientPortalStats(clientId);
          break;
        default:
          sendForbidden(res, 'Invalid role');
          return;
      }

      sendSuccess(res, stats, 'Dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();

