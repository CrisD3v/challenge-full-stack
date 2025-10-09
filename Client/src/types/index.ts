export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  userId: string;
  categoryId?: string;
  categories?: Category;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface TaskFormData {
  title: string;
  description?: string | undefined;
  priority: TaskPriority;
  dueDate?: string | undefined;
  categoryId?: string | undefined;
  tagIds?: string[] | undefined;
}

// Priority levels for tasks
export type TaskPriority = 'baja' | 'media' | 'alta';

// Valid sort fields for tasks
export type TaskSortField = 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Enhanced filter interface with better type safety
export interface FiltrosTareas {
  /** Filter by completion status */
  completed?: boolean;
  /** Filter by task priority level */
  priority?: TaskPriority;
  /** Filter by category ID (must be valid UUID) */
  categoryId?: string;
  /** Filter by tag ID (must be valid UUID) */
  tagId?: string;
  /** Filter tasks created since this date (ISO date string) */
  sinceDate?: string;
  /** Filter tasks created until this date (ISO date string) */
  untilDate?: string;
  /** Search text in task title and description */
  search?: string;
}

// Enhanced order interface with corrected fields
export interface OrdenTareas {
  /** Field to sort by */
  field: TaskSortField;
  /** Sort direction */
  direction: SortDirection;
}

export interface StatisticsTasks {
  total: number;
  completeds: number;
  pending: number;
  perPriority: Record<TaskPriority, number>;
  perCategory: Array<{
    category: string;
    total: number;
  }>;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface Theme {
  mode: 'light' | 'dark';
}

// ============================================================================
// FILTER-RELATED TYPES
// ============================================================================

/**
 * Validation result for filter operations
 */
export interface FilterValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
  /** Array of validation warning messages */
  warnings: string[];
}

/**
 * Configuration for filter persistence
 */
export interface FilterPersistenceConfig {
  /** localStorage key for storing filters */
  readonly storageKey: string;
  /** Version for compatibility checking */
  readonly version: string;
  /** Maximum age in milliseconds before filters expire */
  readonly maxAge: number;
}

/**
 * Persisted filter state structure
 */
export interface PersistedFilterState {
  /** The filter configuration */
  filtros: FiltrosTareas;
  /** The sort configuration */
  orden: OrdenTareas;
  /** Timestamp when filters were saved */
  timestamp: number;
  /** Version for compatibility checking */
  version: string;
}

/**
 * Return type for useFilterPersistence hook
 */
export interface UseFilterPersistenceReturn {
  /** Save current filters to localStorage */
  saveFilters: (filtros: FiltrosTareas, orden: OrdenTareas) => void;
  /** Load filters from localStorage */
  loadFilters: () => { filtros: FiltrosTareas; orden: OrdenTareas } | null;
  /** Clear persisted filters from localStorage */
  clearPersistedFilters: () => void;
}

/**
 * Active filter indicator for UI display
 */
export interface ActiveFilterIndicator {
  /** The filter key */
  key: keyof FiltrosTareas | 'order';
  /** Display label for the filter */
  label: string;
  /** Formatted value for display */
  value: string;
  /** Optional color for the indicator */
  color?: string;
  /** Whether this filter can be removed individually */
  removable: boolean;
  /** Type of indicator (filter or order) */
  type?: 'filter' | 'order';
}

/**
 * Props for FilterIndicators component
 */
export interface FilterIndicatorsProps {
  /** Current filter configuration */
  filtros: FiltrosTareas;
  /** Current order configuration */
  orden?: OrdenTareas;
  /** Total number of tasks (unfiltered) */
  totalTasks: number;
  /** Number of tasks after filtering */
  filteredTasks: number;
  /** Available categories for name resolution */
  categorias?: readonly Category[];
  /** Available tags for name resolution */
  etiquetas?: readonly Tag[];
  /** Callback to remove a specific filter */
  onRemoveFilter: (key: keyof FiltrosTareas) => void;
  /** Callback to reset order to default */
  onResetOrder?: () => void;
  /** Callback to clear all filters */
  onClearAll: () => void;
  /** Whether the component is in loading state */
  isLoading?: boolean;
}

/**
 * Filter state for complex filter management
 */
