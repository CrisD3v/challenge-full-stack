import styled from 'styled-components';
import type { FiltrosTareas, Task } from '../../types';

const DebugContainer = styled.div`
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 0.75rem;
`;

const DebugTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: var(--color-primary);
`;

const DebugSection = styled.div`
  margin-bottom: 0.75rem;
`;

const DebugLabel = styled.div`
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.25rem;
`;

const DebugValue = styled.pre`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
`;

interface FilterDebugProps {
  filtros: FiltrosTareas;
  tasks: Task[];
  isLoading: boolean;
}

export function FilterDebug({ filtros, tasks, isLoading }: FilterDebugProps) {
  // Análisis de las tareas por prioridad
  const tasksByPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filtrar tareas manualmente para comparar
  const manuallyFilteredTasks = tasks.filter(task => {
    if (filtros.priority && task.priority !== filtros.priority) {
      return false;
    }
    if (typeof filtros.completed === 'boolean' && task.completed !== filtros.completed) {
      return false;
    }
    return true;
  });

  return (
    <DebugContainer>
      <DebugTitle>🐛 Filter Debug Info</DebugTitle>

      <DebugSection>
        <DebugLabel>Current Filters:</DebugLabel>
        <DebugValue>{JSON.stringify(filtros, null, 2)}</DebugValue>
      </DebugSection>

      <DebugSection>
        <DebugLabel>Loading State:</DebugLabel>
        <DebugValue>{isLoading ? 'Loading...' : 'Loaded'}</DebugValue>
      </DebugSection>

      <DebugSection>
        <DebugLabel>Total Tasks Received:</DebugLabel>
        <DebugValue>{tasks.length}</DebugValue>
      </DebugSection>

      <DebugSection>
        <DebugLabel>Tasks by Priority:</DebugLabel>
        <DebugValue>{JSON.stringify(tasksByPriority, null, 2)}</DebugValue>
      </DebugSection>

      <DebugSection>
        <DebugLabel>Manually Filtered Tasks (Frontend Logic):</DebugLabel>
        <DebugValue>{manuallyFilteredTasks.length} tasks would match</DebugValue>
      </DebugSection>

      {filtros.priority && (
        <DebugSection>
          <DebugLabel>Tasks with Priority "{filtros.priority}":</DebugLabel>
          <DebugValue>
            {tasks
              .filter(task => task.priority === filtros.priority)
              .map(task => `${task.id}: ${task.title} (${task.priority})`)
              .join('\n') || 'No tasks found with this priority'}
          </DebugValue>
        </DebugSection>
      )}

      <DebugSection>
        <DebugLabel>Sample Tasks (first 3):</DebugLabel>
        <DebugValue>
          {tasks.slice(0, 3).map(task =>
            `${task.id}: ${task.title} - Priority: ${task.priority}, Completed: ${task.completed}`
          ).join('\n') || 'No tasks available'}
        </DebugValue>
      </DebugSection>
    </DebugContainer>
  );
}
