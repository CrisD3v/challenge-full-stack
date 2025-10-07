import { DomainError } from './domain.error';

/**
 * Error lanzado cuando hay un conflicto con el estado actual del recurso
 */
export class ConflictError extends DomainError {
    public readonly conflictType?: string;
    public readonly conflictValue?: string;

    constructor(
        message: string,
        conflictType?: string,
        conflictValue?: string
    ) {
        super(message, 'CONFLICT', 409);
        this.conflictType = conflictType;
        this.conflictValue = conflictValue;
    }

    /**
     * Crear un error de conflicto para recursos duplicados
     */
    static duplicate(resource: string, field: string, value: string): ConflictError {
        return new ConflictError(
            `${resource} with ${field} '${value}' already exists`,
            'DUPLICATE',
            value
        );
    }

    /**
     * Crear un error de conflicto para violaciones de reglas de negocio
     */
    static businessRule(message: string): ConflictError {
        return new ConflictError(message, 'BUSINESS_RULE');
    }
}