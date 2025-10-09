import type { OrdenTareas, Task } from '../../types';

interface SortDebugProps {
  tasks: Task[];
  orden: OrdenTareas;
}

export function SortDebug({ tasks, orden }: SortDebugProps) {
  // Analizar las tareas recibidas
  const taskAnalysis = {
    total: tasks.length,
    byPriority: tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    firstThree: tasks.slice(0, 3).map(task => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      createdAt: task.createdAt,
      dueDate: task.dueDate
    })),
    lastThree: tasks.slice(-3).map(task => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      createdAt: task.createdAt,
      dueDate: task.dueDate
    }))
  };

  // Verificar si las tareas están ordenadas correctamente
  const checkSorting = () => {
    if (tasks.length < 2) return { isCorrect: true, message: 'Menos de 2 tareas, no se puede verificar orden' };

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
          // Usar la misma lógica que en taskSorting.ts para consistencia
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
        return {
          isCorrect: false,
          message: `Orden incorrecto en posición ${i}-${i + 1}: ${current.title} vs ${next.title}`,
          details: { current, next, comparison, expectedOrder }
        };
      }
    }

    return { isCorrect: true, message: 'Orden correcto' };
  };

  const sortingCheck = checkSorting();

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      border: '2px solid #f59e0b',
      borderRadius: '8px',
      padding: '1rem',
      margin: '1rem 0',
      fontSize: '0.875rem'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#f59e0b' }}>
        🔍 Debug de Ordenamiento
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Configuración Actual:</h4>
          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px' }}>
            <strong>Campo:</strong> {orden.field}<br />
            <strong>Dirección:</strong> {orden.direction}<br />
            <strong>Total tareas:</strong> {taskAnalysis.total}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Verificación de Orden:</h4>
          <div style={{
            backgroundColor: sortingCheck.isCorrect ? '#dcfce7' : '#fef2f2',
            padding: '0.5rem',
            borderRadius: '4px',
            border: `1px solid ${sortingCheck.isCorrect ? '#16a34a' : '#dc2626'}`
          }}>
            <strong style={{ color: sortingCheck.isCorrect ? '#16a34a' : '#dc2626' }}>
              {sortingCheck.isCorrect ? '✅' : '❌'} {sortingCheck.message}
            </strong>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Distribución por Prioridad:</h4>
        <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px' }}>
          Alta: {taskAnalysis.byPriority.alta || 0} |
          Media: {taskAnalysis.byPriority.media || 0} |
          Baja: {taskAnalysis.byPriority.baja || 0}
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Primeras 3 Tareas:</h4>
        <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px' }}>
          {taskAnalysis.firstThree.map((task, index) => (
            <div key={task.id} style={{ marginBottom: '0.25rem' }}>
              {index + 1}. <strong>{task.title}</strong> - {task.priority} - {new Date(task.createdAt).toLocaleDateString()}
            </div>
          ))}
        </div>
      </div>

      {taskAnalysis.total > 3 && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Últimas 3 Tareas:</h4>
          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px' }}>
            {taskAnalysis.lastThree.map((task, index) => (
              <div key={task.id} style={{ marginBottom: '0.25rem' }}>
                {taskAnalysis.total - 2 + index}. <strong>{task.title}</strong> - {task.priority} - {new Date(task.createdAt).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
