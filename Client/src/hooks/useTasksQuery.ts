import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { FiltrosTareas, OrdenTareas, Task } from '../types';
import { applyClientSideFilters, validateServerFiltering } from '../utils/clientSideFiltering';
import { normalizeFilters, normalizeOrder, queryKeys } from '../utils/queryKeys';
import { applyHybridSorting } from '../utils/taskSorting';

// Re-export utility functions for external use
export { normalizeFilters, normalizeOrder } from '../utils/queryKeys';

/**
 * Cache configuration for different types of queries
 */
const CACHE_CONFIG = {
  // Base tasks without filters - can be cached longer
  baseTasks: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  // Filtered tasks - shorter cache time as they're more specific
  filteredTasks: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  // Search queries - very short cache as they're user-specific
  searchTasks: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
} as const;

/**
 * Determines appropriate cache configuration based on filters
 */
function getCacheConfig(filtros?: FiltrosTareas) {
  const normalizedFilters = normalizeFilters(filtros);

  if (!normalizedFilters) {
    return CACHE_CONFIG.baseTasks;
  }

  // If there's a search term, use search cache config
  if (normalizedFilters.search) {
    return CACHE_CONFIG.searchTasks;
  }

  // Otherwise use filtered tasks config
  return CACHE_CONFIG.filteredTasks;
}

/**
 * Custom hook for fetching tasks data using TanStack Query
 * Optimized with better cache management and normalized filters
 */
export function useTasksQuery(
  filtros?: FiltrosTareas,
  orden?: OrdenTareas,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    enableClientSideFiltering?: boolean;
  }
) {
  // Normalize filters and order for consistent caching
  const normalizedFilters = normalizeFilters(filtros);
  const normalizedOrder = normalizeOrder(orden);

  // Get appropriate cache configuration
  const cacheConfig = getCacheConfig(normalizedFilters);

  // Helper function to ensure data is always an array (maintaining backward compatibility)
  const ensureArray = (data: any): Task[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.tareas)) return data.tareas;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    console.warn('Datos de tareas no son un array:', data);
    return [];
  };

  // Query para obtener todas las tareas (sin filtros) como fallback
  const allTasksQuery = useQuery({
    queryKey: queryKeys.tasksList(undefined, normalizedOrder),
    queryFn: async () => {
      const data = await apiService.obtenerTareas(undefined, normalizedOrder);
      return ensureArray(data);
    },
    enabled: options?.enabled ?? !!localStorage.getItem('token'),
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
  });

  const query = useQuery({
    queryKey: queryKeys.tasksList(normalizedFilters, normalizedOrder),
    queryFn: async () => {
      try {
        console.log('useTasksQuery: Making API call with filters:', {
          originalFilters: filtros,
          normalizedFilters,
          normalizedOrder
        });

        if (normalizedFilters?.priority) {
          console.log('useTasksQuery: Priority filter in API call:', normalizedFilters.priority);
        }

        if (normalizedOrder) {
          console.log('useTasksQuery: Sort order in API call:', {
            field: normalizedOrder.field,
            direction: normalizedOrder.direction
          });
        }

        const data = await apiService.obtenerTareas(normalizedFilters, normalizedOrder);
        console.log('useTasksQuery: API response received:', {
          dataType: typeof data,
          isArray: Array.isArray(data),
          length: Array.isArray(data) ? data.length : 'N/A',
          firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null
        });

        let tasks = ensureArray(data);

        // Validar filtrado del servidor si tenemos filtros activos y datos de todas las tareas
        if (normalizedFilters && allTasksQuery.data && options?.enableClientSideFiltering !== false) {
          const validation = validateServerFiltering(tasks, allTasksQuery.data, normalizedFilters);

          if (!validation.isConsistent) {
            console.warn('useTasksQuery: Server filtering inconsistent, using client-side filtering');
            tasks = applyClientSideFilters(allTasksQuery.data, normalizedFilters);
          }
        }

        // Aplicar ordenamiento híbrido si hay configuración de orden
        if (normalizedOrder) {
          const sortingResult = applyHybridSorting(tasks, normalizedOrder);

          if (sortingResult.usedClientSide) {
            console.warn('useTasksQuery: Applied client-side sorting due to server sorting issues');
          }

          if (!sortingResult.verification.isCorrect) {
            console.error('useTasksQuery: Sorting verification failed:', sortingResult.verification.errors);
          }

          tasks = sortingResult.tasks;
        }

        return tasks;
      } catch (error: any) {
        console.error('Error in useTasksQuery:', error);

        // Si hay error y tenemos datos de todas las tareas, usar filtrado local como fallback
        if (allTasksQuery.data && normalizedFilters && options?.enableClientSideFiltering !== false) {
          console.log('useTasksQuery: Using client-side filtering as fallback due to server error');
          return applyClientSideFilters(allTasksQuery.data, normalizedFilters);
        }

        // Re-throw to let TanStack Query handle it
        throw error;
      }
    },
    enabled: options?.enabled ?? !!localStorage.getItem('token'), // Only fetch if user is authenticated
    staleTime: options?.staleTime ?? cacheConfig.staleTime,
    gcTime: options?.gcTime ?? cacheConfig.gcTime,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401) {
        return false;
      }
      // Don't retry on validation errors (400, 422)
      if (error?.response?.status === 400 || error?.response?.status === 422) {
        return false;
      }
      // Retry up to 3 times for network and server errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff with jitter
      const baseDelay = Math.min(1000 * Math.pow(2, attemptIndex), 10000);
      const jitter = Math.random() * 0.1 * baseDelay;
      return baseDelay + jitter;
    },
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?
      (query.error as any)?.response?.data?.message || 'Error al cargar las tareas' :
      null,
    isError: query.isError,
    isFetching: query.isFetching,
    isStale: query.isStale,
    refetch: query.refetch,
    // Cache debugging information (useful for development)
    _cacheInfo: {
      queryKey: queryKeys.tasksList(normalizedFilters, normalizedOrder),
      normalizedFilters,
      normalizedOrder,
      cacheConfig,
      dataUpdatedAt: query.dataUpdatedAt,
      errorUpdatedAt: query.errorUpdatedAt,
    },
  };
}

/**
 * Hook variant with debouncing for search queries
 * Useful for search inputs to avoid excessive API calls
 */
export function useTasksQueryWithDebounce(
  filtros?: FiltrosTareas,
  orden?: OrdenTareas,
  debounceMs: number = 300
) {
  // For now, we'll use the regular hook
  // In a future enhancement, we could add debouncing logic here
  // This is a placeholder for the debouncing functionality mentioned in other tasks
  // The debounceMs parameter is reserved for future implementation
  console.debug(`useTasksQueryWithDebounce called with debounce: ${debounceMs}ms`);
  return useTasksQuery(filtros, orden);
}
