import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Send a success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Created successfully'
): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  error?: string
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error: error || message,
  };

  return res.status(statusCode).json(response);
}

/**
 * Send a not found response (404)
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): Response {
  return sendError(res, message, 404);
}

/**
 * Send an unauthorized response (401)
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): Response {
  return sendError(res, message, 401);
}

/**
 * Send a forbidden response (403)
 */
export function sendForbidden(
  res: Response,
  message: string = 'Access denied'
): Response {
  return sendError(res, message, 403);
}

/**
 * Send a bad request response (400)
 */
export function sendBadRequest(
  res: Response,
  message: string = 'Bad request',
  error?: string
): Response {
  return sendError(res, message, 400, error);
}

/**
 * Send a validation error response (422)
 */
export function sendValidationError(
  res: Response,
  message: string = 'Validation failed',
  error?: string
): Response {
  return sendError(res, message, 422, error);
}

