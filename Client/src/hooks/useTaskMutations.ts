import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { FiltrosTareas, OrdenTareas, Task, TaskFormData } from '../types';
import { getCacheUtils } from '../utils/cacheUtils';
import { queryKeys } from '../utils/queryKeys';

/**
 * Hook personalizado para operaciones CRUD de tareas usando mutaciones de TanStack Query
 *
 * Este hook proporciona todas las funciones necesarias para realizar operaciones sobre tareas,
 * incluyendo operaciones en lote para múltiples tareas seleccionadas. Implementa actualizaciones
 * optimistas con manejo adecuado de errores y lógica de rollback automático.
 *
 * Funcionalidades principales:
 * - Operaciones individuales: crear, actualizar, eliminar, completar/descompletar tareas
 * - Operaciones en lote: completar o eliminar múltiples tareas de una vez
 * - Actualizaciones optimistas para feedback inmediato al usuario
 * - Rollback automático en caso de errores de red o servidor
 * - Invalidación inteligente de caché para mantener consistencia de datos
 * - Estados de carga y error para cada tipo de operación
 *
 * Integración con TanStack Query:
 * - Utiliza useMutation para cada tipo de operación
 * - Implementa onMutate para actualizaciones optimistas
 * - Maneja onError para rollback automático
 * - Usa onSettled para invalidación de caché y sincronización final
 *
 * @param filtros - Filtros actuales aplicados a la lista de tareas (opcional)
 * @param orden - Orden actual aplicado a la lista de tareas (opcional)
 * @returns Objeto con funciones de mutación, estados de carga y errores
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

  /**
   * Mutación para operaciones en lote sobre múltiples tareas
   *
   * Esta mutación permite realizar operaciones masivas (completar o eliminar) sobre
   * múltiples tareas seleccionadas de una sola vez. Implementa actualizaciones optimistas
   * para proporcionar feedback inmediato al usuario y rollback automático en caso de error.
   *
   * Flujo de operación:
   * 1. onMutate: Cancela queries pendientes y aplica cambios optimistas
   * 2. mutationFn: Ejecuta la operación en el servidor via API
   * 3. onError: Revierte cambios optimistas si la operación falla
   * 4. onSettled: Invalida caché para sincronizar con el servidor
   *
   * Operaciones soportadas:
   * - 'completar': Marca todas las tareas seleccionadas como completadas
   * - 'eliminar': Elimina todas las tareas seleccionadas del sistema
   *
   * Cumple con los requisitos:
   * - 1.1, 1.2: Completar múltiples tareas con actualización optimista
   * - 2.1, 2.2: Eliminar múltiples tareas con actualización optimista
   * - 1.3, 2.4: Rollback automático en caso de error
   * - 4.1, 4.2: Invalidación de caché para consistencia de datos
   */
  const batchOperationsMutation = useMutation({
    mutationFn: ({ ids, operation }: { ids: string[]; operation: 'completar' | 'eliminar' }) =>
      apiService.operacionesLote(ids, operation),
    onMutate: async ({ ids, operation }) => {
      // Cancelar cualquier refetch pendiente para evitar conflictos de datos
      // Esto asegura que las actualizaciones optimistas no sean sobrescritas
      await queryClient.cancelQueries({ queryKey: queryKeys.tasksList(filtros, orden) });

      // Crear snapshot del estado actual para posible rollback
      // Este snapshot se usa para revertir cambios si la operación falla
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasksList(filtros, orden));

      // Aplicar actualizaciones optimistas para feedback inmediato al usuario
      // Los cambios se muestran inmediatamente mientras se procesa la request
      if (previousTasks) {
        let updatedTasks = [...previousTasks];

        if (operation === 'eliminar') {
          // Filtrar las tareas eliminadas de la lista local
          // Cumple con el requisito 2.3: mostrar actualización optimista
          updatedTasks = updatedTasks.filter(task => !ids.includes(task.id));
        } else if (operation === 'completar') {
          // Marcar las tareas seleccionadas como completadas
          // Cumple con el requisito 1.2: mostrar actualización optimista
          updatedTasks = updatedTasks.map(task =>
            ids.includes(task.id)
              ? { ...task, completed: true, updatedAt: new Date().toISOString() }
              : task
          );
        }

        // Actualizar el caché local con los cambios optimistas
        queryClient.setQueryData<Task[]>(queryKeys.tasksList(filtros, orden), updatedTasks);
      }

      // Retornar contexto con el snapshot para posible rollback
      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Revertir cambios optimistas si la operación falla en el servidor
      // Cumple con los requisitos 1.3 y 2.4: rollback en caso de error
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasksList(filtros, orden), context.previousTasks);
      }
    },
    onSettled: () => {
      // Invalidar caché para sincronizar con el estado real del servidor
      // Esto asegura consistencia de datos independientemente del resultado
      // Cumple con los requisitos 4.1 y 4.2: mantener consistencia de datos
      cacheUtils.invalidation.onTaskMutation();
    },
  });

  return {
    // Funciones de mutación síncronas (fire-and-forget)
    // Estas funciones ejecutan la operación sin devolver una promesa
    createTask: createTaskMutation.mutate,
    updateTask: (id: string, data: Partial<TaskFormData>) =>
      updateTaskMutation.mutate({ id, data }),
    deleteTask: deleteTaskMutation.mutate,
    toggleCompleteTask: toggleCompleteTaskMutation.mutate,

    /**
     * Función síncrona para operaciones en lote
     * Ejecuta la operación sin devolver una promesa (fire-and-forget)
     * Útil cuando no necesitas manejar el resultado de la operación
     *
     * @param ids - Array de IDs de las tareas a procesar
     * @param operation - Tipo de operación: 'completar' o 'eliminar'
     */
    batchOperations: (ids: string[], operation: 'completar' | 'eliminar') =>
      batchOperationsMutation.mutate({ ids, operation }),

    // Funciones de mutación asíncronas (devuelven promesas)
    // Estas funciones permiten manejar el éxito/error de la operación
    createTaskAsync: createTaskMutation.mutateAsync,
    updateTaskAsync: (id: string, data: Partial<TaskFormData>) =>
      updateTaskMutation.mutateAsync({ id, data }),
    deleteTaskAsync: deleteTaskMutation.mutateAsync,
    toggleCompleteTaskAsync: toggleCompleteTaskMutation.mutateAsync,

    /**
     * Función asíncrona para operaciones en lote
     * Devuelve una promesa que permite manejar el éxito/error de la operación
     * Utilizada en los handlers del componente ListTask para limpiar selección
     * solo después de operaciones exitosas
     *
     * @param ids - Array de IDs de las tareas a procesar
     * @param operation - Tipo de operación: 'completar' o 'eliminar'
     * @returns Promise que se resuelve cuando la operación se completa
     */
    batchOperationsAsync: (ids: string[], operation: 'completar' | 'eliminar') =>
      batchOperationsMutation.mutateAsync({ ids, operation }),

    // Estados de carga para cada tipo de mutación
    // Utilizados para deshabilitar UI y mostrar indicadores de carga
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isToggling: toggleCompleteTaskMutation.isPending,

    /**
     * Estado de carga para operaciones en lote
     * Utilizado en ListTask para:
     * - Deshabilitar botones durante operaciones (requisito 3.1)
     * - Deshabilitar interfaz de selección (requisito 3.2)
     * - Mostrar indicadores de carga en botones (requisito 3.1)
     * - Mostrar estado de procesamiento en contador de tareas
     */
    isBatchProcessing: batchOperationsMutation.isPending,

    // Errores de cada tipo de mutación
    // Utilizados para mostrar mensajes de error específicos al usuario
    createError: createTaskMutation.error,
    updateError: updateTaskMutation.error,
    deleteError: deleteTaskMutation.error,
    toggleError: toggleCompleteTaskMutation.error,

    /**
     * Error de operaciones en lote
     * Utilizado en ListTask para mostrar mensajes de error descriptivos
     * en español cuando fallan las operaciones masivas (requisito 3.4)
     * Incluye información detallada sobre el tipo de error ocurrido
     */
    batchError: batchOperationsMutation.error,

    // Funciones para resetear errores
    // Útiles para limpiar estados de error después de mostrarlos al usuario
    resetCreateError: createTaskMutation.reset,
    resetUpdateError: updateTaskMutation.reset,
    resetDeleteError: deleteTaskMutation.reset,
    resetToggleError: toggleCompleteTaskMutation.reset,

    /**
     * Función para resetear errores de operaciones en lote
     * Utilizada para limpiar el estado de error después de que el usuario
     * haya visto y cerrado el mensaje de error
     */
    resetBatchError: batchOperationsMutation.reset,
  };
}
