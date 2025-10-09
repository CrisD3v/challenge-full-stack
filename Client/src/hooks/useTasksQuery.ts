import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { FiltrosTareas, OrdenTareas, Task } from '../types';
import { queryKeys } from '../utils/queryKeys';

/**
 * Custom hook for fetching tasks data using TanStack Query
 * Replaces useState and useEffect with useQuery for better caching and state management
 */
export function useTasksQuery(filtros?: FiltrosTareas, orden?: OrdenTareas) {
  // Helper function to ensure data is always an array (maintaining backward compatibility)
  const ensureArray = (data: any): Task[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.tareas)) return data.tareas;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    console.warn('Datos de tareas no son un array:', data);
    return [];
  };

  const query = useQuery({
    queryKey: queryKeys.tasksList(filtros, orden),
    queryFn: async () => {
      const data = await apiService.obtenerTareas(filtros, orden);
      return ensureArray(data);
    },
    enabled: !!localStorage.getItem('token'), // Only fetch if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes - tasks change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
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
  };
}
