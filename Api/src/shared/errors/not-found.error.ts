import { DomainError } from './domain.error';

/**
 * Error lanzado cuando un recurso solicitado no se encuentra
 */
export class NotFoundError extends DomainError {
    public readonly resource: string;
    public readonly resourceId?: string;

    constructor(resource: string, resourceId?: string) {
        const message = resourceId
            ? `${resource} with id '${resourceId}' not found`
            : `${resource} not found`;

        super(message, 'NOT_FOUND', 404);
        this.resource = resource;
        this.resourceId = resourceId;
    }

    /**
     * Crear un error de no encontrado para un recurso específico por ID
     */
    static forResource(resource: string, id: string): NotFoundError {
        return new NotFoundError(resource, id);
    }
    
    /**
     * Crear un error de no encontrado genérico para un tipo de recurso
     */
    static forResourceType(resource: string): NotFoundError {
        return new NotFoundError(resource);
    }
}