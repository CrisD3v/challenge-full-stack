# Documentación de API - Sistema de Gestión de Tareas

## Información General

**Base URL:** `http://localhost:3000/api`

**Autenticación:** Bearer Token (JWT)

**Content-Type:** `application/json`

---

## Endpoints de Salud y Monitoreo

### GET /health
Verificación básica de salud del servicio.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Task Management API",
  "version": "1.0.0"
}
```

### GET /health/detailed
Verificación detallada de salud para sistemas de monitoreo.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "memory": {
    "used": "45.2 MB",
    "total": "128 MB"
  }
}
```

### GET /ready
Sonda de preparación para orquestación de contenedores.

**Response 200:**
```json
{
  "status": "ready"
}
```

### GET /live
Sonda de vida para orquestación de contenedores.

**Response 200:**
```json
{
  "status": "alive"
}
```

---

## Autenticación

### POST /auth/registro
Registrar un nuevo usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "password": "MiPassword123"
}
```

**Validaciones:**
- `email`: Email válido, máximo 255 caracteres
- `name`: Requerido, solo letras y espacios, máximo 255 caracteres
- `password`: Mínimo 8 caracteres, debe contener minúscula, mayúscula y número

**Response 201:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 409 - Conflict:**
```json
{
  "error": "Conflict",
  "message": "User with this email already exists"
}
```

### POST /auth/login
Iniciar sesión de usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```

**Response 200:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 401 - Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

### GET /auth/perfil
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "message": "Perfil obtenido exitosamente",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Gestión de Tareas

### GET /tareas
Obtener tareas con filtrado, ordenamiento y paginación.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `completed` (boolean): Filtrar por estado de completado
- `categoria` (UUID): Filtrar por ID de categoría
- `prioridad` (string): Filtrar por prioridad (`baja`, `media`, `alta`)
- `fechaVencimiento.desde` (ISO date): Fecha de vencimiento desde
- `fechaVencimiento.hasta` (ISO date): Fecha de vencimiento hasta
- `busqueda` (string): Búsqueda en título y descripción
- `etiquetas` (UUID[]): Filtrar por IDs de etiquetas
- `ordenar` (string): Campo de ordenamiento (`creado_en`, `fecha_vencimiento`, `prioridad`, `titulo`)
- `direccion` (string): Dirección de ordenamiento (`asc`, `desc`)
- `limit` (number): Límite de resultados (1-100, default: 10)
- `offset` (number): Offset para paginación (default: 0)

**Ejemplo Request:**
```
GET /api/tareas?completed=false&prioridad=alta&limit=20&offset=0&ordenar=fecha_vencimiento&direccion=asc
```

**Response 200:**
```json
{
  "message": "Tareas obtenidas exitosamente",
  "tasks": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Completar proyecto",
      "description": "Finalizar el desarrollo del sistema",
      "completed": false,
      "priority": "alta",
      "dueDate": "2024-01-20T23:59:59.000Z",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "categoryId": "456e7890-e89b-12d3-a456-426614174000",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "category": {
        "id": "456e7890-e89b-12d3-a456-426614174000",
        "name": "Trabajo",
        "color": "#FF5733"
      },
      "tags": [
        {
          "id": "789e0123-e89b-12d3-a456-426614174000",
          "name": "urgente"
        }
      ]
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### POST /tareas
Crear una nueva tarea.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "title": "Nueva tarea",
  "description": "Descripción de la tarea",
  "priority": "media",
  "dueDate": "2024-01-25T23:59:59.000Z",
  "categoryId": "456e7890-e89b-12d3-a456-426614174000",
  "tagsId": ["789e0123-e89b-12d3-a456-426614174000"]
}
```

**Validaciones:**
- `title`: Requerido, máximo 255 caracteres
- `description`: Opcional, máximo 1000 caracteres
- `priority`: Opcional, valores válidos: `baja`, `media`, `alta`
- `dueDate`: Opcional, fecha ISO 8601, debe ser futura
- `categoryId`: Opcional, UUID válido
- `tagsId`: Opcional, array de UUIDs válidos

**Response 201:**
```json
{
  "message": "Tarea creada exitosamente",
  "task": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Nueva tarea",
    "description": "Descripción de la tarea",
    "completed": false,
    "priority": "media",
    "dueDate": "2024-01-25T23:59:59.000Z",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "categoryId": "456e7890-e89b-12d3-a456-426614174000",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT /tareas/:id
Actualizar una tarea existente.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "title": "Tarea actualizada",
  "description": null,
  "priority": "alta",
  "dueDate": "2024-01-30T23:59:59.000Z",
  "categoryId": null,
  "tagsId": []
}
```

