import { Pool } from 'pg';
import { databaseConnection } from '../config/database.config';

/**
 * Crea y retorna un pool de conexiones de base de datos
 * Esta función proporciona una interfaz simple para obtener un pool de base de datos
 * que puede ser usado en toda la aplicación
 */
export const createDatabasePool = (): Pool => {
    return databaseConnection.getPool();
};

/**
 * Probar la conexión de base de datos
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
    return databaseConnection.testConnection();
};

/**
 * Cerrar el pool de conexiones de base de datos
 */
export const closeDatabaseConnection = async (): Promise<void> => {
    return databaseConnection.closeConnection();
};

/**
 * Obtener estadísticas de conexión
 */
export const getDatabaseStats = async () => {
    return {
        totalConnections: await databaseConnection.getConnectionCount(),
        idleConnections: await databaseConnection.getIdleConnectionCount(),
        waitingConnections: await databaseConnection.getWaitingConnectionCount()
    };
};