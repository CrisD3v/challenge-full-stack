/**
 * Seguimiento y monitoreo de errores listo para producción
 * Proporciona registro estructurado de errores y métricas para entornos de producción
 */
import { logger, logSecurityEvent } from './logger';

export interface ErrorContext {
    userId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
    timestamp?: string;
    [key: string]: any;
}

export interface ErrorMetrics {
    errorCount: number;
    errorsByType: Map<string, number>;
    errorsByEndpoint: Map<string, number>;
    lastReset: Date;
}

class ErrorTracker {
    private metrics: ErrorMetrics = {
        errorCount: 0,
        errorsByType: new Map(),
        errorsByEndpoint: new Map(),
        lastReset: new Date()
    };

    private readonly METRICS_RESET_INTERVAL = 60 * 60 * 1000; // 1 hour

    constructor() {
        // Reiniciar métricas periódicamente
        setInterval(() => {
            this.resetMetrics();
        }, this.METRICS_RESET_INTERVAL);
    }

    /**
     * Rastrea y registra errores de aplicación con contexto
     */
    trackError(error: Error, context: ErrorContext = {}): void {
        const errorInfo = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            service: 'task-management-api'
        };

        // Actualizar métricas
        this.updateMetrics(error, context);

        // Registrar basado en el tipo de error y severidad
        if (this.isSecurityError(error)) {
            logSecurityEvent('Application Error', errorInfo, 'high');
        } else if (this.isCriticalError(error)) {
            logger.error('Critical application error', errorInfo);
        } else {
            logger.error('Application error', errorInfo);
        }

        // Log metrics if error rate is high
        if (this.isHighErrorRate()) {
            logger.warn('High error rate detected', {
                metrics: this.getMetricsSummary(),
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Rastrea errores de validación
     */
    trackValidationError(field: string, value: any, rule: string, context: ErrorContext = {}): void {
        logger.warn('Validation error', {
            type: 'validation',
            field,
            value: typeof value === 'string' ? value.substring(0, 100) : value, // Truncate long values
            rule,
            context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Rastrea errores de autenticación/autorización
     */
    trackAuthError(type: 'authentication' | 'authorization', reason: string, context: ErrorContext = {}): void {
        logSecurityEvent(`${type} failure`, {
            reason,
            context,
            timestamp: new Date().toISOString()
        }, 'medium');

        // Track potential brute force attempts
        if (type === 'authentication' && context.ip) {
            this.trackFailedLogin(context.ip);
        }
    }

    /**
     * Rastrea errores de base de datos
     */
    trackDatabaseError(operation: string, error: Error, context: ErrorContext = {}): void {
        logger.error('Database error', {
            type: 'database',
            operation,
            error: {
                name: error.name,
                message: error.message,
                code: (error as any).code, // PostgreSQL error code
                detail: (error as any).detail
            },
            context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Rastrea problemas de rendimiento
     */
    trackPerformanceIssue(operation: string, duration: number, threshold: number, context: ErrorContext = {}): void {
        logger.warn('Performance issue detected', {
            type: 'performance',
            operation,
            duration: `${duration}ms`,
            threshold: `${threshold}ms`,
            context,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Obtiene las métricas de error actuales
     */
    getMetrics(): ErrorMetrics {
        return {
            ...this.metrics,
            errorsByType: new Map(this.metrics.errorsByType),
            errorsByEndpoint: new Map(this.metrics.errorsByEndpoint)
        };
    }

    /**
     * Obtiene un resumen de métricas para registro
     */
    getMetricsSummary(): any {
        return {
            totalErrors: this.metrics.errorCount,
            errorsByType: Object.fromEntries(this.metrics.errorsByType),
            errorsByEndpoint: Object.fromEntries(this.metrics.errorsByEndpoint),
            timeWindow: `${Math.round((Date.now() - this.metrics.lastReset.getTime()) / 1000 / 60)} minutes`
        };
    }

    private updateMetrics(error: Error, context: ErrorContext): void {
        this.metrics.errorCount++;

        // Rastrear por tipo de error
        const errorType = error.constructor.name;
        this.metrics.errorsByType.set(
            errorType,
            (this.metrics.errorsByType.get(errorType) || 0) + 1
        );

        // Rastrear por endpoint si está disponible
        if (context.endpoint) {
            this.metrics.errorsByEndpoint.set(
                context.endpoint,
                (this.metrics.errorsByEndpoint.get(context.endpoint) || 0) + 1
            );
        }
    }

    private resetMetrics(): void {
        // Registrar métricas finales antes del reinicio
        if (this.metrics.errorCount > 0) {
            logger.info('Error metrics summary', {
                type: 'metrics_summary',
                ...this.getMetricsSummary(),
                timestamp: new Date().toISOString()
            });
        }

        this.metrics = {
            errorCount: 0,
            errorsByType: new Map(),
            errorsByEndpoint: new Map(),
            lastReset: new Date()
        };
    }

    private isSecurityError(error: Error): boolean {
        const securityErrorTypes = [
            'UnauthorizedError',
            'ForbiddenError',
            'AuthenticationError',
            'AuthorizationError'
        ];
        return securityErrorTypes.includes(error.constructor.name);
    }

    private isCriticalError(error: Error): boolean {
        const criticalErrorTypes = [
            'DatabaseConnectionError',
            'OutOfMemoryError',
            'SystemError'
        ];
        return criticalErrorTypes.includes(error.constructor.name) ||
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('ENOTFOUND');
    }

    private isHighErrorRate(): boolean {
        const timeWindow = Date.now() - this.metrics.lastReset.getTime();
        const errorRate = this.metrics.errorCount / (timeWindow / 1000 / 60); // errors per minute
        return errorRate > 10; // More than 10 errors per minute
    }

    private failedLoginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

    private trackFailedLogin(ip: string): void {
        const now = new Date();
        const attempts = this.failedLoginAttempts.get(ip) || { count: 0, lastAttempt: now };

        // Reiniciar contador si el último intento fue hace más de 15 minutos
        if (now.getTime() - attempts.lastAttempt.getTime() > 15 * 60 * 1000) {
            attempts.count = 0;
        }

        attempts.count++;
        attempts.lastAttempt = now;
        this.failedLoginAttempts.set(ip, attempts);

        // Registrar potencial ataque de fuerza bruta
        if (attempts.count >= 5) {
            logSecurityEvent('Potential brute force attack', {
                ip,
                attemptCount: attempts.count,
                timeWindow: '15 minutes'
            }, 'high');
        }
    }
}

// Exportar instancia singleton
export const errorTracker = new ErrorTracker();

// Exportar funciones auxiliares para escenarios comunes de seguimiento de errores
export const trackError = (error: Error, context?: ErrorContext) =>
    errorTracker.trackError(error, context);

export const trackValidationError = (field: string, value: any, rule: string, context?: ErrorContext) =>
    errorTracker.trackValidationError(field, value, rule, context);

export const trackAuthError = (type: 'authentication' | 'authorization', reason: string, context?: ErrorContext) =>
    errorTracker.trackAuthError(type, reason, context);

export const trackDatabaseError = (operation: string, error: Error, context?: ErrorContext) =>
    errorTracker.trackDatabaseError(operation, error, context);

export const trackPerformanceIssue = (operation: string, duration: number, threshold: number, context?: ErrorContext) =>
    errorTracker.trackPerformanceIssue(operation, duration, threshold, context);