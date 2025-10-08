export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'baja' | 'media' | 'alta';
  dueDate?: string;
  userId: string;
  categoryId?: string;
  categoria?: Category;
  etiquetas?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: 'baja' | 'media' | 'alta';
  dueDate?: string;
  categoryId?: string;
  tagIds?: string[];
}

export interface FiltrosTareas {
  completed?: boolean;
  priority?: 'baja' | 'media' | 'alta';
  categoryId?: string;
  tagId?: string;
  sinceDate?: string;
  untilDate?: string;
  search?: string;
}

export interface OrdenTareas {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface StatisticsTasks {
  total: number;
  completeds: number;
  pending : number;
  porpriority: {
    alta: number;
    media: number;
    baja: number;
  };
  byCategory: Array<{
    category: string;
    total: number;
  }>;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface Theme {
  mode: 'light' | 'dark';
}