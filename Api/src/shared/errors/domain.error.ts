/**
 * Clase base de error de dominio de la cual extienden todos los errores personalizados
 */
export abstract class DomainError extends Error {
    public readonly code: string;
    public readonly statusCode: number;

    constructor(message: string, code: string, statusCode: number = 500) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;

        // Mantiene el stack trace adecuado para donde se lanzó nuestro error
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}