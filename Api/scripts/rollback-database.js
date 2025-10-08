#!/usr/bin/env node

/**
 * Script de Rollback de Base de Datos para Entorno de Desarrollo
 *
 * Este script elimina todas las tablas y limpia la base de datos.
 * ¡USAR CON PRECAUCIÓN - Esto eliminará todos los datos!
 *
 * Uso:
 *   node scripts/rollback-database.js [--confirm]
 *
 * Opciones:
 *   --confirm    Omitir confirmación (para scripts automatizados)
 */

const { Pool } = require('pg');
const readline = require('readline');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = process.env.DB_URL ? {
  connectionString: process.env.DB_URL
} : {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'taskdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

async function confirmRollback() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(
      `⚠️  Esto eliminará TODAS LAS TABLAS y TODOS LOS DATOS en la base de datos "${dbConfig.database}".\n` +
      `¿Estás seguro de que quieres continuar? (escribe "yes" para confirmar): `,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function rollbackDatabase() {
  const pool = new Pool(dbConfig);

  try {
    console.log('🔗 Conectando a la base de datos PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos exitosa');

    console.log('🗑️  Eliminando todas las tablas...');

    // Eliminar tablas en orden inverso de dependencias
    const dropStatements = [
      'DROP TABLE IF EXISTS task_tags CASCADE;',
      'DROP TABLE IF EXISTS tags CASCADE;',
      'DROP TABLE IF EXISTS tasks CASCADE;',
      'DROP TABLE IF EXISTS categories CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP TABLE IF EXISTS schema_migrations CASCADE;',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;'
    ];

    for (const statement of dropStatements) {
      await pool.query(statement);
      console.log(`✅ Ejecutado: ${statement}`);
    }

    console.log('🎉 Rollback de la base de datos completado exitosamente!');

  } catch (error) {
    console.error('❌ Rollback falló:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function main() {
  const skipConfirmation = process.argv.includes('--confirm');

  console.log('🔄 Script de Rollback de Base de Datos');

  if (process.env.DB_URL) {
    console.log(`📊 Base de Datos Objetivo: ${process.env.DB_URL}`);
  } else {
    console.log(`📊 Base de Datos Objetivo: ${dbConfig.database} en ${dbConfig.host}:${dbConfig.port}`);
  }

  if (!skipConfirmation) {
    const confirmed = await confirmRollback();
    if (!confirmed) {
      console.log('❌ Rollback cancelado por el usuario');
      process.exit(0);
    }
  }

  await rollbackDatabase();
}

// Ejecutar el script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Rollback falló:', error);
    process.exit(1);
  });
}

module.exports = { rollbackDatabase };
