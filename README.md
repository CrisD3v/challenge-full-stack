# 📋 Challenge Full Stack - Sistema de Gestión de Tareas

Un sistema completo de gestión de tareas desarrollado con **Node.js/TypeScript** en el backend y **React/TypeScript** en el frontend, implementando arquitectura hexagonal y las mejores prácticas de desarrollo.

## 🎯 Descripción del Proyecto

Este proyecto es una aplicación web full-stack para la gestión de tareas que permite a los usuarios:

- **Gestionar tareas** con CRUD completo (crear, leer, actualizar, eliminar)
- **Organizar por categorías** con colores personalizables
- **Etiquetar tareas** para mejor clasificación y organización
- **Filtrar y buscar** tareas de manera avanzada con múltiples criterios
- **Establecer prioridades** (alta, media, baja) para mejor organización
- **Definir fechas límite** para las tareas con validación
- **Autenticación segura** con JWT y hash de contraseñas
- **Interfaz drag & drop** para reordenar tareas intuitivamente
- **Estadísticas** y reportes de productividad personal
- **Tema claro/oscuro** para mejor experiencia de usuario
- **Exportación** de datos en diferentes formatos
- **Gestión offline** con sincronización automática
- **Notificaciones** en tiempo real para cambios importantes

## 🏗️ Arquitectura del Sistema

### Backend (API)
- **Arquitectura Hexagonal** (Clean Architecture) con separación clara de capas
- **Node.js** con **TypeScript** para type safety
- **Express.js** como framework web con middleware personalizado
- **PostgreSQL** como base de datos con migraciones automáticas
- **JWT** para autenticación segura con bcrypt
- **Jest** para testing unitario e integración
- **Winston** para logging estructurado
- **Rate Limiting** para protección contra ataques
- **Helmet** para headers de seguridad
- **CORS** configurado para desarrollo y producción

### Frontend (Client)
- **React 19** con **TypeScript** y hooks modernos
- **Vite** como build tool para desarrollo rápido
- **Styled Components** para estilos modulares
- **React Hook Form** con validación Yup
- **React Router** para navegación SPA
- **Axios** para comunicación HTTP con interceptors
- **DND Kit** para funcionalidad drag & drop
- **TanStack Query** para gestión de estado del servidor
- **Context API** para estado global de autenticación y tema

## 📁 Estructura del Proyecto

```
challenge-full-stack/
├── api/                          # Backend API
│   ├── src/
│   │   ├── application/          # Casos de uso y DTOs
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   └── use-cases/       # Lógica de negocio
│   │   ├── domain/              # Entidades y reglas de negocio
│   │   │   ├── entities/        # Task, User, Category, Tag
│   │   │   ├── repositories/    # Interfaces de repositorios
│   │   │   └── value-objects/   # Priority, Email, etc.
│   │   ├── infrastructure/      # Implementaciones técnicas
│   │   │   ├── config/          # Configuración de entorno
│   │   │   ├── database/        # PostgreSQL y migraciones
│   │   │   ├── repositories/    # Implementación repositorios
│   │   │   ├── security/        # JWT y bcrypt
│   │   │   ├── logging/         # Winston logger
│   │   │   └── monitoring/      # Health checks
│   │   ├── presentation/        # Capa de presentación
│   │   │   ├── controllers/     # Auth, Task, Category, Tag
│   │   │   ├── middleware/      # Rate limiting, CORS
│   │   │   ├── routes/          # Rutas de la API
│   │   │   └── validators/      # Validación de entrada
│   │   ├── shared/              # Errores y utilidades
│   │   └── types/               # Definiciones TypeScript
│   ├── scripts/                 # Scripts de base de datos
│   └── logs/                    # Archivos de log
├── Client/                      # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── Auth/           # Login, Register
│   │   │   ├── Tasks/          # TaskList, TaskForm, TaskCard
│   │   │   ├── Categories/     # CategoryManager
│   │   │   ├── Layout/         # Sidebar, Header, Layout
│   │   │   ├── Commons/        # ErrorBoundary, Toast
│   │   │   └── Debug/          # Herramientas de desarrollo
│   │   ├── pages/              # Dashboard, Auth, Statistics
│   │   ├── hooks/              # Custom hooks para API
│   │   ├── services/           # Cliente API con Axios
│   │   ├── context/            # Auth y Theme context
│   │   ├── types/              # Interfaces TypeScript
│   │   ├── utils/              # Helpers y utilidades
│   │   ├── config/             # Configuración de TanStack Query
│   │   └── styles/             # CSS global
│   └── public/                 # Archivos estáticos
└── README.md                   # Este archivo
```

