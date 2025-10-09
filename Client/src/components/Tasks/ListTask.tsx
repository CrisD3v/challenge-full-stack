import React, { useState } from 'react';
import styled from 'styled-components';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useTaskMutations } from '../../hooks/useTaskMutations';
import type { FiltrosTareas, OrdenTareas, Task } from '../../types';

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

  &:hover:not(:disabled) {
    background-color: var(--color-bg-secondary);
  }

  /* Estados de deshabilitado durante operaciones en lote */
  /* Cumple con el requisito 3.1: deshabilitar botones durante operaciones */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--color-bg-secondary);
  }

  &.danger {
    border-color: var(--color-error);
    color: var(--color-error);

    &:hover:not(:disabled) {
      background-color: var(--color-error-bg);
    }

    /* Estado deshabilitado para botón de eliminar */
    &:disabled {
      border-color: var(--color-border);
      color: var(--color-text-secondary);
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

  /* Estado deshabilitado durante operaciones en lote */
  /* Cumple con el requisito 3.2: mantener deshabilitada la interfaz de selección */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

// Componente para mostrar errores de operaciones en lote
// Cumple con el requisito 3.4: mostrar mensaje de error descriptivo en español
const BatchErrorMessage = styled.div`
  margin: 0.75rem 1.5rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-error-bg, #fef2f2);
  border: 1px solid var(--color-error, #ef4444);
  border-radius: 8px;
  color: var(--color-error, #ef4444);
  font-size: 0.875rem;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    margin: 0.5rem 1rem;
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
  }
`;

const ErrorIcon = styled.span`
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ErrorContent = styled.div`
  flex: 1;
`;

const ErrorTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ErrorDescription = styled.div`
  opacity: 0.9;
  font-size: 0.8125rem;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const ErrorDismissButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
  flex-shrink: 0;
  margin-top: -0.125rem;

  &:hover {
    opacity: 1;
    background-color: rgba(239, 68, 68, 0.1);
  }

  &:focus {
    outline: 2px solid var(--color-error);
    outline-offset: 2px;
  }
`;

interface ListTasksProps {
  tareas: Task[];
  isLoading: boolean;
  onEditarTarea: (tarea: Task) => void;
  filtros?: FiltrosTareas;
  orden?: OrdenTareas;
}

export function ListTasks({ tareas, isLoading, onEditarTarea, filtros, orden }: ListTasksProps) {
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState<Set<string>>(new Set());
  const [errorDismissed, setErrorDismissed] = useState(false);

  // Integración del hook useTaskMutations para operaciones en lote
  // Este hook proporciona las funciones y estados necesarios para realizar
  // operaciones masivas sobre múltiples tareas seleccionadas
  const {
    batchOperations, // Será usado en tareas futuras para operaciones síncronas
    batchOperationsAsync,
    isBatchProcessing, // Usado para deshabilitar botones durante operaciones
    batchError // Usado para mostrar errores de operaciones en lote
  } = useTaskMutations(filtros, orden);

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

  /**
   * Procesa el error para mostrar un mensaje amigable al usuario
   * Extrae información relevante del error y proporciona mensajes en español
   */
  const getErrorMessage = (error: any) => {
    if (!error) return { title: 'Error', message: 'Ocurrió un error inesperado' };

    // Extraer información del error
    const status = error?.response?.status || error?.status;
    const message = error?.message || error?.response?.data?.message || '';

    // Errores de red
    if (message.includes('fetch') || message.includes('network') || !navigator.onLine) {
      return {
        title: 'Error de conexión',
        message: 'Verifica tu conexión a internet e inténtalo de nuevo.'
      };
    }

    // Errores por código de estado HTTP
    if (status) {
      switch (status) {
        case 400:
          return {
            title: 'Datos inválidos',
            message: 'Por favor, verifica los datos e inténtalo de nuevo.'
          };
        case 401:
          return {
            title: 'Sesión expirada',
            message: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.'
          };
        case 403:
          return {
            title: 'Acceso denegado',
            message: 'No tienes permisos para realizar esta acción.'
          };
        case 404:
          return {
            title: 'Recurso no encontrado',
            message: 'El elemento que buscas no existe o ha sido eliminado.'
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            title: 'Error del servidor',
            message: 'El servidor está experimentando problemas. Inténtalo más tarde.'
          };
        default:
          return {
            title: 'Error en la operación',
            message: 'Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.'
          };
      }
    }

    return {
      title: 'Error en la operación',
      message: 'Hubo un problema al procesar las tareas seleccionadas. Inténtalo de nuevo.'
    };
  };

  /**
   * Maneja el cierre del mensaje de error
   * Permite al usuario ocultar el mensaje de error manualmente
   */
  const handleDismissError = () => {
    setErrorDismissed(true);
  };

  // Resetear el estado de error dismissal cuando cambie el error
  React.useEffect(() => {
    if (batchError) {
      setErrorDismissed(false);
    }
  }, [batchError]);

  /**
   * Maneja la operación de completar múltiples tareas seleccionadas
   * Utiliza la función batchOperations del hook useTaskMutations para realizar
   * la operación en lote con actualizaciones optimistas y manejo de errores
   */
  const handleCompletarSeleccionadas = async () => {
    try {
      // Convertir el Set de IDs seleccionados a array para la operación en lote
      const idsSeleccionados = Array.from(tareasSeleccionadas);

      // Ejecutar la operación en lote usando el hook de mutaciones
      // La función batchOperationsAsync devuelve una promesa que permite
      // manejar el éxito y error de la operación
      await batchOperationsAsync(idsSeleccionados, 'completar');

      // Limpiar la selección solo después de que la operación sea exitosa
      // Esto evita limpiar la selección si hay un error en la operación
      setTareasSeleccionadas(new Set());
    } catch (error) {
      // El manejo de errores se realiza automáticamente por el hook useTaskMutations
      // que incluye rollback optimista y actualización del estado batchError
      // Solo registramos el error para debugging
      console.error('Error al completar tareas seleccionadas:', error);
    }
  };

  /**
   * Maneja la operación de eliminar múltiples tareas seleccionadas
   * Mantiene la confirmación existente antes de proceder con la eliminación
   * Utiliza la función batchOperationsAsync del hook useTaskMutations para realizar
   * la operación en lote con actualizaciones optimistas y manejo de errores
   */
  const handleEliminarSeleccionadas = async () => {
    // Mantener la confirmación existente antes de proceder con la eliminación
    // Esto previene eliminaciones accidentales y cumple con el requisito 2.1
    if (window.confirm(`¿Estás seguro de eliminar ${tareasSeleccionadas.size} tareas?`)) {
      try {
        // Convertir el Set de IDs seleccionados a array para la operación en lote
        const idsSeleccionados = Array.from(tareasSeleccionadas);

        // Ejecutar la operación de eliminación en lote usando el hook de mutaciones
        // La función batchOperationsAsync devuelve una promesa que permite
        // manejar el éxito y error de la operación (requisitos 2.2, 2.3)
        await batchOperationsAsync(idsSeleccionados, 'eliminar');

        // Limpiar la selección solo después de que la operación sea exitosa
        // Esto evita limpiar la selección si hay un error en la operación (requisito 2.5)
        setTareasSeleccionadas(new Set());
      } catch (error) {
        // El manejo de errores se realiza automáticamente por el hook useTaskMutations
        // que incluye rollback optimista y actualización del estado batchError (requisito 2.4)
        // Solo registramos el error para debugging
        console.error('Error al eliminar tareas seleccionadas:', error);
      }
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
          {/* Checkbox de seleccionar todo - se deshabilita durante operaciones en lote */}
          {/* Cumple con el requisito 3.2: mantener deshabilitada la interfaz de selección */}
          <SelectAllCheckbox
            type="checkbox"
            checked={todasSeleccionadas}
            disabled={isBatchProcessing}
            onChange={(e) => handleSeleccionarTodas(e.target.checked)}
          />
          <TaskCount>
            {tareasLocales.length} tarea{tareasLocales.length !== 1 ? 's' : ''}
            {algunasSeleccionadas && ` • ${tareasSeleccionadas.size} seleccionada${tareasSeleccionadas.size !== 1 ? 's' : ''}`}
            {/* Mostrar estado de procesamiento cuando hay operaciones en curso */}
            {isBatchProcessing && ' • Procesando...'}
          </TaskCount>
        </div>

        <BulkActions $visible={algunasSeleccionadas}>
          {/* Botón de completar con estado de carga */}
          {/* Se deshabilita durante operaciones en lote (requisito 3.1) */}
          {/* Cambia el icono a indicador de carga cuando está procesando (requisito 3.1) */}
          <BulkButton
            onClick={handleCompletarSeleccionadas}
            disabled={isBatchProcessing}
          >
            {isBatchProcessing ? '⏳' : '✓'} {isBatchProcessing ? 'Completando...' : 'Completar'}
          </BulkButton>

          {/* Botón de eliminar con estado de carga */}
          {/* Se deshabilita durante operaciones en lote (requisito 3.1) */}
          {/* Cambia el icono a indicador de carga cuando está procesando (requisito 3.1) */}
          <BulkButton
            className="danger"
            onClick={handleEliminarSeleccionadas}
            disabled={isBatchProcessing}
          >
            {isBatchProcessing ? '⏳' : '🗑️'} {isBatchProcessing ? 'Eliminando...' : 'Eliminar'}
          </BulkButton>
        </BulkActions>
      </ListHeader>

      {/* Mensaje de error para operaciones en lote */}
      {/* Cumple con el requisito 3.4: mostrar mensaje de error descriptivo en español */}
      {/* Posicionado de manera visible pero no intrusiva */}
      {batchError && !errorDismissed && (
        <BatchErrorMessage>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorContent>
            <ErrorTitle>
              {getErrorMessage(batchError).title}
            </ErrorTitle>
            <ErrorDescription>
              {getErrorMessage(batchError).message}
            </ErrorDescription>
          </ErrorContent>
          <ErrorDismissButton
            onClick={handleDismissError}
            title="Cerrar mensaje de error"
            aria-label="Cerrar mensaje de error"
          >
            ✕
          </ErrorDismissButton>
        </BatchErrorMessage>
      )}

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
            disabled={isBatchProcessing} // Deshabilitar durante operaciones en lote (requisito 3.2)
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
