import React, { useState } from 'react';
import styled from 'styled-components';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import type { Task } from '../../types';
import { Loading } from '../Commons/Loading';
import { ItemTask } from './ItemTask';

const ListContainer = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
`;

const ListHeader = styled.div`
  padding: 1rem 1.5rem;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: stretch;
  }
`;

const TaskCount = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const BulkActions = styled.div<{ $visible: boolean }>`
  display: ${props => props.$visible ? 'flex' : 'none'};
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const BulkButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: var(--color-bg-secondary);
  }

  &.danger {
    border-color: var(--color-error);
    color: var(--color-error);

    &:hover {
      background-color: var(--color-error-bg);
    }
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }
`;

const SelectAllCheckbox = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const TaskList = styled.div`
  max-height: 70vh;
  overflow-y: auto;
  position: relative;

  @media (max-width: 768px) {
    max-height: 60vh;
  }

  /* Scrollbar personalizado */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-text-secondary);
  }
`;

const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--color-text-secondary);

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 1.25rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

interface ListTasksProps {
  tareas: Task[];
  isLoading: boolean;
  onEditarTarea: (tarea: Task) => void;
}

export function ListTasks({ tareas, isLoading, onEditarTarea }: ListTasksProps) {
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState<Set<string>>(new Set());

  // Convert tareas to array early to avoid initialization issues
  const tareasArray = Array.isArray(tareas) ? tareas : [];

  // Estado local para las tareas reordenadas
  const [tareasLocales, setTareasLocales] = useState<Task[]>(tareasArray);

  // Actualizar tareas locales cuando cambien las props
  React.useEffect(() => {
    setTareasLocales(tareasArray);
  }, [tareasArray]);

  // Debug logs
  console.log('ListaTareas - tareas recibidas:', tareas);
  console.log('ListaTareas - isLoading:', isLoading);
  console.log('ListaTareas - Array.isArray(tareas):', Array.isArray(tareas));

  const handleSeleccionarTarea = (tareaId: string, seleccionada: boolean) => {
    const nuevasSeleccionadas = new Set(tareasSeleccionadas);
    if (seleccionada) {
      nuevasSeleccionadas.add(tareaId);
    } else {
      nuevasSeleccionadas.delete(tareaId);
    }
    setTareasSeleccionadas(nuevasSeleccionadas);
  };

  const handleSeleccionarTodas = (seleccionar: boolean) => {
    if (seleccionar) {
      setTareasSeleccionadas(new Set(tareasLocales.map(t => t.id)));
    } else {
      setTareasSeleccionadas(new Set());
    }
  };

  const handleCompletarSeleccionadas = async () => {
    // TODO: Implementar operación en lote
    console.log('Completar seleccionadas:', Array.from(tareasSeleccionadas));
    setTareasSeleccionadas(new Set());
  };

  const handleEliminarSeleccionadas = async () => {
    if (window.confirm(`¿Estás seguro de eliminar ${tareasSeleccionadas.size} tareas?`)) {
      // TODO: Implementar operación en lote
      console.log('Eliminar seleccionadas:', Array.from(tareasSeleccionadas));
      setTareasSeleccionadas(new Set());
    }
  };

  // Configurar drag and drop personalizado
  const {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  } = useDragAndDrop(tareasLocales, (reorderedItems) => {
    // Actualizar el estado local con las tareas reordenadas
    console.log('Tareas reordenadas:', reorderedItems);
    setTareasLocales(reorderedItems);
    // Aquí podrías hacer una llamada al backend para persistir el orden
  });

  const todasSeleccionadas = tareasSeleccionadas.size === tareasLocales.length && tareasLocales.length > 0;
  const algunasSeleccionadas = tareasSeleccionadas.size > 0;

  if (isLoading && tareasLocales.length === 0) {
    return (
      <ListContainer>
        <div style={{ padding: '2rem' }}>
          <Loading texto="Cargando tareas..." />
        </div>
      </ListContainer>
    );
  }

  if (tareasLocales.length === 0) {
    return (
      <ListContainer>
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>No hay tareas</EmptyTitle>
          <EmptyDescription>
            Crea tu primera tarea para comenzar a organizar tu trabajo
          </EmptyDescription>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <ListHeader>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SelectAllCheckbox
            type="checkbox"
            checked={todasSeleccionadas}
            onChange={(e) => handleSeleccionarTodas(e.target.checked)}
          />
          <TaskCount>
            {tareasLocales.length} tarea{tareasLocales.length !== 1 ? 's' : ''}
            {algunasSeleccionadas && ` • ${tareasSeleccionadas.size} seleccionada${tareasSeleccionadas.size !== 1 ? 's' : ''}`}
          </TaskCount>
        </div>

        <BulkActions $visible={algunasSeleccionadas}>
          <BulkButton onClick={handleCompletarSeleccionadas}>
            ✓ Completar
          </BulkButton>
          <BulkButton className="danger" onClick={handleEliminarSeleccionadas}>
            🗑️ Eliminar
          </BulkButton>
        </BulkActions>
      </ListHeader>

      <TaskList>
        {tareasLocales.map((tarea, index) => (
          <ItemTask
            key={tarea.id}
            tarea={tarea}
            seleccionada={tareasSeleccionadas.has(tarea.id)}
            onSeleccionar={(seleccionada) =>
              handleSeleccionarTarea(tarea.id, seleccionada)
            }
            onEditar={() => onEditarTarea(tarea)}
            isDragging={draggedItem?.id === tarea.id}
            isDragOver={dragOverIndex === index}
            onDragStart={(e) => handleDragStart(e, tarea)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </TaskList>
    </ListContainer>
  );
}