## 🚀 Configuración e Instalación

### Prerrequisitos

- **Node.js** 18 o superior
- **PostgreSQL** 12 o superior
- **npm** o **pnpm** (recomendado)
- **Git**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/CrisD3v/challenge-full-stack.git
cd challenge-full-stack
```

### 2. Configuración del Backend (API)

#### Instalar Dependencias

```bash
cd api
npm install
# o usando pnpm (recomendado)
pnpm install
```

#### Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar el archivo `.env` con tu configuración:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskdb
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Configuración JWT
JWT_SECRET=tu_clave_secreta_super_segura_de_al_menos_32_caracteres
JWT_EXPIRES_IN=24h
JWT_ISSUER=task-management-api

# Configuración de Logging
LOG_LEVEL=info
LOG_FILE_ERROR=logs/error.log
LOG_FILE_COMBINED=logs/combined.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Seguridad
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173

# Pool de Conexiones
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

#### Configurar Base de Datos

Asegúrate de tener PostgreSQL instalado y ejecutándose, luego:

```bash
# Crear base de datos y ejecutar migraciones
npm run db:setup

# Opcional: Llenar con datos de ejemplo (usuarios demo, categorías, tareas)
npm run db:setup:seed
```

Los datos de ejemplo incluyen:
- Usuario admin: `admin@example.com` / `admin123`
- Usuario demo: `user@example.com` / `admin123`
- Categorías predefinidas con colores
- Tareas de ejemplo con diferentes prioridades

#### Iniciar el Servidor API

```bash
# Modo desarrollo con hot reload
npm run dev

# El servidor estará disponible en http://localhost:3000
# Health check: http://localhost:3000/health
```

### 3. Configuración del Frontend (Client)

#### Instalar Dependencias

```bash
cd ../Client
npm install
# o usando pnpm
pnpm install
```

#### Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar el archivo `.env`:

```env
# Configuración de la API
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Configuración de la Aplicación
VITE_APP_NAME=Task Manager
VITE_APP_VERSION=1.0.0

# Configuración de Desarrollo
VITE_DEV_MODE=true
VITE_ENABLE_LOGGING=true

# Configuración de Autenticación
VITE_TOKEN_STORAGE_KEY=token
VITE_TOKEN_EXPIRY_HOURS=24

# Feature Flags
VITE_ENABLE_DRAG_DROP=true
VITE_ENABLE_DARK_THEME=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_STATISTICS=true

# Configuración de Performance
VITE_DEBOUNCE_DELAY=300
VITE_PAGINATION_SIZE=20
VITE_MAX_FILE_SIZE=5242880

# Configuración de UI
VITE_SIDEBAR_WIDTH=250
VITE_MOBILE_BREAKPOINT=768
```

#### Iniciar la Aplicación Frontend

```bash
# Modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

## 📚 Documentación de la API

### Endpoints Principales

#### Autenticación
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/registro` | Registrar nuevo usuario | No |
| `POST` | `/api/auth/login` | Iniciar sesión | No |
| `GET` | `/api/auth/perfil` | Obtener perfil del usuario | Sí |

#### Tareas
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/tareas` | Listar tareas con filtros avanzados | Sí |
| `POST` | `/api/tareas` | Crear nueva tarea | Sí |
| `GET` | `/api/tareas/:id` | Obtener tarea específica | Sí |
| `PUT` | `/api/tareas/:id` | Actualizar tarea completa | Sí |
| `PATCH` | `/api/tareas/:id/completar` | Alternar estado completado | Sí |
| `DELETE` | `/api/tareas/:id` | Eliminar tarea | Sí |

