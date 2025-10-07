-- Migration: Create categories table
-- Description: Crea la tabla de categorías con propiedad de usuario y restricciones
-- Requirements: (Creación y gestión de categorías)

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7), -- Hex color code (#RRGGBB)
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

-- Restricciones de clave foránea
CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,

-- Restricciones de negocio
CONSTRAINT categories_name_check CHECK (LENGTH(TRIM(name)) > 0),
CONSTRAINT categories_color_check CHECK (
    color IS NULL
    OR color ~ * '^#[0-9A-Fa-f]{6}$'
),

-- Restricción única: el usuario no puede tener nombres de categoría duplicados
CONSTRAINT uk_categories_name_user UNIQUE(name, user_id) );

-- Índices para performance
CREATE INDEX idx_categories_user_id ON categories (user_id);

CREATE INDEX idx_categories_name ON categories (name);

CREATE INDEX idx_categories_created_at ON categories (created_at);

-- Trigger para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON
TABLE categories IS 'Almacena categorías de tareas propiedad de los usuarios.';

COMMENT ON COLUMN categories.id IS 'Identificador único para la categoría';

COMMENT ON COLUMN categories.name IS 'Nombre de categoría, único por usuario';

COMMENT ON COLUMN categories.color IS 'Código de color hexadecimal opcional para la visualización de la interfaz de usuario';

COMMENT ON COLUMN categories.user_id IS 'Propietario de esta categoría';

COMMENT ON COLUMN categories.created_at IS 'Creación de categorías timestamp';

COMMENT ON COLUMN categories.updated_at IS 'Última modificación timestamp';