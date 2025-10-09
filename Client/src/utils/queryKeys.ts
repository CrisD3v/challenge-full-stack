import type { FiltrosTareas, OrdenTareas } from '../types';

/**
 * Centralized query keys factory for TanStack Query
 * Provides hierarchical and typed query key structure for consistent caching
 */
export const queryKeys = {
  // Tasks query keys
  tasks: ['tasks'] as const,
  tasksList: (filters?: FiltrosTareas, orden?: OrdenTareas) =>
    ['tasks', 'list', { filters, orden }] as const,
  tasksDetail: (id: string) =>
    ['tasks', 'detail', id] as const,
  tasksStatistics: () =>
    ['tasks', 'statistics'] as const,

  // Categories query keys
  categories: ['categories'] as const,
  categoriesList: () =>
    ['categories', 'list'] as const,
  categoriesDetail: (id: string) =>
    ['categories', 'detail', id] as const,

  // Tags query keys
  tags: ['tags'] as const,
  tagsList: () =>
    ['tags', 'list'] as const,
  tagsDetail: (id: string) =>
    ['tags', 'detail', id] as const,

  // User-specific query keys
  user: ['user'] as const,
  userProfile: () =>
    ['user', 'profile'] as const,
} as const;

/**
 * Type-safe query key factory functions
 * These functions ensure consistent query key generation across the application
 */
export type QueryKeys = typeof queryKeys;

/**
 * Helper type to extract query key types
 */
export type TasksQueryKey = ReturnType<typeof queryKeys.tasksList>;
export type CategoriesQueryKey = ReturnType<typeof queryKeys.categoriesList>;
export type TagsQueryKey = ReturnType<typeof queryKeys.tagsList>;

/**
 * Utility function to create query keys with proper typing
 */
export const createQueryKey = {
  tasks: {
    all: () => queryKeys.tasks,
    lists: () => [...queryKeys.tasks, 'list'] as const,
    list: (filters?: FiltrosTareas, orden?: OrdenTareas) =>
      queryKeys.tasksList(filters, orden),
    details: () => [...queryKeys.tasks, 'detail'] as const,
    detail: (id: string) => queryKeys.tasksDetail(id),
    statistics: () => queryKeys.tasksStatistics(),
  },
  categories: {
    all: () => queryKeys.categories,
    lists: () => [...queryKeys.categories, 'list'] as const,
    list: () => queryKeys.categoriesList(),
    details: () => [...queryKeys.categories, 'detail'] as const,
    detail: (id: string) => queryKeys.categoriesDetail(id),
  },
  tags: {
    all: () => queryKeys.tags,
    lists: () => [...queryKeys.tags, 'list'] as const,
    list: () => queryKeys.tagsList(),
    details: () => [...queryKeys.tags, 'detail'] as const,
    detail: (id: string) => queryKeys.tagsDetail(id),
  },
  user: {
    all: () => queryKeys.user,
    profile: () => queryKeys.userProfile(),
  },
} as const;
