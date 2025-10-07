import { DomainError } from './domain.error';

/**
 * Error lanzado cuando el acceso a un recurso está prohibido
 */
export class ForbiddenError extends DomainError {
    public readonly resource?: string;
    public readonly action?: string;

    constructor(
        message: string = 'Access to this resource is forbidden',
        resource?: string,
        action?: string
    ) {
        super(message, 'FORBIDDEN', 403);
        this.resource = resource;
        this.action = action;
    }

    /**
     * Crear un error de prohibición para propiedad de recurso
     */
    static resourceOwnership(resource: string): ForbiddenError {
        return new ForbiddenError(
            `You don't have permission to access this ${resource}`,
            resource,
            'ACCESS'
        );
    }

    /**
     * Crear un error de prohibición para acción específica
     */
    static forAction(action: string, resource: string): ForbiddenError {
        return new ForbiddenError(
            `You don't have permission to ${action} this ${resource}`,
            resource,
            action
        );
    }
}