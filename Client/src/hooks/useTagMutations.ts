import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/Commons/ErrorToast';
import { apiService } from '../services/api';
import type { Tag } from '../types';
import { getCacheUtils } from '../utils';
import { queryKeys } from '../utils/queryKeys';

/**
 * Hook para mutaciones de etiquetas con actualizaciones optimistas
 * Implementa crear y eliminar etiquetas con rollback automático en caso de error
 */
export function useTagMutations() {
  const queryClient = useQueryClient();
  const cacheUtilsInstance = getCacheUtils();
  const { showToast, showError } = useToast();

  // Función helper para asegurar que siempre sea un array
  const ensureArray = (data: any): Tag[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.etiquetas)) return data.etiquetas;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    console.warn('Datos de etiquetas no son un array:', data);
    return [];
  };

  // Mutación para crear etiqueta
  const createTagMutation = useMutation({
    mutationFn: (data: Omit<Tag, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      apiService.crearEtiqueta(data),

    onMutate: async (newTag) => {
      // Cancelar queries en progreso para evitar conflictos
      await queryClient.cancelQueries({ queryKey: queryKeys.tagsList() });

      // Snapshot del estado anterior
      const previousTags = queryClient.getQueryData<Tag[]>(queryKeys.tagsList());

      // Crear etiqueta temporal para actualización optimista
      const tempTag: Tag = {
        id: `temp-${Date.now()}`,
        name: newTag.name,
        color: newTag.color,
        userId: 'temp-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Actualización optimista
      queryClient.setQueryData<Tag[]>(queryKeys.tagsList(), (old) => {
        const oldArray = ensureArray(old);
        return [...oldArray, tempTag];
      });

      // Retornar contexto para rollback
      return { previousTags, tempTag };
    },

    onSuccess: (newTag, _variables, context) => {
      // Reemplazar la etiqueta temporal con la real
      queryClient.setQueryData<Tag[]>(queryKeys.tagsList(), (old) => {
        const oldArray = ensureArray(old);
        return oldArray.map(tag =>
          tag.id === context?.tempTag.id ? newTag : tag
        );
      });

      // Show success toast
      showToast({
        title: 'Etiqueta creada',
        message: `La etiqueta "${newTag.name}" se creó exitosamente`,
        type: 'success',
        duration: 3000,
      });
    },

    onError: (error, _variables, context) => {
      // Rollback en caso de error
      if (context?.previousTags) {
        queryClient.setQueryData(queryKeys.tagsList(), context.previousTags);
      }

      // Show error toast
      showError(error, 'crear etiqueta');
    },

    onSettled: () => {
      // Use enhanced cross-entity invalidation
      cacheUtilsInstance.invalidation.onTagMutation();
    },
  });

  // Mutación para eliminar etiqueta
  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => apiService.eliminarEtiqueta(id),

    onMutate: async (tagId) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: queryKeys.tagsList() });

      // Snapshot del estado anterior
      const previousTags = queryClient.getQueryData<Tag[]>(queryKeys.tagsList());

      // Actualización optimista - remover etiqueta
      queryClient.setQueryData<Tag[]>(queryKeys.tagsList(), (old) => {
        const oldArray = ensureArray(old);
        return oldArray.filter(tag => tag.id !== tagId);
      });

      // Retornar contexto para rollback
      return { previousTags, deletedTagId: tagId };
    },

    onSuccess: (_data, _tagId) => {
      // Show success toast
      showToast({
        title: 'Etiqueta eliminada',
        message: 'La etiqueta se eliminó exitosamente',
        type: 'success',
        duration: 3000,
      });
    },

    onError: (error, _tagId, context) => {
      // Rollback en caso de error
      if (context?.previousTags) {
        queryClient.setQueryData(queryKeys.tagsList(), context.previousTags);
      }

      // Show error toast
      showError(error, 'eliminar etiqueta');
    },

    onSettled: (_data, _error, tagId) => {
      // Use enhanced cross-entity invalidation for tag deletion
      cacheUtilsInstance.invalidation.onTagDeleted(tagId);
    },
  });

  return {
    createTag: createTagMutation.mutate,
    createTagAsync: createTagMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutate,
    deleteTagAsync: deleteTagMutation.mutateAsync,
    isCreating: createTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
    createError: createTagMutation.error ?
      (createTagMutation.error as any)?.response?.data?.message || 'Error al crear la etiqueta' :
      null,
    deleteError: deleteTagMutation.error ?
      (deleteTagMutation.error as any)?.response?.data?.message || 'Error al eliminar la etiqueta' :
      null,
  };
}
