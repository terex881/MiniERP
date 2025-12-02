import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendUnauthorized } from '../utils/response';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      sendUnauthorized(res, 'Invalid token format');
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        client: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }

    if (!user.isActive) {
      sendUnauthorized(res, 'Account is deactivated');
      return;
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      clientId: user.client?.id,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error', { error: error.message });
    
    if (error.name === 'TokenExpiredError') {
      sendUnauthorized(res, 'Token expired');
      return;
    }
    
    if (error.name === 'JsonWebTokenError') {
      sendUnauthorized(res, 'Invalid token');
      return;
    }
    
    sendUnauthorized(res, 'Authentication failed');
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        client: {
          select: { id: true },
        },
      },
    });

    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clientId: user.client?.id,
      };
    }

    next();
  } catch {
    // Silently continue without auth
    next();
  }
}

