import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ErrorMessage } from '../components/Commons/ErrorMessage';
import { Loading } from '../components/Commons/Loading';
import { Modal } from '../components/Commons/Modal';
import { DueDateSortTest } from '../components/Debug/DueDateSortTest';
import { FilterDebug } from '../components/Debug/FilterDebug';
import { SortDebug } from '../components/Debug/SortDebug';
import { FilterIndicators } from '../components/Tasks/FilterIndicators';
import { FilterTask } from '../components/Tasks/FilterTask';
import { FormTask } from '../components/Tasks/FormTask';
import { ListTasks } from '../components/Tasks/ListTask';
import { PriorityFilterFix } from '../components/Tasks/PriorityFilterFix';
import { QuickPriorityTest } from '../components/Tasks/QuickPriorityTest';
import { QuickSortTest } from '../components/Tasks/QuickSortTest';
import { SimpleTaskList } from '../components/Tasks/SimpleTaskList';
import { useCategories } from '../hooks/useCategorias';
import { useFilterError } from '../hooks/useFilterError';
import { useFilterPersistence } from '../hooks/useFilterPersistence';
import { usePriorityFilterFix } from '../hooks/usePriorityFilterFix';
import { useSortFix } from '../hooks/useSortFix';
import { useTags } from '../hooks/useTags';
import { useTasks } from '../hooks/useTasks';
import { useTasksQuery } from '../hooks/useTasksQuery';
import type { FiltrosTareas, OrdenTareas } from '../types';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: stretch;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.variant === 'primary' ? `
    background-color: var(--color-primary);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }
  ` : `
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    border: 1px solid var(--color-border);

    &:hover:not(:disabled) {
      background-color: var(--color-bg-tertiary);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 250px 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FiltersPanel = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 1rem;

  @media (max-width: 768px) {
    position: static;
  }
`;

const TasksPanel = styled.div`
  min-height: 400px;
`;



