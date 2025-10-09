/**
 * Error handling utilities for TanStack Query
 * Provides user-friendly error messages and error classification
 */

export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface ProcessedError {
  type: ErrorType;
  title: string;
  message: string;
  userMessage: string;
  canRetry: boolean;
  shouldRefresh: boolean;
  originalError: any;
}

/**
 * Process and classify errors for user-friendly display
 */
export const processError = (error: any): ProcessedError => {
  // Default error structure
  const defaultError: ProcessedError = {
    type: ErrorType.UNKNOWN_ERROR,
    title: 'Error inesperado',
    message: 'Ocurrió un error inesperado',
    userMessage: 'Algo salió mal. Por favor, inténtalo de nuevo.',
    canRetry: true,
    shouldRefresh: false,
    originalError: error,
  };

  // Handle null/undefined errors
  if (!error) {
    return defaultError;
  }

  // Extract error information
  const status = error?.response?.status || error?.status;
  const message = error?.message || error?.response?.data?.message || '';
  const code = error?.code || error?.response?.data?.code;

  // Network errors
  if (
    error?.name === 'NetworkError' ||
    message.includes('fetch') ||
    message.includes('network') ||
    code === 'NETWORK_ERROR' ||
    !navigator.onLine
  ) {
    return {
      type: ErrorType.NETWORK_ERROR,
      title: 'Error de conexión',
      message: 'No se pudo conectar con el servidor',
      userMessage: 'Verifica tu conexión a internet e inténtalo de nuevo.',
      canRetry: true,
      shouldRefresh: false,
      originalError: error,
    };
  }

  // Timeout errors
  if (message.includes('timeout') || code === 'TIMEOUT') {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      title: 'Tiempo de espera agotado',
      message: 'La solicitud tardó demasiado en responder',
      userMessage: 'La operación tardó demasiado. Inténtalo de nuevo.',
      canRetry: true,
      shouldRefresh: false,
      originalError: error,
    };
  }

  // HTTP status-based errors
  if (status) {
    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION_ERROR,
          title: 'Datos inválidos',
          message: 'Los datos enviados no son válidos',
          userMessage: 'Por favor, verifica los datos ingresados e inténtalo de nuevo.',
          canRetry: false,
          shouldRefresh: false,
          originalError: error,
        };

      case 401:
        return {
          type: ErrorType.AUTHENTICATION_ERROR,
          title: 'Sesión expirada',
          message: 'Tu sesión ha expirado',
          userMessage: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
          canRetry: false,
          shouldRefresh: true,
          originalError: error,
        };

      case 403:
        return {
          type: ErrorType.AUTHORIZATION_ERROR,
          title: 'Acceso denegado',
          message: 'No tienes permisos para realizar esta acción',
          userMessage: 'No tienes permisos para realizar esta acción.',
          canRetry: false,
          shouldRefresh: false,
          originalError: error,
        };

      case 404:
        return {
          type: ErrorType.NOT_FOUND_ERROR,
          title: 'Recurso no encontrado',
          message: 'El recurso solicitado no existe',
          userMessage: 'El elemento que buscas no existe o ha sido eliminado.',
          canRetry: false,
          shouldRefresh: true,
          originalError: error,
        };

      case 422:
        return {
          type: ErrorType.VALIDATION_ERROR,
          title: 'Error de validación',
          message: 'Los datos no pasaron la validación',
          userMessage: 'Hay errores en los datos ingresados. Por favor, revísalos.',
          canRetry: false,
          shouldRefresh: false,
          originalError: error,
        };

      case 429:
        return {
          type: ErrorType.CLIENT_ERROR,
          title: 'Demasiadas solicitudes',
          message: 'Has excedido el límite de solicitudes',
          userMessage: 'Has realizado demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
          canRetry: true,
          shouldRefresh: false,
          originalError: error,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER_ERROR,
          title: 'Error del servidor',
          message: 'El servidor está experimentando problemas',
          userMessage: 'El servidor está experimentando problemas. Inténtalo de nuevo más tarde.',
          canRetry: true,
          shouldRefresh: false,
          originalError: error,
        };

      default:
        if (status >= 400 && status < 500) {
          return {
            type: ErrorType.CLIENT_ERROR,
            title: 'Error en la solicitud',
            message: `Error del cliente: ${status}`,
            userMessage: 'Hubo un problema con tu solicitud. Inténtalo de nuevo.',
            canRetry: true,
            shouldRefresh: false,
            originalError: error,
          };
        } else if (status >= 500) {
          return {
            type: ErrorType.SERVER_ERROR,
            title: 'Error del servidor',
            message: `Error del servidor: ${status}`,
            userMessage: 'El servidor está experimentando problemas. Inténtalo de nuevo más tarde.',
            canRetry: true,
            shouldRefresh: false,
            originalError: error,
          };
        }
    }
  }

  // Specific error messages
  if (message.includes('ENOTFOUND') || message.includes('DNS')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      title: 'Error de DNS',
      message: 'No se pudo resolver el nombre del servidor',
      userMessage: 'No se puede conectar con el servidor. Verifica tu conexión a internet.',
      canRetry: true,
      shouldRefresh: false,
      originalError: error,
    };
  }

  if (message.includes('ECONNREFUSED')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      title: 'Conexión rechazada',
      message: 'El servidor rechazó la conexión',
      userMessage: 'No se puede conectar con el servidor. Inténtalo más tarde.',
      canRetry: true,
      shouldRefresh: false,
      originalError: error,
    };
  }

  return defaultError;
};

