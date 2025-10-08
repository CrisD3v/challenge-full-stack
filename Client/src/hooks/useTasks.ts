import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { FiltrosTareas, OrdenTareas, Task, TaskFormData } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosTareas>({});
  const [orden, setOrden] = useState<OrdenTareas>({ field: 'createdAt', direction: 'desc' });

  // Función helper para asegurar que siempre sea un array
  const ensureArray = (data: any): Task[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.tareas)) return data.tareas;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    console.warn('Datos de tareas no son un array:', data);
    return [];
  };

  const cargarTareas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // console.log('useTareas - Cargando tareas...');
      const tareasObtenidas = await apiService.obtenerTareas(filtros, orden);
      // console.log('useTareas - Tareas obtenidas:', tareasObtenidas);

      // Verificar que sea un array
      const tareasArray = ensureArray(tareasObtenidas);
      // console.log('useTareas - Tareas como array:', tareasArray);

      setTasks(tareasArray);
    } catch (err: any) {
      console.error('useTareas - Error al cargar tareas:', err);
      setError(err.response?.data?.message || 'Error al cargar las tareas');
      setTasks([]); // Asegurar que siempre sea un array
    } finally {
      setIsLoading(false);
    }
  }, [filtros, orden]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // console.log('useTareas useEffect - Token:', token ? 'Presente' : 'Ausente');
    if (token) {
      // console.log('useTareas useEffect - Cargando tareas porque hay token');
      cargarTareas();
    } else {
      // console.log('useTareas useEffect - No hay token, no cargando tareas');
    }
  }, [cargarTareas]);

  // Escuchar evento de login exitoso
  useEffect(() => {
    const handleUserLoggedIn = () => {
      // console.log('useTareas - Usuario logueado, recargando tareas');W
      cargarTareas();
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn);
  }, [cargarTareas]);

  const crearTarea = async (data: TaskFormData): Promise<Task> => {
    try {
      setError(null);
      const newTask = await apiService.crearTarea(data);

      // Actualización optimista
      setTasks(prev => [newTask, ...prev]);

      return newTask;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la tarea');
      throw err;
    }
  };

  const actualizarTarea = async (id: string, data: Partial<TaskFormData>): Promise<Task> => {
    try {
      setError(null);

      // Actualización optimista
      setTasks(prev => prev.map(tasks =>
        tasks.id === id ? { ...tasks, ...data } : tasks
      ));

      const tareaActualizada = await apiService.actualizarTarea(id, data);

      // Actualizar con los datos reales del servidor
      setTasks(prev => prev.map(tarea =>
        tarea.id === id ? tareaActualizada : tarea
      ));

      return tareaActualizada;
    } catch (err: any) {
      // Revertir la actualización optimista en caso de error
      await cargarTareas();
      setError(err.response?.data?.message || 'Error al actualizar la tarea');
      throw err;
    }
  };

  const eliminarTarea = async (id: string): Promise<void> => {
    try {
      setError(null);

      // Actualización optimista
      const tareaEliminada = tasks.find(t => t.id === id);
      setTasks(prev => prev.filter(task => task.id !== id));

      await apiService.eliminarTarea(id);
    } catch (err: any) {
      // Revertir la actualización optimista en caso de error
      await cargarTareas();
      setError(err.response?.data?.message || 'Error al eliminar la tarea');
      throw err;
    }
  };

  const toggleCompletarTarea = async (id: string): Promise<void> => {
    try {
      setError(null);

      // Actualización optimista
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ));

      const tareaActualizada = await apiService.toggleCompletarTarea(id);

      // Actualizar con los datos reales del servidor
      setTasks(prev => prev.map(tarea =>
        tarea.id === id ? tareaActualizada : tarea
      ));
    } catch (err: any) {
      // Revertir la actualización optimista en caso de error
      await cargarTareas();
      setError(err.response?.data?.message || 'Error al cambiar el estado de la tarea');
      throw err;
    }
  };

  const operacionesLote = async (ids: string[], operation: 'completar' | 'eliminar'): Promise<void> => {
    try {
      setError(null);

      // Actualización optimista
      if (operation === 'eliminar') {
        setTasks(prev => prev.filter(task => !ids.includes(task.id)));
      } else if (operation === 'completar') {
        setTasks(prev => prev.map(task =>
          ids.includes(task.id) ? { ...task, completed: true } : task
        ));
      }

      await apiService.operacionesLote(ids, operation);
    } catch (err: any) {
      // Revertir la actualización optimista en caso de error
      await cargarTareas();
      setError(err.response?.data?.message || 'Error en la operación en lote');
      throw err;
    }
  };

  const reordenarTareas = (startIndex: number, endIndex: number) => {
    const tareasArray = ensureArray(tasks);
    const result = Array.from(tareasArray);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setTasks(result);
  };

  const aplicarFiltros = (nuevosFiltros: FiltrosTareas) => {
    setFiltros(nuevosFiltros);
  };

  const aplicarOrden = (nuevoOrden: OrdenTareas) => {
    setOrden(nuevoOrden);
  };

  const limpiarError = () => {
    setError(null);
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