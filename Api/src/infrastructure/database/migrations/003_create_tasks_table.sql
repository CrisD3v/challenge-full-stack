-- Migration: Create tasks table
-- Description: Crea la tabla de tareas con todas las restricciones y relaciones necesarias
-- Requirements: (Creación de tareas), (Recuperación de tareas), (Actualizaciones de tareas), (Eliminación de tareas)

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

-- Restricciones de clave externa
CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
CONSTRAINT fk_tasks_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,

-- Restricciones de negocio
CONSTRAINT tasks_title_check CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT tasks_priority_check CHECK (priority IN ('baja', 'media', 'alta')),
    CONSTRAINT tasks_description_check CHECK (description IS NULL OR LENGTH(TRIM(description)) > 0)
);

-- Índices para la optimización del rendimiento
CREATE INDEX idx_tasks_user_id ON tasks (user_id);

CREATE INDEX idx_tasks_category_id ON tasks (category_id);

CREATE INDEX idx_tasks_completed ON tasks (completed);

CREATE INDEX idx_tasks_priority ON tasks (priority);

CREATE INDEX idx_tasks_due_date ON tasks (due_date);

CREATE INDEX idx_tasks_created_at ON tasks (created_at);

CREATE INDEX idx_tasks_updated_at ON tasks (updated_at);

-- Índices compuestos para patrones de consulta comunes
CREATE INDEX idx_tasks_user_completed ON tasks (user_id, completed);

CREATE INDEX idx_tasks_user_priority ON tasks (user_id, priority);

CREATE INDEX idx_tasks_user_category ON tasks (user_id, category_id);

CREATE INDEX idx_tasks_user_due ON tasks (user_id, due_date)
WHERE
    due_date IS NOT NULL;

-- Índice de búsqueda de texto completo por título y descripción
CREATE INDEX idx_tareas_search ON tasks USING gin (
    to_tsvector (
        'spanish',
        title || ' ' || COALESCE(description, '')
    )
);

-- Disparador para actualizar la marca de tiempo updated_at
CREATE TRIGGER trigger_tareas_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para la documentación.
COMMENT ON
TABLE tasks IS 'Almacena tareas de usuario con categorías y prioridades';

COMMENT ON COLUMN tasks.id IS 'Identificador único para la tarea';

COMMENT ON COLUMN tasks.title IS 'Título de la tarea, campo obligatorio';

COMMENT ON COLUMN tasks.description IS 'Descripción detallada opcional';

COMMENT ON COLUMN tasks.completed IS 'Estado de finalización de la tarea';

COMMENT ON COLUMN tasks.priority IS 'Prioridad de tareas: baja, media, alta';

COMMENT ON COLUMN tasks.due_date IS 'Fecha de vencimiento opcional';

COMMENT ON COLUMN tasks.user_id IS 'Dueño de esta tarea';

COMMENT ON COLUMN tasks.category_id IS 'Asignación de categoría opcional';

COMMENT ON COLUMN tasks.created_at IS 'Creación de la tarea timestamp';

COMMENT ON COLUMN tasks.updated_at IS 'Última modificación timestamp';