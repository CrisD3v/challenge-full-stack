# 🔍 Sistema de Filtrado y Ordenamiento - Documentación Técnica

## 📋 Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Sistema de Filtrado](#sistema-de-filtrado)
3. [Sistema de Ordenamiento](#sistema-de-ordenamiento)
4. [Validación y Type Safety](#validación-y-type-safety)
5. [Persistencia de Filtros](#persistencia-de-filtros)
6. [Fallback del Cliente](#fallback-del-cliente)
7. [Debugging y Diagnóstico](#debugging-y-diagnóstico)
8. [Optimización de Performance](#optimización-de-performance)
9. [Casos de Uso Avanzados](#casos-de-uso-avanzados)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura del Sistema

### Flujo de Datos
```
Usuario → UI Components → Hooks → Validation → API Service → Backend
                    ↓
              Local Fallback ← Cache ← Response Processing
```

### Componentes Principales
- **FilterTask**: Interfaz de usuario para filtros
- **useTasksQuery**: Hook principal de datos
- **clientSideFiltering**: Sistema de fallback
- **taskSorting**: Algoritmos de ordenamiento
- **filterValidation**: Validación de filtros

---

## 🔍 Sistema de Filtrado

### Tipos de Filtros Soportados

#### 1. Filtros Básicos
```typescript
interface FiltrosTareas {
  completed?: boolean;        // Estado de completado
  priority?: TaskPriority;    // Nivel de prioridad
  categoryId?: string;        // ID de categoría (UUID)
  tagId?: string;            // ID de etiqueta (UUID)
  search?: string;           // Búsqueda de texto
}
```

#### 2. Filtros de Fecha
```typescript
interface FiltrosFecha {
  sinceDate?: string;        // Desde fecha (ISO string)
  untilDate?: string;        // Hasta fecha (ISO string)
}
```

### Implementación del Filtrado

#### Componente FilterTask
```typescript
export const FilterTask: React.FC<FilterTaskProps> = ({
  filtros,
  onFiltrosChange,
  categorias,
  etiquetas
}) => {
  const handlePriorityChange = useCallback((priority: TaskPriority | '') => {
    const newFiltros = { ...filtros };

    if (priority === '') {
      delete newFiltros.priority;
    } else {
      newFiltros.priority = priority;
    }

    onFiltrosChange(newFiltros);
  }, [filtros, onFiltrosChange]);

  return (
    <div className="filter-panel">
      <PrioritySelect
        value={filtros.priority || ''}
        onChange={handlePriorityChange}
      />
      <CategorySelect
        value={filtros.categoryId || ''}
        onChange={(categoryId) => handleCategoryChange(categoryId)}
        categories={categorias}
      />
      {/* Más filtros... */}
    </div>
  );
};
```

#### Hook useTasksQuery con Filtros
```typescript
export const useTasksQuery = (
  filtros: FiltrosTareas = {},
  orden: OrdenTareas = { field: 'createdAt', direction: 'desc' }
) => {
  // Validar filtros antes de la query
  const validatedFilters = useMemo(() => {
    const validation = validateFilters(filtros);
    if (!validation.isValid) {
      console.warn('Invalid filters:', validation.errors);
      return {};
    }
    return filtros;
  }, [filtros]);

  return useQuery({
    queryKey: queryKeys.tasks.list(validatedFilters, orden),
    queryFn: async () => {
      try {
        const serverTasks = await api.getTasks(validatedFilters, orden);

        // Verificar si el servidor aplicó los filtros correctamente
        const clientFiltered = applyClientSideFilters(serverTasks, validatedFilters);

        if (serverTasks.length !== clientFiltered.length) {
          console.warn('Server filtering inconsistency detected, using client-side fallback');
          return clientFiltered;
        }

        return serverTasks;
      } catch (error) {
        console.error('Server filtering failed, using cached data with client-side filtering');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
```

### Filtrado del Lado del Cliente

#### Implementación Completa
```typescript
// utils/clientSideFiltering.ts
export const applyClientSideFilters = (
  tasks: Task[],
  filtros: FiltrosTareas
): Task[] => {
  return tasks.filter(task => {
    // Filtro por estado completado
    if (filtros.completed !== undefined) {
      if (task.completed !== filtros.completed) {
        return false;
      }
    }

    // Filtro por prioridad
    if (filtros.priority) {
      if (task.priority !== filtros.priority) {
        return false;
      }
    }

    // Filtro por categoría
    if (filtros.categoryId) {
      if (task.categoryId !== filtros.categoryId) {
        return false;
      }
    }

    // Filtro por etiqueta
    if (filtros.tagId) {
      const hasTag = task.tags?.some(tag => tag.id === filtros.tagId);
      if (!hasTag) {
        return false;
      }
    }

    // Filtro por búsqueda de texto
    if (filtros.search) {
      const searchLower = filtros.search.toLowerCase().trim();
      if (searchLower) {
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower) || false;

        if (!titleMatch && !descMatch) {
          return false;
        }
      }
    }

    // Filtro por fecha de creación (desde)
    if (filtros.sinceDate) {
      const taskDate = new Date(task.createdAt);
      const sinceDate = new Date(filtros.sinceDate);
      if (taskDate < sinceDate) {
        return false;
      }
    }

    // Filtro por fecha de creación (hasta)
    if (filtros.untilDate) {
      const taskDate = new Date(task.createdAt);
      const untilDate = new Date(filtros.untilDate);
      if (taskDate > untilDate) {
        return false;
      }
    }

    return true;
  });
};

// Función de comparación para verificar consistencia
export const compareFilterResults = (
  serverResult: Task[],
  clientResult: Task[],
  filtros: FiltrosTareas
): FilterComparisonResult => {
  const serverIds = new Set(serverResult.map(t => t.id));
  const clientIds = new Set(clientResult.map(t => t.id));

  const onlyInServer = serverResult.filter(t => !clientIds.has(t.id));
  const onlyInClient = clientResult.filter(t => !serverIds.has(t.id));

  return {
    isConsistent: serverIds.size === clientIds.size &&
                  onlyInServer.length === 0 &&
                  onlyInClient.length === 0,
    serverCount: serverResult.length,
    clientCount: clientResult.length,
    onlyInServer,
    onlyInClient,
    appliedFilters: filtros,
  };
};
```

---

## 📊 Sistema de Ordenamiento

### Campos de Ordenamiento Soportados
```typescript
type TaskSortField =
  | 'title'      // Título alfabético
  | 'priority'   // Nivel de prioridad
  | 'dueDate'    // Fecha de vencimiento
  | 'createdAt'  // Fecha de creación
  | 'updatedAt'; // Fecha de actualización
```

### Algoritmo de Ordenamiento Híbrido

#### Implementación Principal
```typescript
// utils/taskSorting.ts
export const sortTasks = (
  tasks: Task[],
  field: TaskSortField,
  direction: SortDirection
): Task[] => {
  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'title':
        comparison = a.title.localeCompare(b.title, 'es', {
          sensitivity: 'base',
          numeric: true
        });
        break;

      case 'priority':
        const priorityOrder = { baja: 1, media: 2, alta: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;

      case 'dueDate':
        comparison = compareDueDates(a.dueDate, b.dueDate);
        break;

      case 'createdAt':
      case 'updatedAt':
        const aTime = new Date(a[field]).getTime();
        const bTime = new Date(b[field]).getTime();
        comparison = aTime - bTime;
        break;

      default:
        console.warn(`Unsupported sort field: ${field}`);
        return 0;
    }

    return direction === 'desc' ? -comparison : comparison;
  });

  // Log para debugging
  console.log(`sortTasks: Sorted ${tasks.length} tasks by ${field} ${direction}`);

  return sortedTasks;
};

// Función especializada para fechas de vencimiento
const compareDueDates = (aDate?: string, bDate?: string): number => {
  // Ambas sin fecha - mantener orden actual
  if (!aDate && !bDate) {
    return 0;
  }

  // Solo a sin fecha - a va después
  if (!aDate) {
    return 1;
  }

  // Solo b sin fecha - b va después
  if (!bDate) {
    return -1;
  }

  // Ambas con fecha - comparar normalmente
  return new Date(aDate).getTime() - new Date(bDate).getTime();
};
```

#### Verificación de Ordenamiento
```typescript
export const verifySorting = (
  tasks: Task[],
  field: TaskSortField,
  direction: SortDirection
): SortVerificationResult => {
  const errors: string[] = [];

  for (let i = 0; i < tasks.length - 1; i++) {
    const current = tasks[i];
    const next = tasks[i + 1];

    let comparison = 0;

    switch (field) {
      case 'title':
        comparison = current.title.localeCompare(next.title);
        break;
      case 'priority':
        const priorityOrder = { baja: 1, media: 2, alta: 3 };
        comparison = priorityOrder[current.priority] - priorityOrder[next.priority];
        break;
      case 'dueDate':
        comparison = compareDueDates(current.dueDate, next.dueDate);
        break;
      default:
        comparison = new Date(current[field]).getTime() - new Date(next[field]).getTime();
    }

    const expectedComparison = direction === 'desc' ? -comparison : comparison;

    if (expectedComparison > 0) {
      errors.push(`Orden incorrecto en posición ${i}-${i + 1}: ${current.title} vs ${next.title}`);
    }
  }

  return {
    isCorrect: errors.length === 0,
    errors,
    field,
    direction,
    taskCount: tasks.length,
  };
};
```

#### Sistema Híbrido con Fallback
```typescript
export const applyHybridSorting = (
  tasks: Task[],
  field: TaskSortField,
  direction: SortDirection
): HybridSortResult => {
  // Verificar si las tareas ya vienen ordenadas del servidor
  const verification = verifySorting(tasks, field, direction);

  if (verification.isCorrect) {
    console.log('✅ Server sorting is correct');
    return {
      tasks,
      source: 'server',
      verification,
    };
  }

  // Si el servidor no ordenó correctamente, aplicar ordenamiento local
  console.warn('❌ Server sorting incorrect, applying client-side sorting');
  const sortedTasks = sortTasks(tasks, field, direction);

  return {
    tasks: sortedTasks,
    source: 'client',
    verification: verifySorting(sortedTasks, field, direction),
  };
};
```

---

## ✅ Validación y Type Safety

### Validadores de Filtros
```typescript
// utils/filterValidation.ts
export const validateFilters = (filtros: FiltrosTareas): FilterValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar UUID de categoría
  if (filtros.categoryId) {
    if (!isUUID(filtros.categoryId)) {
      errors.push('El ID de categoría debe ser un UUID válido');
    }
  }

  // Validar UUID de etiqueta
  if (filtros.tagId) {
    if (!isUUID(filtros.tagId)) {
      errors.push('El ID de etiqueta debe ser un UUID válido');
    }
  }

  // Validar prioridad
  if (filtros.priority) {
    if (!isTaskPriority(filtros.priority)) {
      errors.push('La prioridad debe ser: baja, media o alta');
    }
  }

  // Validar fechas
  if (filtros.sinceDate) {
    if (!isISODateString(filtros.sinceDate)) {
      errors.push('La fecha de inicio debe ser una fecha ISO válida');
    }
  }

  if (filtros.untilDate) {
    if (!isISODateString(filtros.untilDate)) {
      errors.push('La fecha de fin debe ser una fecha ISO válida');
    }
  }

  // Validar rango de fechas
  if (filtros.sinceDate && filtros.untilDate) {
    const since = new Date(filtros.sinceDate);
    const until = new Date(filtros.untilDate);

    if (since > until) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const daysDiff = (until.getTime() - since.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      warnings.push('El rango de fechas es muy amplio (>1 año), esto puede afectar el rendimiento');
    }
  }

  // Validar búsqueda de texto
  if (filtros.search) {
    if (filtros.search.trim().length === 0) {
      warnings.push('La búsqueda está vacía, se ignorará');
    } else if (filtros.search.length < 2) {
      warnings.push('La búsqueda es muy corta, puede devolver muchos resultados');
    } else if (filtros.search.length > 100) {
      errors.push('La búsqueda es demasiado larga (máximo 100 caracteres)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Normalización de filtros
export const normalizeFilters = (filtros: FiltrosTareas): FiltrosTareas => {
  const normalized: FiltrosTareas = {};

  // Normalizar búsqueda
  if (filtros.search) {
    const trimmed = filtros.search.trim();
    if (trimmed.length > 0) {
      normalized.search = trimmed;
    }
  }

  // Copiar otros filtros válidos
  if (filtros.completed !== undefined) {
    normalized.completed = filtros.completed;
  }

  if (filtros.priority && isTaskPriority(filtros.priority)) {
    normalized.priority = filtros.priority;
  }

  if (filtros.categoryId && isUUID(filtros.categoryId)) {
    normalized.categoryId = filtros.categoryId;
  }

  if (filtros.tagId && isUUID(filtros.tagId)) {
    normalized.tagId = filtros.tagId;
  }

  if (filtros.sinceDate && isISODateString(filtros.sinceDate)) {
    normalized.sinceDate = filtros.sinceDate;
  }

  if (filtros.untilDate && isISODateString(filtros.untilDate)) {
    normalized.untilDate = filtros.untilDate;
  }

  return normalized;
};
```

### Type Guards Avanzados
```typescript
// Type guards para runtime validation
export const isValidFilterKey = (key: string): key is keyof FiltrosTareas => {
  return ['completed', 'priority', 'categoryId', 'tagId', 'sinceDate', 'untilDate', 'search'].includes(key);
};

export const isValidSortField = (field: string): field is TaskSortField => {
  return ['title', 'priority', 'dueDate', 'createdAt', 'updatedAt'].includes(field);
};

export const isValidSortDirection = (direction: string): direction is SortDirection => {
  return ['asc', 'desc'].includes(direction);
};

// Validador completo de orden
export const validateOrder = (orden: Partial<OrdenTareas>): OrdenTareas => {
  const defaultOrder: OrdenTareas = { field: 'createdAt', direction: 'desc' };

  if (!orden.field || !isValidSortField(orden.field)) {
    console.warn(`Invalid sort field: ${orden.field}, using default: ${defaultOrder.field}`);
    return defaultOrder;
  }

  if (!orden.direction || !isValidSortDirection(orden.direction)) {
    console.warn(`Invalid sort direction: ${orden.direction}, using default: ${defaultOrder.direction}`);
    return { field: orden.field, direction: defaultOrder.direction };
  }

  return { field: orden.field, direction: orden.direction };
};
```

---

## 💾 Persistencia de Filtros

### Hook useFilterPersistence
```typescript
// hooks/useFilterPersistence.ts
export const useFilterPersistence = (): UseFilterPersistenceReturn => {
  const config: FilterPersistenceConfig = {
    storageKey: 'taskFilters',
    version: '1.0.0',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  };

  const saveFilters = useCallback((filtros: FiltrosTareas, orden: OrdenTareas) => {
    try {
      const persistedState: PersistedFilterState = {
        filtros: normalizeFilters(filtros),
        orden: validateOrder(orden),
        timestamp: Date.now(),
        version: config.version,
      };

      localStorage.setItem(config.storageKey, JSON.stringify(persistedState));
      console.log('✅ Filters saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save filters:', error);
    }
  }, []);

  const loadFilters = useCallback((): { filtros: FiltrosTareas; orden: OrdenTareas } | null => {
    try {
      const stored = localStorage.getItem(config.storageKey);
      if (!stored) return null;

      const parsed: PersistedFilterState = JSON.parse(stored);

      // Verificar versión
      if (parsed.version !== config.version) {
        console.warn('Filter version mismatch, clearing stored filters');
        clearPersistedFilters();
        return null;
      }

      // Verificar edad
      const age = Date.now() - parsed.timestamp;
      if (age > config.maxAge) {
        console.warn('Stored filters are too old, clearing');
        clearPersistedFilters();
        return null;
      }

      // Validar datos
      const validation = validateFilters(parsed.filtros);
      if (!validation.isValid) {
        console.warn('Stored filters are invalid:', validation.errors);
        clearPersistedFilters();
        return null;
      }

      console.log('✅ Filters loaded from localStorage');
      return {
        filtros: parsed.filtros,
        orden: validateOrder(parsed.orden),
      };
    } catch (error) {
      console.error('❌ Failed to load filters:', error);
      clearPersistedFilters();
      return null;
    }
  }, []);

  const clearPersistedFilters = useCallback(() => {
    try {
      localStorage.removeItem(config.storageKey);
      console.log('✅ Persisted filters cleared');
    } catch (error) {
      console.error('❌ Failed to clear persisted filters:', error);
    }
  }, []);

  return {
    saveFilters,
    loadFilters,
    clearPersistedFilters,
  };
};
```

### Integración con Componentes
```typescript
// Uso en TaskPage
export const TaskPage: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosTareas>({});
  const [orden, setOrden] = useState<OrdenTareas>({ field: 'createdAt', direction: 'desc' });

  const { saveFilters, loadFilters } = useFilterPersistence();

  // Cargar filtros al montar el componente
  useEffect(() => {
    const stored = loadFilters();
    if (stored) {
      setFiltros(stored.filtros);
      setOrden(stored.orden);
    }
  }, [loadFilters]);

  // Guardar filtros cuando cambien
  useEffect(() => {
    const hasActiveFilters = Object.keys(filtros).length > 0;
    if (hasActiveFilters) {
      saveFilters(filtros, orden);
    }
  }, [filtros, orden, saveFilters]);

  // ... resto del componente
};
```

---

## 🐛 Debugging y Diagnóstico

### Componente FilterDebug
```typescript
// components/Debug/FilterDebug.tsx
export const FilterDebug: React.FC<FilterDebugProps> = ({
  filtros,
  tasks,
  totalTasks,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Análisis de filtros
  const analysis = useMemo(() => {
    const validation = validateFilters(filtros);
    const activeFilters = Object.keys(filtros).length;
    const filteredCount = tasks?.length || 0;
    const filterEfficiency = totalTasks > 0 ? (filteredCount / totalTasks) * 100 : 0;

    return {
      validation,
      activeFilters,
      filteredCount,
      totalTasks,
      filterEfficiency: Math.round(filterEfficiency * 100) / 100,
    };
  }, [filtros, tasks, totalTasks]);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="debug-toggle"
      >
        🔍 Debug Filtros ({analysis.activeFilters} activos)
      </button>
    );
  }

  return (
    <div className="filter-debug">
      <div className="debug-header">
        <h3>🔍 Debug de Filtros</h3>
        <button onClick={() => setIsExpanded(false)}>✕</button>
      </div>

      <div className="debug-content">
        <div className="debug-section">
          <h4>📊 Estadísticas</h4>
          <ul>
            <li>Filtros activos: {analysis.activeFilters}</li>
            <li>Tareas filtradas: {analysis.filteredCount}</li>
            <li>Total de tareas: {analysis.totalTasks}</li>
            <li>Eficiencia: {analysis.filterEfficiency}%</li>
          </ul>
        </div>

        <div className="debug-section">
          <h4>✅ Validación</h4>
          <div className={`validation-status ${analysis.validation.isValid ? 'valid' : 'invalid'}`}>
            {analysis.validation.isValid ? '✅ Válido' : '❌ Inválido'}
          </div>

          {analysis.validation.errors.length > 0 && (
            <div className="validation-errors">
              <strong>Errores:</strong>
              <ul>
                {analysis.validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.validation.warnings.length > 0 && (
            <div className="validation-warnings">
              <strong>Advertencias:</strong>
              <ul>
                {analysis.validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="debug-section">
          <h4>🔧 Filtros Activos</h4>
          <pre>{JSON.stringify(filtros, null, 2)}</pre>
        </div>

        <div className="debug-section">
          <h4>📋 Primeras 3 Tareas</h4>
          <pre>
            {JSON.stringify(
              tasks?.slice(0, 3).map(t => ({
                id: t.id,
                title: t.title,
                priority: t.priority,
                completed: t.completed,
              })),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};
```

### Componente SortDebug
```typescript
// components/Debug/SortDebug.tsx
export const SortDebug: React.FC<SortDebugProps> = ({
  tasks,
  orden,
}) => {
  const verification = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { isCorrect: true, errors: [], taskCount: 0 };
    }

    return verifySorting(tasks, orden.field, orden.direction);
  }, [tasks, orden]);

  const analysis = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;

    const first = tasks[0];
    const last = tasks[tasks.length - 1];

    return {
      first: {
        title: first.title,
        value: getFieldValue(first, orden.field),
      },
      last: {
        title: last.title,
        value: getFieldValue(last, orden.field),
      },
      distribution: getDistribution(tasks, orden.field),
    };
  }, [tasks, orden]);

  return (
    <div className={`sort-debug ${verification.isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="debug-header">
        <h3>📊 Debug de Ordenamiento</h3>
        <div className="sort-status">
          {verification.isCorrect ? '✅ Orden correcto' : '❌ Orden incorrecto'}
        </div>
      </div>

      <div className="debug-content">
        <div className="debug-section">
          <h4>⚙️ Configuración</h4>
          <ul>
            <li>Campo: {orden.field}</li>
            <li>Dirección: {orden.direction}</li>
            <li>Total tareas: {verification.taskCount}</li>
          </ul>
        </div>

        {!verification.isCorrect && (
          <div className="debug-section">
            <h4>❌ Errores Detectados</h4>
            <ul>
              {verification.errors.map((error, index) => (
                <li key={index} className="error-item">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis && (
          <div className="debug-section">
            <h4>📈 Análisis</h4>
            <div className="analysis-grid">
              <div>
                <strong>Primera tarea:</strong>
                <div>{analysis.first.title}</div>
                <div>Valor: {analysis.first.value}</div>
              </div>
              <div>
                <strong>Última tarea:</strong>
                <div>{analysis.last.title}</div>
                <div>Valor: {analysis.last.value}</div>
              </div>
            </div>

            {analysis.distribution && (
              <div className="distribution">
                <strong>Distribución:</strong>
                <pre>{JSON.stringify(analysis.distribution, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Funciones auxiliares
const getFieldValue = (task: Task, field: TaskSortField): string => {
  switch (field) {
    case 'title':
      return task.title;
    case 'priority':
      return task.priority;
    case 'dueDate':
      return task.dueDate || 'Sin fecha';
    case 'createdAt':
    case 'updatedAt':
      return new Date(task[field]).toLocaleString();
    default:
      return 'N/A';
  }
};

const getDistribution = (tasks: Task[], field: TaskSortField) => {
  if (field === 'priority') {
    return tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>);
  }

  return null;
};
```

---

## ⚡ Optimización de Performance

### Debouncing de Filtros
```typescript
// Hook para debounce de filtros
export const useDebouncedFilters = (
  filtros: FiltrosTareas,
  delay: number = 300
): FiltrosTareas => {
  const [debouncedFilters, setDebouncedFilters] = useState(filtros);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filtros);
    }, delay);

    return () => clearTimeout(handler);
  }, [filtros, delay]);

  return debouncedFilters;
};

// Uso en componente
export const TaskPage: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosTareas>({});
  const debouncedFilters = useDebouncedFilters(filtros, 300);

  const { data: tasks } = useTasksQuery(debouncedFilters, orden);

  // ... resto del componente
};
```

### Memoización de Resultados
```typescript
// Hook optimizado con memoización
export const useOptimizedTasksQuery = (
  filtros: FiltrosTareas,
  orden: OrdenTareas
) => {
  // Memoizar la key de la query
  const queryKey = useMemo(() =>
    queryKeys.tasks.list(filtros, orden),
    [filtros, orden]
  );

  // Memoizar la función de query
  const queryFn = useCallback(async () => {
    const startTime = performance.now();

    try {
      const result = await api.getTasks(filtros, orden);
      const endTime = performance.now();

      console.log(`Query completed in ${endTime - startTime}ms`);
      return result;
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }, [filtros, orden]);

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
```

### Optimización de Renderizado
```typescript
// Componente optimizado con React.memo
export const TaskItem = React.memo<TaskItemProps>(({
  task,
  onUpdate,
  onDelete
}) => {
  // Memoizar handlers para evitar re-renders
  const handleUpdate = useCallback((updates: Partial<Task>) => {
    onUpdate(task.id, updates);
  }, [task.id, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  return (
    <div className="task-item">
      {/* Contenido del item */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para optimizar re-renders
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.priority === nextProps.task.priority
  );
});
```

---

## 🎯 Casos de Uso Avanzados

### Filtros Complejos Combinados
```typescript
// Ejemplo: Tareas urgentes pendientes de esta semana
const urgentPendingThisWeek: FiltrosTareas = {
  completed: false,
  priority: 'alta',
  sinceDate: startOfWeek(new Date()).toISOString(),
  untilDate: endOfWeek(new Date()).toISOString(),
};

// Ejemplo: Búsqueda en tareas de una categoría específica
const searchInCategory = (categoryId: string, searchTerm: string): FiltrosTareas => ({
  categoryId,
  search: searchTerm,
});

// Ejemplo: Tareas vencidas
const overdueTasks: FiltrosTareas = {
  completed: false,
  untilDate: new Date().toISOString(),
};
```

### Ordenamiento Dinámico
```typescript
// Hook para alternar ordenamiento
export const useToggleSort = (initialField: TaskSortField) => {
  const [orden, setOrden] = useState<OrdenTareas>({
    field: initialField,
    direction: 'desc',
  });

  const toggleSort = useCallback((field: TaskSortField) => {
    setOrden(current => {
      if (current.field === field) {
        // Mismo campo: alternar dirección
        return {
          field,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        // Nuevo campo: empezar con descendente
        return {
          field,
          direction: 'desc',
        };
      }
    });
  }, []);

  return { orden, toggleSort };
};
```

### Filtros Predefinidos
```typescript
// Configuración de filtros predefinidos
export const PRESET_FILTERS = {
  all: {},
  pending: { completed: false },
  completed: { completed: true },
  highPriority: { priority: 'alta' as TaskPriority },
  thisWeek: {
    sinceDate: startOfWeek(new Date()).toISOString(),
    untilDate: endOfWeek(new Date()).toISOString(),
  },
  overdue: {
    completed: false,
    untilDate: new Date().toISOString(),
  },
} as const;

// Hook para filtros predefinidos
export const usePresetFilters = () => {
  const [activePreset, setActivePreset] = useState<keyof typeof PRESET_FILTERS>('all');

  const applyPreset = useCallback((preset: keyof typeof PRESET_FILTERS) => {
    setActivePreset(preset);
    return PRESET_FILTERS[preset];
  }, []);

  return { activePreset, applyPreset };
};
```

---

## 🔧 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Filtros No Se Aplican
```typescript
// Verificar en consola del navegador:
console.log('Filtros enviados:', filtros);
console.log('Validación:', validateFilters(filtros));

// Soluciones:
// - Verificar que los filtros sean válidos
// - Comprobar la conexión de red
// - Revisar logs del servidor
// - Usar el fallback del cliente
```

#### 2. Ordenamiento Incorrecto
```typescript
// Usar el componente de debug:
<SortDebug tasks={tasks} orden={orden} />

// Verificar manualmente:
const verification = verifySorting(tasks, orden.field, orden.direction);
console.log('Verificación de orden:', verification);

// Soluciones:
// - Verificar que el campo de ordenamiento sea válido
// - Comprobar que las fechas estén en formato correcto
// - Usar el sistema híbrido de ordenamiento
```

#### 3. Performance Lenta
```typescript
// Medir tiempos de respuesta:
console.time('filter-query');
const result = await api.getTasks(filtros, orden);
console.timeEnd('filter-query');

// Optimizaciones:
// - Usar debounce en filtros de texto
// - Implementar paginación
// - Reducir la frecuencia de refetch
// - Usar memoización en componentes
```

#### 4. Persistencia No Funciona
```typescript
// Verificar localStorage:
console.log('Stored filters:', localStorage.getItem('taskFilters'));

// Verificar permisos:
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage available');
} catch (error) {
  console.error('localStorage not available:', error);
}
```

### Herramientas de Diagnóstico

#### 1. Query Inspector
```typescript
// Inspeccionar queries activas
export const debugActiveQueries = () => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  console.group('🔍 Active Queries');
  queries.forEach(query => {
    console.log('Key:', query.queryKey);
    console.log('State:', query.state.status);
    console.log('Data count:', query.state.data?.length || 0);
    console.log('Last updated:', query.state.dataUpdatedAt);
  });
  console.groupEnd();
};
```

#### 2. Filter Analyzer
```typescript
// Analizar efectividad de filtros
export const analyzeFilterEffectiveness = (
  originalTasks: Task[],
  filteredTasks: Task[],
  filtros: FiltrosTareas
) => {
  const reduction = ((originalTasks.length - filteredTasks.length) / originalTasks.length) * 100;

  console.group('📊 Filter Analysis');
  console.log('Original tasks:', originalTasks.length);
  console.log('Filtered tasks:', filteredTasks.length);
  console.log('Reduction:', `${reduction.toFixed(1)}%`);
  console.log('Active filters:', Object.keys(filtros).length);
  console.log('Filters:', filtros);
  console.groupEnd();

  return {
    originalCount: originalTasks.length,
    filteredCount: filteredTasks.length,
    reductionPercentage: reduction,
    activeFiltersCount: Object.keys(filtros).length,
  };
};
```

---

*Documentación del Sistema de Filtrado y Ordenamiento - Última actualización: $(date)*
