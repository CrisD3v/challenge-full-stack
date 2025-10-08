# 📋 API de Gestión de Tareas

Una API REST robusta y escalable para gestión de tareas construida con **Node.js**, **TypeScript** y **PostgreSQL**, siguiendo los principios de **Arquitectura Hexagonal** (Clean Architecture).

## 🚀 Características Principales

- ✅ **CRUD completo** de tareas, categorías y etiquetas
- 🔐 **Autenticación JWT** segura
- 👤 **Gestión de usuarios** con registro y perfil
- 🏷️ **Sistema de etiquetas** para organización avanzada
- 📁 **Categorización** de tareas con colores personalizables
- 🔍 **Filtrado y búsqueda** avanzada de tareas
- 📄 **Paginación** eficiente de resultados
- 🛡️ **Validación robusta** de datos de entrada
- 🚦 **Rate limiting** para protección contra abuso
- 📊 **Health checks** para monitoreo
- 🏗️ **Arquitectura Hexagonal** para mantenibilidad
- 🧪 **Testing** completo con Jest
- 📝 **Logging** estructurado con Winston
- 🔒 **Seguridad** con Helmet y CORS

## 🛠️ Stack Tecnológico

- **Runtime:** Node.js 18+
- **Lenguaje:** TypeScript
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT (jsonwebtoken)
- **Validación:** express-validator
- **Testing:** Jest + Supertest
- **Logging:** Winston
- **Seguridad:** Helmet, bcrypt, CORS
- **Documentación:** Swagger/OpenAPI (próximamente)

## 📁 Estructura del Proyecto

```
src/
├── application/          # Casos de uso y DTOs
│   ├── dto/             # Data Transfer Objects
│   └── use-cases/       # Lógica de negocio
├── domain/              # Entidades y reglas de negocio
│   ├── entities/        # Entidades del dominio
│   ├── repositories/    # Interfaces de repositorios
│   └── value-objects/   # Objetos de valor
├── infrastructure/      # Implementaciones técnicas
│   ├── config/          # Configuración de la aplicación
│   ├── database/        # Conexión y migraciones
│   ├── repositories/    # Implementación de repositorios
│   └── security/        # JWT, hashing, etc.
├── presentation/        # Capa de presentación
│   ├── controllers/     # Controladores HTTP
│   ├── middleware/      # Middleware de Express
│   ├── routes/          # Definición de rutas
│   └── validators/      # Validadores de entrada
└── shared/              # Código compartido
    └── errors/          # Clases de error personalizadas
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18 o superior
- **PostgreSQL** 12 o superior
- **npm** o **yarn**

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd task-management-api
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tu configuración:

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
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Configuración de Logging
LOG_LEVEL=info
```

### 4. Configurar Base de Datos

#### Opción A: Setup Automático (Recomendado)

```bash
# Crear base de datos y ejecutar migraciones
npm run db:setup

# Opcional: Llenar con datos de ejemplo
npm run db:setup:seed
```

#### Opción B: Setup Manual

```bash
# Solo ejecutar migraciones
npm run db:migrate

# Llenar con datos de ejemplo (opcional)
npm run db:seed
```

### 5. Iniciar el Servidor

#### Desarrollo

```bash
npm run dev
```

#### Producción

```bash
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación de API

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Health check básico |
| `POST` | `/api/auth/registro` | Registrar usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/perfil` | Obtener perfil |
| `GET` | `/api/tareas` | Listar tareas |
| `POST` | `/api/tareas` | Crear tarea |
| `PUT` | `/api/tareas/:id` | Actualizar tarea |
| `DELETE` | `/api/tareas/:id` | Eliminar tarea |
| `PATCH` | `/api/tareas/:id/completar` | Alternar completado |
| `GET` | `/api/categorias` | Listar categorías |
| `POST` | `/api/categorias` | Crear categoría |
| `GET` | `/api/etiquetas` | Listar etiquetas |
| `POST` | `/api/etiquetas` | Crear etiqueta |

### Ejemplos de Uso

#### Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "password": "MiPassword123"
  }'
```

#### Crear Tarea

```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_jwt_token" \
  -d '{
    "title": "Nueva tarea",
    "description": "Descripción de la tarea",
    "priority": "alta",
    "dueDate": "2024-12-31T23:59:59.000Z"
  }'
