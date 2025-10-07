/**
 * Servicio de monitoreo de Health 
 * Proporciona verificaciones de Health  integrales para la aplicación y sus dependencias
 */

import { Pool } from 'pg';
import { config } from '../config/app.config';
import { errorTracker } from '../logging/error-tracker';
import { logger } from '../logging/logger';

export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    service: string;
    version: string;
    uptime: string;
    environment: string;
}

export interface DetailedHealthStatus extends HealthStatus {
    checks: {
        database: HealthCheck;
        memory: HealthCheck;
        disk?: HealthCheck;
        dependencies?: HealthCheck[];
    };
    metrics: {
        errorRate: number;
        responseTime: number;
        activeConnections: number;
    };
}

export interface HealthCheck {
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime: number;
    message?: string;
    details?: any;
}

class HealthService {
    private startTime = Date.now();
    private dbPool: Pool | null = null;

    constructor() {
        // Inicializar pool de base de datos para verificaciones de Health 
        this.initializeDbPool();
    }

    private initializeDbPool(): void {
        try {
            this.dbPool = new Pool({
                host: config.database.host,
                port: config.database.port,
                database: config.database.database,
                user: config.database.user,
                password: config.database.password,
                max: 2, // Pool mínimo para verificaciones de Health 
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000
            });
        } catch (error) {
            logger.error('Failed to initialize health check database pool', error);
        }
    }

