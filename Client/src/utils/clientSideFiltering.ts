import type { FiltrosTareas, Task } from '../types';

/**
 * Aplica filtros del lado del cliente como fallback
 * Útil cuando el backend no está funcionando correctamente o como validación adicional
 */
export function applyClientSideFilters(tasks: Task[], filtros: FiltrosTareas): Task[] {
  if (!Array.isArray(tasks)) {
    console.warn('clientSideFiltering: tasks is not an array:', tasks);
    return [];
  }

  let filteredTasks = [...tasks];

  // Filtro de estado completado
  if (typeof filtros.completed === 'boolean') {
    filteredTasks = filteredTasks.filter(task => task.completed === filtros.completed);
    console.log(`clientSideFiltering: Applied completed filter (${filtros.completed}), ${filteredTasks.length} tasks remaining`);
  }

  // Filtro de prioridad
  if (filtros.priority && ['baja', 'media', 'alta'].includes(filtros.priority)) {
    const beforeCount = filteredTasks.length;
    filteredTasks = filteredTasks.filter(task => task.priority === filtros.priority);
    console.log(`clientSideFiltering: Applied priority filter (${filtros.priority}), ${beforeCount} -> ${filteredTasks.length} tasks`);

    // Debug: mostrar las prioridades de todas las tareas
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('clientSideFiltering: Priority distribution in all tasks:', priorityCounts);
  }

  // Filtro de categoría
  if (filtros.categoryId) {
    filteredTasks = filteredTasks.filter(task => task.categoryId === filtros.categoryId);
    console.log(`clientSideFiltering: Applied category filter (${filtros.categoryId}), ${filteredTasks.length} tasks remaining`);
  }

  // Filtro de etiqueta
  if (filtros.tagId) {
    filteredTasks = filteredTasks.filter(task =>
      task.tags && task.tags.some(tag => tag.id === filtros.tagId)
    );
    console.log(`clientSideFiltering: Applied tag filter (${filtros.tagId}), ${filteredTasks.length} tasks remaining`);
  }

  // Filtro de búsqueda
  if (filtros.search && filtros.search.trim()) {
    const searchTerm = filtros.search.trim().toLowerCase();
    filteredTasks = filteredTasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm))
    );
    console.log(`clientSideFiltering: Applied search filter ("${searchTerm}"), ${filteredTasks.length} tasks remaining`);
  }

  // Filtros de fecha
  if (filtros.sinceDate) {
    const sinceDate = new Date(filtros.sinceDate);
    if (!isNaN(sinceDate.getTime())) {
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= sinceDate;
      });
      console.log(`clientSideFiltering: Applied since date filter (${filtros.sinceDate}), ${filteredTasks.length} tasks remaining`);
    }
  }

  if (filtros.untilDate) {
    const untilDate = new Date(filtros.untilDate);
    if (!isNaN(untilDate.getTime())) {
      // Agregar 23:59:59 al día para incluir todo el día
      untilDate.setHours(23, 59, 59, 999);
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate <= untilDate;
      });
      console.log(`clientSideFiltering: Applied until date filter (${filtros.untilDate}), ${filteredTasks.length} tasks remaining`);
    }
  }

  console.log(`clientSideFiltering: Final result: ${filteredTasks.length} tasks after all filters`);
  return filteredTasks;
}

/**
 * Compara los resultados del filtrado del servidor con el filtrado local
 * Útil para detectar inconsistencias
 */
export function validateServerFiltering(
  serverTasks: Task[],
  allTasks: Task[],
  filtros: FiltrosTareas
): {
  isConsistent: boolean;
  serverCount: number;
  clientCount: number;
  difference: number;
} {
  const clientFiltered = applyClientSideFilters(allTasks, filtros);

  const result = {
    isConsistent: serverTasks.length === clientFiltered.length,
    serverCount: serverTasks.length,
    clientCount: clientFiltered.length,
    difference: Math.abs(serverTasks.length - clientFiltered.length)
  };

  if (!result.isConsistent) {
    console.warn('validateServerFiltering: Server and client filtering results differ:', result);
    console.warn('validateServerFiltering: Server tasks:', serverTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority })));
    console.warn('validateServerFiltering: Client filtered tasks:', clientFiltered.map(t => ({ id: t.id, title: t.title, priority: t.priority })));
  }

  return result;
}

/**
 * Determina si deberíamos usar filtrado del lado del cliente como fallback
 */
export function shouldUseClientSideFiltering(
  serverTasks: Task[],
  filtros: FiltrosTareas,
  hasServerError: boolean = false
): boolean {
  // Usar filtrado local si hay error del servidor
  if (hasServerError) {
    console.log('shouldUseClientSideFiltering: Using client-side filtering due to server error');
    return true;
  }

  // Usar filtrado local si no hay filtros activos pero el servidor devolvió datos filtrados
  const hasActiveFilters = Object.keys(filtros).some(key => {
    const value = filtros[key as keyof FiltrosTareas];
    return value !== undefined && value !== null && value !== '';
  });

  if (!hasActiveFilters && serverTasks.length === 0) {
    console.log('shouldUseClientSideFiltering: No active filters but server returned empty results');
    return true;
  }

  return false;
}
