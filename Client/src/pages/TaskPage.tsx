import { useState } from 'react';
import styled from 'styled-components';

import { ErrorMessage } from '../components/Commons/ErrorMessage';
import { Loading } from '../components/Commons/Loading';
import { Modal } from '../components/Commons/Modal';
import { FilterTask } from '../components/Tasks/FilterTask';
import { FormTask } from '../components/Tasks/FormTask';
import { ListTasks } from '../components/Tasks/ListTask';
import { useTasks } from '../hooks/useTasks';

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

const KeyboardShortcuts = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

const ShortcutTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: between;
  margin-bottom: 0.25rem;
`;

export function TaskPage() {
  const {
    tasks,
    isLoading,
    error,
    aplicarFiltros,
    aplicarOrden,
    filtros,
    orden,
    limpiarError
  } = useTasks();

  const [modalTareaAbierto, setModalTareaAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);

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

  const handleExportarSeleccionadas = () => {
    // TODO: Implementar exportación de tareas seleccionadas
    console.log('Exportar tareas seleccionadas');
  };

  if (isLoading && tasks.length === 0) {
    return <Loading size="large" texto="Cargando tareas..." />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Mis Tareas</PageTitle>
        <ActionButtons>
          <Button variant="secondary" onClick={handleExportarSeleccionadas}>
            📤 Exportar
          </Button>
          <Button variant="primary" onClick={handleNuevaTarea}>
            ➕ Nueva Tarea
          </Button>
        </ActionButtons>
      </PageHeader>

      {error && (
        <ErrorMessage
          mensaje={error}
          onCerrar={limpiarError}
        />
      )}

      <ContentArea>
        <FiltersPanel>
          <FilterTask
            filtros={filtros}
            orden={orden}
            onFiltrosChange={aplicarFiltros}
            onOrdenChange={aplicarOrden}
          />

          {/* <KeyboardShortcuts>
            <ShortcutTitle>Atajos de Teclado</ShortcutTitle>
            <ShortcutItem>
              <span>Ctrl + N</span>
              <span>Nueva tarea</span>
            </ShortcutItem>
            <ShortcutItem>
              <span>Escape</span>
              <span>Cerrar modal</span>
            </ShortcutItem>
          </KeyboardShortcuts> */}
        </FiltersPanel>

        <TasksPanel>
          <ListTasks
            tareas={tasks}
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
