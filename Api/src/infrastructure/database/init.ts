import { databaseConnection } from '../config/database.config';
import { logger } from '../logging/logger';

export class DatabaseInitializer {
  public static async initialize(): Promise<void> {
    try {
      logger.info('Initializing database connection...');

      // Testea la conexión
      const isConnected = await databaseConnection.testConnection();

      if (!isConnected) {
        throw new Error('Failed to establish database connection');
      }

      logger.info('Database connection initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize database connection', error);
      throw error;
    }
  }

  public static async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down database connection...');

      await databaseConnection.closeConnection();

      logger.info('Database connection closed successfully');

    } catch (error) {
      logger.error('Error during database shutdown', error);
      throw error;
    }
  }
}

// Manejadores de cierre elegante
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  try {
    await DatabaseInitializer.shutdown();
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  try {
    await DatabaseInitializer.shutdown();
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', error);
    process.exit(1);
  }
});