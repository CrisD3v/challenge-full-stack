import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { FiltrosTareas, OrdenTareas, Task, TaskFormData } from '../types';
import { getCacheUtils } from '../utils/cacheUtils';
import { queryKeys } from '../utils/queryKeys';

/**
 * Custom hook for task CRUD operations using TanStack Query mutations
 * Implements optimistic updates with proper error handling and rollback logic
 */
export function useTaskMutations(filtros?: FiltrosTareas, orden?: OrdenTareas) {
  const queryClient = useQueryClient();
  const cacheUtils = getCacheUtils();

  // Create task mutation with optimistic updates
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiService.crearTarea(data),
    onMutate: async (newTaskData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasksList(filtros, orden) });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasksList(filtros, orden));

      // Optimistically update to the new value
      if (previousTasks) {
        const optimisticTask: Task = {
          id: `temp-${Date.now()}`, // Temporary ID
          title: newTaskData.title,
          description: newTaskData.description,
          completed: false,
          priority: newTaskData.priority,
          dueDate: newTaskData.dueDate,
          userId: '', // Will be set by server
          categoryId: newTaskData.categoryId,
          categories: undefined,
          tags: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Task[]>(
          queryKeys.tasksList(filtros, orden),
          [optimisticTask, ...previousTasks]
        );
      }

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (_err, _newTaskData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasksList(filtros, orden), context.previousTasks);
      }
    },
    onSuccess: (newTask) => {
      // Update the cache with the real task data from server
      queryClient.setQueryData<Task[]>(
        queryKeys.tasksList(filtros, orden),
        (old) => {
          if (!old) return [newTask];
          // Replace the optimistic task with the real one
          return old.map(task =>
            task.id.startsWith('temp-') ? newTask : task
          );
        }
      );
    },
    onSettled: (_data, _error, variables) => {
      // Use enhanced cross-entity invalidation
      cacheUtils.invalidation.onTaskMutation();

      // If task has category, also invalidate category-specific cache
      if (variables.categoryId) {
        cacheUtils.invalidation.onTaskWithCategoryChanged(variables.categoryId);
      }
    },
  });

  // Update task mutation with optimistic updates
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      apiService.actualizarTarea(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasksList(filtros, orden) });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasksList(filtros, orden));

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasksList(filtros, orden),
          previousTasks.map(task =>
            task.id === id ? { ...task, ...data, updatedAt: new Date().toISOString() } : task
          )
        );
      }

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasksList(filtros, orden), context.previousTasks);
      }
    },
    onSuccess: (updatedTask) => {
      // Update the cache with the real task data from server
      queryClient.setQueryData<Task[]>(
        queryKeys.tasksList(filtros, orden),
        (old) => {
          if (!old) return [updatedTask];
          return old.map(task =>
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      cacheUtils.invalidation.onTaskMutation();
    },
  });

  // Delete task mutation with optimistic updates
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiService.eliminarTarea(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasksList(filtros, orden) });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasksList(filtros, orden));

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasksList(filtros, orden),
          previousTasks.filter(task => task.id !== id)
        );
      }

      // Return a context object with the snapshotted value and deleted task
      const deletedTask = previousTasks?.find(task => task.id === id);
      return { previousTasks, deletedTask };
    },
    onError: (_err, _id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasksList(filtros, orden), context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      cacheUtils.invalidation.onTaskMutation();
    },
  });

  // Toggle complete task mutation with optimistic updates
  const toggleCompleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiService.toggleCompletarTarea(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasksList(filtros, orden) });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasksList(filtros, orden));

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasksList(filtros, orden),
          previousTasks.map(task =>
            task.id === id
              ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
              : task
          )
        );
      }

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (_err, _id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasksList(filtros, orden), context.previousTasks);
      }
    },
    onSuccess: (updatedTask) => {
      // Update the cache with the real task data from server
      queryClient.setQueryData<Task[]>(
        queryKeys.tasksList(filtros, orden),
        (old) => {
          if (!old) return [updatedTask];
          return old.map(task =>
            task.id === updatedTask.id ? updatedTask : task
          );
        }
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      cacheUtils.invalidation.onTaskMutation();
    },
  });

  // Batch operations mutation with optimistic updates
  const batchOperationsMutation = useMutation({
    mutationFn: ({ ids, operation }: { ids: string[]; operation: 'completar' | 'eliminar' }) =>
      apiService.operacionesLote(ids, operation),
    onMutate: async ({ ids, operation }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.tasksList(filtros, orden) });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasksList(filtros, orden));

      // Optimistically update to the new value
      if (previousTasks) {
        let updatedTasks = [...previousTasks];

        if (operation === 'eliminar') {
          updatedTasks = updatedTasks.filter(task => !ids.includes(task.id));
        } else if (operation === 'completar') {
          updatedTasks = updatedTasks.map(task =>
            ids.includes(task.id)
              ? { ...task, completed: true, updatedAt: new Date().toISOString() }
              : task
          );
        }

        queryClient.setQueryData<Task[]>(queryKeys.tasksList(filtros, orden), updatedTasks);
      }

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasksList(filtros, orden), context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      cacheUtils.invalidation.onTaskMutation();
    },
  });

  return {
    // Mutation functions
    createTask: createTaskMutation.mutate,
    updateTask: (id: string, data: Partial<TaskFormData>) =>
      updateTaskMutation.mutate({ id, data }),
    deleteTask: deleteTaskMutation.mutate,
    toggleCompleteTask: toggleCompleteTaskMutation.mutate,
    batchOperations: (ids: string[], operation: 'completar' | 'eliminar') =>
      batchOperationsMutation.mutate({ ids, operation }),

    // Async mutation functions (return promises)
    createTaskAsync: createTaskMutation.mutateAsync,
    updateTaskAsync: (id: string, data: Partial<TaskFormData>) =>
      updateTaskMutation.mutateAsync({ id, data }),
    deleteTaskAsync: deleteTaskMutation.mutateAsync,
    toggleCompleteTaskAsync: toggleCompleteTaskMutation.mutateAsync,
    batchOperationsAsync: (ids: string[], operation: 'completar' | 'eliminar') =>
      batchOperationsMutation.mutateAsync({ ids, operation }),

    // Mutation states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isToggling: toggleCompleteTaskMutation.isPending,
    isBatchProcessing: batchOperationsMutation.isPending,

    // Mutation errors
    createError: createTaskMutation.error,
    updateError: updateTaskMutation.error,
    deleteError: deleteTaskMutation.error,
    toggleError: toggleCompleteTaskMutation.error,
    batchError: batchOperationsMutation.error,

    // Reset functions
    resetCreateError: createTaskMutation.reset,
    resetUpdateError: updateTaskMutation.reset,
    resetDeleteError: deleteTaskMutation.reset,
    resetToggleError: toggleCompleteTaskMutation.reset,
    resetBatchError: batchOperationsMutation.reset,
  };
}
