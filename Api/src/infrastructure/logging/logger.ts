import winston from 'winston';
import { config } from '../config/app.config';

// Crear directorio de logs si no existe
import { existsSync, mkdirSync } from 'fs';
const logsDir = 'logs';
if (!existsSync(logsDir)) {
    mkdirSync(logsDir);
}

// Formato de log listo para producción con datos estructurados
const productionFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf((info) => {
        // Agregar metadatos de entorno y servicio para monitoreo en producción
        const { timestamp, level, message, service, ...otherInfo } = info;
        const logEntry = {
            timestamp,
            level,
            message,
            service: service || 'task-management-api',
            environment: config.nodeEnv,
            pid: process.pid,
            hostname: require('os').hostname(),
            ...otherInfo
        };

        return JSON.stringify(logEntry);
    })
);

// Formato de consola amigable para desarrollo
const developmentFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;

        // Pretty print metadata in development
        const metaKeys = Object.keys(meta).filter(key =>
            !['timestamp', 'level', 'message', 'service'].includes(key)
        );

        if (metaKeys.length > 0) {
            const cleanMeta: Record<string, any> = {};
            metaKeys.forEach(key => {
                cleanMeta[key] = meta[key];
            });
            msg += `\n${JSON.stringify(cleanMeta, null, 2)}`;
        }

        return msg;
    })
);

// Configurar transports basados en el entorno
const transports: winston.transport[] = [];

// Transports de archivo para todos los entornos
transports.push(
    // Archivo de log de errores con rotación
    new winston.transports.File({
        filename: config.logging.errorFile,
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        format: productionFormat
    }),

    // Archivo de log combinado con rotación
    new winston.transports.File({
        filename: config.logging.combinedFile,
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        format: productionFormat
    })
);

// Configuración de transport de consola
if (config.nodeEnv === 'production') {
    // Logging JSON estructurado para producción (para sistemas de agregación de logs)
    transports.push(new winston.transports.Console({
        format: productionFormat,
        level: 'info' // Solo registrar info y superiores en consola de producción
    }));
} else {
    // Formato legible para desarrollo
    transports.push(new winston.transports.Console({
        format: developmentFormat
    }));
}

// Crear instancia del logger con configuración mejorada
export const logger = winston.createLogger({
    level: config.nodeEnv === 'production' ? 'info' : config.logging.level,
    format: productionFormat,
    defaultMeta: {
        service: 'task-management-api',
        version: process.env.npm_package_version || '1.0.0'
    },
    transports,

    // Manejo de errores mejorado
    exitOnError: false, // Don't exit on handled exceptions

    // Modo silencioso para pruebas
    silent: process.env.NODE_ENV === 'test'
});

// Manejo de excepciones y rechazos listos para producción
logger.exceptions.handle(
    new winston.transports.File({
        filename: 'logs/exceptions.log',
        format: productionFormat,
        maxsize: 10485760,
        maxFiles: 5
    })
);

logger.rejections.handle(
    new winston.transports.File({
        filename: 'logs/rejections.log',
        format: productionFormat,
        maxsize: 10485760,
        maxFiles: 5
    })
);

// Agregar compatibilidad con ID de correlación de solicitudes
export const addCorrelationId = (correlationId: string) => {
    return logger.child({ correlationId });
};

// Ayudante de monitoreo de rendimiento
export const logPerformance = (operation: string, startTime: number, metadata?: any) => {
    const duration = Date.now() - startTime;
    logger.info('Performance metric', {
        operation,
        duration: `${duration}ms`,
        ...metadata
    });
};

//Registro de eventos de seguridad
export const logSecurityEvent = (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') => {
    logger.warn('Security event', {
        securityEvent: event,
        severity,
        details,
        timestamp: new Date().toISOString()
    });
};

export default logger;