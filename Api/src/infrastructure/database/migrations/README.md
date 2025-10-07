# Migraciones de Base de Datos

Este directorio contiene archivos de migración SQL para el schema de la base de datos de la API de Gestión de Tareas.

## Archivos de Migración

Las migraciones se ejecutan en orden alfabético basado en su nombre de archivo. Cada archivo de migración sigue la convención de nomenclatura:

```
XXX_description.sql
```

Donde `XXX` es un número secuencial con ceros a la izquierda.

### Migraciones Actuales

1. **001_create_users_table.sql** - Crea la tabla de usuarios con campos de autenticación
2. **002_create_categories_table.sql** - Crea la tabla de categorías con propiedad de usuario
3. **003_create_tasks_table.sql** - Crea la tabla de tareas con full-text search e indexes
4. **004_create_tags_table.sql** - Crea la tabla de etiquetas para etiquetado flexible
5. **005_create_tasks_tags_table.sql** - Crea la tabla de unión para relaciones tarea-etiqueta

## Descripción General del Schema de Base de Datos

### Tablas

- **users** - Cuentas de usuario con autenticación
- **categories** - Categorías de tareas (propiedad del usuario)
- **tasks** - Tareas con prioridades, fechas de vencimiento y estado de completado
- **tags** - Etiquetas para etiquetado flexible de tareas
- **tasks_labels** - Relación muchos-a-muchos entre tareas y etiquetas

### Características Clave

- **UUID Primary Keys** - Todas las tablas usan UUID para mejor escalabilidad
- **Soft Relationships** - Foreign keys con comportamiento CASCADE/SET NULL apropiado
- **Performance Indexes** - Indexes estratégicos para patrones de consulta comunes
- **Full-Text Search** - Búsqueda de texto completo en español en títulos y descripciones de tareas
- **Audit Timestamps** - Timestamps de creación/actualización con triggers automáticos
- **Data Validation** - Check constraints para reglas de negocio

### Características de Seguridad

- **Parameterized Queries** - Todas las implementaciones de repository usan queries parametrizadas
- **User Isolation** - Todos los datos de usuario están apropiadamente aislados por user_id
- **Input Validation** - Constraints a nivel de base de datos complementan la validación de aplicación

## Ejecutar Migraciones

### Usando scripts de npm/pnpm (recomendado):

```bash
# Ejecutar todas las migraciones pendientes
npm run db:migrate

# Verificar estado de migraciones
npm run db:migrate:status

# Resetear base de datos (eliminar todas las tablas y re-ejecutar migraciones)
npm run db:migrate:reset
```

## Flujo de Trabajo de Desarrollo

1. **Configuración Inicial**: Ejecutar `npm/pnpm run db:setup:seed` para crear tablas y agregar datos de ejemplo
2. **Desarrollo Regular**: Usar `npm run db:migrate` para aplicar nuevas migraciones
3. **Reset Cuando sea Necesario**: Usar `npm run db:migrate:reset` para empezar desde cero

## Agregar Nuevas Migraciones

1. Crear un nuevo archivo SQL con el siguiente número secuencial
2. Incluir comentarios y documentación apropiados
3. Agregar indexes apropiados para rendimiento
4. Probar la migración exhaustivamente
5. Actualizar este README si es necesario

## Variables de Entorno

Asegúrate de que estas variables de entorno estén configuradas:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskdb
DB_USER=postgres
DB_PASSWORD=your_password
DB_URL=postgres://postgres:your_password@localhost:5432/taskdb
```

## Solución de Problemas

### La Migración Falla
- Verificar configuración de conexión a la base de datos
- Verificar que PostgreSQL esté ejecutándose
- Verificar sintaxis SQL de la migración
- Revisar logs de error

### Problemas de Permisos
- Asegurar que el usuario de base de datos tenga privilegios CREATE/DROP
- Verificar configuración de autenticación de PostgreSQL