**Filtros disponibles en GET /api/tareas:**
- `completed`: true/false
- `priority`: alta/media/baja
- `categoryId`: UUID de categoría
- `search`: búsqueda en título y descripción
- `sinceDate`: tareas desde fecha
- `untilDate`: tareas hasta fecha
- `limit` y `offset`: paginación

#### Categorías
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/categorias` | Listar categorías del usuario | Sí |
| `POST` | `/api/categorias` | Crear nueva categoría | Sí |
| `PUT` | `/api/categorias/:id` | Actualizar categoría | Sí |
| `DELETE` | `/api/categorias/:id` | Eliminar categoría | Sí |

#### Etiquetas
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/api/etiquetas` | Listar etiquetas del usuario | Sí |
| `POST` | `/api/etiquetas` | Crear nueva etiqueta | Sí |
| `PUT` | `/api/etiquetas/:id` | Actualizar etiqueta | Sí |
| `DELETE` | `/api/etiquetas/:id` | Eliminar etiqueta | Sí |

#### Health Checks y Monitoreo
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Estado básico del servicio | No |
| `GET` | `/health/detailed` | Estado detallado con métricas | No |
| `GET` | `/ready` | Sonda de preparación (Kubernetes) | No |
| `GET` | `/live` | Sonda de vida (Kubernetes) | No |

### Ejemplos de Uso de la API

#### 1. Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "MiPassword123"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid-del-usuario",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Iniciar Sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "MiPassword123"
  }'
```

#### 3. Crear Tarea

```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_jwt_token" \
  -d '{
    "title": "Completar documentación",
    "description": "Escribir la documentación completa del proyecto",
    "priority": "alta",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "categoryId": "uuid-categoria",
    "tagIds": ["uuid-tag-1", "uuid-tag-2"]
  }'
