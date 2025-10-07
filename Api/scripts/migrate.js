#!/usr/bin/env node

/**
 * Herramienta CLI de Migration
 *
 * Interfaz de línea de comandos simple para ejecutar migrations de base de datos
 *
 * Uso:
 *   node scripts/migrate.js <comando>
 *
 * Comandos:
 *   status    - Mostrar estado de migrations
 *   up        - Ejecutar migrations pendientes
 *   reset     - Eliminar todas las tablas y re-ejecutar todas las migrations
 */

const { Pool } = require('pg');
const { runMigrations, seedDatabase } = require('./setup-database');
const { rollbackDatabase } = require('./rollback-database');
require('dotenv').config();

// Configuración de base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'taskdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
};

async function showStatus() {
    const pool = new Pool(dbConfig);

    try {
        console.log('📊 Migration Status');
        console.log(`Database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
        console.log('─'.repeat(50));

        // Verificar si la tabla de migrations existe
        const { rows: tableExists } = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'schema_migrations'
      )
    `);

        if (!tableExists[0].exists) {
            console.log('❌ Migrations table not found. Run "migrate up" to initialize.');
            return;
        }

        // Obtener migrations ejecutadas
        const { rows: executedMigrations } = await pool.query(
            'SELECT version, executed_at FROM schema_migrations ORDER BY version'
        );

        console.log(`✅ Executed migrations: ${executedMigrations.length}`);

        if (executedMigrations.length > 0) {
            console.log('\nExecuted migrations:');
            executedMigrations.forEach(migration => {
                console.log(`  ✓ ${migration.version} (${migration.executed_at.toISOString()})`);
            });
        }

    } catch (error) {
        console.error('❌ Error checking status:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

async function runUp() {
    console.log('🚀 Running migrations...');
    await runMigrations();
}

async function runReset() {
    console.log('🔄 Resetting database...');
    await rollbackDatabase();
    await runMigrations();
    console.log('✅ Database reset completed!');
}

async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'status':
            await showStatus();
            break;

        case 'up':
            await runUp();
            break;

        case 'reset':
            await runReset();
            break;

        case 'seed':
            await seedDatabase();
            break;

        default:
            console.log('Usage: node scripts/migrate.js <command>');
            console.log('');
            console.log('Commands:');
            console.log('  status    Show migration status');
            console.log('  up        Run pending migrations');
            console.log('  reset     Drop all tables and re-run migrations');
            console.log('  seed      Insert sample data');
            process.exit(1);
    }
}

// Ejecutar el CLI
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Command failed:', error);
        process.exit(1);
    });
}