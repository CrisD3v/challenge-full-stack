import { useCallback, useEffect, useRef } from 'react';
import type { OrdenTareas } from '../types';

/**
 * Hook personalizado para manejar el ordenamiento de manera más robusta
 * Soluciona problemas comunes con el ordenamiento de tareas
 */
export function useSortFix(
  orden: OrdenTareas,
  onOrdenChange: (orden: OrdenTareas) => void,
  refetch?: () => void
) {
  const lastOrderRef = useRef<OrdenTareas>(orden);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detectar cambios en el ordenamiento
  useEffect(() => {
    const hasChanged =
      orden.field !== lastOrderRef.current.field ||
      orden.direction !== lastOrderRef.current.direction;

    if (hasChanged) {
      console.log('useSortFix: Sort order changed', {
        from: lastOrderRef.current,
        to: orden
      });

      lastOrderRef.current = orden;

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Forzar refetch después de un breve delay
      if (refetch) {
        timeoutRef.current = setTimeout(() => {
          console.log('useSortFix: Forcing refetch for sort order change');
          refetch();
        }, 200);
      }
    }
  }, [orden, refetch]);

  // Función para aplicar ordenamiento de manera robusta
  const applySortOrder = useCallback((field: string, direction: 'asc' | 'desc') => {
    console.log('useSortFix: Applying sort order', { field, direction });

    const newOrden: OrdenTareas = { field: field as any, direction };

    // Aplicar el ordenamiento inmediatamente
    onOrdenChange(newOrden);

    // Si hay refetch disponible, usarlo después de un breve delay
    if (refetch) {
      setTimeout(() => {
        console.log('useSortFix: Refetching after sort change');
        refetch();
      }, 100);
    }
  }, [onOrdenChange, refetch]);

  // Función para cambiar solo el campo manteniendo la dirección
  const changeSortField = useCallback((field: string) => {
    console.log('useSortFix: Changing sort field', field);
    applySortOrder(field, orden.direction);
  }, [applySortOrder, orden.direction]);

  // Función para cambiar solo la dirección manteniendo el campo
  const changeSortDirection = useCallback((direction: 'asc' | 'desc') => {
    console.log('useSortFix: Changing sort direction', direction);
    applySortOrder(orden.field, direction);
  }, [applySortOrder, orden.field]);

  // Función para resetear a ordenamiento por defecto
  const resetSortOrder = useCallback(() => {
    console.log('useSortFix: Resetting to default sort order');
    applySortOrder('createdAt', 'desc');
  }, [applySortOrder]);

  // Función para alternar la dirección actual
  const toggleSortDirection = useCallback(() => {
    const newDirection = orden.direction === 'asc' ? 'desc' : 'asc';
    console.log('useSortFix: Toggling sort direction', { from: orden.direction, to: newDirection });
    changeSortDirection(newDirection);
  }, [orden.direction, changeSortDirection]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    applySortOrder,
    changeSortField,
    changeSortDirection,
    resetSortOrder,
    toggleSortDirection,
    currentField: orden.field,
    currentDirection: orden.direction
  };
}
