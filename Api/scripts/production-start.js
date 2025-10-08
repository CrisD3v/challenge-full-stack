#!/usr/bin/env node

/**
 * Script de inicio para producción
 * Maneja la configuración del entorno de producción, health checks y arranque elegante
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Colores para la salida de consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

function validateEnvironment() {
  log('🔍 Validando entorno de producción...', colors.blue);

  const requiredVars = [
    'NODE_ENV',
    'JWT_SECRET',
    'PORT'
  ];

  // Verificar configuración de base de datos
  const hasDbUrl = !!process.env.DB_URL;
  const hasDbParams = !!(
    process.env.DB_HOST &&
    process.env.DB_PORT &&
    process.env.DB_NAME &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD
  );

  if (!hasDbUrl && !hasDbParams) {
    requiredVars.push('DB_URL or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD');
  }

  const missing = requiredVars.filter(varName => {
    if (varName.includes('or')) return false; // Omitir la verificación combinada
    return !process.env[varName];
  });

  if (missing.length > 0) {
    log(`❌ Faltan variables de entorno requeridas: ${missing.join(', ')}`, colors.red);
    process.exit(1);
  }

  // Validar NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    log(`⚠️  NODE_ENV no está configurado como 'production' (actual: ${process.env.NODE_ENV})`, colors.yellow);
  }

  // Validar fortaleza del JWT secret
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    log('❌ JWT_SECRET debe tener al menos 32 caracteres en producción', colors.red);
    process.exit(1);
  }

  log('✅ Validación de entorno completada', colors.green);
}

function checkDependencies() {
  log('📦 Verificando dependencias...', colors.blue);

  try {
    // Verificar si existe el directorio dist
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      log('❌ Directorio dist no encontrado. Ejecuta "npm run build" primero', colors.red);
      process.exit(1);
    }

    // Verificar si existe el punto de entrada principal
    const mainFile = path.join(distPath, 'index.js');
    if (!fs.existsSync(mainFile)) {
      log('❌ Punto de entrada principal no encontrado. Ejecuta "npm run build" primero', colors.red);
      process.exit(1);
    }

    log('✅ Verificación de dependencias completada', colors.green);
  } catch (error) {
    log(`❌ Verificación de dependencias falló: ${error.message}`, colors.red);
    process.exit(1);
  }
}

function createLogsDirectory() {
  log('📁 Configurando directorio de logs...', colors.blue);

  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    log('✅ Directorio de logs creado', colors.green);
  } else {
    log('✅ Directorio de logs existe', colors.green);
  }
}

async function waitForDatabase() {
  log('🗄️  Esperando conexión a la base de datos...', colors.blue);

  const maxAttempts = 30;
  const delay = 2000; // 2 segundos

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Intentar conectar a la base de datos usando un health check simple
      const { Pool } = require('pg');

      const dbConfig = process.env.DB_URL ?
        { connectionString: process.env.DB_URL } :
        {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD
        };

      const pool = new Pool({
        ...dbConfig,
        max: 1,
        connectionTimeoutMillis: 5000
      });

      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      await pool.end();

      log('✅ Conexión a la base de datos exitosa', colors.green);
      return;
    } catch (error) {
      log(`⏳ Intento de conexión a la base de datos ${attempt}/${maxAttempts} falló: ${error.message}`, colors.yellow);

      if (attempt === maxAttempts) {
        log('❌ Conexión a la base de datos falló después del máximo de intentos', colors.red);
        process.exit(1);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function runMigrations() {
  log('🔄 Ejecutando migraciones de base de datos...', colors.blue);

  try {
    execSync('npm run db:migrate', { stdio: 'pipe' });
    log('✅ Migraciones de base de datos completadas', colors.green);
  } catch (error) {
    log(`❌ Migraciones de base de datos fallaron: ${error.message}`, colors.red);
    process.exit(1);
  }
}

function startApplication() {
  log('🚀 Starting Task Management API...', colors.cyan);

  const port = process.env.PORT || 3000;
  const nodeArgs = [
    '--max-old-space-size=512', // Limitar uso de memoria
    'dist/index.js'
  ];

  const app = spawn('node', nodeArgs, {
    stdio: 'inherit',
    env: process.env
  });

  // Manejar salida de la aplicación
  app.on('exit', (code, signal) => {
    if (code !== null) {
      log(`Aplicación terminó con código ${code}`, code === 0 ? colors.green : colors.red);
    } else {
      log(`Aplicación terminada por señal ${signal}`, colors.yellow);
    }
  });

  app.on('error', (error) => {
    log(`Falló al iniciar la aplicación: ${error.message}`, colors.red);
    process.exit(1);
  });

  // Esperar a que la aplicación esté lista
  setTimeout(async () => {
    try {
      await waitForApplicationReady(port);
      log('🎉 Task Management API started successfully!', colors.green);
      log(`📍 Server running on port ${port}`, colors.cyan);
      log(`🌍 Environment: ${process.env.NODE_ENV}`, colors.cyan);
      log(`📊 Health check: http://localhost:${port}/health`, colors.cyan);
    } catch (error) {
      log(`❌ La aplicación falló al iniciar: ${error.message}`, colors.red);
      app.kill();
      process.exit(1);
    }
  }, 5000);

  return app;
}

async function waitForApplicationReady(port, maxAttempts = 10) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/health`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Health check returned status ${res.statusCode}`));
          }
        });

        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Timeout en health check'));
        });
      });

      return; // Éxito
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(`Aplicación no está lista después de ${maxAttempts} intentos: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

function setupGracefulShutdown(app) {
  const gracefulShutdown = (signal) => {
    log(`\n🛑 Recibida señal ${signal}. Iniciando apagado elegante...`, colors.yellow);

    if (app) {
      app.kill('SIGTERM');
    }

    setTimeout(() => {
      log('⚠️  Apagado forzado después del timeout', colors.red);
      process.exit(1);
    }, 30000); // timeout de 30 segundos
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

async function main() {
  try {
    log(`${colors.cyan}${colors.bright}🚀 Task Management API - Production Startup${colors.reset}`);
    log(`${colors.cyan}===============================================${colors.reset}`);

    // Verificaciones previas al vuelo
    validateEnvironment();
    checkDependencies();
    createLogsDirectory();

    // Configuración de base de datos
    await waitForDatabase();
    await runMigrations();

    // Iniciar aplicación
    const app = startApplication();
    setupGracefulShutdown(app);

  } catch (error) {
    log(`💥 Inicio de producción falló: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Manejar argumentos del script
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.cyan}${colors.bright}Task Management API - Inicio de Producción${colors.reset}`);
  log(`${colors.cyan}===============================================\n${colors.reset}`);
  log('Uso: node scripts/production-start.js [opciones]\n');
  log('Opciones:');
  log('  --help, -h    Mostrar este mensaje de ayuda');
  log('\nEste script hará:');
  log('  1. Validar variables de entorno de producción');
  log('  2. Verificar dependencias y artefactos de build');
  log('  3. Configurar directorio de logs');
  log('  4. Esperar conexión a la base de datos');
  log('  5. Ejecutar migraciones de base de datos');
  log('  6. Iniciar la aplicación con health checks');
  log('  7. Configurar manejadores de apagado elegante');
  process.exit(0);
}

// Ejecutar el inicio de producción
main();
