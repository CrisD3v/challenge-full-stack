import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Tag } from '../types';
import { queryKeys } from '../utils/queryKeys';

/**
 * Hook para obtener etiquetas usando TanStack Query
 * Reemplaza la lógica de useState y useEffect del hook original
 */
export function useTagsQuery() {
  // Función helper para asegurar que siempre sea un array (mantener compatibilidad)
  const ensureArray = (data: any): Tag[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.etiquetas)) return data.etiquetas;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    console.warn('Datos de etiquetas no son un array:', data);
    return [];
  };

  const query = useQuery({
    queryKey: queryKeys.tagsList(),
    queryFn: async () => {
      console.log('useTagsQuery - Cargando etiquetas...');
      const etiquetasObtenidas = await apiService.obtenerEtiquetas();
      console.log('useTagsQuery - Etiquetas obtenidas:', etiquetasObtenidas);

      // Verificar que sea un array
      const etiquetasArray = ensureArray(etiquetasObtenidas);
      console.log('useTagsQuery - Etiquetas como array:', etiquetasArray);

      return etiquetasArray;
    },
    enabled: !!localStorage.getItem('token'), // Solo ejecutar si hay token
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      // No reintentar si es error de autenticación
      if (error?.response?.status === 401) {
        return false;
      }
      // Reintentar hasta 3 veces para otros errores
      return failureCount < 3;
    },
  });

  return {
    etiquetas: query.data || [],
    isLoading: query.isLoading,
    error: query.error ?
      (query.error as any)?.response?.data?.message || 'Error al cargar las etiquetas' :
      null,
    refetch: query.refetch,
    isError: query.isError,
    isSuccess: query.isSuccess,
  };
}