export interface FilterState {
  /** Current filter configuration */
  filtros: FiltrosTareas;
  /** Current sort configuration */
  orden: OrdenTareas;
  /** Whether any filters are currently active */
  isActive: boolean;
  /** Number of active filters */
  activeCount: number;
  /** Timestamp of last filter application */
  lastApplied: Date | null;
  /** Validation result for current filters */
  validation: FilterValidationResult;
  /** Whether filters are currently being applied */
  isApplying: boolean;
}

/**
 * Filter error types for better error handling
 */
export type FilterErrorType =
  | 'VALIDATION_ERROR'
  | 'PERSISTENCE_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Filter error with context
 */
export interface FilterError {
  /** Type of error */
  type: FilterErrorType;
  /** Error message */
  message: string;
  /** Additional context about the error */
  context?: Record<string, unknown>;
  /** Timestamp when error occurred */
  timestamp: Date;
  /** Whether the error is recoverable */
  recoverable: boolean;
}

/**
 * Filter operation result
 */
export interface FilterOperationResult<T = unknown> {
  /** Whether the operation was successful */
  success: boolean;
  /** Result data if successful */
  data?: T;
  /** Error information if failed */
  error?: FilterError;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// UTILITY TYPES FOR BETTER TYPE SAFETY
// ============================================================================

/**
 * Utility type to make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type to make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for non-empty string
 */
export type NonEmptyString = string & { readonly __brand: unique symbol };

/**
 * Utility type for UUID string
 */
export type UUID = string & { readonly __uuid: unique symbol };

/**
 * Utility type for ISO date string
 */
export type ISODateString = string & { readonly __isoDate: unique symbol };

/**
 * Enhanced FiltrosTareas with strict typing
 */
export interface StrictFiltrosTareas {
  completed?: boolean;
  priority?: TaskPriority;
  categoryId?: UUID;
  tagId?: UUID;
  sinceDate?: ISODateString;
  untilDate?: ISODateString;
  search?: NonEmptyString;
}

/**
 * Type guard for TaskPriority
 */
export const isTaskPriority = (value: unknown): value is TaskPriority => {
  return typeof value === 'string' && ['baja', 'media', 'alta'].includes(value);
};

/**
 * Type guard for TaskSortField
 */
export const isTaskSortField = (value: unknown): value is TaskSortField => {
  return typeof value === 'string' &&
    ['title', 'priority', 'dueDate', 'createdAt', 'updatedAt'].includes(value);
};

/**
 * Type guard for SortDirection
 */
export const isSortDirection = (value: unknown): value is SortDirection => {
  return typeof value === 'string' && ['asc', 'desc'].includes(value);
};

/**
 * Type guard for UUID format
 */
export const isUUID = (value: unknown): value is UUID => {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Type guard for ISO date string
 */
export const isISODateString = (value: unknown): value is ISODateString => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
};

/**
 * Type guard for non-empty string
 */
export const isNonEmptyString = (value: unknown): value is NonEmptyString => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validated filter type with runtime type checking
 */
export interface ValidatedFiltrosTareas extends FiltrosTareas {
  readonly _validated: true;
  readonly _validatedAt: Date;
  /** Internal validation state */
  readonly _isValid?: boolean;
  /** Internal validation errors */
  readonly _errors?: readonly string[];
  /** Internal validation warnings */
  readonly _warnings?: readonly string[];
}

/**
 * Filter keys that can be used for removal
 */
export type FilterKey = keyof FiltrosTareas;

/**
 * Readonly version of FiltrosTareas for immutable operations
 */
export type ReadonlyFiltrosTareas = Readonly<FiltrosTareas>;

/**
 * Partial filter update type
 */
export type FilterUpdate = Partial<FiltrosTareas>;

/**
 * Filter comparison result
 */
export interface FilterComparison {
  areEqual: boolean;
  differences: Array<{
    key: keyof FiltrosTareas;
    oldValue: unknown;
    newValue: unknown;
  }>;
}

/**
 * Filter serialization format for persistence
 */
export interface SerializedFilters {
  filtros: string; // JSON string of FiltrosTareas
  orden: string;   // JSON string of OrdenTareas
  checksum: string; // For integrity verification
}
