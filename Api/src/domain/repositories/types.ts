import { PriorityLevel } from '../value-objects/priority';


// User DTOs
export interface CreateUserDto {
  email: string;
  name: string;
  hashedPassword: string;
}

// Task DTOs
export interface CreateTaskDto {
  titulo: string;
  descripcion?: string | null;
  prioridad?: PriorityLevel;
  fechaVencimiento?: Date | null;
  usuarioId: string;
  categoriaId?: string | null;
}

export interface UpdateTaskDto {
  titulo?: string;
  descripcion?: string | null;
  prioridad?: PriorityLevel;
  fechaVencimiento?: Date | null;
  categoriaId?: string | null;
}

export interface TaskFilters {
  completada?: boolean;
  categoria?: string;
  prioridad?: PriorityLevel;
  fechaVencimiento?: {
    desde?: Date;
    hasta?: Date;
  };
  busqueda?: string;
  etiquetas?: string[];
  ordenar?: 'creado_en' | 'fecha_vencimiento' | 'prioridad' | 'titulo';
  direccion?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Category DTOs
export interface CreateCategoryDto {
  nombre: string;
  color?: string | null;
  usuarioId: string;
}

export interface UpdateCategoryDto {
  nombre?: string;
  color?: string | null;
}

// Tag DTOs
export interface CreateTagDto {
  nombre: string;
  usuarioId: string;
}
