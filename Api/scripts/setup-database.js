#!/usr/bin/env node

/**
 * Script de Configuración de Base de Datos para Entorno de Desarrollo
 *
 * Este script configura la base de datos PostgreSQL para la API de gestión de tareas.
 * Ejecuta todas las migraciones en orden y opcionalmente llena la base de datos con datos de prueba.
 *
 * Uso:
 *   node scripts/setup-database.js [--seed]
 *
 * Opciones:
 *   --seed    También insertar datos de ejemplo para desarrollo
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de la base de datos - priorizar DB_URL si está disponible
const dbConfig = process.env.DB_URL ?
  { connectionString: process.env.DB_URL } :
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'taskdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };

// Mostrar información de configuración
const displayConfig = process.env.DB_URL ?
  `DB_URL connection` :
  `${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`;

// Directorio de archivos de migración
const migrationsDir = path.join(__dirname, '../src/infrastructure/database/migrations');

async function runMigrations() {
  const pool = new Pool(dbConfig);

  try {
    console.log('🔗 Conectando a la base de datos PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos exitosa');

    // Crear tabla de seguimiento de migraciones si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Obtener lista de archivos de migración
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Encontrados ${migrationFiles.length} archivos de migración`);

    // Verificar qué migraciones ya han sido ejecutadas
    const { rows: executedMigrations } = await pool.query(
      'SELECT version FROM schema_migrations ORDER BY version'
    );
    const executedVersions = new Set(executedMigrations.map(row => row.version));

    // Ejecutar migraciones pendientes
    for (const file of migrationFiles) {
      const version = path.basename(file, '.sql');

      if (executedVersions.has(version)) {
        console.log(`⏭️  Omitiendo ${file} (ya ejecutada)`);
        continue;
      }

      console.log(`🔄 Ejecutando migración: ${file}`);

      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Ejecutar migración en una transacción
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(migrationSQL);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version]
        );
        await client.query('COMMIT');
        console.log(`✅ Migración ${file} ejecutada exitosamente`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('🎉 Todas las migraciones completadas exitosamente!');

  } catch (error) {
    console.error('❌ Migración falló:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function seedDatabase() {
  const pool = new Pool(dbConfig);

  try {
    console.log('🌱 Llenando base de datos con datos de ejemplo...');

    // Usuarios de ejemplo
    const users = [
      {
        email: 'admin@example.com',
        name: 'Administrador',
        password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoS' // contraseña: admin123
      },
      {
        email: 'user@example.com',
        name: 'Usuario Demo',
        password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoS' // contraseña: admin123
      }
    ];

    // Insertar usuarios
    for (const user of users) {
      await pool.query(`
        INSERT INTO users (email, name, password_hash)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO NOTHING
      `, [user.email, user.name, user.password_hash]);
    }

    // Obtener IDs de usuarios
    const { rows: userRows } = await pool.query('SELECT id, email FROM users');
    const adminUser = userRows.find(u => u.email === 'admin@example.com');
    const demoUser = userRows.find(u => u.email === 'user@example.com');

    if (adminUser) {
      // Categorías de ejemplo
      const categories = [
        { name: 'Trabajo', color: '#FF6B6B', user_id: adminUser.id },
        { name: 'Personal', color: '#4ECDC4', user_id: adminUser.id },
        { name: 'Estudios', color: '#45B7D1', user_id: adminUser.id }
      ];

      for (const category of categories) {
        await pool.query(`
          INSERT INTO categories (name, color, user_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (name, user_id) DO NOTHING
        `, [category.name, category.color, category.user_id]);
      }

      // Obtener IDs de categorías
      const { rows: categoryRows } = await pool.query(
        'SELECT id, name FROM categories WHERE user_id = $1',
        [adminUser.id]
      );

      // Etiquetas de ejemplo
      const tags = [
        { name: 'urgente', user_id: adminUser.id },
        { name: 'importante', user_id: adminUser.id },
        { name: 'reunion', user_id: adminUser.id },
        { name: 'proyecto', user_id: adminUser.id }
      ];

      for (const tag of tags) {
        await pool.query(`
          INSERT INTO tags (name, user_id)
          VALUES ($1, $2)
          ON CONFLICT (name, user_id) DO NOTHING
        `, [tag.name, tag.user_id]);
      }

      // Tareas de ejemplo
      const trabajoCategory = categoryRows.find(c => c.name === 'Trabajo');
      const personalCategory = categoryRows.find(c => c.name === 'Personal');

      const tasks = [
        {
          title: 'Completar informe mensual',
          description: 'Preparar el informe de actividades del mes',
          priority: 'alta',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
          user_id: adminUser.id,
          category_id: trabajoCategory?.id
        },
        {
          title: 'Revisar emails pendientes',
          description: 'Responder emails importantes acumulados',
          priority: 'media',
          completed: true,
          user_id: adminUser.id,
          category_id: trabajoCategory?.id
        },
        {
          title: 'Comprar víveres',
          description: 'Lista de compras para la semana',
          priority: 'baja',
          user_id: adminUser.id,
          category_id: personalCategory?.id
        }
      ];

      for (const task of tasks) {
        await pool.query(`
          INSERT INTO tasks (title, description, priority, due_date, completed, user_id, category_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          task.title,
          task.description,
          task.priority,
          task.due_date,
          task.completed || false,
          task.user_id,
          task.category_id
        ]);
      }
    }

    console.log('✅ Base de datos llenada exitosamente!');

  } catch (error) {
    console.error('❌ Seeding falló:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function main() {
  const shouldSeed = process.argv.includes('--seed');

  console.log('🚀 Iniciando configuración de base de datos...');
  console.log(`📊 Base de Datos: ${displayConfig}`);

  await runMigrations();

  if (shouldSeed) {
    await seedDatabase();
  }

  console.log('🎯 Configuración de base de datos completada!');
}

// Ejecutar el script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Configuración falló:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations, seedDatabase };
