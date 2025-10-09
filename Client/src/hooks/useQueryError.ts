import { useCallback } from 'react';
import { ErrorType, getErrorNotification, logError, processError } from '../utils/errorHandling';

/**
 * Hook for handling query errors in a user-friendly way
 * Provides error processing, logging, and user notification utilities
 */
export const useQueryError = () => {
  /**
   * Process an error and return user-friendly information
   */
  const handleError = useCallback((error: any, context?: string) => {
    // Log the error for debugging
    logError(error, context);

    // Process the error for user display
    const processedError = processError(error);

    return processedError;
  }, []);

  /**
   * Get a notification object for displaying to the user
   */
  const getNotification = useCallback((error: any) => {
    return getErrorNotification(error);
  }, []);

  /**
   * Check if an error should trigger a page refresh
   */
  const shouldRefresh = useCallback((error: any) => {
    const processedError = processError(error);
    return processedError.shouldRefresh;
  }, []);

  /**
   * Check if an error can be retried
   */
  const canRetry = useCallback((error: any) => {
    const processedError = processError(error);
    return processedError.canRetry;
  }, []);

  /**
   * Check if an error is a network error
   */
  const isNetworkError = useCallback((error: any) => {
    const processedError = processError(error);
    return processedError.type === ErrorType.NETWORK_ERROR;
  }, []);

  /**
   * Check if an error is an authentication error
   */
  const isAuthError = useCallback((error: any) => {
    const processedError = processError(error);
    return processedError.type === ErrorType.AUTHENTICATION_ERROR;
  }, []);

  /**
   * Get user-friendly error message
   */
  const getUserMessage = useCallback((error: any) => {
    const processedError = processError(error);
    return processedError.userMessage;
  }, []);

  /**
   * Get error title for display
   */
  const getErrorTitle = useCallback((error: any) => {
    const processedError = processError(error);
    return processedError.title;
  }, []);

  return {
    handleError,
    getNotification,
    shouldRefresh,
    canRetry,
    isNetworkError,
    isAuthError,
    getUserMessage,
    getErrorTitle,
  };
};

/**
 * Hook for handling mutation errors with automatic error processing
 */
export const useMutationError = () => {
  const { handleError, getNotification, shouldRefresh, isAuthError } = useQueryError();

  /**
   * Handle mutation error with automatic actions
   */
  const handleMutationError = useCallback((error: any, context?: string) => {
    const processedError = handleError(error, context);

    // Handle authentication errors by redirecting to login
    if (isAuthError(error)) {
      // Clear any stored auth tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // Redirect to login page
      window.location.href = '/auth';
      return processedError;
    }

    // Handle errors that require page refresh
    if (shouldRefresh(error)) {
      // Show a confirmation dialog before refreshing
      const shouldReload = window.confirm(
        'Se requiere recargar la página para continuar. ¿Deseas hacerlo ahora?'
      );

      if (shouldReload) {
        window.location.reload();
      }
    }

    return processedError;
  }, [handleError, isAuthError, shouldRefresh]);

  return {
    handleMutationError,
    ...useQueryError(),
  };
};

/**
 * Hook for handling query errors with retry functionality
 */
export const useQueryErrorWithRetry = (retryFn?: () => void) => {
  const queryError = useQueryError();

  /**
   * Handle query error with optional retry
   */
  const handleQueryError = useCallback((error: any, context?: string) => {
    const processedError = queryError.handleError(error, context);

    // Return error info along with retry function if available
    return {
      ...processedError,
      retry: processedError.canRetry && retryFn ? retryFn : undefined,
    };
  }, [queryError, retryFn]);

  return {
    handleQueryError,
    ...queryError,
  };
};
