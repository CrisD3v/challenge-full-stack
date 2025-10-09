import { useCallback } from 'react';
import type {
  FilterPersistenceConfig,
  FiltrosTareas,
  OrdenTareas,
  PersistedFilterState,
  UseFilterPersistenceReturn
} from '../types';
import {
  isSortDirection,
  isTaskPriority,
  isTaskSortField
} from '../types';

/**
 * Configuration for filter persistence
 */
const PERSISTENCE_CONFIG: FilterPersistenceConfig = {
  storageKey: 'taskFilters',
  version: '1.0.0',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const;

/**
 * Default filter values
 */
const DEFAULT_FILTERS: FiltrosTareas = {};
const DEFAULT_ORDER: OrdenTareas = { field: 'createdAt', direction: 'desc' };

/**
 * Validates if a filter object has valid structure and values using type guards
 */
function validateFilters(filtros: any): filtros is FiltrosTareas {
  if (!filtros || typeof filtros !== 'object') {
    return false;
  }

  // Check each filter property for valid types and values using type guards
  const validations = [
    // completed should be boolean or undefined
    filtros.completed === undefined || typeof filtros.completed === 'boolean',

    // priority should be valid priority value or undefined
    filtros.priority === undefined || isTaskPriority(filtros.priority),

    // categoryId should be string or undefined
    filtros.categoryId === undefined || typeof filtros.categoryId === 'string',

    // tagId should be string or undefined
    filtros.tagId === undefined || typeof filtros.tagId === 'string',

    // sinceDate should be valid date string or undefined
    filtros.sinceDate === undefined ||
    (typeof filtros.sinceDate === 'string' && !isNaN(Date.parse(filtros.sinceDate))),

    // untilDate should be valid date string or undefined
    filtros.untilDate === undefined ||
    (typeof filtros.untilDate === 'string' && !isNaN(Date.parse(filtros.untilDate))),

    // search should be string or undefined
    filtros.search === undefined || typeof filtros.search === 'string',

    // No internal validation fields to check anymore
  ];

  return validations.every(Boolean);
}

/**
 * Validates if an order object has valid structure and values using type guards
 */
function validateOrder(orden: any): orden is OrdenTareas {
  if (!orden || typeof orden !== 'object') {
    return false;
  }

  return (
    isTaskSortField(orden.field) &&
    isSortDirection(orden.direction)
  );
}

/**
 * Sanitizes filter object by removing invalid properties
 */
function sanitizeFilters(filtros: any): FiltrosTareas {
  if (!filtros || typeof filtros !== 'object') {
    return DEFAULT_FILTERS;
  }

  const sanitized: FiltrosTareas = {};

  // Only include valid properties
  if (typeof filtros.completed === 'boolean') {
    sanitized.completed = filtros.completed;
  }

  if (isTaskPriority(filtros.priority)) {
    sanitized.priority = filtros.priority;
  }

  if (typeof filtros.categoryId === 'string' && filtros.categoryId.trim()) {
    sanitized.categoryId = filtros.categoryId.trim();
  }

  if (typeof filtros.tagId === 'string' && filtros.tagId.trim()) {
    sanitized.tagId = filtros.tagId.trim();
  }

  if (typeof filtros.sinceDate === 'string' && !isNaN(Date.parse(filtros.sinceDate))) {
    sanitized.sinceDate = filtros.sinceDate;
  }

  if (typeof filtros.untilDate === 'string' && !isNaN(Date.parse(filtros.untilDate))) {
    sanitized.untilDate = filtros.untilDate;
  }

  if (typeof filtros.search === 'string') {
    sanitized.search = filtros.search.trim() || undefined;
  }

  return sanitized;
}

/**
 * Sanitizes order object
 */
function sanitizeOrder(orden: any): OrdenTareas {
  if (!validateOrder(orden)) {
    return DEFAULT_ORDER;
  }
  return orden;
}

/**
 * Custom hook for persisting task filters in localStorage
 *
 * Provides functionality to save, load, and clear filter state with validation
 * and error handling for localStorage operations.
 *
 * Features:
 * - Automatic validation of filter data
 * - Data sanitization for corrupted localStorage data
 * - Expiration handling for old filter data
 * - Version compatibility for future migrations
 *
 * @returns Object with saveFilters, loadFilters, and clearPersistedFilters functions
 */
export function useFilterPersistence(): UseFilterPersistenceReturn {
  /**
   * Internal function to clear localStorage - not exposed to avoid circular dependencies
   */
  const clearStorage = () => {
    try {
      localStorage.removeItem(PERSISTENCE_CONFIG.storageKey);
    } catch (error) {
      console.error('useFilterPersistence: Error clearing persisted filters:', error);
    }
  };

  /**
   * Saves filter state to localStorage with validation and error handling
   */
  const saveFilters = useCallback((filtros: FiltrosTareas, orden: OrdenTareas): void => {
    try {
      // Validate inputs before saving
      if (!validateFilters(filtros)) {
        console.warn('useFilterPersistence: Invalid filters provided, using sanitized version');
        filtros = sanitizeFilters(filtros);
      }

      if (!validateOrder(orden)) {
        console.warn('useFilterPersistence: Invalid order provided, using default');
        orden = DEFAULT_ORDER;
      }

      const persistedState: PersistedFilterState = {
        filtros,
        orden,
        timestamp: Date.now(),
        version: PERSISTENCE_CONFIG.version,
      };

      localStorage.setItem(
        PERSISTENCE_CONFIG.storageKey,
        JSON.stringify(persistedState)
      );
    } catch (error) {
      console.error('useFilterPersistence: Error saving filters to localStorage:', error);
      // Fail silently - persistence is not critical functionality
    }
  }, []);

  /**
   * Loads filter state from localStorage with validation and expiration check
   */
  const loadFilters = useCallback((): { filtros: FiltrosTareas; orden: OrdenTareas } | null => {
    try {
      const stored = localStorage.getItem(PERSISTENCE_CONFIG.storageKey);

      if (!stored) {
        return null;
      }

      const parsed: PersistedFilterState = JSON.parse(stored);

      // Check if data is expired
      if (Date.now() - parsed.timestamp > PERSISTENCE_CONFIG.maxAge) {
        console.info('useFilterPersistence: Stored filters expired, clearing');
        clearStorage();
        return null;
      }

      // Validate and sanitize the loaded data
      const sanitizedFilters = sanitizeFilters(parsed.filtros);
      const sanitizedOrder = sanitizeOrder(parsed.orden);

      // If sanitization changed the data significantly, it might be corrupted
      const filtersValid = validateFilters(parsed.filtros);
      const orderValid = validateOrder(parsed.orden);

      if (!filtersValid || !orderValid) {
        console.warn('useFilterPersistence: Corrupted filter data detected, using sanitized version');
      }

      return {
        filtros: sanitizedFilters,
        orden: sanitizedOrder,
      };
    } catch (error) {
      console.error('useFilterPersistence: Error loading filters from localStorage:', error);
      // Clear corrupted data
      clearStorage();
      return null;
    }
  }, []);

  /**
   * Clears persisted filter state from localStorage
   */
  const clearPersistedFilters = useCallback((): void => {
    clearStorage();
  }, []);

  return {
    saveFilters,
    loadFilters,
    clearPersistedFilters,
  };
}

/**
 * Utility function to check if filters are empty (no active filters)
 */
export function areFiltersEmpty(filtros: FiltrosTareas): boolean {
  return Object.keys(filtros).length === 0 ||
    Object.values(filtros).every(value =>
      value === undefined ||
      value === '' ||
      (typeof value === 'string' && value.trim() === '')
    );
}

/**
 * Utility function to count active filters
 */
export function countActiveFilters(filtros: FiltrosTareas): number {
  return Object.values(filtros).filter(value =>
    value !== undefined &&
    value !== '' &&
    !(typeof value === 'string' && value.trim() === '')
  ).length;
}
