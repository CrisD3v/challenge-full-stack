import { databaseConnection } from '../config/database.config';
import { logger } from '../logging/logger';

export interface DatabaseHealthStatus {
    isHealthy: boolean;
    connectionCount: number;
    idleConnectionCount: number;
    waitingConnectionCount: number;
    lastChecked: Date;
    error?: string;
}

export class DatabaseHealthChecker {
    public static async checkHealth(): Promise<DatabaseHealthStatus> {
        const lastChecked = new Date();

        try {
            // Testeo basico de conectividad
            const isConnected = await databaseConnection.testConnection();

            if (!isConnected) {
                return {
                    isHealthy: false,
                    connectionCount: 0,
                    idleConnectionCount: 0,
                    waitingConnectionCount: 0,
                    lastChecked,
                    error: 'Database connection test failed'
                };
            }

            // Obtener estadísticas del pool de conexiones
            const [connectionCount, idleConnectionCount, waitingConnectionCount] = await Promise.all([
                databaseConnection.getConnectionCount(),
                databaseConnection.getIdleConnectionCount(),
                databaseConnection.getWaitingConnectionCount()
            ]);

            const healthStatus: DatabaseHealthStatus = {
                isHealthy: true,
                connectionCount,
                idleConnectionCount,
                waitingConnectionCount,
                lastChecked
            };

            logger.debug('Database health check completed', healthStatus);

            return healthStatus;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            logger.error('Database health check failed', { error: errorMessage });

            return {
                isHealthy: false,
                connectionCount: 0,
                idleConnectionCount: 0,
                waitingConnectionCount: 0,
                lastChecked,
                error: errorMessage
            };
        }
    }

    public static async performDetailedHealthCheck(): Promise<DatabaseHealthStatus & {
        queryResponseTime?: number;
        version?: string;
    }> {
        const basicHealth = await this.checkHealth();

        if (!basicHealth.isHealthy) {
            return basicHealth;
        }

        try {
            const pool = databaseConnection.getPool();

            // Medir tiempo de respuesta de consulta
            const startTime = Date.now();
            const versionResult = await pool.query('SELECT version()');
            const queryResponseTime = Date.now() - startTime;

            return {
                ...basicHealth,
                queryResponseTime,
                version: versionResult.rows[0]?.version
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            return {
                ...basicHealth,
                isHealthy: false,
                error: errorMessage
            };
        }
    }
}