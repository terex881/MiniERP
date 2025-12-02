import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendValidationError } from '../utils/response';

/**
 * Middleware factory for request validation using Zod schemas
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors nicely
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = formattedErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join('; ');

        sendValidationError(res, 'Validation failed', errorMessage);
        return;
      }
      
      // Re-throw non-Zod errors
      throw error;
    }
  };
}

/**
 * Middleware to validate only the request body
 */
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = formattedErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join('; ');

        sendValidationError(res, 'Validation failed', errorMessage);
        return;
      }
      
      throw error;
    }
  };
}

/**
 * Middleware to validate only query parameters
 */
export function validateQuery(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = formattedErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join('; ');

        sendValidationError(res, 'Invalid query parameters', errorMessage);
        return;
      }
      
      throw error;
    }
  };
}

/**
 * Middleware to validate URL params
 */
export function validateParams(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = formattedErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join('; ');

        sendValidationError(res, 'Invalid URL parameters', errorMessage);
        return;
      }
      
      throw error;
    }
  };
}

