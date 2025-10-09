import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/Commons/ErrorToast';
import { apiService } from '../services/api';
import type { Category } from '../types';
import { getCacheUtils } from '../utils';
import { queryKeys } from '../utils/queryKeys';

/**
 * Custom hook for category CRUD operations using TanStack Query mutations
 * Implements optimistic updates and proper error handling with rollback logic
 */
export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const cacheUtilsInstance = getCacheUtils();
  const { showToast, showError } = useToast();

  // Helper function to ensure array format (maintaining compatibility)
  const ensureArray = (data: any): Category[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.categorias)) return data.categorias;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    return [];
  };

  // Create category mutation with optimistic updates
  const createCategoryMutation = useMutation({
    mutationFn: async (data: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
      return await apiService.crearCategoria(data);
    },
    onMutate: async (newCategory) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.categoriesList() });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData<Category[]>(queryKeys.categoriesList());

      // Optimistically update to the new value
      const optimisticCategory: Category = {
        id: `temp-${Date.now()}`, // Temporary ID
        userId: 'temp-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newCategory,
      };

      queryClient.setQueryData<Category[]>(queryKeys.categoriesList(), (old) => {
        const oldArray = ensureArray(old);
        return [...oldArray, optimisticCategory];
      });

      // Return a context object with the snapshotted value
      return { previousCategories, optimisticCategory };
    },
    onSuccess: (data, _variables, context) => {
      // Replace the optimistic category with the real one
      queryClient.setQueryData<Category[]>(queryKeys.categoriesList(), (old) => {
        const oldArray = ensureArray(old);
        return oldArray.map(category =>
          category.id === context?.optimisticCategory.id ? data : category
        );
      });

      // Show success toast
      showToast({
        title: 'Categoría creada',
        message: `La categoría "${data.name}" se creó exitosamente`,
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error, _newCategory, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categoriesList(), context.previousCategories);
      }

      // Show error toast
      showError(error, 'crear categoría');
    },
    onSettled: () => {
      // Use enhanced cross-entity invalidation
      cacheUtilsInstance.invalidation.onCategoryMutation();
    },
  });

  // Update category mutation with optimistic updates
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }): Promise<Category> => {
      return await apiService.actualizarCategoria(id, data);
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.categoriesList() });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData<Category[]>(queryKeys.categoriesList());

      // Optimistically update to the new value
      queryClient.setQueryData<Category[]>(queryKeys.categoriesList(), (old) => {
        const oldArray = ensureArray(old);
        return oldArray.map(category =>
          category.id === id
            ? { ...category, ...data, updatedAt: new Date().toISOString() }
            : category
        );
      });

      return { previousCategories };
    },
    onSuccess: (updatedCategory) => {
      // Show success toast
      showToast({
        title: 'Categoría actualizada',
        message: `La categoría "${updatedCategory.name}" se actualizó exitosamente`,
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categoriesList(), context.previousCategories);
      }

      // Show error toast
      showError(error, 'actualizar categoría');
    },
    onSettled: (_data, _error, { id }) => {
      // Use enhanced cross-entity invalidation with specific category ID
      cacheUtilsInstance.invalidation.onCategoryMutation(id);
    },
  });

  // Delete category mutation with optimistic updates
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiService.eliminarCategoria(id);
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.categoriesList() });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData<Category[]>(queryKeys.categoriesList());

      // Optimistically update by removing the category
      queryClient.setQueryData<Category[]>(queryKeys.categoriesList(), (old) => {
        const oldArray = ensureArray(old);
        return oldArray.filter(category => category.id !== id);
      });

      return { previousCategories };
    },
    onSuccess: () => {
      // Show success toast
      showToast({
        title: 'Categoría eliminada',
        message: 'La categoría se eliminó exitosamente',
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error, _id, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categoriesList(), context.previousCategories);
      }

      // Show error toast
      showError(error, 'eliminar categoría');
    },
    onSettled: (_data, _error, id) => {
      // Use enhanced cross-entity invalidation for category deletion
      cacheUtilsInstance.invalidation.onCategoryDeleted(id);
    },
  });

  return {
    // Create category
    crearCategoria: createCategoryMutation.mutateAsync,
    isCreating: createCategoryMutation.isPending,
    createError: createCategoryMutation.error?.message ?? null,

    // Update category
    actualizarCategoria: (id: string, data: Partial<Category>) =>
      updateCategoryMutation.mutateAsync({ id, data }),
    isUpdating: updateCategoryMutation.isPending,
    updateError: updateCategoryMutation.error?.message ?? null,

    // Delete category
    eliminarCategoria: deleteCategoryMutation.mutateAsync,
    isDeleting: deleteCategoryMutation.isPending,
    deleteError: deleteCategoryMutation.error?.message ?? null,

    // General mutation states
    isMutating: createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      deleteCategoryMutation.isPending,

    // Combined error state
    mutationError: createCategoryMutation.error?.message ||
      updateCategoryMutation.error?.message ||
      deleteCategoryMutation.error?.message ||
      null,
  };
}
