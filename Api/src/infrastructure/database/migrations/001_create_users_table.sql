-- Migration: Create Users table
-- Description: Crea la tabla de usuarios con restricciones e índices apropiados
-- Requirements: (Registro y gestión de usuarios)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

-- Constraints
CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_name_check CHECK (LENGTH(TRIM(name)) > 0)
);

-- Índices para performance
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_created_at ON users (created_at);

-- Comentarios para la documentación.
COMMENT ON
TABLE users IS 'Almacena información de la cuenta de usuario';

COMMENT ON COLUMN users.id IS 'Identificador único para el usuario';

COMMENT ON COLUMN users.email IS 'Dirección de correo electrónico del usuario, debe ser única';

COMMENT ON COLUMN users.name IS 'Nombre para mostrar del usuario';

COMMENT ON COLUMN users.password_hash IS 'Contraseña con hash de Bcrypt';

COMMENT ON COLUMN users.created_at IS 'creación de la cuenta timestamp';