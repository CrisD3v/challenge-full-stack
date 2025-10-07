import { NextFunction, Request, Response } from 'express';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors';
import { logger } from './logging.middleware';

/**
 * Global error handling middleware
 * Handles all errors thrown in the application and returns appropriate HTTP responses
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Handle validation errors
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      field: error.field || undefined,
      code: 'VALIDATION_ERROR'
    });
    return;
  }

  // Handle not found errors
  if (error instanceof NotFoundError) {
    res.status(404).json({
      error: 'Not Found',
      message: error.message,
      code: 'NOT_FOUND'
    });
    return;
  }

  // Handle unauthorized errors
  if (error instanceof UnauthorizedError) {
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
      code: 'UNAUTHORIZED'
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
    return;
  }

  // Handle database constraint errors
  if (error.message?.includes('duplicate key value')) {
    const field = extractFieldFromDuplicateError(error.message);
    res.status(409).json({
      error: 'Conflict',
      message: `${field} already exists`,
      code: 'DUPLICATE_ENTRY'
    });
    return;
  }

  // Handle foreign key constraint errors
  if (error.message?.includes('foreign key constraint')) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Referenced resource does not exist',
      code: 'FOREIGN_KEY_CONSTRAINT'
    });
    return;
  }

  // Handle rate limiting errors (though express-rate-limit handles this)
  if (error.message?.includes('Too many requests')) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED'
    });
    return;
  }

  // Log internal server errors
  logger.error('Internal server error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date().toISOString()
  });

  // Default internal server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : error.message,
    code: 'INTERNAL_ERROR'
  });
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
};

/**
 * Extract field name from PostgreSQL duplicate key error message
 */
function extractFieldFromDuplicateError(message: string): string {
  const match = message.match(/Key \(([^)]+)\)/);
  return match?.[1] ?? 'field';
}