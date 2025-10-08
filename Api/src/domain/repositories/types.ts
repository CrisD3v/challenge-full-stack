import { PriorityLevel } from '../value-objects/priority';


// User DTOs
export interface CreateUserDto {
  email: string;
  name: string;
  hashedPassword: string;
}

// Task DTOs
export interface CreateTaskDto {
  title: string;
  description?: string | null;
  priority?: PriorityLevel;
  dueDate?: Date | null;
  userId: string;
  categoryId?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  priority?: PriorityLevel;
  dueDate?: Date | null;
  categoryId?: string | null;
}

export interface TaskFilters {
  completed?: boolean;
  category?: string;
  priority?: PriorityLevel;
  dueDate?: {
    since?: Date;
    until?: Date;
  };
  search?: string;
  tags?: string[];
  order?: 'created_at' | 'due_date' | 'priority' | 'title';
  direction?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Category DTOs
export interface CreateCategoryDto {
  name: string;
  color?: string | null;
  userId: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string | null;
}

// Tag DTOs
export interface CreateTagDto {
  name: string;
  userId: string;
}