```

#### Filtrar Tareas

```bash
# Tareas pendientes de alta prioridad
curl "http://localhost:3000/api/tareas?completed=false&prioridad=alta" \
  -H "Authorization: Bearer tu_jwt_token"

# Búsqueda con paginación
curl "http://localhost:3000/api/tareas?busqueda=proyecto&limit=10&offset=0" \
  -H "Authorization: Bearer tu_jwt_token"
```

Para documentación completa de la API, consulta [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

### Estructura de Tests

- **Unit Tests:** Casos de uso y entidades
- **Integration Tests:** Controladores y repositorios
- **E2E Tests:** Flujos completos de API

## 🗄️ Base de Datos

### Migraciones

```bash
# Ejecutar migraciones pendientes
npm run db:migrate

# Ver estado de migraciones
npm run db:migrate:status

# Resetear base de datos (¡CUIDADO!)
npm run db:migrate:reset
```

### Esquema Principal

- **users:** Usuarios del sistema
- **tasks:** Tareas principales
- **categories:** Categorías para organización
- **tags:** Etiquetas para clasificación
- **task_tags:** Relación muchos-a-muchos entre tareas y etiquetas

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar en modo desarrollo |
| `npm run build` | Compilar TypeScript |
| `npm start` | Iniciar servidor de producción |
| `npm test` | Ejecutar tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run db:setup` | Configurar base de datos |
| `npm run db:migrate` | Ejecutar migraciones |
| `npm run db:seed` | Llenar con datos de ejemplo |

## 🔒 Seguridad

### Medidas Implementadas

- **Autenticación JWT** con tokens seguros
- **Hashing de contraseñas** con bcrypt (12 rounds)
- **Rate limiting** para prevenir abuso
- **Validación de entrada** robusta
- **Headers de seguridad** con Helmet
- **CORS** configurado apropiadamente
- **Sanitización** de datos de entrada

### Configuración de Seguridad

```env
# JWT
JWT_SECRET=clave_super_secreta_de_al_menos_32_caracteres
JWT_EXPIRES_IN=24h

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

## 📊 Monitoreo y Logging

### Health Checks

- `GET /health` - Estado básico del servicio
- `GET /health/detailed` - Estado detallado con métricas
- `GET /ready` - Sonda de preparación (Kubernetes)
- `GET /live` - Sonda de vida (Kubernetes)

### Logging

Los logs se almacenan en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

Configuración de niveles:
```env
LOG_LEVEL=info  # error, warn, info, debug
```

## 🚀 Despliegue

### Variables de Entorno de Producción

```env
NODE_ENV=production
PORT=3000

# Base de datos
DB_URL=postgres://user:password@host:port/database

# JWT con clave segura
JWT_SECRET=clave_super_secreta_de_produccion

# Logging
LOG_LEVEL=warn

# CORS para tu dominio
CORS_ORIGIN=https://tu-dominio.com
```

### Docker (Próximamente)

```dockerfile
# Dockerfile incluido próximamente
FROM node:18-alpine
# ... configuración Docker
```

### Consideraciones de Producción

- Usar un **reverse proxy** (nginx)
- Configurar **SSL/TLS**
- Implementar **monitoreo** (Prometheus/Grafana)
- Configurar **backups** de base de datos
- Usar **variables de entorno** seguras
- Implementar **CI/CD**

## 🤝 Contribución

### Guías de Desarrollo

1. **Fork** el repositorio
2. Crear una **rama feature** (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un **Pull Request**

### Estándares de Código

- **TypeScript** estricto
- **ESLint** para linting
- **Prettier** para formateo
- **Conventional Commits** para mensajes
- **Tests** requeridos para nuevas funcionalidades

### Arquitectura

Este proyecto sigue **Arquitectura Hexagonal**:

- **Domain:** Lógica de negocio pura
- **Application:** Casos de uso y orquestación
- **Infrastructure:** Implementaciones técnicas
- **Presentation:** Interfaz HTTP/REST

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

### Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Verificar configuración en .env
echo $DB_HOST $DB_PORT $DB_NAME
```

#### Error de Migraciones
```bash
# Resetear y volver a ejecutar
npm run db:migrate:reset
npm run db:setup
```

#### Error de Permisos JWT
```bash
# Verificar que JWT_SECRET esté configurado
echo $JWT_SECRET
```
