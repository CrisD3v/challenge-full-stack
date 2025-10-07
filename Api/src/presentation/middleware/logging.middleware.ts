import { NextFunction, Request, Response } from 'express';
import winston from 'winston';

// Crear instancia del logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Agregar console Transport para desarrollo
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

/**
 * Middleware de logging de peticiones que registra peticiones HTTP con información de tiempo
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';

    // Registrar la petición entrante
    logger.info('Incoming request', {
        method,
        url,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
    });

    // Sobrescribir res.end para capturar detalles de la respuesta
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any): Response {
        const duration = Date.now() - start;
        const { statusCode } = res;

        // Registrar la respuesta
        logger.info('Request completed', {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
            timestamp: new Date().toISOString()
        });

        // Llamar al método end original
        return originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Middleware de logging de errores para capturar y registrar errores
 */
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';

    logger.error('Request error', {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        request: {
            method,
            url,
            ip,
            userAgent,
            body: req.body,
            params: req.params,
            query: req.query
        },
        timestamp: new Date().toISOString()
    });

    next(error);
};

export { logger };