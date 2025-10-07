# Documentación de Middleware

Este directorio contiene todos los componentes de middleware para la API de Gestión de Tareas, implementando seguridad, logging, manejo de errores y otras preocupaciones transversales.

## Descripción General

El middleware está organizado siguiendo los principios de arquitectura hexagonal e implementa los requisitos de la especificación:

- **Request Logging**: Logging integral con integración de Winston
- **Configuración CORS**: Intercambio seguro de recursos entre orígenes

## Componentes de Middleware

### 1. Request Logging (`logging.middleware.ts`)

Logging integral de requests y errores usando Winston.

```typescript
import { requestLogger, errorLogger, logger } from './logging.middleware';

app.use(requestLogger);  // Log all requests
app.use(errorLogger);    // Log errors (before error handler)
```

**Características:**
- Timing y detalles de requests
- Status de response y duración
- Logging de errores con stack traces
- Niveles de log configurables
- Transports de archivo y consola
- Logging JSON estructurado

### 2. Configuración CORS (`cors.middleware.ts`)

Configuración segura de cross-origin resource sharing.

```typescript
import { corsMiddleware, simpleCors } from './cors.middleware';

// Production CORS with origin validation
app.use(corsMiddleware);

// Development CORS (allows all origins)
app.use(simpleCors);
```

**Características:**
- Validación de origin específica por environment
- Origins permitidos configurables vía variables de entorno
- Soporte de credentials
- Manejo adecuado de preflight
- Defaults enfocados en seguridad

## Configuración

### Variables de Entorno

```bash
# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://myapp.com

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

### Configuración del Logger Winston

El logger está configurado con:
- **File Transport**: `logs/combined.log` (todos los logs)
- **Error Transport**: `logs/error.log` (solo errores)
- **Console Transport**: Solo en desarrollo
- **Log Rotation**: Tamaño máximo de archivo 5MB, 5 archivos retenidos

### CORS
- Valida origins de requests
- Soporta credentials
- Configurable para diferentes environments
