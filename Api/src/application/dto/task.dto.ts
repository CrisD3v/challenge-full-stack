import { PriorityLevel } from '../../domain/value-objects/priority';

export interface CreateTaskRequestDto {
  title: string;
  description?: string;
  priority?: PriorityLevel;
  dueDate?: string; // ISO string from client
  categoryId?: string;
  tagsId?: string[];
}

export interface UpdateTaskRequestDto {
  title?: string;
  description?: string | null;
  priority?: PriorityLevel;
  dueDate?: string | null; // ISO string from client
  categoryId?: string | null;
  tagsId?: string[];
}

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: PriorityLevel;
  dueDate: Date | null;
  userId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    color: string | null;
  };
  tags?: Array<{
    id: string;
    name: string;
  }>;
}

export interface TaskFiltersDto {
  completed?: boolean;
  category?: string;
  priority?: PriorityLevel;
  dueDate?: {
    since?: string; // ISO string from client
    until?: string; // ISO string from client
  };
  search?: string;
  tags?: string[];
  order?: 'created_at' | 'due_date' | 'priority' | 'title';
  direction?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface GetTasksResponseDto {
  tasks: TaskResponseDto[];
  total: number;
  limit: number;
  offset: number;
}