    /**
     * Obtener estado básico de Health 
     */
    async getHealthStatus(): Promise<HealthStatus> {
        const startTime = Date.now();

        try {
            // Verificación rápida de conectividad de base de datos
            const dbHealthy = await this.quickDatabaseCheck();
            const memoryHealthy = this.checkMemoryUsage();

            const status = dbHealthy && memoryHealthy ? 'healthy' : 'unhealthy';

            return {
                status,
                timestamp: new Date().toISOString(),
                service: 'Task Management API',
                version: process.env.npm_package_version || '1.0.0',
                uptime: this.getUptime(),
                environment: config.nodeEnv
            };
        } catch (error) {
            logger.error('Health check failed', error);
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                service: 'Task Management API',
                version: process.env.npm_package_version || '1.0.0',
                uptime: this.getUptime(),
                environment: config.nodeEnv
            };
        }
    }

    /**
     * Obtener estado detallado de Health  con verificaciones integrales
     */
    async getDetailedHealthStatus(): Promise<DetailedHealthStatus> {
        const startTime = Date.now();

        try {
            // Ejecutar todas las verificaciones de Health  en paralelo
            const [databaseCheck, memoryCheck] = await Promise.all([
                this.checkDatabase(),
                this.checkMemory()
            ]);

            // Determinar estado general
            const checks = { database: databaseCheck, memory: memoryCheck };
            const status = this.determineOverallStatus(Object.values(checks));

            // Obtener métricas
            const metrics = await this.getMetrics();

            return {
                status,
                timestamp: new Date().toISOString(),
                service: 'Task Management API',
                version: process.env.npm_package_version || '1.0.0',
                uptime: this.getUptime(),
                environment: config.nodeEnv,
                checks,
                metrics
            };
        } catch (error) {
            logger.error('Detailed health check failed', error);
            throw error;
        }
    }

    /**
     * Verificar si la aplicación está lista para servir requests
     */
    async checkReadiness(): Promise<boolean> {
        try {
            // La aplicación está lista si la base de datos es accesible
            return await this.quickDatabaseCheck();
        } catch (error) {
            logger.warn('Readiness check failed', error);
            return false;
        }
    }

    /**
     * Verificación rápida de conectividad de base de datos
     */
    private async quickDatabaseCheck(): Promise<boolean> {
        if (!this.dbPool) {
            return false;
        }

        try {
            const client = await this.dbPool.connect();
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Verificación integral de Health de base de datos
     */
    private async checkDatabase(): Promise<HealthCheck> {
        const startTime = Date.now();

        if (!this.dbPool) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Database pool not initialized'
            };
        }

        try {
            const client = await this.dbPool.connect();

            // Probar conectividad básica
            await client.query('SELECT 1');

            // Verificar versión de base de datos y estadísticas básicas
            const versionResult = await client.query('SELECT version()');
            const statsResult = await client.query(`
        SELECT
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

            client.release();

            const responseTime = Date.now() - startTime;

            return {
                status: responseTime < 1000 ? 'healthy' : 'degraded',
                responseTime,
                message: 'Database connection successful',
                details: {
                    version: versionResult.rows[0]?.version?.split(' ')[0] || 'unknown',
                    totalConnections: statsResult.rows[0]?.total_connections || 0,
                    activeConnections: statsResult.rows[0]?.active_connections || 0
                }
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                status: 'unhealthy',
                responseTime,
                message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Verificación de Health del uso de memoria
     */
    private checkMemory(): HealthCheck {
        const startTime = Date.now();

        try {
            const memUsage = process.memoryUsage();
            const totalMemory = memUsage.heapTotal;
            const usedMemory = memUsage.heapUsed;
            const memoryUsagePercent = (usedMemory / totalMemory) * 100;

            let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
            let message = 'Memory usage normal';

            if (memoryUsagePercent > 90) {
                status = 'unhealthy';
                message = 'Critical memory usage';
            } else if (memoryUsagePercent > 75) {
                status = 'degraded';
                message = 'High memory usage';
            }

            return {
                status,
                responseTime: Date.now() - startTime,
                message,
                details: {
                    heapUsed: `${Math.round(usedMemory / 1024 / 1024)}MB`,
                    heapTotal: `${Math.round(totalMemory / 1024 / 1024)}MB`,
                    usagePercent: `${memoryUsagePercent.toFixed(1)}%`,
                    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
                    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Verificar uso de memoria (versión simple)
     */
    private checkMemoryUsage(): boolean {
        try {
            const memUsage = process.memoryUsage();
            const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
            return memoryUsagePercent < 90; // Saludable si el uso de memoria es menor al 90%
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtener métricas de la aplicación
     */
    private async getMetrics(): Promise<any> {
        try {
            const errorMetrics = errorTracker.getMetrics();
            const timeWindow = Date.now() - errorMetrics.lastReset.getTime();
            const errorRate = errorMetrics.errorCount / (timeWindow / 1000 / 60); // errores por minuto

            return {
                errorRate: Math.round(errorRate * 100) / 100,
                responseTime: 0, // Sería necesario implementar seguimiento de tiempo de respuesta
                activeConnections: this.dbPool?.totalCount || 0
            };
        } catch (error) {
            return {
                errorRate: -1,
                responseTime: -1,
                activeConnections: -1
            };
        }
    }

    /**
     * Determinar estado general a partir de verificaciones individuales
     */
    private determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
        const hasUnhealthy = checks.some(check => check.status === 'unhealthy');
        const hasDegraded = checks.some(check => check.status === 'degraded');

        if (hasUnhealthy) return 'unhealthy';
        if (hasDegraded) return 'degraded';
        return 'healthy';
    }

    /**
     * Obtener tiempo de actividad de la aplicación
     */
    private getUptime(): string {
        const uptimeMs = Date.now() - this.startTime;
        const uptimeSeconds = Math.floor(uptimeMs / 1000);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
    }

    /**
     * Limpiar recursos
     */
    async cleanup(): Promise<void> {
        if (this.dbPool) {
            await this.dbPool.end();
            this.dbPool = null;
        }
    }
}

// Exportar instancia singleton
export const healthService = new HealthService();

// Exportar funciones para uso en rutas
export const getHealthStatus = () => healthService.getHealthStatus();
export const getDetailedHealthStatus = () => healthService.getDetailedHealthStatus();
export const checkReadiness = () => healthService.checkReadiness();