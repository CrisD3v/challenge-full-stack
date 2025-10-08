#!/usr/bin/env node

/**
 * Script de seeding de base de datos para desarrollo
 * Crea usuarios, categorías, tareas y tags de ejemplo para pruebas
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configuración de la base de datos - priorizar DB_URL si está disponible
const dbConfig = process.env.DB_URL ?
  { connectionString: process.env.DB_URL } :
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'taskdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  };

// Colores para salida de consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Datos de ejemplo
const sampleUsers = [
  {
    id: uuidv4(),
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'demo123'
  },
  {
    id: uuidv4(),
    email: 'test@example.com',
    name: 'Test User',
    password: 'test123'
  }
];

const sampleCategories = [
  { name: 'Trabajo', color: '#FF6B6B' },
  { name: 'Personal', color: '#4ECDC4' },
  { name: 'Estudios', color: '#45B7D1' },
  { name: 'Hogar', color: '#96CEB4' },
  { name: 'Salud', color: '#FFEAA7' }
];

const sampleTags = [
  'urgente',
  'importante',
  'reunión',
  'proyecto',
  'revisión',
  'compras',
  'ejercicio',
  'lectura'
];

const sampleTasks = [
  {
    title: 'Completar informe mensual',
    description: 'Preparar el informe de ventas del mes anterior',
    priority: 'alta',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
    completed: false,
    category: 'Trabajo',
    tags: ['importante', 'proyecto']
  },
  {
    title: 'Revisar propuesta de cliente',
    description: 'Analizar la propuesta del cliente ABC y preparar respuesta',
    priority: 'alta',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días desde ahora
    completed: false,
    category: 'Trabajo',
    tags: ['urgente', 'revisión']
  },
  {
    title: 'Comprar ingredientes para cena',
    description: 'Lista: pollo, verduras, arroz, especias',
    priority: 'media',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día desde ahora
    completed: false,
    category: 'Personal',
    tags: ['compras']
  },
  {
    title: 'Ejercicio matutino',
    description: 'Rutina de 30 minutos de cardio y fuerza',
    priority: 'media',
    dueDate: null,
    completed: true,
    category: 'Salud',
    tags: ['ejercicio']
  },
  {
    title: 'Leer capítulo 5 del libro de JavaScript',
    description: 'Continuar con el estudio de async/await',
    priority: 'baja',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días desde ahora
    completed: false,
    category: 'Estudios',
    tags: ['lectura']
  },
  {
    title: 'Organizar escritorio',
    description: 'Limpiar y organizar el espacio de trabajo',
    priority: 'baja',
    dueDate: null,
    completed: true,
    category: 'Hogar',
    tags: []
  }
];

async function seedDatabase() {
  const pool = new Pool(dbConfig);

  try {
    log(`${colors.cyan}🌱 Iniciando seeding de la base de datos...${colors.reset}`);

    // Verificar si ya existen datos
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 0) {
      log(`${colors.yellow}⚠️  La base de datos ya contiene datos. Omitiendo seeding.${colors.reset}`);
      log(`${colors.yellow}   Usa la bandera --force para sobrescribir datos existentes${colors.reset}`);
      return;
    }

    // Hashear contraseñas para usuarios de ejemplo
    log(`${colors.blue}🔐 Hasheando contraseñas...${colors.reset}`);
    for (const user of sampleUsers) {
      user.passwordHash = await bcrypt.hash(user.password, 12);
    }

    // Insertar usuarios de ejemplo
    log(`${colors.blue}👥 Creando usuarios de ejemplo...${colors.reset}`);
    for (const user of sampleUsers) {
      await pool.query(
        'INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4)',
        [user.id, user.email, user.name, user.passwordHash]
      );
      log(`   ✅ Usuario creado: ${user.email}`);
    }

    // Insertar categorías para cada usuario
    log(`${colors.blue}📁 Creando categorías de ejemplo...${colors.reset}`);
    const categoryMap = new Map();

    for (const user of sampleUsers) {
      for (const category of sampleCategories) {
        const categoryId = uuidv4();
        await pool.query(
          'INSERT INTO categories (id, name, color, user_id) VALUES ($1, $2, $3, $4)',
          [categoryId, category.name, category.color, user.id]
        );
        categoryMap.set(`${user.id}-${category.name}`, categoryId);
        log(`   ✅ Categoría creada: ${category.name} para ${user.email}`);
      }
    }

    // Insertar tags para cada usuario
    log(`${colors.blue}🏷️  Creando tags de ejemplo...${colors.reset}`);
    const tagMap = new Map();

    for (const user of sampleUsers) {
      for (const tagName of sampleTags) {
        const tagId = uuidv4();
        await pool.query(
          'INSERT INTO tags (id, name, user_id) VALUES ($1, $2, $3)',
          [tagId, tagName, user.id]
        );
        tagMap.set(`${user.id}-${tagName}`, tagId);
        log(`   ✅ Etiqueta creada: ${tagName} para ${user.email}`);
      }
    }

    // Insertar tareas de ejemplo
    log(`${colors.blue}📝 Creando tareas de ejemplo...${colors.reset}`);

    for (const user of sampleUsers) {
      for (const task of sampleTasks) {
        const taskId = uuidv4();
        const categoryId = categoryMap.get(`${user.id}-${task.category}`);

        await pool.query(
          `INSERT INTO tasks (id, title, description, priority, due_date,
           completed, user_id, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            taskId,
            task.title,
            task.description,
            task.priority,
            task.dueDate,
            task.completed,
            user.id,
            categoryId
          ]
        );

        // Agregar tags a la tarea
        for (const tagName of task.tags) {
          const tagId = tagMap.get(`${user.id}-${tagName}`);
          if (tagId) {
            await pool.query(
              'INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)',
              [taskId, tagId]
            );
          }
        }

        log(`   ✅ Tarea creada: ${task.title} para ${user.email}`);
      }
    }

    log(`${colors.green}🎉 Seeding de la base de datos completado exitosamente!${colors.reset}`);
    log(`${colors.cyan}Cuentas de ejemplo creadas:${colors.reset}`);
    log(`   📧 demo@example.com (contraseña: demo123)`);
    log(`   📧 test@example.com (contraseña: test123)`);
    log(`${colors.cyan}Datos creados:${colors.reset}`);
    log(`   👥 ${sampleUsers.length} usuarios`);
    log(`   📁 ${sampleCategories.length * sampleUsers.length} categorías`);
    log(`   🏷️  ${sampleTags.length * sampleUsers.length} tags`);
    log(`   📝 ${sampleTasks.length * sampleUsers.length} tareas`);

  } catch (error) {
    console.error(`${colors.reset}❌ Error en seeding de la base de datos:`, error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log(`${colors.cyan}Script de Seeding de Base de Datos${colors.reset}`);
  log('==================================\n');
  log('Uso: node scripts/seed-database.js [opciones]\n');
  log('Opciones:');
  log('  --help, -h    Mostrar este mensaje de ayuda');
  log('  --force       Forzar seeding aunque existan datos');
  log('\nEste script crea datos de ejemplo para desarrollo incluyendo:');
  log('  - Usuarios demo con contraseñas hasheadas');
  log('  - Categorías para organización de tareas');
  log('  - tags para etiquetado de tareas');
  log('  - Tareas de ejemplo con varias priorityes y fechas de vencimiento');
  process.exit(0);
}

// Verificar bandera de forzado
const forceSeeding = args.includes('--force');
if (forceSeeding) {
  log(`${colors.yellow}⚠️  Seeding forzado habilitado - los datos existentes se preservarán${colors.reset}`);
}

// Ejecutar seeding
seedDatabase()
  .then(() => {
    log(`${colors.green}✅ Proceso de seeding completado${colors.reset}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.reset}💥 Seeding falló:`, error.message);
    process.exit(1);
  });
