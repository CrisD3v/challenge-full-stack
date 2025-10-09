import { useCallback, useEffect, useRef } from 'react';
import type { FiltrosTareas } from '../types';

/**
 * Hook personalizado para manejar el filtro de prioridad de manera más robusta
 * Soluciona problemas comunes con el filtrado de prioridad
 */
export function usePriorityFilterFix(
  filtros: FiltrosTareas,
  onFiltrosChange: (filtros: FiltrosTareas) => void,
  refetch?: () => void
) {
  const lastPriorityRef = useRef<string | undefined>(filtros.priority);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar cambios en el filtro de prioridad
  useEffect(() => {
    if (filtros.priority !== lastPriorityRef.current) {
      console.log('usePriorityFilterFix: Priority filter changed', {
        from: lastPriorityRef.current,
        to: filtros.priority
      });

      lastPriorityRef.current = filtros.priority;

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Si hay un filtro de prioridad activo, forzar refetch después de un breve delay
      if (filtros.priority && refetch) {
        timeoutRef.current = setTimeout(() => {
          console.log('usePriorityFilterFix: Forcing refetch for priority filter');
          refetch();
        }, 200);
      }
    }
  }, [filtros.priority, refetch]);

  // Función para aplicar filtro de prioridad de manera robusta
  const applyPriorityFilter = useCallback((priority: string | undefined) => {
    console.log('usePriorityFilterFix: Applying priority filter', priority);

    const newFiltros = { ...filtros };

    if (!priority || priority === '') {
      delete newFiltros.priority;
    } else {
      newFiltros.priority = priority as any;
    }

    // Aplicar los filtros inmediatamente
    onFiltrosChange(newFiltros);

    // Si hay refetch disponible, usarlo después de un breve delay
    if (refetch) {
      setTimeout(() => {
        console.log('usePriorityFilterFix: Refetching after priority change');
        refetch();
      }, 100);
    }
  }, [filtros, onFiltrosChange, refetch]);

  // Función para resetear el filtro de prioridad
  const resetPriorityFilter = useCallback(() => {
    console.log('usePriorityFilterFix: Resetting priority filter');
    applyPriorityFilter(undefined);
  }, [applyPriorityFilter]);

  // Función para forzar refresh del filtro actual
  const refreshCurrentFilter = useCallback(() => {
    if (filtros.priority) {
      console.log('usePriorityFilterFix: Refreshing current priority filter');
      const currentPriority = filtros.priority;

      // Primero limpiar el filtro
      const clearedFilters = { ...filtros };
      delete clearedFilters.priority;
      onFiltrosChange(clearedFilters);

      // Luego volver a aplicarlo
      setTimeout(() => {
        applyPriorityFilter(currentPriority);
      }, 100);
    }
  }, [filtros, onFiltrosChange, applyPriorityFilter]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    applyPriorityFilter,
    resetPriorityFilter,
    refreshCurrentFilter,
    currentPriority: filtros.priority
  };
}
