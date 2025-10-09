import styled from 'styled-components';
import type {
  ActiveFilterIndicator,
  FilterIndicatorsProps,
  SortDirection,
  TaskPriority,
  TaskSortField
} from '../../types';

const IndicatorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const IndicatorsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TaskCounter = styled.div`
  font-size: 0.875rem;
  color: var(--color-text);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '📊';
    font-size: 1rem;
  }
`;

const ClearAllButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &:hover {
    background-color: var(--color-danger, #ef4444);
    border-color: var(--color-danger, #ef4444);
    color: white;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background-color: var(--color-primary);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }
`;

const FilterLabel = styled.span`
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;



// Using the type from the main types file

export function FilterIndicators({
  filtros,
  orden,
  totalTasks,
  filteredTasks,
  categorias = [],
  etiquetas = [],
  onRemoveFilter,
  onResetOrder,
  onClearAll,
  isLoading = false
}: FilterIndicatorsProps) {
  // Función para obtener el nombre de una categoría por ID
  const getCategoryName = (categoryId: string): string => {
    const category = categorias.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría desconocida';
  };

  // Función para obtener el nombre de una etiqueta por ID
  const getTagName = (tagId: string): string => {
    const tag = etiquetas.find(tag => tag.id === tagId);
    return tag ? tag.name : 'Etiqueta desconocida';
  };

  // Función para formatear el valor de prioridad con type safety
  const formatPriority = (priority: TaskPriority): string => {
    const priorityMap: Record<TaskPriority, string> = {
      'alta': 'Alta',
      'media': 'Media',
      'baja': 'Baja'
    };
    return priorityMap[priority];
  };

  // Función para formatear fechas
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Función para formatear el campo de ordenamiento
  const formatSortField = (field: TaskSortField): string => {
    const fieldMap: Record<TaskSortField, string> = {
      'title': 'Título',
      'priority': 'Prioridad',
      'dueDate': 'Fecha límite',
      'createdAt': 'Fecha de creación',
      'updatedAt': 'Última actualización'
    };
    return fieldMap[field];
  };

  // Función para formatear la dirección de ordenamiento
  const formatSortDirection = (direction: SortDirection): string => {
    return direction === 'asc' ? 'Ascendente' : 'Descendente';
  };

  // Generar array de filtros activos con mejor tipado
  const activeFilters: ActiveFilterIndicator[] = [];

  if (filtros.search) {
    activeFilters.push({
      key: 'search',
      label: 'Búsqueda',
      value: `"${filtros.search}"`,
      removable: true,
      type: 'filter'
    });
  }

  if (filtros.completed !== undefined) {
    activeFilters.push({
      key: 'completed',
      label: 'Estado',
      value: filtros.completed ? 'Completadas' : 'Pendientes',
      color: filtros.completed ? '#10b981' : '#f59e0b',
      removable: true,
      type: 'filter'
    });
  }

  if (filtros.priority) {
    const priorityColors: Record<TaskPriority, string> = {
      'alta': '#ef4444',
      'media': '#f59e0b',
      'baja': '#10b981'
    };

    activeFilters.push({
      key: 'priority',
      label: 'Prioridad',
      value: formatPriority(filtros.priority),
      color: priorityColors[filtros.priority],
      removable: true,
      type: 'filter'
    });
  }

  if (filtros.categoryId) {
    activeFilters.push({
      key: 'categoryId',
      label: 'Categoría',
      value: getCategoryName(filtros.categoryId),
      removable: true,
      type: 'filter'
    });
  }

  if (filtros.tagId) {
    activeFilters.push({
      key: 'tagId',
      label: 'Etiqueta',
      value: getTagName(filtros.tagId),
      removable: true,
      type: 'filter'
    });
  }

  if (filtros.sinceDate) {
    activeFilters.push({
      key: 'sinceDate',
      label: 'Desde',
      value: formatDate(filtros.sinceDate),
      removable: true,
      type: 'filter'
    });
  }

  if (filtros.untilDate) {
    activeFilters.push({
      key: 'untilDate',
      label: 'Hasta',
      value: formatDate(filtros.untilDate),
      removable: true,
      type: 'filter'
    });
  }

  // Agregar indicador de orden si no es el orden por defecto
  if (orden && (orden.field !== 'createdAt' || orden.direction !== 'desc')) {
    activeFilters.push({
      key: 'order',
      label: 'Ordenar por',
      value: `${formatSortField(orden.field)} (${formatSortDirection(orden.direction)})`,
      color: '#6366f1',
      removable: true,
      type: 'order'
    });
  }

  // Si no hay filtros activos, no mostrar el componente
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <IndicatorsContainer>
      <IndicatorsHeader>
        <TaskCounter>
          {totalTasks === filteredTasks
            ? `${filteredTasks} ${filteredTasks === 1 ? 'tarea encontrada' : 'tareas encontradas'}`
            : `Mostrando ${filteredTasks} de ${totalTasks} ${totalTasks === 1 ? 'tarea' : 'tareas'}`
          }
        </TaskCounter>
        <ClearAllButton onClick={onClearAll}>
          🗑️ Limpiar todo
        </ClearAllButton>
      </IndicatorsHeader>

      <FiltersRow>
        {activeFilters.map(({ key, label, value, color, removable, type }) => (
          <FilterChip
            key={key}
            style={{ backgroundColor: color || 'var(--color-primary)' }}
          >
            <FilterLabel title={`${label}: ${value}`}>
              {label}: {value}
            </FilterLabel>
            {removable && (
              <RemoveButton
                onClick={() => {
                  if (type === 'order' && onResetOrder) {
                    onResetOrder();
                  } else if (type === 'filter' && key !== 'order') {
                    onRemoveFilter(key as keyof typeof filtros);
                  }
                }}
                title={`Remover ${type === 'order' ? 'orden' : 'filtro'}: ${label}`}
                aria-label={`Remover ${type === 'order' ? 'orden' : 'filtro'} ${label}`}
                disabled={isLoading}
              >
                ×
              </RemoveButton>
            )}
          </FilterChip>
        ))}
      </FiltersRow>
    </IndicatorsContainer>
  );
}
