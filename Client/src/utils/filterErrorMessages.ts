/**
 * Centralized error messages for filter operations in Spanish
 */

export const FilterErrorMessages = {
  // Network errors
  NETWORK_ERROR: {
    title: 'Error de conexión',
    message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  },

  // Server errors
  SERVER_ERROR: {
    title: 'Error del servidor',
    message: 'El servidor está experimentando problemas. Inténtalo de nuevo más tarde.',
  },

  // Validation errors
  VALIDATION_ERROR: {
    title: 'Datos inválidos',
    message: 'Los filtros seleccionados contienen errores. Por favor, revísalos.',
  },

  // Filter application errors
  FILTER_APPLICATION_ERROR: {
    title: 'Error al aplicar filtros',
    message: 'No se pudieron aplicar los filtros seleccionados.',
  },

  // Filter loading errors
  FILTER_LOADING_ERROR: {
    title: 'Error al cargar filtros',
    message: 'No se pudieron cargar los datos necesarios para los filtros.',
  },

  // Filter persistence errors
  FILTER_PERSISTENCE_ERROR: {
    title: 'Error al guardar filtros',
    message: 'No se pudieron guardar tus preferencias de filtros.',
  },

  // Retry messages
  RETRY_MESSAGES: {
    RETRYING: 'Reintentando...',
    MAX_RETRIES: 'Máximo de reintentos alcanzado',
    RETRY_SUCCESS: 'Operación exitosa',
    RETRY_FAILED: 'No se pudo completar la operación después de varios intentos.',
  },

  // Fallback messages
  FALLBACK_MESSAGES: {
    USING_CACHE: 'Mostrando datos en caché',
    CACHE_OUTDATED: 'Los datos mostrados pueden no estar actualizados',
    NO_CACHE_AVAILABLE: 'No hay datos disponibles sin conexión',
  },

  // Validation specific messages
  VALIDATION_MESSAGES: {
    INVALID_DATE_RANGE: 'La fecha desde debe ser anterior o igual a la fecha hasta',
    INVALID_DATE_FORMAT: 'El formato de fecha no es válido',
    FUTURE_DATE_LIMIT: 'Las fechas no pueden estar más de 10 años en el futuro',
    INVALID_PRIORITY: 'El valor de prioridad debe ser: baja, media o alta',
    SEARCH_TOO_LONG: 'El texto de búsqueda es demasiado largo (máximo 500 caracteres)',
    SEARCH_TOO_SHORT: 'El texto de búsqueda es muy corto (mínimo 2 caracteres)',
    INVALID_UUID: 'El identificador no tiene un formato válido',
    INVALID_CATEGORY_ID: 'El ID de categoría no es válido',
    INVALID_TAG_ID: 'El ID de etiqueta no es válido',
  },

  // Warning messages
  WARNING_MESSAGES: {
    LARGE_DATE_RANGE: 'El rango de fechas es muy amplio. Esto puede afectar el rendimiento.',
    SHORT_SEARCH_TERM: 'Usa al menos 2 caracteres para mejores resultados de búsqueda.',
    PROBLEMATIC_SEARCH: 'El patrón de búsqueda puede no devolver resultados útiles.',
  },

  // Success messages
  SUCCESS_MESSAGES: {
    FILTERS_APPLIED: 'Filtros aplicados correctamente',
    FILTERS_CLEARED: 'Filtros limpiados',
    FILTERS_SAVED: 'Preferencias de filtros guardadas',
  },
} as const;

/**
 * Get error message based on error type and context
 */
export const getFilterErrorMessage = (
  errorType: keyof typeof FilterErrorMessages,
  context?: string
) => {
  const baseMessage = FilterErrorMessages[errorType];

  if (typeof baseMessage === 'object' && 'title' in baseMessage) {
    return {
      title: baseMessage.title,
      message: context ? `${baseMessage.message} (${context})` : baseMessage.message,
    };
  }

  return {
    title: 'Error',
    message: 'Ocurrió un error inesperado',
  };
};

/**
 * Get validation error message
 */
export const getValidationErrorMessage = (
  validationType: keyof typeof FilterErrorMessages.VALIDATION_MESSAGES
) => {
  return FilterErrorMessages.VALIDATION_MESSAGES[validationType];
};

/**
 * Get warning message
 */
export const getWarningMessage = (
  warningType: keyof typeof FilterErrorMessages.WARNING_MESSAGES
) => {
  return FilterErrorMessages.WARNING_MESSAGES[warningType];
};
