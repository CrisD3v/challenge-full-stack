import { useEffect, useState } from 'react';

/**
 * Hook para implementar debouncing en valores
 * @param value - El valor a debounce
 * @param delay - El delay en milisegundos (por defecto 300ms)
 * @returns El valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear un timer que actualice el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia antes de que se complete el delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
