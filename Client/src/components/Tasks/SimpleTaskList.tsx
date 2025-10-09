import type { OrdenTareas, Task } from '../../types';

interface SimpleTaskListProps {
  tasks: Task[];
  orden: OrdenTareas;
}

export function SimpleTaskList({ tasks, orden }: SimpleTaskListProps) {
  // Aplicar ordenamiento local para verificar
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
        // Usar la misma lógica que en taskSorting.ts para consistencia
        if (!a.dueDate && !b.dueDate) {
          comparison = 0; // Ambas sin fecha, mantener orden actual
        } else if (!a.dueDate) {
          comparison = 1; // a sin fecha va después de b
        } else if (!b.dueDate) {
          comparison = -1; // b sin fecha va después de a
        } else {
          // Ambas tienen fecha, comparar normalmente
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        break;
      default:
        comparison = 0;
    }

    return orden.direction === 'desc' ? -comparison : comparison;
  });

  console.log('SimpleTaskList: Sorting applied', {
    originalCount: tasks.length,
    sortedCount: sortedTasks.length,
    field: orden.field,
    direction: orden.direction,
    firstThree: sortedTasks.slice(0, 3).map(t => ({
      title: t.title,
      priority: t.priority,
      createdAt: t.createdAt
    }))
  });

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      border: '2px solid #10b981',
      borderRadius: '8px',
      padding: '1rem',
      margin: '1rem 0'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#10b981' }}>
        📋 Lista Simple de Tareas (Ordenamiento Local)
      </h3>

      <div style={{
        fontSize: '0.875rem',
        marginBottom: '1rem',
        color: '#374151',
        backgroundColor: 'white',
        padding: '0.5rem',
        borderRadius: '4px'
      }}>
        <strong>Ordenamiento:</strong> {orden.field} ({orden.direction})<br />
        <strong>Total tareas:</strong> {tasks.length}<br />
        <strong>Tareas ordenadas:</strong> {sortedTasks.length}
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {sortedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            No hay tareas para mostrar
          </div>
        ) : (
          sortedTasks.map((task, index) => (
            <div
              key={task.id}
              style={{
                padding: '0.75rem',
                margin: '0.5rem 0',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                #{index + 1} - {task.title}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                Prioridad: <span style={{
                  color: task.priority === 'alta' ? '#ef4444' :
                    task.priority === 'media' ? '#f59e0b' : '#10b981',
                  fontWeight: 'bold'
                }}>
                  {task.priority}
                </span> |
                Creado: {new Date(task.createdAt).toLocaleDateString()}
                {task.dueDate && ` | Vence: ${new Date(task.dueDate).toLocaleDateString()}`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
