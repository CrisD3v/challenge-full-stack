import type { OrdenTareas, Task } from '../types';

/**
 * Aplica ordenamiento a una lista de tareas del lado del cliente
 * Útil como fallback o para verificar el ordenamiento del servidor
 */
export function sortTasks(tasks: Task[], orden: OrdenTareas): Task[] {
  if (!tasks || tasks.length === 0) return [];

  console.log('sortTasks: Sorting tasks', {
    count: tasks.length,
    field: orden.field,
    direction: orden.direction
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (orden.field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;

      case 'priority':
        const priorityOrder = { 'baja': 1, 'media': 2, 'alta': 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;

      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;

      case 'dueDate':
        // Manejar tareas sin fecha de vencimiento
        // Las tareas sin fecha van al final independientemente de la dirección
        if (!a.dueDate && !b.dueDate) {
          comparison = 0; // Ambas sin fecha, mantener orden actual
        } else if (!a.dueDate) {
          comparison = 1; // a sin fecha va después de b
        } else if (!b.dueDate) {
          comparison = -1; // b sin fecha va después de a
        } else {
          // Ambas tienen fecha, comparar normalmente
          const aTime = new Date(a.dueDate).getTime();
          const bTime = new Date(b.dueDate).getTime();
          comparison = aTime - bTime;

          // Debug específico para dueDate
          if (Math.abs(comparison) > 0) {
            console.log('sortTasks dueDate comparison:', {
              taskA: { title: a.title, dueDate: a.dueDate, time: aTime },
              taskB: { title: b.title, dueDate: b.dueDate, time: bTime },
              comparison,
              direction: orden.direction
            });
          }
        }
        break;

      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;

      default:
        console.warn('sortTasks: Unknown sort field:', orden.field);
        comparison = 0;
    }

    // Aplicar dirección de ordenamiento
    const result = orden.direction === 'desc' ? -comparison : comparison;

    return result;
  });

  console.log('sortTasks: Sorting completed', {
    originalFirst: tasks[0]?.title,
    sortedFirst: sortedTasks[0]?.title,
    originalLast: tasks[tasks.length - 1]?.title,
    sortedLast: sortedTasks[sortedTasks.length - 1]?.title
  });

  return sortedTasks;
}

/**
 * Verifica si una lista de tareas está correctamente ordenada
 */
export function verifySorting(tasks: Task[], orden: OrdenTareas): {
  isCorrect: boolean;
  errors: string[];
  details?: any;
} {
  if (tasks.length < 2) {
    return { isCorrect: true, errors: [] };
  }

  const errors: string[] = [];

  for (let i = 0; i < tasks.length - 1; i++) {
    const current = tasks[i];
    const next = tasks[i + 1];
    let comparison = 0;

    switch (orden.field) {
      case 'title':
        comparison = current.title.localeCompare(next.title);
        break;
      case 'priority':
        const priorityOrder = { 'baja': 1, 'media': 2, 'alta': 3 };
        comparison = priorityOrder[current.priority] - priorityOrder[next.priority];
        break;
      case 'createdAt':
        comparison = new Date(current.createdAt).getTime() - new Date(next.createdAt).getTime();
        break;
      case 'dueDate':
        // Usar la misma lógica que en sortTasks para consistencia
        if (!current.dueDate && !next.dueDate) {
          comparison = 0; // Ambas sin fecha, mantener orden actual
        } else if (!current.dueDate) {
          comparison = 1; // current sin fecha va después de next
        } else if (!next.dueDate) {
          comparison = -1; // next sin fecha va después de current
        } else {
          // Ambas tienen fecha, comparar normalmente
          comparison = new Date(current.dueDate).getTime() - new Date(next.dueDate).getTime();
        }
        break;
    }

    const expectedOrder = orden.direction === 'asc' ? comparison <= 0 : comparison >= 0;

    if (!expectedOrder) {
      errors.push(`Orden incorrecto en posición ${i}-${i + 1}: "${current.title}" vs "${next.title}"`);
    }
  }

  return {
    isCorrect: errors.length === 0,
    errors,
    details: errors.length > 0 ? {
      field: orden.field,
      direction: orden.direction,
      firstError: errors[0]
    } : undefined
  };
}

/**
 * Aplica ordenamiento híbrido: intenta usar el del servidor, pero aplica ordenamiento local si es necesario
 */
export function applyHybridSorting(
  tasks: Task[],
  orden: OrdenTareas,
  forceClientSide: boolean = false
): {
  tasks: Task[];
  usedClientSide: boolean;
  verification: ReturnType<typeof verifySorting>;
} {
  console.log('applyHybridSorting: Starting hybrid sorting', {
    taskCount: tasks.length,
    order: orden,
    forceClientSide
  });

  // Si se fuerza el ordenamiento del cliente, aplicarlo directamente
  if (forceClientSide) {
    const sortedTasks = sortTasks(tasks, orden);
    const verification = verifySorting(sortedTasks, orden);

    return {
      tasks: sortedTasks,
      usedClientSide: true,
      verification
    };
  }

  // Verificar si las tareas del servidor están correctamente ordenadas
  const verification = verifySorting(tasks, orden);

  if (verification.isCorrect) {
    console.log('applyHybridSorting: Server sorting is correct');
    return {
      tasks,
      usedClientSide: false,
      verification
    };
  }

  // Si el ordenamiento del servidor es incorrecto, aplicar ordenamiento del cliente
  console.warn('applyHybridSorting: Server sorting is incorrect, applying client-side sorting');
  console.warn('applyHybridSorting: Sorting errors:', verification.errors);

  const sortedTasks = sortTasks(tasks, orden);
  const newVerification = verifySorting(sortedTasks, orden);

  return {
    tasks: sortedTasks,
    usedClientSide: true,
    verification: newVerification
  };
}
