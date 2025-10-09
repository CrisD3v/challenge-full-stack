import styled from 'styled-components';
import type { FiltrosTareas, Task } from '../../types';

const TestContainer = styled.div`
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const TestTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: var(--color-primary);
  font-size: 1rem;
`;

const TestButton = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 0.75rem 1rem;
  margin: 0.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  background-color: ${props => props.$active ? (props.$color || '#3b82f6') : '#6b7280'};
  color: white;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TestInfo = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--color-bg);
  border-radius: 6px;
  font-size: 0.875rem;
  line-height: 1.4;
`;

const TestResult = styled.div<{ $success?: boolean }>`
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: ${props => props.$success ? '#dcfce7' : '#fef2f2'};
  color: ${props => props.$success ? '#166534' : '#dc2626'};
  border: 1px solid ${props => props.$success ? '#bbf7d0' : '#fecaca'};
`;

interface SimplePriorityTestProps {
  filtros: FiltrosTareas;
  tasks: Task[];
  onFiltrosChange: (filtros: FiltrosTareas) => void;
}

export function SimplePriorityTest({ filtros, tasks, onFiltrosChange }: SimplePriorityTestProps) {
  // Contar tareas por prioridad
  const taskCounts = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Función simple para aplicar filtro
  const applyFilter = (priority: string | undefined) => {
    console.log('SimplePriorityTest: Applying filter', priority);

    const newFiltros = { ...filtros };
    if (priority) {
      newFiltros.priority = priority as any;
    } else {
      delete newFiltros.priority;
    }

    console.log('SimplePriorityTest: New filters', newFiltros);
    onFiltrosChange(newFiltros);
  };

  // Verificar si el filtro está funcionando
  const isWorking = () => {
    if (!filtros.priority) return true; // Sin filtro, todo está bien

    const expectedCount = taskCounts[filtros.priority] || 0;
    const actualCount = tasks.length;

    return expectedCount === actualCount;
  };

  return (
    <TestContainer>
      <TestTitle>🧪 Test Simple de Filtro de Prioridad</TestTitle>

      <div>
        <TestButton
          $active={!filtros.priority}
          $color="#374151"
          onClick={() => applyFilter(undefined)}
        >
          Todas ({taskCounts.total || 0})
        </TestButton>

        <TestButton
          $active={filtros.priority === 'alta'}
          $color="#ef4444"
          onClick={() => applyFilter('alta')}
        >
          Alta ({taskCounts.alta || 0})
        </TestButton>

        <TestButton
          $active={filtros.priority === 'media'}
          $color="#f59e0b"
          onClick={() => applyFilter('media')}
        >
          Media ({taskCounts.media || 0})
        </TestButton>

        <TestButton
          $active={filtros.priority === 'baja'}
          $color="#10b981"
          onClick={() => applyFilter('baja')}
        >
          Baja ({taskCounts.baja || 0})
        </TestButton>
      </div>

      <TestInfo>
        <strong>Estado Actual:</strong><br />
        • Filtro activo: {filtros.priority || 'Ninguno'}<br />
        • Tareas mostradas: {tasks.length}<br />
        • Total de tareas: {taskCounts.total || 0}<br />
        • Distribución: Alta({taskCounts.alta || 0}), Media({taskCounts.media || 0}), Baja({taskCounts.baja || 0})

        <TestResult $success={isWorking()}>
          {isWorking()
            ? '✅ El filtro está funcionando correctamente'
            : '❌ El filtro no está funcionando como esperado'
          }
        </TestResult>
      </TestInfo>
    </TestContainer>
  );
}
