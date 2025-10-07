// Clase base de error
export { DomainError } from './domain.error';

// Clases específicas de error
export { ConflictError } from './conflict.error';
export { ForbiddenError } from './forbidden.error';
export { NotFoundError } from './not-found.error';
export { UnauthorizedError } from './unauthorized.error';
export { ValidationError } from './validation.error';

// Importar tipos para type guards
import { ConflictError } from './conflict.error';
import { DomainError } from './domain.error';
import { ForbiddenError } from './forbidden.error';
import { NotFoundError } from './not-found.error';
import { UnauthorizedError } from './unauthorized.error';
import { ValidationError } from './validation.error';

// Funciones type guard
export const isDomainError = (error: any): error is DomainError => {
    return error instanceof Error && 'code' in error && 'statusCode' in error;
};

export const isValidationError = (error: any): error is ValidationError => {
    return error instanceof Error && error.name === 'ValidationError';
};

export const isNotFoundError = (error: any): error is NotFoundError => {
    return error instanceof Error && error.name === 'NotFoundError';
};

export const isUnauthorizedError = (error: any): error is UnauthorizedError => {
    return error instanceof Error && error.name === 'UnauthorizedError';
};

export const isForbiddenError = (error: any): error is ForbiddenError => {
    return error instanceof Error && error.name === 'ForbiddenError';
};

export const isConflictError = (error: any): error is ConflictError => {
    return error instanceof Error && error.name === 'ConflictError';
};