import { NextFunction, Request, Response } from 'express';
import { ValidationError as ExpressValidationError, validationResult } from 'express-validator';

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationErrorResponse {
  error: string;
  message: string;
  details: ValidationErrorDetail[];
}

/**
 * Middleware to handle express-validator validation results
 * Returns 400 status with detailed validation errors if validation fails
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationErrorDetail[] = errors.array().map((error: ExpressValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    const response: ValidationErrorResponse = {
      error: 'Validation Error',
      message: 'Los datos proporcionados no son válidos',
      details: validationErrors
    };

    res.status(400).json(response);
    return;
  }

  next();
};

/**
 * Helper function to create validation middleware chain
 * Combines validation rules with error handling
 */
export const validate = (validations: any[]) => {
  return [...validations, handleValidationErrors];
};