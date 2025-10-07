# Controllers

Este directorio contiene los controllers de la capa de presentación que manejan requests y responses HTTP para la API de Gestión de Tareas.

## Controllers Implementados

### AuthController
- **Archivo**: `auth.controller.ts`
- **Endpoints**:
  - `POST /api/auth/registro` - Registro de usuario
  - `POST /api/auth/login` - Login de usuario
  - `GET /api/auth/perfil` - Obtener perfil de usuario (protegido)
- **Características**: Autenticación JWT, hashing de contraseñas, validación de input

## Manejo de Errores

Todos los controllers implementan manejo consistente de errores:

- **400 Bad Request** - Errores de validación, campos requeridos faltantes
- **401 Unauthorized** - Autenticación faltante o inválida
- **403 Forbidden** - Permisos insuficientes (validación de propiedad)
- **404 Not Found** - Recurso no encontrado
- **409 Conflict** - Recursos duplicados (ej. nombres de categoría/etiqueta)
- **500 Internal Server Error** - Errores inesperados (pasados al handler global)

## Autenticación y Autorización

- Todos los endpoints (excepto registro/login de auth) requieren autenticación JWT
- La validación de propiedad asegura que los usuarios solo puedan acceder a sus propios recursos
- La información del usuario se extrae del token JWT y se adjunta al objeto request

## Validación

- Validación de requests usando express-validator
- Schemas de validación consistentes para todos los endpoints
- Mensajes de error apropiados en español (según los requisitos)

## Testing

- Tests unitarios exhaustivos para todos los controllers
- Los tests cubren casos de éxito, casos de error y casos límite
- Dependencias mockeadas para testing aislado
- 100% de cobertura de test para lógica de controllers

## Routes

Los controllers se conectan a través de archivos de route en `../routes/`:
- `auth.routes.ts` - Routes de autenticación