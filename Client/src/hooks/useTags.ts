import { useEffect, useState } from 'react';
import type { Tag } from '../types';
import { useTagMutations } from './useTagMutations';
import { useTagsQuery } from './useTagsQuery';

/**
 * Hook principal para gestión de etiquetas usando TanStack Query
 * Mantiene la misma interfaz pública que la implementación anterior
 * para garantizar compatibilidad con componentes existentes
 */
export function useTags() {
  const [localError, setLocalError] = useState<string | null>(null);

  // Usar los nuevos hooks basados en TanStack Query
  const {
    etiquetas,
    isLoading,
    error: queryError,
    refetch
  } = useTagsQuery();

  const {
    createTagAsync,
    deleteTagAsync,
    isCreating,
    isDeleting,
    createError,
    deleteError
  } = useTagMutations();

  // Combinar errores de query y mutaciones
  const error = localError || queryError || createError || deleteError;

  // Escuchar evento de login exitoso para refrescar datos
  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log('useTags - Usuario logueado, recargando etiquetas');
      refetch();
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, [refetch]);

  // Función para crear etiqueta manteniendo la interfaz original
  const crearEtiqueta = async (data: Omit<Tag, 'id' | 'usuarioId' | 'createdAt' | 'updatedAt'>): Promise<Tag> => {
    try {
      setLocalError(null);
      const nuevaEtiqueta = await createTagAsync(data);
      return nuevaEtiqueta;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear la etiqueta';
      setLocalError(errorMessage);
      throw err;
    }
  };

  // Función para eliminar etiqueta manteniendo la interfaz original
  const eliminarEtiqueta = async (id: string): Promise<void> => {
    try {
      setLocalError(null);
      await deleteTagAsync(id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la etiqueta';
      setLocalError(errorMessage);
      throw err;
    }
  };

  // Función para cargar etiquetas manualmente (mantener compatibilidad)
  const cargarEtiquetas = () => {
    setLocalError(null);
    refetch();
  };

  // Función para limpiar errores
  const limpiarError = () => {
    setLocalError(null);
  };

  return {
    etiquetas,
    isLoading: isLoading || isCreating || isDeleting,
    error,
    crearEtiqueta,
    eliminarEtiqueta,
    cargarEtiquetas,
    limpiarError,
  };
}
