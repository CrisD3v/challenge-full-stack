-- Migration: Create tags table
-- Description: Crea la tabla de etiquetas para el etiquetado flexible de tareas
-- Requirements: (Creación y gestión de etiquetas)

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

-- Restricciones de clave foránea
CONSTRAINT fk_tags_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

-- Restricciones de negocio
CONSTRAINT tags_name_check CHECK (LENGTH(TRIM(name)) > 0),
CONSTRAINT tags_name_length_check CHECK (LENGTH(name) <= 100),

-- Restricción única: el usuario no puede tener nombres de etiquetas duplicados
CONSTRAINT uk_tags_name_user UNIQUE(name, user_id) );

-- índices para performance
CREATE INDEX idx_tags_user_id ON tags (user_id);

CREATE INDEX idx_tags_name ON tags (name);

CREATE INDEX idx_tags_created_at ON tags (created_at);

-- Comentarios para la documentación
COMMENT ON
TABLE tags IS 'Almacena etiquetas para un etiquetado flexible de tareas';

COMMENT ON COLUMN tags.id IS 'Identificador único para la etiqueta';

COMMENT ON COLUMN tags.name IS 'Nombre de la etiqueta, única por usuario';

COMMENT ON COLUMN tags.user_id IS 'Propietario de esta etiqueta';

COMMENT ON COLUMN tags.created_at IS 'Creación de etiqueta timestamp';