export function TaskPage() {
  const [filtros, setFiltros] = useState<FiltrosTareas>({});
  const [orden, setOrden] = useState<OrdenTareas>({ field: 'createdAt', direction: 'desc' });

  // Use the enhanced query hook with error handling
  const {
    tasks,
    isLoading,
    error: queryError,
    refetch,
    isError
  } = useTasksQuery(filtros, orden, {
    enableClientSideFiltering: true // Habilitar filtrado del lado del cliente como fallback
  });

  // Get total tasks count (without filters) for comparison
  const {
    tasks: totalTasks,
    isLoading: isLoadingTotal
  } = useTasksQuery({}, { field: 'createdAt', direction: 'desc' });

  // Keep the old useTasks hook for mutations
  const {
    limpiarError
  } = useTasks();

  const { categorias } = useCategories();
  const { etiquetas } = useTags();
  const { saveFilters, loadFilters, clearPersistedFilters } = useFilterPersistence();
  const { getCachedFallback } = useFilterError();

  // Hook para manejar el filtro de prioridad de manera robusta
  const { applyPriorityFilter, resetPriorityFilter, refreshCurrentFilter } = usePriorityFilterFix(
    filtros,
    setFiltros,
    refetch
  );

  // Hook para manejar el ordenamiento de manera robusta
  const { applySortOrder, changeSortField, changeSortDirection, resetSortOrder, toggleSortDirection } = useSortFix(
    orden,
    setOrden,
    refetch
  );

  // Debug: Log when filters change
  useEffect(() => {
    console.log('TaskPage: filtros changed', filtros);
    if (filtros.priority) {
      console.log('TaskPage: Priority filter detected:', filtros.priority);
      // Forzar refetch cuando se aplique un filtro de prioridad
      setTimeout(() => {
        console.log('TaskPage: Forcing refetch for priority filter');
        refetch();
      }, 100);
    }
  }, [filtros, refetch]);

  useEffect(() => {
    console.log('TaskPage: orden changed', orden);
    console.log('TaskPage: Sort order details:', {
      field: orden.field,
      direction: orden.direction,
      isValid: orden.field && orden.direction
    });
  }, [orden]);

  const [modalTareaAbierto, setModalTareaAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [fallbackTasks, setFallbackTasks] = useState<any[]>([]);

  // Load persisted filters when component mounts
  useEffect(() => {
    const persistedFilters = loadFilters();
    if (persistedFilters) {
      setFiltros(persistedFilters.filtros);
      setOrden(persistedFilters.orden);
    }
    setFiltersLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  // Save filters automatically when they change (but only after initial load)
  useEffect(() => {
    if (filtersLoaded) {
      saveFilters(filtros, orden);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, orden, filtersLoaded]); // Removed saveFilters from dependencies to prevent infinite loop

  // Handle query errors and provide fallback data
  useEffect(() => {
    if (isError && queryError) {
      const cachedData = getCachedFallback(filtros, orden);
      setFallbackTasks(cachedData);
    } else {
      setFallbackTasks([]);
    }
  }, [isError, queryError, filtros, orden, getCachedFallback]);

  const handleNuevaTarea = () => {
    setTareaEditando(null);
    setModalTareaAbierto(true);
  };

  const handleEditarTarea = (tarea: any) => {
    setTareaEditando(tarea);
    setModalTareaAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalTareaAbierto(false);
    setTareaEditando(null);
  };

  const handleRemoveFilter = (key: keyof typeof filtros) => {
    const nuevosFiltros = { ...filtros };
    delete nuevosFiltros[key];
    setFiltros(nuevosFiltros);
  };

  const handleClearAllFilters = () => {
    setFiltros({});
    setOrden({ field: 'createdAt', direction: 'desc' });
    clearPersistedFilters();
  };

  const handleResetOrder = () => {
    setOrden({ field: 'createdAt', direction: 'desc' });
  };

  const handleRetryQuery = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error retrying query:', error);
    }
  };

  // Determine which tasks to display (real data or fallback)
  const displayTasks = isError && fallbackTasks.length > 0 ? fallbackTasks : tasks;
  const displayError = isError && fallbackTasks.length === 0 ? queryError : null;

  if ((isLoading || isLoadingTotal) && displayTasks.length === 0) {
    return <Loading size="large" texto="Cargando tareas..." />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Mis Tareas</PageTitle>
        <ActionButtons>
          <Button variant="primary" onClick={handleNuevaTarea}>
            ➕ Nueva Tarea
          </Button>
        </ActionButtons>
      </PageHeader>

      {displayError && (
        <ErrorMessage
          mensaje={displayError}
          onCerrar={limpiarError}
        />
      )}

      {isError && fallbackTasks.length > 0 && (
        <div style={{
          backgroundColor: 'var(--color-warning-bg, #fef3c7)',
          border: '1px solid var(--color-warning-border, #f59e0b)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          <span>Mostrando datos en caché ({fallbackTasks.length} tareas). Algunos filtros pueden no estar actualizados.</span>
          <button
            onClick={handleRetryQuery}
            style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      <ContentArea>
        <FiltersPanel>
          <FilterTask
            filtros={filtros}
            orden={orden}
            onFiltrosChange={setFiltros}
            onOrdenChange={setOrden}
            isLoading={isLoading}
            error={queryError}
            onRetry={handleRetryQuery}
          />
        </FiltersPanel>

        <TasksPanel>
          {/* <QuickPriorityTest
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />

          <QuickSortTest
            orden={orden}
            onOrdenChange={setOrden}
            applySortOrder={applySortOrder}
            changeSortField={changeSortField}
            changeSortDirection={changeSortDirection}
            toggleSortDirection={toggleSortDirection}
          /> */}

          {/* <SimpleTaskList
            tasks={displayTasks}
            orden={orden}
          /> */}
          {/*
          <SortDebug
            tasks={displayTasks}
            orden={orden}
          />

          <DueDateSortTest
            tasks={displayTasks}
            orden={orden}
          />

          <PriorityFilterFix
            filtros={filtros}
            tasks={displayTasks}
            onFiltrosChange={setFiltros}
          />

          <FilterDebug
            filtros={filtros}
            tasks={displayTasks}
            isLoading={isLoading}
          /> */}

          <FilterIndicators
            filtros={filtros}
            orden={orden}
            totalTasks={totalTasks?.length || 0}
            filteredTasks={displayTasks?.length || 0}
            categorias={categorias}
            etiquetas={etiquetas}
            onRemoveFilter={handleRemoveFilter}
            onResetOrder={handleResetOrder}
            onClearAll={handleClearAllFilters}
          />

          <ListTasks
            tareas={displayTasks}
            isLoading={isLoading}
            onEditarTarea={handleEditarTarea}
            filtros={filtros}
            orden={orden}
          />
        </TasksPanel>
      </ContentArea>

      <Modal
        isOpen={modalTareaAbierto}
        onClose={handleCerrarModal}
        titulo={tareaEditando ? 'Editar Tarea' : 'Nueva Tarea'}
        size="medium"
      >
        <FormTask
          tarea={tareaEditando}
          onSuccess={handleCerrarModal}
          onCancel={handleCerrarModal}
        />
      </Modal>
    </PageContainer>
  );
}
