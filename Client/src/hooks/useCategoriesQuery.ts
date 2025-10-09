import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Category } from '../types';
import { queryKeys } from '../utils/queryKeys';

/**
 * Custom hook for fetching categories using TanStack Query
 * Replaces useState and useEffect with useQuery for better caching and error handling
 */
export function useCategoriesQuery() {
  // Function to ensure data is always an array (maintaining compatibility)
  const ensureArray = (data: any): Category[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.categorias)) return data.categorias;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    console.warn('Datos de categorías no son un array:', data);
    return [];
  };

  const query = useQuery({
    queryKey: queryKeys.categoriesList(),
    queryFn: async (): Promise<Category[]> => {
      console.log('useCategoriesQuery - Fetching categories...');
      const categoriasObtenidas = await apiService.obtenerCategorias();
      console.log('useCategoriesQuery - Categories obtained:', categoriasObtenidas);

      // Ensure it's always an array for compatibility
      const categoriasArray = ensureArray(categoriasObtenidas);
      console.log('useCategoriesQuery - Categories as array:', categoriasArray);

      return categoriasArray;
    },
    enabled: !!localStorage.getItem('token'), // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    categorias: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    isError: query.isError,
    refetch: query.refetch,
    // Maintain compatibility with existing interface
    cargarCategorias: () => query.refetch(),
  };
}