/**
 * Get retry configuration based on error type
 */
export const getRetryConfig = (error: any) => {
  const processedError = processError(error);

  switch (processedError.type) {
    case ErrorType.NETWORK_ERROR:
    case ErrorType.TIMEOUT_ERROR:
    case ErrorType.SERVER_ERROR:
      return {
        shouldRetry: true,
        maxRetries: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      };

    case ErrorType.CLIENT_ERROR:
      // Only retry for rate limiting (429)
      if (error?.response?.status === 429) {
        return {
          shouldRetry: true,
          maxRetries: 2,
          retryDelay: (attemptIndex: number) => Math.min(5000 * 2 ** attemptIndex, 60000),
        };
      }
      return { shouldRetry: false, maxRetries: 0, retryDelay: () => 0 };

    case ErrorType.AUTHENTICATION_ERROR:
    case ErrorType.AUTHORIZATION_ERROR:
    case ErrorType.VALIDATION_ERROR:
    case ErrorType.NOT_FOUND_ERROR:
      return { shouldRetry: false, maxRetries: 0, retryDelay: () => 0 };

    default:
      return {
        shouldRetry: true,
        maxRetries: 1,
        retryDelay: () => 1000,
      };
  }
};

/**
 * Enhanced retry function for TanStack Query
 */
export const enhancedRetryFunction = (failureCount: number, error: any) => {
  const retryConfig = getRetryConfig(error);

  // Don't retry if we're offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  // Check if we should retry based on error type
  if (!retryConfig.shouldRetry) {
    return false;
  }

  // Check if we've exceeded max retries
  if (failureCount >= retryConfig.maxRetries) {
    return false;
  }

  return true;
};

/**
 * Enhanced retry delay function with exponential backoff
 */
export const enhancedRetryDelay = (attemptIndex: number, error: any) => {
  const retryConfig = getRetryConfig(error);
  return retryConfig.retryDelay(attemptIndex);
};

/**
 * Log error for monitoring and debugging
 */
export const logError = (error: any, context?: string) => {
  const processedError = processError(error);

  console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
  console.error('Type:', processedError.type);
  console.error('Title:', processedError.title);
  console.error('Message:', processedError.message);
  console.error('User Message:', processedError.userMessage);
  console.error('Can Retry:', processedError.canRetry);
  console.error('Should Refresh:', processedError.shouldRefresh);
  console.error('Original Error:', processedError.originalError);
  console.groupEnd();

  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // errorTrackingService.captureError(processedError);
  }
};

/**
 * Create user-friendly error message for toasts/notifications
 */
export const getErrorNotification = (error: any) => {
  const processedError = processError(error);

  return {
    title: processedError.title,
    message: processedError.userMessage,
    type: 'error' as const,
    duration: processedError.type === ErrorType.NETWORK_ERROR ? 10000 : 5000,
    actions: processedError.canRetry ? [
      {
        label: 'Reintentar',
        action: 'retry',
      }
    ] : undefined,
  };
};
