import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { FiltrosTareas, Task } from '../../types';

const FixContainer = styled.div`
  background-color: var(--color-warning-bg, #fef3c7);
  border: 1px solid var(--color-warning-border, #f59e0b);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const FixTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: var(--color-warning, #f59e0b);
`;

const FixButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;

  &:hover {
    background-color: var(--color-primary-dark);
  }
`;

interface PriorityFilterFixProps {
  filtros: FiltrosTareas;
  tasks: Task[];
  onFiltrosChange: (filtros: FiltrosTareas) => void;
}

export function PriorityFilterFix({ filtros, tasks, onFiltrosChange }: PriorityFilterFixProps) {
  const [showFix, setShowFix] = useState(false);
  const [clientFilteredTasks, setClientFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Verificar si hay un problema con el filtro de prioridad
    if (filtros.priority && tasks.length > 0) {
      const manuallyFiltered = tasks.filter(task => task.priority === filtros.priority);
      setClientFilteredTasks(manuallyFiltered);

      // Si el filtro está activo pero no hay cambios en las tareas mostradas,
      // es probable que haya un problema
      const allPriorities = tasks.map(t => t.priority);
      const hasTasksWithPriority = allPriorities.includes(filtros.priority);

      if (hasTasksWithPriority && tasks.length === manuallyFiltered.length) {
        // Todas las tareas tienen la misma prioridad, el filtro puede no estar funcionando
        setShowFix(false);
      } else if (hasTasksWithPriority && manuallyFiltered.length === 0) {
        // Hay tareas con esa prioridad pero el filtro no las muestra
        setShowFix(true);
      } else {
        setShowFix(false);
      }
    } else {
      setShowFix(false);
      setClientFilteredTasks([]);
    }
  }, [filtros.priority, tasks]);

  const handleApplyClientFilter = () => {
    // Forzar un refresh del filtro
    const newFiltros = { ...filtros };
    delete newFiltros.priority;
    onFiltrosChange(newFiltros);

    // Luego volver a aplicar el filtro
    setTimeout(() => {
      onFiltrosChange({ ...newFiltros, priority: filtros.priority });
    }, 100);
  };

  const handleClearFilter = () => {
    const newFiltros = { ...filtros };
    delete newFiltros.priority;
    onFiltrosChange(newFiltros);
    setShowFix(false);
  };

  if (!showFix || !filtros.priority) {
    return null;
  }

  return (
    <FixContainer>
      <FixTitle>🔧 Problema detectado con el filtro de prioridad</FixTitle>
      <p>
        El filtro de prioridad "{filtros.priority}" parece no estar funcionando correctamente.
        Se encontraron {clientFilteredTasks.length} tareas con esta prioridad, pero no se están mostrando.
      </p>
      <div>
        <FixButton onClick={handleApplyClientFilter}>
          Reintentar Filtro
        </FixButton>
        <FixButton onClick={handleClearFilter}>
          Limpiar Filtro
        </FixButton>
      </div>
    </FixContainer>
  );
}
