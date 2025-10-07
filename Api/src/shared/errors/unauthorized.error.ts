import { DomainError } from './domain.error';

/**
 * Error lanzado cuando falla la autenticación o autorización
 */
export class UnauthorizedError extends DomainError {
    public readonly reason?: string;

    constructor(message: string = 'Unauthorized access', reason?: string) {
        super(message, 'UNAUTHORIZED', 401);
        this.reason = reason;
    }

    /**
     * Crear un error de no autorización para credenciales inválidas
     */
    static invalidCredentials(): UnauthorizedError {
        return new UnauthorizedError('Invalid credentials provided', 'INVALID_CREDENTIALS');
    }

    /**
     * Crear un error de no autorización para token faltante
     */
    static missingToken(): UnauthorizedError {
        return new UnauthorizedError('Authentication token is required', 'MISSING_TOKEN');
    }

    /**
     * Crear un error de no autorización para token inválido
     */
    static invalidToken(): UnauthorizedError {
        return new UnauthorizedError('Invalid or expired authentication token', 'INVALID_TOKEN');
    }

    /**
     * Crear un error de no autorización para permisos insuficientes
     */
    static insufficientPermissions(): UnauthorizedError {
        return new UnauthorizedError('Insufficient permissions to access this resource', 'INSUFFICIENT_PERMISSIONS');
    }
}