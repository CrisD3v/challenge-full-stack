import type {
  FilterValidationResult,
  FiltrosTareas,
  OrdenTareas
} from '../types';
import {
  isSortDirection,
  isTaskPriority,
  isTaskSortField
} from '../types';

/**
 * Validate filter values and return detailed validation results
 */
export const validateFilters = (filtros: FiltrosTareas): FilterValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate date ranges
  if (filtros.sinceDate && filtros.untilDate) {
    const fechaDesde = new Date(filtros.sinceDate);
    const fechaHasta = new Date(filtros.untilDate);

    if (isNaN(fechaDesde.getTime())) {
      errors.push('La fecha desde no es válida');
    }

    if (isNaN(fechaHasta.getTime())) {
      errors.push('La fecha hasta no es válida');
    }

    if (!isNaN(fechaDesde.getTime()) && !isNaN(fechaHasta.getTime())) {
      if (fechaDesde > fechaHasta) {
        errors.push('La fecha desde debe ser anterior o igual a la fecha hasta');
      }

      // Check if date range is too large (more than 5 years)
      const diffYears = (fechaHasta.getTime() - fechaDesde.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (diffYears > 5) {
        warnings.push('El rango de fechas es muy amplio (más de 5 años). Esto puede afectar el rendimiento.');
      }
    }

    // Check if dates are too far in the future
    const now = new Date();
    const maxFutureDate = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());

    if (!isNaN(fechaDesde.getTime()) && fechaDesde > maxFutureDate) {
      errors.push('La fecha desde no puede estar más de 10 años en el futuro');
    }

    if (!isNaN(fechaHasta.getTime()) && fechaHasta > maxFutureDate) {
      errors.push('La fecha hasta no puede estar más de 10 años en el futuro');
    }
  }

  // Validate individual dates
  if (filtros.sinceDate && !filtros.untilDate) {
    const fechaDesde = new Date(filtros.sinceDate);
    if (isNaN(fechaDesde.getTime())) {
      errors.push('La fecha desde no es válida');
    }
  }

  if (filtros.untilDate && !filtros.sinceDate) {
    const fechaHasta = new Date(filtros.untilDate);
    if (isNaN(fechaHasta.getTime())) {
      errors.push('La fecha hasta no es válida');
    }
  }

  // Validate priority values using type guard
  if (filtros.priority && !isTaskPriority(filtros.priority)) {
    errors.push('El valor de prioridad no es válido. Debe ser: baja, media o alta');
  }

  // Validate search length and content
  if (filtros.search) {
    if (filtros.search.length > 500) {
      errors.push('El texto de búsqueda es demasiado largo (máximo 500 caracteres)');
    }

    if (filtros.search.length < 2) {
      warnings.push('El texto de búsqueda es muy corto. Usa al menos 2 caracteres para mejores resultados.');
    }

    // Check for potentially problematic search patterns
    const problematicPatterns = [
      /^\s+$/, // Only whitespace
      /^[^a-zA-Z0-9\s]+$/, // Only special characters
    ];

    if (problematicPatterns.some(pattern => pattern.test(filtros.search!))) {
      warnings.push('El patrón de búsqueda puede no devolver resultados útiles.');
    }
  }

  // Validate IDs format - relaxed validation for compatibility
  if (filtros.categoryId && filtros.categoryId !== '') {
    // Just check that it's a non-empty string, don't enforce UUID format
    if (typeof filtros.categoryId !== 'string' || filtros.categoryId.trim().length === 0) {
      errors.push('El ID de categoría no es válido');
    }
  }

  if (filtros.tagId && filtros.tagId !== '') {
    // Just check that it's a non-empty string, don't enforce UUID format
    if (typeof filtros.tagId !== 'string' || filtros.tagId.trim().length === 0) {
      errors.push('El ID de etiqueta no es válido');
    }
  }

  // Validate boolean values
  if (filtros.completed !== undefined && typeof filtros.completed !== 'boolean') {
    errors.push('El valor de estado completado debe ser verdadero o falso');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate order configuration using type guards
 */
export const validateOrder = (orden: OrdenTareas): FilterValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isTaskSortField(orden.field)) {
    errors.push(`Campo de ordenamiento inválido: ${orden.field}. Campos válidos: title, priority, dueDate, createdAt, updatedAt`);
  }

  if (!isSortDirection(orden.direction)) {
    errors.push(`Dirección de ordenamiento inválida: ${orden.direction}. Direcciones válidas: asc, desc`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitize filter values by removing invalid or empty values
 */
export const sanitizeFilters = (filtros: FiltrosTareas): FiltrosTareas => {
  const sanitized: FiltrosTareas = {};

  // Copy only valid, non-empty values
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Special handling for strings - trim whitespace
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed !== '') {
          (sanitized as any)[key] = trimmed;
        }
      } else {
        (sanitized as any)[key] = value;
      }
    }
  });

  return sanitized;
};

/**
 * Sanitize order configuration using type guards
 */
export const sanitizeOrder = (orden: OrdenTareas): OrdenTareas => {
  return {
    field: isTaskSortField(orden.field) ? orden.field : 'createdAt',
    direction: isSortDirection(orden.direction) ? orden.direction : 'desc'
  };
};

/**
 * Check if filters are empty (no active filters)
 */
export const areFiltersEmpty = (filtros: FiltrosTareas): boolean => {
  const sanitized = sanitizeFilters(filtros);
  return Object.keys(sanitized).length === 0;
};

/**
 * Count active filters
 */
export const countActiveFilters = (filtros: FiltrosTareas): number => {
  const sanitized = sanitizeFilters(filtros);
  return Object.keys(sanitized).length;
};

/**
 * Get human-readable description of active filters
 */
export const getFiltersDescription = (filtros: FiltrosTareas): string[] => {
  const descriptions: string[] = [];
  const sanitized = sanitizeFilters(filtros);

  if (sanitized.search) {
    descriptions.push(`Búsqueda: "${sanitized.search}"`);
  }

  if (sanitized.completed !== undefined) {
    descriptions.push(`Estado: ${sanitized.completed ? 'Completadas' : 'Pendientes'}`);
  }

  if (sanitized.priority) {
    descriptions.push(`Prioridad: ${sanitized.priority}`);
  }

  if (sanitized.categoryId) {
    descriptions.push('Categoría específica');
  }

  if (sanitized.tagId) {
    descriptions.push('Etiqueta específica');
  }

  if (sanitized.sinceDate || sanitized.untilDate) {
    if (sanitized.sinceDate && sanitized.untilDate) {
      descriptions.push(`Fechas: ${sanitized.sinceDate} - ${sanitized.untilDate}`);
    } else if (sanitized.sinceDate) {
      descriptions.push(`Desde: ${sanitized.sinceDate}`);
    } else if (sanitized.untilDate) {
      descriptions.push(`Hasta: ${sanitized.untilDate}`);
    }
  }

  return descriptions;
};

/**
 * Validate complete filter configuration (filters + order)
 */
export const validateFilterConfiguration = (
  filtros: FiltrosTareas,
  orden: OrdenTareas
): FilterValidationResult => {
  const filterValidation = validateFilters(filtros);
  const orderValidation = validateOrder(orden);

  return {
    isValid: filterValidation.isValid && orderValidation.isValid,
    errors: [...filterValidation.errors, ...orderValidation.errors],
    warnings: [...filterValidation.warnings, ...orderValidation.warnings]
  };
};
