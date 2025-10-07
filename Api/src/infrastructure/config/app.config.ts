import dotenv from 'dotenv';

// Cargar variables de entorno solo si no está en el entorno de prueba
if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  logging: {
    level: string;
    errorFile: string;
    combinedFile: string;
  };
}


export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

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