**Response 200:**
```json
{
  "message": "Tarea actualizada exitosamente",
  "task": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Tarea actualizada",
    "description": null,
    "completed": false,
    "priority": "alta",
    "dueDate": "2024-01-30T23:59:59.000Z",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "categoryId": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### DELETE /tareas/:id
Eliminar una tarea.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 204:** Sin contenido

### PATCH /tareas/:id/completar
Alternar estado de completado de una tarea.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "message": "Estado de tarea actualizado exitosamente",
  "task": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Tarea completada",
    "description": "Descripción de la tarea",
    "completed": true,
    "priority": "media",
    "dueDate": "2024-01-25T23:59:59.000Z",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "categoryId": "456e7890-e89b-12d3-a456-426614174000",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## Gestión de Categorías

### GET /categorias
Obtener todas las categorías del usuario autenticado.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "message": "Categorías obtenidas exitosamente",
  "categories": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "name": "Trabajo",
      "color": "#FF5733",
      "userId": "123e4567-e89b-12d3-a456-426614174000"
    },
    {
      "id": "789e0123-e89b-12d3-a456-426614174000",
      "name": "Personal",
      "color": "#33FF57",
      "userId": "123e4567-e89b-12d3-a456-426614174000"
    }
  ]
}
```

### POST /categorias
Crear una nueva categoría.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "Nueva Categoría",
  "color": "#3357FF"
}
```

**Validaciones:**
- `name`: Requerido, máximo 255 caracteres
- `color`: Opcional, código de color hexadecimal

**Response 201:**
```json
{
  "message": "Categoría creada exitosamente",
  "category": {
    "id": "abc12345-e89b-12d3-a456-426614174000",
    "name": "Nueva Categoría",
    "color": "#3357FF",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### PUT /categorias/:id
Actualizar una categoría existente.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "Categoría Actualizada",
  "color": "#FF33A1"
}
```

**Response 200:**
```json
{
  "message": "Categoría actualizada exitosamente",
  "category": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "name": "Categoría Actualizada",
    "color": "#FF33A1",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### DELETE /categorias/:id
Eliminar una categoría.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 204:** Sin contenido

---

## Gestión de Etiquetas

### GET /etiquetas
Obtener todas las etiquetas del usuario autenticado.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200:**
```json
{
  "message": "Etiquetas obtenidas exitosamente",
  "tags": [
    {
      "id": "789e0123-e89b-12d3-a456-426614174000",
      "name": "urgente",
      "userId": "123e4567-e89b-12d3-a456-426614174000"
    },
    {
      "id": "def45678-e89b-12d3-a456-426614174000",
      "name": "importante",
      "userId": "123e4567-e89b-12d3-a456-426614174000"
    }
  ]
}
```

### POST /etiquetas
Crear una nueva etiqueta.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "nueva-etiqueta"
}
```

**Validaciones:**
- `name`: Requerido, máximo 255 caracteres

**Response 201:**
```json
{
  "message": "Etiqueta creada exitosamente",
  "tag": {
    "id": "ghi78901-e89b-12d3-a456-426614174000",
    "name": "nueva-etiqueta",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

---

## Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "error": "Validation Error",
  "message": "Título es requerido y no puede exceder 255 caracteres",
  "field": "title"
}
```

### 401 - Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Usuario no autenticado"
}
```

### 403 - Forbidden
```json
{
  "error": "Forbidden",
  "message": "No tienes permisos para acceder a este recurso"
}
```

### 404 - Not Found
```json
{
  "error": "Not Found",
  "message": "Tarea no encontrada"
}
```

### 409 - Conflict
```json
{
  "error": "Conflict",
  "message": "Ya existe una categoría con ese nombre"
}
```

### 429 - Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Demasiadas solicitudes. Intenta de nuevo más tarde."
}
```

### 500 - Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Error interno del servidor"
}
```

---

## Notas Adicionales

### Autenticación
- Todos los endpoints (excepto registro, login y health checks) requieren autenticación
- El token JWT debe incluirse en el header `Authorization: Bearer <token>`
- Los tokens tienen una duración limitada y deben renovarse periódicamente

### Limitación de Velocidad (Rate Limiting)
- Endpoints de autenticación: Límite más estricto
- Endpoints generales: Límite estándar
- Respuesta 429 cuando se excede el límite

### Paginación
- Parámetros: `limit` (máximo 100) y `offset`
- Respuesta incluye `total`, `limit` y `offset` para navegación

### Filtrado y Ordenamiento
- Múltiples filtros se pueden combinar
- Ordenamiento disponible por varios campos
- Búsqueda de texto en título y descripción

### Formatos de Fecha
- Todas las fechas usan formato ISO 8601
- Las fechas de vencimiento deben ser futuras
- Timestamps incluyen zona horaria UTC
