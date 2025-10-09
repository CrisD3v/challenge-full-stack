import { useEffect, useState } from 'react';
import type { Category } from '../types';
import { useCategoriesQuery } from './useCategoriesQuery';
import { useCategoryMutations } from './useCategoryMutations';

/**
 * Main useCategories hook that combines query and mutation functionality
 * Maintains exact same public interface as the original implementation
 * Now powered by TanStack Query for better caching and optimistic updates
 */
export function useCategories() {
  // Use the new TanStack Query-based hooks
  const {
    categorias,
    isLoading: queryLoading,
    error: queryError,
    cargarCategorias,
  } = useCategoriesQuery();

  const {
    crearCategoria: createMutation,
    actualizarCategoria: updateMutation,
    eliminarCategoria: deleteMutation,
    isMutating,
    mutationError,
  } = useCategoryMutations();

  // Local error state to maintain compatibility
  const [localError, setLocalError] = useState<string | null>(null);

  // Listen for successful login events to refetch data
  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log('useCategorias - Usuario logueado, recargando categorías');
      cargarCategorias();
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, [cargarCategorias]);

  // Wrapper functions to maintain exact same interface and error handling
  const crearCategoria = async (data: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
    try {
      setLocalError(null);
      const result = await createMutation(data);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear la categoría';
      setLocalError(errorMessage);
      throw err;
    }
  };

  const actualizarCategoria = async (id: string, data: Partial<Category>): Promise<Category> => {
    try {
      setLocalError(null);
      const result = await updateMutation(id, data);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la categoría';
      setLocalError(errorMessage);
      throw err;
    }
  };

  const eliminarCategoria = async (id: string): Promise<void> => {
    try {
      setLocalError(null);
      await deleteMutation(id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la categoría';
      setLocalError(errorMessage);
      throw err;
    }
  };

  const limpiarError = () => {
    setLocalError(null);
  };

  // Combine loading states (query loading or any mutation in progress)
  const isLoading = queryLoading || isMutating;

  // Combine error states (prioritize local error, then mutation error, then query error)
  const error = localError || mutationError || queryError;

  // Return the exact same interface as the original hook
  return {
    categorias,
    isLoading,
    error,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    cargarCategorias,
    limpiarError,
  };
}
