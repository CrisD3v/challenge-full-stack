import { useState } from 'react';
import styled from 'styled-components';
import { useTasks } from '../../hooks/useTasks';
import type { Task } from '../../types';
import { esFechaVencida, formatearFecha, obtenerColorPrioridad, truncarTexto } from '../../utils/helpers';

const TaskItem = styled.div<{ $isDragging?: boolean; $isDragOver?: boolean; $completada?: boolean }>`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background-color: ${props => {
    if (props.$isDragging) return 'var(--color-bg-secondary)';
    if (props.$isDragOver) return 'var(--color-primary-light)';
    return 'var(--color-bg)';
  }};
  opacity: ${props => {
    if (props.$isDragging) return 0.8;
    if (props.$completada) return 0.7;
    return 1;
  }};
  transition: all 0.2s ease;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'default'};
  transform: ${props => props.$isDragging ? 'scale(1.02)' : 'scale(1)'};
  box-shadow: ${props => props.$isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
  border-left: ${props => props.$isDragOver ? '3px solid var(--color-primary)' : '3px solid transparent'};
  position: relative;

  &:hover {
    background-color: var(--color-bg-secondary);
  }

  &:last-child {
    border-bottom: none;
  }

  /* Indicador de drop zone */
  ${props => props.$isDragOver && `
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--color-primary);
      border-radius: 2px;
      z-index: 10;
    }
  `}

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
  }
`;

const TaskContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const TaskCheckbox = styled.input`
  margin-top: 0.25rem;
  cursor: pointer;
`;

const TaskMain = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    flex-wrap: wrap;
  }
`;

const TaskTitle = styled.h3<{ $completada?: boolean }>`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: ${props => props.$completada ? 'line-through' : 'none'};
  word-break: break-word;
`;

const TaskActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;

  ${TaskItem}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1;
    gap: 0.25rem;
  }

  @media (max-width: 480px) {
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text);
  }

  &.danger:hover {
    background-color: var(--color-error-bg);
    color: var(--color-error);
  }
`;

const TaskDescription = styled.p`
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
`;

const TaskMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.75rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    font-size: 0.7rem;
  }

  @media (max-width: 480px) {
    gap: 0.25rem;
    font-size: 0.65rem;
  }
`;

const PriorityBadge = styled.span<{ $priority: 'baja' | 'media' | 'alta' }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  background-color: ${props => {
    const color = obtenerColorPrioridad(props.$priority);
    return `${color}20`;
  }};
  color: ${props => obtenerColorPrioridad(props.$priority)};
  text-transform: capitalize;
`;

const CategoryBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const TagBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.7rem;
`;

const DueDate = styled.span<{ $vencida?: boolean }>`
  color: ${props => props.$vencida ? 'var(--color-error)' : 'var(--color-text-secondary)'};
  font-weight: ${props => props.$vencida ? 500 : 400};
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  cursor: grab;
  padding: 0.25rem;
  font-size: 1rem;
  user-select: none;
  transition: all 0.2s;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    color: var(--color-primary);
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.2rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

interface ItemTaskProps {
  tarea: Task;
  seleccionada: boolean;
  onSeleccionar: (seleccionada: boolean) => void;
  onEditar: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export function ItemTask({
  tarea,
  seleccionada,
  onSeleccionar,
  onEditar,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}: ItemTaskProps) {
  const { toggleCompletarTarea, eliminarTarea } = useTasks();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleCompletada = async () => {
    try {
      setIsUpdating(true);
      await toggleCompletarTarea(tarea.id);
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEliminar = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        await eliminarTarea(tarea.id);
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    }
  };

  const fechaVencida = tarea.dueDate && esFechaVencida(tarea.dueDate);

  return (
    <TaskItem
      draggable
      $isDragging={isDragging}
      $isDragOver={isDragOver}
      $completada={tarea.completed}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <TaskContent>
        <TaskCheckbox
          type="checkbox"
          checked={seleccionada}
          onChange={(e) => onSeleccionar(e.target.checked)}
        />

        <DragHandle title="Arrastrar para reordenar">
          ⋮⋮
        </DragHandle>

        <TaskMain>
          <TaskHeader>
            <TaskTitle $completada={tarea.completed}>
              {tarea.title}
            </TaskTitle>

            <TaskActions>
              <ActionButton
                onClick={handleToggleCompletada}
                disabled={isUpdating}
                title={tarea.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
              >
                {tarea.completed ? '↶' : '✓'}
              </ActionButton>
              <ActionButton onClick={onEditar} title="Editar tarea">
                ✏️
              </ActionButton>
              <ActionButton
                className="danger"
                onClick={handleEliminar}
                title="Eliminar tarea"
              >
                🗑️
              </ActionButton>
            </TaskActions>
          </TaskHeader>

          {tarea.description && (
            <TaskDescription>
              {truncarTexto(tarea.description, 150)}
            </TaskDescription>
          )}

          <TaskMeta>
            <PriorityBadge $priority={tarea.priority}>
              {tarea.priority}
            </PriorityBadge>

            {tarea.categories && (
              <CategoryBadge>
                📁 {tarea.categories.name}
              </CategoryBadge>
            )}

            {tarea.tags && tarea.tags.length > 0 && (
              <>
                {tarea.tags.slice(0, 3).map((tag) => (
                  <TagBadge key={tag.id}>
                    #{tag.name}
                  </TagBadge>
                ))}
                {tarea.tags.length > 3 && (
                  <TagBadge>
                    +{tarea.tags.length - 3} más
                  </TagBadge>
                )}
              </>
            )}

            {tarea.dueDate && (
              <DueDate $vencida={fechaVencida || false}>
                📅 {formatearFecha(tarea.dueDate)}
                {fechaVencida && ' (Vencida)'}
              </DueDate>
            )}

            <span style={{ color: 'var(--color-text-secondary)' }}>
              Creada {formatearFecha(tarea.createdAt)}
            </span>
          </TaskMeta>
        </TaskMain>
      </TaskContent>
    </TaskItem>
  );
}