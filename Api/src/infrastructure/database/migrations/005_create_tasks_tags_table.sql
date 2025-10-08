-- Migration: Create task_tags junction table
-- Description: Crea la relación muchos-a-muchos entre tareas y etiquetas
-- Requirements: (Asignación de etiquetas a tareas)

CREATE TABLE task_tags (
    task_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

-- Clave primaria (compuesta)
PRIMARY KEY (task_id, tag_id),

-- Restricciones de clave foránea
CONSTRAINT fk_task_tags_task FOREIGN KEY (task_id)
        REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_tags_tag FOREIGN KEY (tag_id)
        REFERENCES tags(id) ON DELETE CASCADE
);

-- Índices para performance (búsqueda inversa)
CREATE INDEX idx_task_tags_tag_id ON task_tags (tag_id);

CREATE INDEX idx_task_tags_created_at ON task_tags (created_at);

-- Comentarios para documentación
COMMENT ON
TABLE task_tags IS 'Tabla de unión para la relación de muchos a muchos entre tareas y etiquetas';

COMMENT ON COLUMN task_tags.task_id IS 'Referencia a la tarea';

COMMENT ON COLUMN task_tags.tag_id IS 'Referencia a la etiqueta';

COMMENT ON COLUMN task_tags.created_at IS 'Cuando se asignó la etiqueta a la tarea';
