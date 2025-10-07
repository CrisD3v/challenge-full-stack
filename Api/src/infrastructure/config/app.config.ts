import dotenv from 'dotenv';
import { DatabaseConfig } from './database.config';


// Cargar variables de entorno solo si no está en el entorno de prueba
if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  logging: {
    level: string;
    errorFile: string;
    combinedFile: string;
  };
}


// Analizar la URL de la base de datos para extraer componentes individuales
function parseDatabaseUrl(url: string): Partial<DatabaseConfig> {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      database: parsed.pathname.slice(1), // Remove leading slash
      user: parsed.username,
      password: parsed.password
    };
  } catch (error) {
    throw new Error(`Invalid database URL format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validar las variables de entorno requeridas
function validateEnvironment(): void {
  const hasDbUrl = !!process.env.DB_URL;
  const hasIndividualParams = !!(
    process.env.DB_HOST &&
    process.env.DB_PORT &&
    process.env.DB_NAME &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD
  );

  // Debe tener DB_URL o todos los parámetros de base de datos individuales
  if (!hasDbUrl && !hasIndividualParams) {
    throw new Error(
      'Database configuration missing. Please provide either:\n' +
      '1. DB_URL environment variable, or\n' +
      '2. All individual database parameters: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD'
    );
  }
}

// Validar y analizar variables de entorno
validateEnvironment();

// Configurar ajustes de base de datos
function configureDatabaseSettings(): DatabaseConfig {
  const baseConfig = {
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
  };

  if (process.env.DB_URL) {
    // Usar DB_URL
    const parsedUrl = parseDatabaseUrl(process.env.DB_URL);
    return {
      url: process.env.DB_URL,
      host: parsedUrl.host || 'localhost',
      port: parsedUrl.port || 5432,
      database: parsedUrl.database || '',
      user: parsedUrl.user || '',
      password: parsedUrl.password || '',
      ...baseConfig
    };
  } else {
    // Usar parametros individuales
    return {
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      ...baseConfig
    };
  }
}


export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: configureDatabaseSettings(),
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    errorFile: process.env.LOG_FILE_ERROR || 'logs/error.log',
    combinedFile: process.env.LOG_FILE_COMBINED || 'logs/combined.log'
  },
};

// Configuración de registro en desarrollo (sin datos sensibles)
if (config.nodeEnv === 'development') {
  console.log('Application Configuration Loaded:', {
    port: config.port,
    nodeEnv: config.nodeEnv,
    logging: config.logging,
  });
}