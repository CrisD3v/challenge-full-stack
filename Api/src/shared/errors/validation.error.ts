import { DomainError } from './domain.error';

/**
 * Error lanzado cuando falla la validación
 */
export class ValidationError extends DomainError {
    public readonly field?: string;
    public readonly details?: Record<string, any>;

    constructor(
        message: string,
        field?: string,
        details?: Record<string, any>
    ) {
        super(message, 'VALIDATION_ERROR', 400);
        this.field = field;
        this.details = details;
    }

    /**
     * Crear un error de validación para un field específico
     */
    static forField(field: string, message: string): ValidationError {
        return new ValidationError(`Validation failed for field '${field}': ${message}`, field);
    }

    /**
     * Crear un error de validación con múltiples errores de field
     */
    static withDetails(message: string, details: Record<string, string>): ValidationError {
        return new ValidationError(message, undefined, details);
    }
}