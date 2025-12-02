import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { sendForbidden, sendUnauthorized } from '../utils/response';

// Role hierarchy (higher index = more permissions)
const roleHierarchy: Role[] = ['CLIENT', 'OPERATOR', 'SUPERVISOR', 'ADMIN'];

/**
 * Get role level for comparison
 */
function getRoleLevel(role: Role): number {
  return roleHierarchy.indexOf(role);
}

/**
 * Check if user role has minimum required level
 */
function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

/**
 * Middleware to check if user has one of the required roles
 */
export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user has at least the minimum required role
 */
export function requireMinRole(minRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!hasMinimumRole(req.user.role, minRole)) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
}

/**
 * Admin only middleware
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'ADMIN') {
    sendForbidden(res, 'Admin access required');
    return;
  }

  next();
}

/**
 * Staff only middleware (Admin, Supervisor, Operator)
 */
export function staffOnly(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role === 'CLIENT') {
    sendForbidden(res, 'Staff access required');
    return;
  }

  next();
}

/**
 * Client portal only middleware
 */
export function clientOnly(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'CLIENT') {
    sendForbidden(res, 'Client portal access only');
    return;
  }

  if (!req.user.clientId) {
    sendForbidden(res, 'No client profile linked');
    return;
  }

  next();
}

/**
 * Check if user can access a specific resource (ownership check)
 */
export function canAccessResource(
  resourceOwnerId: string | undefined | null,
  req: Request
): boolean {
  if (!req.user) return false;
  
  // Admins and Supervisors can access everything
  if (req.user.role === 'ADMIN' || req.user.role === 'SUPERVISOR') {
    return true;
  }

  // Operators can access resources assigned to them
  if (req.user.role === 'OPERATOR') {
    return resourceOwnerId === req.user.userId;
  }

  // Clients can only access their own resources
  if (req.user.role === 'CLIENT') {
    return resourceOwnerId === req.user.clientId;
  }

  return false;
}

/**
 * Middleware factory for resource ownership check
 */
export function requireOwnership(getResourceOwnerId: (req: Request) => Promise<string | null>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    // Admins bypass ownership check
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    try {
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        sendForbidden(res, 'Resource not found or access denied');
        return;
      }

      if (!canAccessResource(ownerId, req)) {
        sendForbidden(res, 'Access denied to this resource');
        return;
      }

      next();
    } catch (error) {
      sendForbidden(res, 'Access check failed');
    }
  };
}

// Export role hierarchy for use elsewhere
export { roleHierarchy, getRoleLevel, hasMinimumRole };

