import type { OrdenTareas, Task } from '../../types';

interface DueDateSortTestProps {
  tasks: Task[];
  orden: OrdenTareas;
}

export function DueDateSortTest({ tasks, orden }: DueDateSortTestProps) {
  // Analizar las tareas por fecha de vencimiento
  const dueDateAnalysis = {
    withDueDate: tasks.filter(t => t.dueDate),
    withoutDueDate: tasks.filter(t => !t.dueDate),
    total: tasks.length
  };

  // Ordenar manualmente para comparar
  const manualSort = [...tasks].sort((a, b) => {
    let comparison = 0;

    if (!a.dueDate && !b.dueDate) {
      comparison = 0;
    } else if (!a.dueDate) {
      comparison = 1;
    } else if (!b.dueDate) {
      comparison = -1;
    } else {
      comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    return orden.direction === 'desc' ? -comparison : comparison;
  });

  // Verificar si el orden actual es correcto
  const verifyOrder = () => {
    if (tasks.length < 2) return { isCorrect: true, message: 'Menos de 2 tareas' };

    for (let i = 0; i < tasks.length - 1; i++) {
      const current = tasks[i];
      const next = tasks[i + 1];
      let comparison = 0;

      if (!current.dueDate && !next.dueDate) {
        comparison = 0;
      } else if (!current.dueDate) {
        comparison = 1;
      } else if (!next.dueDate) {
        comparison = -1;
      } else {
        comparison = new Date(current.dueDate).getTime() - new Date(next.dueDate).getTime();
      }

      const expectedOrder = orden.direction === 'asc' ? comparison <= 0 : comparison >= 0;

      if (!expectedOrder) {
        return {
          isCorrect: false,
          message: `Error en posición ${i}-${i + 1}`,
          details: {
            current: { title: current.title, dueDate: current.dueDate },
            next: { title: next.title, dueDate: next.dueDate },
            comparison,
            expectedOrder,
            direction: orden.direction
          }
        };
      }
    }

    return { isCorrect: true, message: 'Orden correcto' };
  };

  const verification = verifyOrder();

  if (orden.field !== 'dueDate') {
    return null; // Solo mostrar cuando se ordene por fecha de vencimiento
  }

  return (
    <div style={{
      backgroundColor: '#f0f9ff',
      border: '2px solid #0ea5e9',
      borderRadius: '8px',
      padding: '1rem',
      margin: '1rem 0',
      fontSize: '0.875rem'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#0ea5e9' }}>
        📅 Test Específico: Ordenamiento por Fecha de Vencimiento
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Análisis de Fechas:</h4>
          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px' }}>
            <strong>Con fecha:</strong> {dueDateAnalysis.withDueDate.length}<br />
            <strong>Sin fecha:</strong> {dueDateAnalysis.withoutDueDate.length}<br />
            <strong>Total:</strong> {dueDateAnalysis.total}<br />
            <strong>Dirección:</strong> {orden.direction}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Verificación:</h4>
          <div style={{
            backgroundColor: verification.isCorrect ? '#dcfce7' : '#fef2f2',
            padding: '0.5rem',
            borderRadius: '4px',
            border: `1px solid ${verification.isCorrect ? '#16a34a' : '#dc2626'}`
          }}>
            <strong style={{ color: verification.isCorrect ? '#16a34a' : '#dc2626' }}>
              {verification.isCorrect ? '✅' : '❌'} {verification.message}
            </strong>
            {!verification.isCorrect && verification.details && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <div><strong>Actual:</strong> {verification.details.current.title} ({verification.details.current.dueDate || 'Sin fecha'})</div>
                <div><strong>Siguiente:</strong> {verification.details.next.title} ({verification.details.next.dueDate || 'Sin fecha'})</div>
                <div><strong>Comparación:</strong> {verification.details.comparison}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Orden Actual vs Manual:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <strong>Orden Recibido:</strong>
            <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
              {tasks.slice(0, 5).map((task, index) => (
                <div key={task.id} style={{ marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  {index + 1}. {task.title} - {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                </div>
              ))}
              {tasks.length > 5 && <div style={{ color: '#6b7280' }}>... y {tasks.length - 5} más</div>}
            </div>
          </div>

          <div>
            <strong>Orden Manual:</strong>
            <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
              {manualSort.slice(0, 5).map((task, index) => (
                <div key={task.id} style={{ marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  {index + 1}. {task.title} - {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                </div>
              ))}
              {manualSort.length > 5 && <div style={{ color: '#6b7280' }}>... y {manualSort.length - 5} más</div>}
            </div>
          </div>
        </div>
      </div>

      {dueDateAnalysis.withDueDate.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Tareas con Fecha (ordenadas):</h4>
          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px' }}>
            {dueDateAnalysis.withDueDate
              .sort((a, b) => {
                const comparison = new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
                return orden.direction === 'desc' ? -comparison : comparison;
              })
              .slice(0, 3)
              .map((task, index) => (
                <div key={task.id} style={{ marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  {task.title} - {new Date(task.dueDate!).toLocaleDateString()}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
