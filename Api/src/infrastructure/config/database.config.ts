import { Pool, PoolConfig } from 'pg';
import { logger } from '../logging/logger';
import { config } from './app.config';

export interface DatabaseConfig {
  url?: string; // Optional database URL
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    let dbConfig: PoolConfig;

    // Use DB_URL if provided, otherwise use individual parameters
    if (config.database.url) {
      dbConfig = {
        connectionString: config.database.url,
        max: config.database.max,
        idleTimeoutMillis: config.database.idleTimeoutMillis,
        connectionTimeoutMillis: config.database.connectionTimeoutMillis,
        ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
      };
    } else {
      dbConfig = {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.user,
        password: config.database.password,
        max: config.database.max,
        idleTimeoutMillis: config.database.idleTimeoutMillis,
        connectionTimeoutMillis: config.database.connectionTimeoutMillis,
        ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
      };
    }

    this.pool = new Pool(dbConfig);

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });

    // Handle pool connection
    this.pool.on('connect', () => {
      logger.info('Database client connected');
    });

    // Handle pool removal
    this.pool.on('remove', () => {
      logger.info('Database client removed');
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      logger.info('Database connection test successful', {
        timestamp: result.rows[0].now
      });

      return true;
    } catch (error) {
      logger.error('Database connection test failed', error);
      return false;
    }
  }

  public async closeConnection(): Promise<void> {
    try {
      await this.pool.end();
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Error closing database connection pool', error);
      throw error;
    }
  }

  public async getConnectionCount(): Promise<number> {
    return this.pool.totalCount;
  }

  public async getIdleConnectionCount(): Promise<number> {
    return this.pool.idleCount;
  }

  public async getWaitingConnectionCount(): Promise<number> {
    return this.pool.waitingCount;
  }
}

// Export singleton instance
export const databaseConnection = DatabaseConnection.getInstance();