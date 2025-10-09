import type { FiltrosTareas, OrdenTareas } from '../types';

/**
 * Normalizes filters for consistent cache keys
 * Removes undefined/empty values and sorts object keys for deterministic cache keys
 */
export function normalizeFilters(filtros?: FiltrosTareas): FiltrosTareas | undefined {
  if (!filtros) return undefined;

  const normalized: FiltrosTareas = {};

  // Only include defined and non-empty values
  if (typeof filtros.completed === 'boolean') {
    normalized.completed = filtros.completed;
  }

  if (filtros.priority && ['baja', 'media', 'alta'].includes(filtros.priority)) {
    normalized.priority = filtros.priority;
    console.log('normalizeFilters: Priority filter normalized:', filtros.priority);
  } else if (filtros.priority) {
    console.warn('normalizeFilters: Invalid priority value ignored:', filtros.priority);
  }

  if (filtros.categoryId && filtros.categoryId.trim() !== '') {
    normalized.categoryId = filtros.categoryId.trim();
  }

  if (filtros.tagId && filtros.tagId.trim() !== '') {
    normalized.tagId = filtros.tagId.trim();
  }

  if (filtros.sinceDate && filtros.sinceDate.trim() !== '') {
    normalized.sinceDate = filtros.sinceDate.trim();
  }

  if (filtros.untilDate && filtros.untilDate.trim() !== '') {
    normalized.untilDate = filtros.untilDate.trim();
  }

  if (filtros.search && filtros.search.trim() !== '') {
    normalized.search = filtros.search.trim();
  }

  // Return undefined if no valid filters
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

/**
 * Normalizes order configuration for consistent cache keys
 */
export function normalizeOrder(orden?: OrdenTareas): OrdenTareas | undefined {
  console.log('normalizeOrder: Input order:', orden);

  if (!orden || !orden.field || !orden.direction) {
    console.log('normalizeOrder: Invalid order, returning undefined');
    return undefined;
  }

  const normalized = {
    field: orden.field,
    direction: orden.direction
  };

  console.log('normalizeOrder: Normalized order:', normalized);
  return normalized;
}

/**
 * Centralized query keys factory for TanStack Query
 * Provides hierarchical and typed query key structure for consistent caching
 */
export const queryKeys = {
  // Tasks query keys
  tasks: ['tasks'] as const,
  tasksList: (filters?: FiltrosTareas, orden?: OrdenTareas) => {
    const normalizedFilters = normalizeFilters(filters);
    const normalizedOrder = normalizeOrder(orden);
    return ['tasks', 'list', { filters: normalizedFilters, orden: normalizedOrder }] as const;
  },
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
 * Cache invalidation helpers
 * These functions help with selective cache invalidation for better performance
 */
export const cacheInvalidation = {
  /**
   * Invalidates all task-related queries
   */
  allTasks: () => queryKeys.tasks,

  /**
   * Invalidates task lists but keeps individual task details
   */
  taskLists: () => [...queryKeys.tasks, 'list'] as const,

  /**
   * Invalidates specific filtered task queries
   * Useful when you know specific filters that might be affected
   */
  filteredTasks: (filters?: FiltrosTareas, orden?: OrdenTareas) =>
    queryKeys.tasksList(normalizeFilters(filters), normalizeOrder(orden)),

  /**
   * Invalidates all search-based queries
   * Useful when task content changes and might affect search results
   */
  searchQueries: () => {
    // This would need to be used with queryClient.invalidateQueries with a predicate
    // to match all queries that have search filters
    return (queryKey: unknown[]) => {
      if (Array.isArray(queryKey) && queryKey[0] === 'tasks' && queryKey[1] === 'list') {
        const params = queryKey[2] as { filters?: FiltrosTareas };
        return !!(params?.filters?.search);
      }
      return false;
    };
  },
} as const;

/**
 * Utility function to create query keys with proper typing and normalization
 */
export const createQueryKey = {
  tasks: {
    all: () => queryKeys.tasks,
    lists: () => [...queryKeys.tasks, 'list'] as const,
    list: (filters?: FiltrosTareas, orden?: OrdenTareas) =>
      queryKeys.tasksList(normalizeFilters(filters), normalizeOrder(orden)),
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
