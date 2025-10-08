/**
 * Configuración centralizada de variables de entorno
 * Todas las variables de entorno deben tener el prefijo VITE_ para ser accesibles en el cliente
 */

interface AppConfig {
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
  };

  // Application Configuration
  app: {
    name: string;
    version: string;
  };

  // Development Configuration
  dev: {
    mode: boolean;
    enableLogging: boolean;
  };

  // Authentication Configuration
  auth: {
    tokenStorageKey: string;
    tokenExpiryHours: number;
  };

  // Feature Flags
  features: {
    dragDrop: boolean;
    darkTheme: boolean;
    export: boolean;
    statistics: boolean;
  };

  // Performance Configuration
  performance: {
    debounceDelay: number;
    paginationSize: number;
    maxFileSize: number;
  };

  // UI Configuration
  ui: {
    sidebarWidth: number;
    mobileBreakpoint: number;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  return value || defaultValue || '';
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 10000),
  },

  app: {
    name: getEnvVar('VITE_APP_NAME', 'Task Manager'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  },

  dev: {
    mode: getEnvBoolean('VITE_DEV_MODE', import.meta.env.DEV),
    enableLogging: getEnvBoolean('VITE_ENABLE_LOGGING', import.meta.env.DEV),
  },

  auth: {
    tokenStorageKey: getEnvVar('VITE_TOKEN_STORAGE_KEY', 'token'),
    tokenExpiryHours: getEnvNumber('VITE_TOKEN_EXPIRY_HOURS', 24),
  },

  features: {
    dragDrop: getEnvBoolean('VITE_ENABLE_DRAG_DROP', true),
    darkTheme: getEnvBoolean('VITE_ENABLE_DARK_THEME', true),
    export: getEnvBoolean('VITE_ENABLE_EXPORT', true),
    statistics: getEnvBoolean('VITE_ENABLE_STATISTICS', true),
  },

  performance: {
    debounceDelay: getEnvNumber('VITE_DEBOUNCE_DELAY', 300),
    paginationSize: getEnvNumber('VITE_PAGINATION_SIZE', 20),
    maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 5242880), // 5MB
  },

  ui: {
    sidebarWidth: getEnvNumber('VITE_SIDEBAR_WIDTH', 250),
    mobileBreakpoint: getEnvNumber('VITE_MOBILE_BREAKPOINT', 768),
  },
};

// Logging helper que respeta la configuración de entorno
export const logger = {
  log: (...args: any[]) => {
    if (config.dev.enableLogging) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (config.dev.enableLogging) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (config.dev.enableLogging) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (config.dev.enableLogging) {
      console.info(...args);
    }
  },
};

// Debug: Log de configuración cargada
// if (import.meta.env.DEV) {
//   console.log('🔧 Configuración cargada:', {
//     apiBaseUrl: config.api.baseUrl,
//     devMode: config.dev.mode,
//     enableLogging: config.dev.enableLogging,
//     features: config.features
//   });
// }

export default config;