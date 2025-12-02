import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { sendError, sendBadRequest, sendNotFound } from '../utils/response';
import { env } from '../config/env';

/**
 * Custom application error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

/**
 * Bad request error
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
} {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return {
        statusCode: 400,
        message: `A record with this ${field} already exists`,
      };
    case 'P2003':
      // Foreign key constraint violation
      return {
        statusCode: 400,
        message: 'Referenced record does not exist',
      };
    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        message: 'Record not found',
      };
    default:
      return {
        statusCode: 500,
        message: 'Database error occurred',
      };
  }
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendNotFound(res, `Route ${req.method} ${req.path} not found`);
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred', {
    message: error.message,
    stack: env.isDevelopment ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle AppError (our custom errors)
  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { statusCode, message } = handlePrismaError(error);
    sendError(res, message, statusCode);
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    sendBadRequest(res, 'Invalid data provided');
    return;
  }

  // Handle Multer errors
  if (error.name === 'MulterError') {
    const multerError = error as any;
    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        sendBadRequest(res, 'File too large');
        return;
      case 'LIMIT_FILE_COUNT':
        sendBadRequest(res, 'Too many files');
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        sendBadRequest(res, 'Unexpected file field');
        return;
      default:
        sendBadRequest(res, 'File upload error');
        return;
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // Generic server error
  const message = env.isDevelopment ? error.message : 'Internal server error';
  sendError(res, message, 500);
}