```

**Respuesta:**
```json
{
  "id": "uuid-tarea",
  "title": "Completar documentación",
  "description": "Escribir la documentación completa del proyecto",
  "completed": false,
  "priority": "alta",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "userId": "uuid-usuario",
  "categoryId": "uuid-categoria",
  "category": {
    "id": "uuid-categoria",
    "name": "Trabajo",
    "color": "#3498db"
  },
  "tags": [
    {
      "id": "uuid-tag-1",
      "name": "Urgente"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 4. Filtrar Tareas

```bash
# Tareas pendientes de alta prioridad
curl "http://localhost:3000/api/tareas?completed=false&priority=alta" \
  -H "Authorization: Bearer tu_jwt_token"

# Búsqueda con paginación
curl "http://localhost:3000/api/tareas?search=documentacion&limit=10&offset=0" \
  -H "Authorization: Bearer tu_jwt_token"

# Filtrar por categoría y fecha
curl "http://localhost:3000/api/tareas?categoryId=uuid-categoria&sinceDate=2024-01-01" \
  -H "Authorization: Bearer tu_jwt_token"
```

#### 5. Crear Categoría

```bash
curl -X POST http://localhost:3000/api/categorias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_jwt_token" \
  -d '{
    "name": "Trabajo",
    "description": "Tareas relacionadas con el trabajo",
    "color": "#3498db"
  }'
```

#### 6. Crear Etiqueta

```bash
curl -X POST http://localhost:3000/api/etiquetas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_jwt_token" \
  -d '{
    "name": "Urgente"
  }'
```

## 🎨 Uso del Frontend

### Funcionalidades Principales

#### 1. Autenticación
- **Registro de usuarios** con validación de formularios
- **Inicio de sesión** con persistencia de token
- **Logout** seguro

#### 2. Gestión de Tareas
- **Lista de tareas** con filtros avanzados y paginación
- **Crear/editar tareas** con formulario completo y validación
- **Drag & drop** para reordenar tareas intuitivamente
- **Marcar como completadas** con un click
- **Eliminar tareas** con confirmación modal
- **Búsqueda en tiempo real** con debounce
- **Filtros persistentes** que se mantienen entre sesiones

#### 3. Organización
- **Categorías** con colores personalizables (formato hex)
- **Etiquetas** para clasificación múltiple
- **Filtros combinados** por estado, prioridad, categoría, etiqueta, fecha
- **Ordenamiento** por fecha, prioridad, título
- **Vista de calendario** para fechas límite

#### 4. Características Avanzadas
- **Estadísticas** de productividad con gráficos
- **Exportación** de datos en múltiples formatos
- **Tema claro/oscuro** con persistencia
- **Responsive design** para móviles y tablets
- **Gestión offline** con sincronización automática
- **Optimistic updates** para mejor UX
- **Error handling** robusto con recuperación automática

### Componentes Principales

#### TaskList Component
```typescript
// Ejemplo de uso del componente de lista de tareas
import { TaskList } from './components/Tasks/TaskList';

<TaskList
  tasks={tasks}
  onTaskUpdate={handleTaskUpdate}
  onTaskDelete={handleTaskDelete}
  onTaskComplete={handleTaskComplete}
  filters={filters}
  loading={loading}
/>
```

#### TaskForm Component
```typescript
// Ejemplo de uso del formulario de tareas
import { TaskForm } from './components/Tasks/TaskForm';

<TaskForm
  task={selectedTask}
  categories={categories}
  tags={tags}
  onSubmit={handleTaskSubmit}
  onCancel={handleCancel}
/>
```

### Custom Hooks

#### useTasks Hook
```typescript
// Hook principal para gestión de tareas con TanStack Query
const {
  tasks,
  isLoading,
  error,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  refetch
} = useTasks(filters);
```

#### useAuth Hook
```typescript
// Hook para autenticación con Context API
const {
  usuario,
  isLoading,
  login,
  register,
  logout,
  isAuthenticated
} = useAuth();
```

#### useTaskMutations Hook
```typescript
// Hook especializado para mutaciones de tareas
const {
  createMutation,
  updateMutation,
  deleteMutation,
  toggleMutation
} = useTaskMutations();
```

#### useDragAndDrop Hook
```typescript
// Hook para funcionalidad drag & drop
const {
  sensors,
  handleDragEnd,
  handleDragStart,
  activeId
} = useDragAndDrop(tasks, onReorder);
```

## 🧪 Testing

### Backend Testing

```bash
cd Api

# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="Task"
```

### Tipos de Tests Implementados

- **Unit Tests:** Entidades, casos de uso, servicios
- **Integration Tests:** Controladores, repositorios
- **E2E Tests:** Flujos completos de API

### Ejemplo de Test

```typescript
// Ejemplo de test de caso de uso
describe('CreateTaskUseCase', () => {
  it('should create a task successfully', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'alta' as const,
      userId: 'user-id'
    };

    const result = await createTaskUseCase.execute(taskData);

    expect(result.title).toBe(taskData.title);
    expect(result.completed).toBe(false);
  });
});
```

## 🗄️ Base de Datos

### Esquema de Base de Datos

```sql
-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Constraints de validación
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_name_check CHECK (LENGTH(TRIM(name)) > 0)
);

-- Tabla de categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Constraints de validación
  CONSTRAINT categories_name_check CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT categories_color_check CHECK (color IS NULL OR color ~* '^#[0-9A-Fa-f]{6}$'),

  -- Unique constraint para evitar categorías duplicadas por usuario
  CONSTRAINT unique_category_per_user UNIQUE (name, user_id)
);

-- Tabla de etiquetas
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  CONSTRAINT fk_tags_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Constraints de validación
  CONSTRAINT tags_name_check CHECK (LENGTH(TRIM(name)) > 0),

  -- Unique constraint para evitar etiquetas duplicadas por usuario
  CONSTRAINT unique_tag_per_user UNIQUE (name, user_id)
);

-- Tabla de tareas
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  priority VARCHAR(10) DEFAULT 'media' NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  category_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

  -- Constraints de validación
  CONSTRAINT tasks_title_check CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT tasks_priority_check CHECK (priority IN ('baja', 'media', 'alta')),
  CONSTRAINT tasks_description_check CHECK (description IS NULL OR LENGTH(TRIM(description)) > 0)
);

-- Tabla de relación tareas-etiquetas
CREATE TABLE task_tags (
  task_id UUID NOT NULL,
  tag_id UUID NOT NULL,

  -- Foreign keys
  CONSTRAINT fk_task_tags_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,

  -- Primary key compuesta
  PRIMARY KEY (task_id, tag_id)
);

-- Índices para optimización de consultas
CREATE INDEX idx_tasks_user_completed ON tasks (user_id, completed);
CREATE INDEX idx_tasks_user_priority ON tasks (user_id, priority);
CREATE INDEX idx_tasks_user_category ON tasks (user_id, category_id);
CREATE INDEX idx_tasks_due_date ON tasks (due_date) WHERE due_date IS NOT NULL;

-- Índice de búsqueda de texto completo
CREATE INDEX idx_tasks_search ON tasks USING gin (
  to_tsvector('spanish', title || ' ' || COALESCE(description, ''))
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Scripts de Base de Datos

```bash
# Configurar base de datos completa (migraciones + datos opcionales)
npm run db:setup

# Configurar con datos de ejemplo
npm run db:setup:seed

# Solo ejecutar migraciones pendientes
npm run db:migrate

# Ver estado de migraciones ejecutadas
npm run db:migrate:status

# Llenar con datos de ejemplo (usuarios, categorías, tareas)
npm run db:seed

# Resetear base de datos completamente (¡CUIDADO!)
npm run db:migrate:reset

# Rollback de la última migración
npm run db:rollback
```

**Datos de ejemplo incluidos:**
- 2 usuarios demo con contraseñas hash
- 3 categorías con colores (Trabajo, Personal, Estudios)
- 4 etiquetas predefinidas
- 3 tareas de ejemplo con diferentes estados y prioridades

## 🔒 Seguridad

### Medidas de Seguridad Implementadas

#### Backend
- **Autenticación JWT** con tokens seguros
- **Hashing de contraseñas** con bcrypt (12 rounds)
- **Rate limiting** para prevenir ataques de fuerza bruta
- **Validación de entrada** robusta con express-validator
- **Headers de seguridad** con Helmet
- **CORS** configurado apropiadamente
- **Sanitización** de datos de entrada
- **Logging** de eventos de seguridad

#### Frontend
- **Almacenamiento seguro** de tokens
- **Validación de formularios** en cliente y servidor
- **Sanitización** de datos mostrados
- **Protección de rutas** privadas
- **Timeout automático** de sesión
- **Validación de tipos** con TypeScript

### Configuración de Seguridad

```env
# JWT - Usar clave segura en producción
JWT_SECRET=clave_super_secreta_de_al_menos_32_caracteres
JWT_EXPIRES_IN=24h

# Bcrypt - Rounds de hashing
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# CORS - Configurar para producción
CORS_ORIGIN=https://tu-dominio.com
```

## 📊 Monitoreo y Logging

### Health Checks

```bash
# Estado básico del servicio
curl http://localhost:3000/health

# Estado detallado con métricas
curl http://localhost:3000/health/detailed
```

### Logging

Los logs se almacenan en:
- `Api/logs/error.log` - Solo errores
- `Api/logs/combined.log` - Todos los logs

Configuración de niveles:
```env
LOG_LEVEL=info  # error, warn, info, debug
```

### Métricas Disponibles

- **Tiempo de respuesta** de endpoints
- **Número de requests** por minuto
- **Errores** por tipo y frecuencia
- **Uso de memoria** y CPU
- **Conexiones** de base de datos activas

## 🚀 Despliegue

### Variables de Entorno de Producción

#### Backend
```env
NODE_ENV=production
PORT=3000

# Base de datos
DB_URL=postgres://user:password@host:port/database

# JWT con clave segura
JWT_SECRET=clave_super_secreta_de_produccion_muy_larga

# Logging
LOG_LEVEL=warn

# CORS para tu dominio
CORS_ORIGIN=https://tu-dominio.com

# Rate limiting más estricto
RATE_LIMIT_MAX_REQUESTS=50
```

#### Frontend
```env
VITE_API_BASE_URL=https://api.tu-dominio.com/api
VITE_APP_NAME=Task Manager
VITE_DEV_MODE=false
VITE_ENABLE_LOGGING=false
```

### Build para Producción

#### Backend
```bash
cd Api
npm run build
npm start
```

#### Frontend
```bash
cd Client
npm run build
npm run preview
```

### Consideraciones de Producción

- Usar **reverse proxy** (nginx/Apache)
- Configurar **SSL/TLS** con certificados válidos
- Implementar **monitoreo** (Prometheus/Grafana)
- Configurar **backups** automáticos de base de datos
- Usar **variables de entorno** seguras
- Implementar **CI/CD** pipeline
- Configurar **logs centralizados**
- Usar **CDN** para assets estáticos

## 🛠️ Scripts Disponibles

### Backend (api/)
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar en modo desarrollo con nodemon y hot reload |
| `npm run build` | Compilar TypeScript a JavaScript |
| `npm start` | Iniciar servidor de producción |
| `npm test` | Ejecutar todos los tests unitarios |
| `npm run test:watch` | Tests en modo watch para desarrollo |
| `npm run test:coverage` | Tests con reporte de cobertura completo |
| `npm run test:all` | Ejecutar tests unitarios e integración |
| `npm run db:setup` | Configurar base de datos completa |
| `npm run db:setup:seed` | Configurar BD con datos de ejemplo |
| `npm run db:migrate` | Ejecutar migraciones pendientes |
| `npm run db:migrate:status` | Ver estado de migraciones |
| `npm run db:seed` | Llenar con datos de ejemplo |
| `npm run db:rollback` | Rollback de migraciones |
| `npm run db:migrate:reset` | Resetear base de datos (¡CUIDADO!) |

### Frontend (Client/)
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo con Vite |
| `npm run build` | Build optimizado para producción |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Ejecutar ESLint con reglas TypeScript |
| `npm run build:prod` | Build y preview en un comando |

### Estándares de Código

- **TypeScript** estricto en ambos proyectos
- **ESLint** para linting
- **Prettier** para formateo (configurar en tu editor)
- **Conventional Commits** para mensajes
- **Tests** requeridos para nuevas funcionalidades
- **Documentación** actualizada

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté ejecutándose
# Windows
net start postgresql-x64-14

# Verificar configuración en .env
echo %DB_HOST% %DB_PORT% %DB_NAME%
```

#### Error de Migraciones
```bash
# Resetear y volver a ejecutar
npm run db:migrate:reset
npm run db:setup
```

#### Error de CORS en Frontend
```bash
# Verificar que CORS_ORIGIN en backend coincida con URL del frontend
# Backend (.env): CORS_ORIGIN=http://localhost:5173
# Frontend (.env): VITE_API_BASE_URL=http://localhost:3000/api

# También verificar que ambos servidores estén ejecutándose
# Backend en puerto 3000, Frontend en puerto 5173
```

#### Error de Token JWT
```bash
# Verificar que JWT_SECRET esté configurado
echo %JWT_SECRET%

# Limpiar localStorage en el navegador
localStorage.clear()
```

#### Puerto en Uso
```bash
# Windows - Encontrar proceso usando puerto 3000
netstat -ano | findstr :3000

# Terminar proceso
taskkill /PID <PID> /F
```

### Logs de Debug

#### Backend
```bash
# Activar logs de debug
LOG_LEVEL=debug npm run dev
```

#### Frontend
```bash
# Activar logs en desarrollo
VITE_ENABLE_LOGGING=true npm run dev

# También puedes usar las herramientas de desarrollo incluidas:
# - React Query DevTools (automático en desarrollo)
# - Debug components en /dashboard
# - Performance logger en consola del navegador
```

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo [LICENSE](LICENSE) para más detalles.
