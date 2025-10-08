# 📋 Challenge Full Stack - Sistema de Gestión de Tareas

Un sistema completo de gestión de tareas desarrollado con **Node.js/TypeScript** en el backend y **React/TypeScript** en el frontend, implementando arquitectura hexagonal y las mejores prácticas de desarrollo.

## 🎯 Descripción del Proyecto

Este proyecto es una aplicación web full-stack para la gestión de tareas que permite a los usuarios:

- **Gestionar tareas** con CRUD completo (crear, leer, actualizar, eliminar)
- **Organizar por categorías** con colores personalizables
- **Etiquetar tareas** para mejor clasificación
- **Filtrar y buscar** tareas de manera avanzada
- **Establecer prioridades** (alta, media, baja)
- **Definir fechas límite** para las tareas
- **Autenticación segura** con JWT
- **Interfaz drag & drop** para reordenar tareas
- **Estadísticas** y reportes de productividad
- **Tema claro/oscuro** para mejor experiencia de usuario
- **Exportación** de datos en diferentes formatos

## 🏗️ Arquitectura del Sistema

### Backend (API)
- **Arquitectura Hexagonal** (Clean Architecture)
- **Node.js** con **TypeScript**
- **Express.js** como framework web
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **Jest** para testing
- **Winston** para logging

### Frontend (Client)
- **React 19** con **TypeScript**
- **Vite** como build tool
- **Styled Components** para estilos
- **React Hook Form** para formularios
- **React Router** para navegación
- **Axios** para comunicación HTTP
- **DND Kit** para drag & drop

## 📁 Estructura del Proyecto

```
challenge-full-stack/
├── Api/                          # Backend API
│   ├── src/
│   │   ├── application/          # Casos de uso y DTOs
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   └── use-cases/       # Lógica de negocio
│   │   ├── domain/              # Entidades y reglas de negocio
│   │   │   ├── entities/        # Entidades del dominio
│   │   │   ├── repositories/    # Interfaces de repositorios
│   │   │   └── value-objects/   # Objetos de valor
│   │   ├── infrastructure/      # Implementaciones técnicas
│   │   │   ├── config/          # Configuración
│   │   │   ├── database/        # Base de datos
│   │   │   ├── repositories/    # Implementación repositorios
│   │   │   └── security/        # Seguridad y JWT
│   │   ├── presentation/        # Capa de presentación
│   │   │   ├── controllers/     # Controladores HTTP
│   │   │   ├── middleware/      # Middleware Express
│   │   │   ├── routes/          # Rutas de la API
│   │   │   └── validators/      # Validadores
│   │   └── shared/              # Código compartido
│   ├── scripts/                 # Scripts de base de datos
│   ├── logs/                    # Archivos de log
│   └── docs/                    # Documentación API
├── Client/                      # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── Auth/           # Componentes de autenticación
│   │   │   ├── Tasks/          # Componentes de tareas
│   │   │   ├── Categories/     # Componentes de categorías
│   │   │   ├── Layout/         # Componentes de layout
│   │   │   └── Commons/        # Componentes comunes
│   │   ├── pages/              # Páginas de la aplicación
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # Servicios API
│   │   ├── context/            # Context providers
│   │   ├── types/              # Definiciones TypeScript
│   │   ├── utils/              # Utilidades
│   │   └── styles/             # Estilos globales
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
cd Api
npm install
# o usando pnpm
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

# Configuración de Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Seguridad
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173
```

#### Configurar Base de Datos

```bash
# Crear base de datos y ejecutar migraciones
npm run db:setup

# Opcional: Llenar con datos de ejemplo
npm run db:setup:seed
```

#### Iniciar el Servidor API

```bash
# Modo desarrollo
npm run dev

# El servidor estará disponible en http://localhost:3000
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
| `GET` | `/api/tareas` | Listar tareas con filtros | Sí |
| `POST` | `/api/tareas` | Crear nueva tarea | Sí |
| `GET` | `/api/tareas/:id` | Obtener tarea específica | Sí |
| `PUT` | `/api/tareas/:id` | Actualizar tarea completa | Sí |
| `PATCH` | `/api/tareas/:id/completar` | Alternar estado completado | Sí |
| `DELETE` | `/api/tareas/:id` | Eliminar tarea | Sí |

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
  "categories": {
    "id": "uuid-categoria",
    "name": "Trabajo",
    "color": "#3498db"
  },
  "tags": [
    {
      "id": "uuid-tag-1",
      "name": "Urgente",
      "color": "#e74c3c"
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
    "name": "Urgente",
    "color": "#e74c3c"
  }'
```

## 🎨 Uso del Frontend

### Funcionalidades Principales

#### 1. Autenticación
- **Registro de usuarios** con validación de formularios
- **Inicio de sesión** con persistencia de token
- **Logout** seguro

#### 2. Gestión de Tareas
- **Lista de tareas** con filtros avanzados
- **Crear/editar tareas** con formulario completo
- **Drag & drop** para reordenar tareas
- **Marcar como completadas** con un click
- **Eliminar tareas** con confirmación

#### 3. Organización
- **Categorías** con colores personalizables
- **Etiquetas** para clasificación múltiple
- **Filtros** por estado, prioridad, categoría, etiqueta
- **Búsqueda** en tiempo real

#### 4. Características Avanzadas
- **Estadísticas** de productividad
- **Exportación** de datos
- **Tema claro/oscuro**
- **Responsive design**
- **Notificaciones** en tiempo real

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
// Hook para gestión de tareas
const {
  tasks,
  loading,
  error,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  fetchTasks
} = useTasks();
```

#### useAuth Hook
```typescript
// Hook para autenticación
const {
  user,
  isAuthenticated,
  login,
  register,
  logout,
  loading
} = useAuth();
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
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3498db',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de etiquetas
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tareas
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) CHECK (priority IN ('baja', 'media', 'alta')),
  due_date TIMESTAMP,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación tareas-etiquetas
CREATE TABLE task_tags (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);
```

### Scripts de Base de Datos

```bash
# Configurar base de datos completa
npm run db:setup

# Solo ejecutar migraciones
npm run db:migrate

# Ver estado de migraciones
npm run db:migrate:status

# Llenar con datos de ejemplo
npm run db:seed

# Resetear base de datos (¡CUIDADO!)
npm run db:migrate:reset

# Rollback de migraciones
npm run db:rollback
```

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

### Backend (Api/)
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar en modo desarrollo con nodemon |
| `npm run build` | Compilar TypeScript a JavaScript |
| `npm start` | Iniciar servidor de producción |
| `npm test` | Ejecutar todos los tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run db:setup` | Configurar base de datos completa |
| `npm run db:migrate` | Ejecutar migraciones pendientes |
| `npm run db:seed` | Llenar con datos de ejemplo |
| `npm run db:migrate:reset` | Resetear base de datos |

### Frontend (Client/)
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Build para producción |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Ejecutar ESLint |

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
# Backend: CORS_ORIGIN=http://localhost:5173
# Frontend: VITE_API_BASE_URL=http://localhost:3000/api
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
```

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo [LICENSE](LICENSE) para más detalles.

