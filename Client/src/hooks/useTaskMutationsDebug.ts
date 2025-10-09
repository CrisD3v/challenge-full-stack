import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { TaskFormData } from '../types';
import { queryKeys } from '../utils';

/**
 * Debug version of task mutations to identify the issue
 */
export function useTaskMutationsDebug() {
  const queryClient = useQueryClient();

  // Simple create task mutation without optimistic updates for debugging
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      console.log('🚀 Debug: Starting task creation with data:', data);
      console.log('🚀 Debug: API Service:', apiService);
      console.log('🚀 Debug: crearTarea function:', apiService.crearTarea);

      try {
        const result = await apiService.crearTarea(data);
        console.log('✅ Debug: Task created successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ Debug: Error creating task:', error);
        console.error('❌ Debug: Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
          config: (error as any)?.config?.url,
          headers: (error as any)?.config?.headers,
        });
        throw error;
      }
    },
    onMutate: (data) => {
      console.log('🔄 Debug: onMutate called with:', data);
    },
    onSuccess: (data, variables) => {
      console.log('✅ Debug: onSuccess called with:', { data, variables });
      // Invalidate both old and new query keys
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksList() });
    },
    onError: (error, variables) => {
      console.error('❌ Debug: onError called with:', { error, variables });
    },
    onSettled: (data, error, variables) => {
      console.log('🏁 Debug: onSettled called with:', { data, error, variables });
    }
  });

  return {
    createTask: createTaskMutation.mutate,
    createTaskAsync: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    createError: createTaskMutation.error,
    resetCreateError: createTaskMutation.reset,

    // Debug info
    mutationState: {
      status: createTaskMutation.status,
      isPending: createTaskMutation.isPending,
      isError: createTaskMutation.isError,
      isSuccess: createTaskMutation.isSuccess,
      error: createTaskMutation.error,
      data: createTaskMutation.data,
    }
  };
}
