import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/Commons/ErrorToast';
import { apiService } from '../services/api';
import type { TaskFormData } from '../types';
import { queryKeys } from '../utils/queryKeys';

/**
 * Simplified version of task mutations without complex optimizations
 * Use this as a fallback while we debug the main implementation
 */
export function useTaskMutationsSimple(_filtros?: any, _orden?: any) {
  const queryClient = useQueryClient();
  const { showToast, showError } = useToast();

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => apiService.crearTarea(data),
    onSuccess: (newTask) => {
      // Simple invalidation - refetch all task-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() });

      // Show success toast
      showToast({
        title: 'Tarea creada',
        message: `La tarea "${newTask.title}" se creó exitosamente`,
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error toast
      showError(error, 'crear tarea');
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      apiService.actualizarTarea(id, data),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() });

      // Show success toast
      showToast({
        title: 'Tarea actualizada',
        message: `La tarea "${updatedTask.title}" se actualizó exitosamente`,
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error toast
      showError(error, 'actualizar tarea');
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiService.eliminarTarea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() });

      // Show success toast
      showToast({
        title: 'Tarea eliminada',
        message: 'La tarea se eliminó exitosamente',
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error toast
      showError(error, 'eliminar tarea');
    },
  });

  // Toggle complete task mutation
  const toggleCompleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiService.toggleCompletarTarea(id),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() });

      // Show success toast
      const status = updatedTask.completed ? 'completada' : 'marcada como pendiente';
      showToast({
        title: 'Tarea actualizada',
        message: `La tarea "${updatedTask.title}" fue ${status}`,
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error toast
      showError(error, 'cambiar estado de tarea');
    },
  });

  // Batch operations mutation
  const batchOperationsMutation = useMutation({
    mutationFn: ({ ids, operation }: { ids: string[]; operation: 'completar' | 'eliminar' }) =>
      apiService.operacionesLote(ids, operation),
    onSuccess: (_, { ids, operation }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() });

      // Show success toast
      const count = ids.length;
      const actionText = operation === 'completar' ? 'completaron' : 'eliminaron';
      showToast({
        title: 'Operación exitosa',
        message: `Se ${actionText} ${count} tarea${count > 1 ? 's' : ''} exitosamente`,
        type: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      // Show error toast
      showError(error, 'operación en lote');
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
