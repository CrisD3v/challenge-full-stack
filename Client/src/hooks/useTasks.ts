import { useCallback, useEffect, useState } from 'react';
import type { FiltrosTareas, OrdenTareas, Task, TaskFormData } from '../types';
import { useTaskMutationsSimple as useTaskMutations } from './useTaskMutationsSimple';
import { useTasksQuery } from './useTasksQuery';

export function useTasks() {
  const [filtros, setFiltros] = useState<FiltrosTareas>({});
  const [orden, setOrden] = useState<OrdenTareas>({ field: 'createdAt', direction: 'desc' });

  // Use the new query-based hooks
  const {
    tasks,
    isLoading,
    error,
    refetch
  } = useTasksQuery(filtros, orden);

  const {
    createTaskAsync,
    updateTaskAsync,
    deleteTaskAsync,
    toggleCompleteTaskAsync,
    batchOperationsAsync,
    createError,
    updateError,
    deleteError,
    toggleError,
    batchError,
    resetCreateError,
    resetUpdateError,
    resetDeleteError,
    resetToggleError,
    resetBatchError,
  } = useTaskMutations(filtros, orden);

  // Escuchar evento de login exitoso
  useEffect(() => {
    const handleUserLoggedIn = () => {
      // console.log('useTareas - Usuario logueado, recargando tareas');
      refetch();
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, [refetch]);

  const crearTarea = async (data: TaskFormData): Promise<Task> => {
    try {
      resetCreateError();
      const newTask = await createTaskAsync(data);
      return newTask;
    } catch (err: any) {
      const errorMessage = createError
        ? (createError as any)?.response?.data?.message || 'Error al crear la tarea'
        : 'Error al crear la tarea';
      throw new Error(errorMessage);
    }
  };

  const actualizarTarea = async (id: string, data: Partial<TaskFormData>): Promise<Task> => {
    try {
      resetUpdateError();
      const tareaActualizada = await updateTaskAsync(id, data);
      return tareaActualizada;
    } catch (err: any) {
      const errorMessage = updateError
        ? (updateError as any)?.response?.data?.message || 'Error al actualizar la tarea'
        : 'Error al actualizar la tarea';
      throw new Error(errorMessage);
    }
  };

  const eliminarTarea = async (id: string): Promise<void> => {
    try {
      resetDeleteError();
      await deleteTaskAsync(id);
    } catch (err: any) {
      const errorMessage = deleteError
        ? (deleteError as any)?.response?.data?.message || 'Error al eliminar la tarea'
        : 'Error al eliminar la tarea';
      throw new Error(errorMessage);
    }
  };

  const toggleCompletarTarea = async (id: string): Promise<void> => {
    try {
      resetToggleError();
      await toggleCompleteTaskAsync(id);
    } catch (err: any) {
      const errorMessage = toggleError
        ? (toggleError as any)?.response?.data?.message || 'Error al cambiar el estado de la tarea'
        : 'Error al cambiar el estado de la tarea';
      throw new Error(errorMessage);
    }
  };

  const operacionesLote = async (ids: string[], operation: 'completar' | 'eliminar'): Promise<void> => {
    try {
      resetBatchError();
      await batchOperationsAsync(ids, operation);
    } catch (err: any) {
      const errorMessage = batchError
        ? (batchError as any)?.response?.data?.message || 'Error en la operación en lote'
        : 'Error en la operación en lote';
      throw new Error(errorMessage);
    }
  };

  const reordenarTareas = (_startIndex: number, _endIndex: number) => {
    // For reordering, we'll need to implement local state management
    // since this is a UI-only operation that doesn't persist to server
    // This functionality might need to be handled differently in the components
    console.warn('reordenarTareas: This function needs to be implemented at component level for TanStack Query');
  };

  const aplicarFiltros = (nuevosFiltros: FiltrosTareas) => {
    setFiltros(nuevosFiltros);
  };

  const aplicarOrden = (nuevoOrden: OrdenTareas) => {
    setOrden(nuevoOrden);
  };

  const cargarTareas = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const limpiarError = () => {
    // Clear all mutation errors
    resetCreateError();
    resetUpdateError();
    resetDeleteError();
    resetToggleError();
    resetBatchError();
  };

  return {
    tasks,
    isLoading,
    error,
    filtros,
    orden,
    crearTarea,
    actualizarTarea,
    eliminarTarea,
    toggleCompletarTarea,
    operacionesLote,
    reordenarTareas,
    aplicarFiltros,
    aplicarOrden,
    cargarTareas,
    limpiarError,
  };
}
