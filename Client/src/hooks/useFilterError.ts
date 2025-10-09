import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useToast } from '../components/Commons/ErrorToast';
import type { FiltrosTareas, OrdenTareas, Task } from '../types';
import { validateFilters as validateFiltersUtil } from '../utils/filterValidation';
import { queryKeys } from '../utils/queryKeys';
import { useQueryError } from './useQueryError';

/**
 * Specialized hook for handling filter-related errors
 * Provides Spanish error messages, retry logic, and cached data fallbacks
 */
export const useFilterError = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { handleError, isNetworkError, canRetry } = useQueryError();

  const [retryCount, setRetryCount] = useState<Record<string, number>>({});

  /**
   * Get cached tasks data as fallback when filters fail
   */
  const getCachedFallback = useCallback((filtros?: FiltrosTareas, orden?: OrdenTareas): Task[] => {
    // Try to get cached data for the specific filters first
    const specificCacheKey = queryKeys.tasksList(filtros, orden);
    let cachedData = queryClient.getQueryData<Task[]>(specificCacheKey);

    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    // If no specific cached data, try to get base tasks without filters
    const baseCacheKey = queryKeys.tasksList();
    cachedData = queryClient.getQueryData<Task[]>(baseCacheKey);

    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    // If no cached data at all, return empty array
    return [];
  }, [queryClient]);

  /**
   * Handle filter-specific errors with Spanish messages
   */
  const handleFilterError = useCallback((
    error: any,
    context: 'apply' | 'load' | 'persist' | 'validate',
    filtros?: FiltrosTareas,
    orden?: OrdenTareas
  ) => {
    const processedError = handleError(error, `filter-${context}`);

    // Generate filter-specific error messages in Spanish
    const getFilterErrorMessage = () => {
      switch (context) {
        case 'apply':
          if (isNetworkError(error)) {
            return {
              title: 'Error al aplicar filtros',
              message: 'No se pudieron aplicar los filtros debido a un problema de conexión. Se muestran los datos disponibles en caché.',
            };
          }
          return {
            title: 'Error al filtrar tareas',
            message: 'No se pudieron aplicar los filtros seleccionados. Inténtalo de nuevo.',
          };

        case 'load':
          return {
            title: 'Error al cargar filtros',
            message: 'No se pudieron cargar los datos para los filtros. Verifica tu conexión.',
          };

        case 'persist':
          return {
            title: 'Error al guardar filtros',
            message: 'No se pudieron guardar tus preferencias de filtros.',
          };

        case 'validate':
          return {
            title: 'Filtros inválidos',
            message: 'Los filtros seleccionados no son válidos. Por favor, revisa los valores ingresados.',
          };

        default:
          return {
            title: processedError.title,
            message: processedError.userMessage,
          };
      }
    };

    const errorMessage = getFilterErrorMessage();

    // For network errors during filter application, show cached data
    if (context === 'apply' && isNetworkError(error)) {
      const cachedTasks = getCachedFallback(filtros, orden);

      showToast({
        title: errorMessage.title,
        message: `${errorMessage.message} (${cachedTasks.length} tareas en caché)`,
        type: 'warning',
        duration: 8000,
        actions: canRetry(error) ? [{
          label: 'Reintentar',
          action: 'retry'
        }] : undefined
      });

      return {
        ...processedError,
        fallbackData: cachedTasks,
        showedFallback: true
      };
    }

    // For other errors, show error toast
    showToast({
      title: errorMessage.title,
      message: errorMessage.message,
      type: 'error',
      duration: 6000,
      actions: canRetry(error) ? [{
        label: 'Reintentar',
        action: 'retry'
      }] : undefined
    });

    return {
      ...processedError,
      fallbackData: null,
      showedFallback: false
    };
  }, [handleError, isNetworkError, canRetry, showToast, getCachedFallback]);

  /**
   * Retry logic for filter operations with exponential backoff
   */
  const retryFilterOperation = useCallback(async (
    operation: () => Promise<any>,
    operationKey: string,
    maxRetries: number = 3
  ) => {
    const currentRetries = retryCount[operationKey] || 0;

    if (currentRetries >= maxRetries) {
      showToast({
        title: 'Máximo de reintentos alcanzado',
        message: 'No se pudo completar la operación después de varios intentos.',
        type: 'error',
        duration: 5000
      });
      return null;
    }

    try {
      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, currentRetries), 10000);

      if (currentRetries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));

        showToast({
          title: 'Reintentando...',
          message: `Intento ${currentRetries + 1} de ${maxRetries}`,
          type: 'info',
          duration: 2000
        });
      }

      const result = await operation();

      // Reset retry count on success
      setRetryCount(prev => ({ ...prev, [operationKey]: 0 }));

      if (currentRetries > 0) {
        showToast({
          title: 'Operación exitosa',
          message: 'Los filtros se aplicaron correctamente.',
          type: 'success',
          duration: 3000
        });
      }

      return result;
    } catch (error) {
      // Increment retry count
      setRetryCount(prev => ({ ...prev, [operationKey]: currentRetries + 1 }));

      // Handle the error
      handleFilterError(error, 'apply');

      // If we can retry and haven't reached max retries, don't throw
      if (canRetry(error) && currentRetries < maxRetries - 1) {
        return retryFilterOperation(operation, operationKey, maxRetries);
      }

      throw error;
    }
  }, [retryCount, handleFilterError, canRetry, showToast]);

  /**
   * Validate filter values and show specific validation errors
   */
  const validateFilters = useCallback((filtros: FiltrosTareas): { isValid: boolean; errors: string[]; warnings: string[] } => {
    return validateFiltersUtil(filtros);
  }, []);

  /**
   * Show validation errors to the user
   */
  const showValidationErrors = useCallback((errors: string[], warnings?: string[]) => {
    if (errors.length === 0 && (!warnings || warnings.length === 0)) return;

    // Show errors first
    if (errors.length > 0) {
      const errorMessage = errors.length === 1
        ? errors[0]
        : `Se encontraron ${errors.length} errores:\n${errors.map(e => `• ${e}`).join('\n')}`;

      showToast({
        title: 'Errores de validación',
        message: errorMessage,
        type: 'error',
        duration: 8000
      });
    }

    // Show warnings separately
    if (warnings && warnings.length > 0) {
      const warningMessage = warnings.length === 1
        ? warnings[0]
        : `Advertencias:\n${warnings.map(w => `• ${w}`).join('\n')}`;

      showToast({
        title: 'Advertencias',
        message: warningMessage,
        type: 'warning',
        duration: 6000
      });
    }
  }, [showToast]);

  /**
   * Clear all retry counts (useful for resetting state)
   */
  const clearRetryState = useCallback(() => {
    setRetryCount({});
  }, []);

  return {
    handleFilterError,
    retryFilterOperation,
    validateFilters,
    showValidationErrors,
    getCachedFallback,
    clearRetryState,
    retryCount
  };
};
