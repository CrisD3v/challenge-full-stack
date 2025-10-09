# 🧩 Guía de Componentes - Task Management Frontend

## 📋 Tabla de Contenidos

1. [Arquitectura de Componentes](#arquitectura-de-componentes)
2. [Componentes de Autenticación](#componentes-de-autenticación)
3. [Componentes de Tareas](#componentes-de-tareas)
4. [Componentes de Filtrado](#componentes-de-filtrado)
5. [Componentes de Debug](#componentes-de-debug)
6. [Componentes Comunes](#componentes-comunes)
7. [Componentes de Layout](#componentes-de-layout)
8. [Patrones de Diseño](#patrones-de-diseño)
9. [Guía de Estilo](#guía-de-estilo)
10. [Testing de Componentes](#testing-de-componentes)

---

## 🏗️ Arquitectura de Componentes

### Jerarquía de Componentes
```
App
├── AuthProvider
├── ThemeProvider
├── ToastProvider
├── ErrorBoundary
└── Router
    ├── AuthPage
    └── Dashboard
        ├── Layout
        │   ├── Header
        │   ├── Sidebar
        │   └── Main
        └── Pages
            ├── TaskPage
            ├── CategoryPage
            ├── StatisticsPage
            └── ExportPage
```

### Principios de Diseño
- **Composición**: Componentes pequeñoseutilizables
- **Separación de Responsabilidades**: Lógica separada de presentación
- **Props Drilling Mínimo**: Uso de Context para estado global
- **Type Safety**: Props tipadas con TypeScript
- **Performance**: Memoización y lazy loading

---

## 🔐 Componentes de Autenticación

### AuthPage
Página principal de autenticación con formularios de login y registro.

```typescript
// pages/AuthPage.tsx
interface AuthPageProps {}

export const AuthPage: React.FC<AuthPageProps> = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { login, register, isLoading } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <AuthHeader mode={mode} onModeChange={setMode} />
        <AuthForm
          mode={mode}
          onLogin={login}
          onRegister={register}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
```

**Props:**
- Ninguna (página de nivel superior)

**Estado Interno:**
- `mode`: Modo actual ('login' | 'register')

**Hooks Utilizados:**
- `useAuth()`: Contexto de autenticación
- `useState()`: Estado local del modo

### AuthForm
Formulario unificado para login y registro con validación.

```typescript
// components/Auth/AuthForm.tsx
interface AuthFormProps {
  mode: 'login' | 'register';
  onLogin: (data: LoginData) => Promise<void>;
  onRegister: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onLogin,
  onRegister,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginData | RegisterData>({
    resolver: yupResolver(getValidationSchema(mode))
  });

  const onSubmit = async (data: LoginData | RegisterData) => {
    try {
      if (mode === 'login') {
        await onLogin(data as LoginData);
      } else {
        await onRegister(data as RegisterData);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      {mode === 'register' && (
        <FormField
          label="Nombre"
          type="text"
          {...register('name')}
          error={errors.name?.message}
        />
      )}

      <FormField
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />

      <FormField
        label="Contraseña"
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
      </Button>
    </form>
  );
};
```

**Props:**
- `mode`: Modo del formulario
- `onLogin`: Callback para login
- `onRegister`: Callback para registro
- `isLoading`: Estado de carga

**Características:**
- Validación con Yup
- Manejo de errores integrado
- Campos dinámicos según el modo
- Estados de carga

### ProtectedRoute
HOC para proteger rutas que requieren autenticación.

```typescript
// components/Auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <Navigate to="/login" replace />
}) => {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  if (!usuario) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

**Props:**
- `children`: Componentes a proteger
- `fallback`: Componente a mostrar si no está autenticado

---

## 📝 Componentes de Tareas

### TaskPage
Página principal de gestión de tareas con filtros y ordenamiento.

```typescript
// pages/TaskPage.tsx
export const TaskPage: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosTareas>({});
  const [orden, setOrden] = useState<OrdenTareas>({
    field: 'createdAt',
    direction: 'desc'
  });

  const { data: tasks, isLoading, error } = useTasksQuery(filtros, orden);
  const { data: categorias } = useCategoriesQuery();
  const { data: etiquetas } = useTagsQuery();

  const taskMutations = useTaskMutations();

  return (
    <div className="task-page">
      <TaskPageHeader
        totalTasks={tasks?.length || 0}
        filtros={filtros}
        onClearFilters={() => setFiltros({})}
      />

      <div className="task-page-content">
        <aside className="task-sidebar">
          <FilterTask
            filtros={filtros}
            onFiltrosChange={setFiltros}
            orden={orden}
            onOrdenChange={setOrden}
            categorias={categorias}
            etiquetas={etiquetas}
          />
        </aside>

        <main className="task-main">
          <FilterIndicators
            filtros={filtros}
            orden={orden}
            totalTasks={tasks?.length || 0}
            filteredTasks={tasks?.length || 0}
            categorias={categorias}
            etiquetas={etiquetas}
            onRemoveFilter={(key) => {
              const newFiltros = { ...filtros };
              delete newFiltros[key];
              setFiltros(newFiltros);
            }}
            onClearAll={() => setFiltros({})}
          />

          {isLoading ? (
            <TaskListSkeleton />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <TaskList
              tasks={tasks || []}
              onTaskUpdate={taskMutations.update}
              onTaskDelete={taskMutations.delete}
              onTaskToggle={taskMutations.toggle}
            />
          )}
        </main>
      </div>
    </div>
  );
};
```

### TaskList
Lista principal de tareas con funcionalidad drag & drop.

```typescript
// components/Tasks/TaskList.tsx
interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (id: string) => void;
  enableDragDrop?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  enableDragDrop = true
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: 'task-list' });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over?.id);

      // Reordenar tareas localmente
      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

      // Actualizar orden en el servidor
      reorderedTasks.forEach((task, index) => {
        onTaskUpdate(task.id, { order: index });
      });
    }
  }, [tasks, onTaskUpdate]);

  if (tasks.length === 0) {
    return <EmptyTaskList />;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="task-list" ref={setNodeRef}>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={(updates) => onTaskUpdate(task.id, updates)}
              onDelete={() => onTaskDelete(task.id)}
              onToggle={() => onTaskToggle(task.id)}
              enableDrag={enableDragDrop}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
```

### TaskItem
Item individual de tarea con acciones inline.

```typescript
// components/Tasks/TaskItem.tsx
interface TaskItemProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  onToggle: () => void;
  enableDrag?: boolean;
}

export const TaskItem = React.memo<TaskItemProps>(({
  task,
  onUpdate,
  onDelete,
  onToggle,
  enableDrag = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleQuickEdit = useCallback((field: keyof Task, value: any) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item ${task.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      {enableDrag && (
        <div className="drag-handle" {...attributes} {...listeners}>
          ⋮⋮
        </div>
      )}

      <div className="task-content">
        <div className="task-header">
          <Checkbox
            checked={task.completed}
            onChange={onToggle}
            className="task-checkbox"
          />

          {isEditing ? (
            <TaskTitleEditor
              value={task.title}
              onSave={(title) => {
                handleQuickEdit('title', title);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <h3
              className="task-title"
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </h3>
          )}

          <TaskPriorityBadge
            priority={task.priority}
            onChange={(priority) => handleQuickEdit('priority', priority)}
          />
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          {task.dueDate && (
            <TaskDueDate
              date={task.dueDate}
              onChange={(dueDate) => handleQuickEdit('dueDate', dueDate)}
            />
          )}

          {task.categories && (
            <CategoryBadge category={task.categories} />
          )}

          {task.tags && task.tags.length > 0 && (
            <TagList tags={task.tags} />
          )}
        </div>
      </div>

      <div className="task-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▲' : '▼'}
        </Button>

        <TaskActionsMenu
          task={task}
          onEdit={() => setIsEditing(true)}
          onDelete={onDelete}
          onDuplicate={() => onUpdate({ ...task, id: undefined, title: `${task.title} (copia)` })}
        />
      </div>

      {isExpanded && (
        <TaskDetails
          task={task}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
});
```

### TaskForm
Formulario para crear y editar tareas.

```typescript
// components/Tasks/TaskForm.tsx
interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  categorias?: Category[];
  etiquetas?: Tag[];
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  categorias = [],
  etiquetas = []
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'media',
      dueDate: task?.dueDate || '',
      categoryId: task?.categoryId || '',
      tagIds: task?.tags?.map(t => t.id) || []
    },
    resolver: yupResolver(taskFormSchema)
  });

  const selectedTags = watch('tagIds');

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="task-form">
      <div className="form-section">
        <FormField
          label="Título *"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Ingresa el título de la tarea"
        />

        <FormField
          label="Descripción"
          as="textarea"
          rows={3}
          {...register('description')}
          error={errors.description?.message}
          placeholder="Describe la tarea (opcional)"
        />
      </div>

      <div className="form-section">
        <div className="form-row">
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <PrioritySelect
                label="Prioridad"
                value={field.value}
                onChange={field.onChange}
                error={errors.priority?.message}
              />
            )}
          />

          <FormField
            label="Fecha de vencimiento"
            type="datetime-local"
            {...register('dueDate')}
            error={errors.dueDate?.message}
          />
        </div>

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategorySelect
              label="Categoría"
              value={field.value}
              onChange={field.onChange}
              categories={categorias}
              error={errors.categoryId?.message}
              allowEmpty
            />
          )}
        />

        <Controller
          name="tagIds"
          control={control}
          render={({ field }) => (
            <TagMultiSelect
              label="Etiquetas"
              value={field.value}
              onChange={field.onChange}
              tags={etiquetas}
              error={errors.tagIds?.message}
            />
          )}
        />
      </div>

      <div className="form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {task ? 'Actualizar' : 'Crear'} Tarea
        </Button>
      </div>
    </form>
  );
};
```

---

## 🔍 Componentes de Filtrado

### FilterTask
Panel principal de filtros con todos los controles.

```typescript
// components/Tasks/FilterTask.tsx
interface FilterTaskProps {
  filtros: FiltrosTareas;
  onFiltrosChange: (filtros: FiltrosTareas) => void;
  orden: OrdenTareas;
  onOrdenChange: (orden: OrdenTareas) => void;
  categorias?: Category[];
  etiquetas?: Tag[];
}

export const FilterTask: React.FC<FilterTaskProps> = ({
  filtros,
  onFiltrosChange,
  orden,
  onOrdenChange,
  categorias = [],
  etiquetas = []
}) => {
  const handleFilterChange = useCallback(<K extends keyof FiltrosTareas>(
    key: K,
    value: FiltrosTareas[K]
  ) => {
    const newFiltros = { ...filtros };

    if (value === undefined || value === '' || value === null) {
      delete newFiltros[key];
    } else {
      newFiltros[key] = value;
    }

    onFiltrosChange(newFiltros);
  }, [filtros, onFiltrosChange]);

  const handleOrderChange = useCallback((
    field: TaskSortField,
    direction?: SortDirection
  ) => {
    const newDirection = direction || (
      orden.field === field && orden.direction === 'asc' ? 'desc' : 'asc'
    );

    onOrdenChange({ field, direction: newDirection });
  }, [orden, onOrdenChange]);

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <h3>Filtros</h3>

        <FilterGroup label="Estado">
          <CompletionFilter
            value={filtros.completed}
            onChange={(completed) => handleFilterChange('completed', completed)}
          />
        </FilterGroup>

        <FilterGroup label="Prioridad">
          <PriorityFilter
            value={filtros.priority}
            onChange={(priority) => handleFilterChange('priority', priority)}
          />
        </FilterGroup>

        <FilterGroup label="Categoría">
          <CategoryFilter
            value={filtros.categoryId}
            onChange={(categoryId) => handleFilterChange('categoryId', categoryId)}
            categories={categorias}
          />
        </FilterGroup>

        <FilterGroup label="Etiqueta">
          <TagFilter
            value={filtros.tagId}
            onChange={(tagId) => handleFilterChange('tagId', tagId)}
            tags={etiquetas}
          />
        </FilterGroup>

        <FilterGroup label="Búsqueda">
          <SearchFilter
            value={filtros.search}
            onChange={(search) => handleFilterChange('search', search)}
            placeholder="Buscar en título y descripción..."
          />
        </FilterGroup>

        <FilterGroup label="Fechas">
          <DateRangeFilter
            sinceDate={filtros.sinceDate}
            untilDate={filtros.untilDate}
            onSinceDateChange={(sinceDate) => handleFilterChange('sinceDate', sinceDate)}
            onUntilDateChange={(untilDate) => handleFilterChange('untilDate', untilDate)}
          />
        </FilterGroup>
      </div>

      <div className="sort-section">
        <h3>Ordenamiento</h3>

        <SortControls
          orden={orden}
          onOrderChange={handleOrderChange}
        />
      </div>

      <div className="filter-actions">
        <Button
          variant="secondary"
          onClick={() => onFiltrosChange({})}
          disabled={Object.keys(filtros).length === 0}
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};
```

### FilterIndicators
Indicadores visuales de filtros activos.

```typescript
// components/Tasks/FilterIndicators.tsx
interface FilterIndicatorsProps {
  filtros: FiltrosTareas;
  orden?: OrdenTareas;
  totalTasks: number;
  filteredTasks: number;
  categorias?: Category[];
  etiquetas?: Tag[];
  onRemoveFilter: (key: keyof FiltrosTareas) => void;
  onResetOrder?: () => void;
  onClearAll: () => void;
}

export const FilterIndicators: React.FC<FilterIndicatorsProps> = ({
  filtros,
  orden,
  totalTasks,
  filteredTasks,
  categorias = [],
  etiquetas = [],
  onRemoveFilter,
  onResetOrder,
  onClearAll
}) => {
  const indicators = useMemo(() => {
    const result: ActiveFilterIndicator[] = [];

    // Indicador de estado completado
    if (filtros.completed !== undefined) {
      result.push({
        key: 'completed',
        label: 'Estado',
        value: filtros.completed ? 'Completadas' : 'Pendientes',
        color: filtros.completed ? '#10b981' : '#f59e0b',
        removable: true,
        type: 'filter'
      });
    }

    // Indicador de prioridad
    if (filtros.priority) {
      const priorityColors = {
        alta: '#ef4444',
        media: '#f59e0b',
        baja: '#10b981'
      };

      result.push({
        key: 'priority',
        label: 'Prioridad',
        value: filtros.priority.charAt(0).toUpperCase() + filtros.priority.slice(1),
        color: priorityColors[filtros.priority],
        removable: true,
        type: 'filter'
      });
    }

    // Indicador de categoría
    if (filtros.categoryId) {
      const category = categorias.find(c => c.id === filtros.categoryId);
      result.push({
        key: 'categoryId',
        label: 'Categoría',
        value: category?.name || 'Categoría desconocida',
        color: category?.color,
        removable: true,
        type: 'filter'
      });
    }

    // Indicador de etiqueta
    if (filtros.tagId) {
      const tag = etiquetas.find(t => t.id === filtros.tagId);
      result.push({
        key: 'tagId',
        label: 'Etiqueta',
        value: tag?.name || 'Etiqueta desconocida',
        color: tag?.color,
        removable: true,
        type: 'filter'
      });
    }

    // Indicador de búsqueda
    if (filtros.search) {
      result.push({
        key: 'search',
        label: 'Búsqueda',
        value: `"${filtros.search}"`,
        color: '#6366f1',
        removable: true,
        type: 'filter'
      });
    }

    // Indicador de rango de fechas
    if (filtros.sinceDate || filtros.untilDate) {
      let dateValue = '';
      if (filtros.sinceDate && filtros.untilDate) {
        dateValue = `${formatDate(filtros.sinceDate)} - ${formatDate(filtros.untilDate)}`;
      } else if (filtros.sinceDate) {
        dateValue = `Desde ${formatDate(filtros.sinceDate)}`;
      } else if (filtros.untilDate) {
        dateValue = `Hasta ${formatDate(filtros.untilDate)}`;
      }

      result.push({
        key: 'sinceDate', // Usamos sinceDate como key representativa
        label: 'Fechas',
        value: dateValue,
        color: '#8b5cf6',
        removable: true,
        type: 'filter'
      });
    }

    // Indicador de ordenamiento (si no es el por defecto)
    if (orden && (orden.field !== 'createdAt' || orden.direction !== 'desc')) {
      const fieldLabels: Record<TaskSortField, string> = {
        title: 'Título',
        priority: 'Prioridad',
        dueDate: 'Fecha Venc.',
        createdAt: 'Fecha Creación',
        updatedAt: 'Última Modificación'
      };

      result.push({
        key: 'order',
        label: 'Orden',
        value: `${fieldLabels[orden.field]} ${orden.direction === 'asc' ? '↑' : '↓'}`,
        color: '#64748b',
        removable: !!onResetOrder,
        type: 'order'
      });
    }

    return result;
  }, [filtros, orden, categorias, etiquetas]);

  const hasActiveFilters = indicators.length > 0;
  const reductionPercentage = totalTasks > 0
    ? Math.round(((totalTasks - filteredTasks) / totalTasks) * 100)
    : 0;

  if (!hasActiveFilters) {
    return (
      <div className="filter-indicators empty">
        <span className="filter-summary">
          Mostrando todas las tareas ({totalTasks})
        </span>
      </div>
    );
  }

  return (
    <div className="filter-indicators active">
      <div className="filter-summary">
        <span className="results-count">
          {filteredTasks} de {totalTasks} tareas
        </span>
        {reductionPercentage > 0 && (
          <span className="reduction-percentage">
            ({reductionPercentage}% filtrado)
          </span>
        )}
      </div>

      <div className="indicators-list">
        {indicators.map(indicator => (
          <FilterIndicator
            key={indicator.key}
            indicator={indicator}
            onRemove={() => {
              if (indicator.type === 'order' && onResetOrder) {
                onResetOrder();
              } else if (indicator.type === 'filter') {
                onRemoveFilter(indicator.key as keyof FiltrosTareas);
              }
            }}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="clear-all-button"
      >
        Limpiar todo
      </Button>
    </div>
  );
};

// Componente individual de indicador
const FilterIndicator: React.FC<{
  indicator: ActiveFilterIndicator;
  onRemove: () => void;
}> = ({ indicator, onRemove }) => {
  return (
    <div
      className="filter-indicator"
      style={{
        backgroundColor: indicator.color ? `${indicator.color}20` : undefined,
        borderColor: indicator.color
      }}
    >
      <span className="indicator-label">{indicator.label}:</span>
      <span className="indicator-value">{indicator.value}</span>
      {indicator.removable && (
        <button
          className="remove-indicator"
          onClick={onRemove}
          aria-label={`Remover filtro ${indicator.label}`}
        >
          ×
        </button>
      )}
    </div>
  );
};
```

---

## 🐛 Componentes de Debug

### FilterDebug
Componente de debugging para filtros con análisis detallado.

```typescript
// components/Debug/FilterDebug.tsx
interface FilterDebugProps {
  filtros: FiltrosTareas;
  tasks?: Task[];
  totalTasks: number;
  onFilterChange?: (filtros: FiltrosTareas) => void;
}

export const FilterDebug: React.FC<FilterDebugProps> = ({
  filtros,
  tasks = [],
  totalTasks,
  onFilterChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  const analysis = useMemo(() => {
    const validation = validateFilters(filtros);
    const activeFilters = Object.keys(filtros).length;
    const filteredCount = tasks.length;
    const filterEfficiency = totalTasks > 0 ? (filteredCount / totalTasks) * 100 : 0;

    // Análisis por tipo de filtro
    const filterBreakdown = {
      completed: filtros.completed !== undefined ? 1 : 0,
      priority: filtros.priority ? 1 : 0,
      category: filtros.categoryId ? 1 : 0,
      tag: filtros.tagId ? 1 : 0,
      search: filtros.search ? 1 : 0,
      dateRange: (filtros.sinceDate || filtros.untilDate) ? 1 : 0,
    };

    // Distribución de tareas por prioridad
    const priorityDistribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>);

    return {
      validation,
      activeFilters,
      filteredCount,
      totalTasks,
      filterEfficiency: Math.round(filterEfficiency * 100) / 100,
      filterBreakdown,
      priorityDistribution,
    };
  }, [filtros, tasks, totalTasks]);

  const testFilters = useMemo(() => [
    {
      name: 'Solo Alta Prioridad',
      filters: { priority: 'alta' as TaskPriority },
    },
    {
      name: 'Solo Pendientes',
      filters: { completed: false },
    },
    {
      name: 'Completadas de Alta Prioridad',
      filters: { completed: true, priority: 'alta' as TaskPriority },
    },
    {
      name: 'Última Semana',
      filters: {
        sinceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  ], []);

  if (!isExpanded) {
    return (
      <div className="filter-debug collapsed">
        <button
          onClick={() => setIsExpanded(true)}
          className="debug-toggle"
        >
          🔍 Debug Filtros ({analysis.activeFilters} activos, {analysis.filterEfficiency}% eficiencia)
        </button>
      </div>
    );
  }

  return (
    <div className="filter-debug expanded">
      <div className="debug-header">
        <h3>🔍 Debug de Filtros</h3>
        <div className="debug-controls">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className={`toggle-button ${showRawData ? 'active' : ''}`}
          >
            Raw Data
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="close-button"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="debug-content">
        {/* Estadísticas Generales */}
        <div className="debug-section">
          <h4>📊 Estadísticas</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Filtros Activos:</span>
              <span className="stat-value">{analysis.activeFilters}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tareas Filtradas:</span>
              <span className="stat-value">{analysis.filteredCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Tareas:</span>
              <span className="stat-value">{analysis.totalTasks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Eficiencia:</span>
              <span className="stat-value">{analysis.filterEfficiency}%</span>
            </div>
          </div>
        </div>

        {/* Estado de Validación */}
        <div className="debug-section">
          <h4>✅ Validación</h4>
          <div className={`validation-status ${analysis.validation.isValid ? 'valid' : 'invalid'}`}>
            {analysis.validation.isValid ? '✅ Filtros Válidos' : '❌ Filtros Inválidos'}
          </div>

          {analysis.validation.errors.length > 0 && (
            <div className="validation-errors">
              <strong>Errores:</strong>
              <ul>
                {analysis.validation.errors.map((error, index) => (
                  <li key={index} className="error-item">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.validation.warnings.length > 0 && (
            <div className="validation-warnings">
              <strong>Advertencias:</strong>
              <ul>
                {analysis.validation.warnings.map((warning, index) => (
                  <li key={index} className="warning-item">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Desglose de Filtros */}
        <div className="debug-section">
          <h4>🔧 Desglose de Filtros</h4>
          <div className="filter-breakdown">
            {Object.entries(analysis.filterBreakdown).map(([type, count]) => (
              <div key={type} className={`filter-type ${count > 0 ? 'active' : 'inactive'}`}>
                <span className="filter-type-name">{type}:</span>
                <span className="filter-type-status">{count > 0 ? '✅' : '⭕'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de Prioridades */}
        {Object.keys(analysis.priorityDistribution).length > 0 && (
          <div className="debug-section">
            <h4>📈 Distribución por Prioridad</h4>
            <div className="priority-distribution">
              {Object.entries(analysis.priorityDistribution).map(([priority, count]) => (
                <div key={priority} className="priority-item">
                  <span className={`priority-badge priority-${priority}`}>
                    {priority}
                  </span>
                  <span className="priority-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros de Prueba */}
        {onFilterChange && (
          <div className="debug-section">
            <h4>🧪 Filtros de Prueba</h4>
            <div className="test-filters">
              {testFilters.map((test, index) => (
                <button
                  key={index}
                  onClick={() => onFilterChange(test.filters)}
                  className="test-filter-button"
                >
                  {test.name}
                </button>
              ))}
              <button
                onClick={() => onFilterChange({})}
                className="test-filter-button clear"
              >
                Limpiar Todo
              </button>
            </div>
          </div>
        )}

        {/* Datos Raw */}
        {showRawData && (
          <div className="debug-section">
            <h4>🔧 Datos Raw</h4>
            <div className="raw-data">
              <div className="raw-section">
                <h5>Filtros Activos:</h5>
                <pre>{JSON.stringify(filtros, null, 2)}</pre>
              </div>

              <div className="raw-section">
                <h5>Primeras 3 Tareas:</h5>
                <pre>
                  {JSON.stringify(
                    tasks.slice(0, 3).map(t => ({
                      id: t.id,
                      title: t.title,
                      priority: t.priority,
                      completed: t.completed,
                      dueDate: t.dueDate,
                      categoryId: t.categoryId,
                    })),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🔧 Componentes Comunes

### Button
Componente de botón reutilizable con múltiples variantes.

```typescript
// components/Commons/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  const baseClasses = 'button';
  const variantClasses = `button--${variant}`;
  const sizeClasses = `button--${size}`;
  const stateClasses = [
    isLoading && 'button--loading',
    disabled && 'button--disabled',
    fullWidth && 'button--full-width'
  ].filter(Boolean).join(' ');

  const allClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    stateClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={allClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          {leftIcon && <span className="button__left-icon">{leftIcon}</span>}
          <span className="button__content">{children}</span>
          {rightIcon && <span className="button__right-icon">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
```

### Modal
Componente modal reutilizable con overlay y animaciones.

```typescript
// components/Commons/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true
}) => {
  // Manejar escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div
        className="modal-backdrop"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div className={`modal modal--${size}`}>
        {(title || showCloseButton) && (
          <div className="modal__header">
            {title && <h2 className="modal__title">{title}</h2>}
            {showCloseButton && (
              <button
                className="modal__close-button"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
```

### LoadingSpinner
Componente de loading con diferentes tamaños y estilos.

```typescript
// components/Commons/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color,
  className
}) => {
  const sizeClasses = `spinner--${size}`;
  const allClasses = ['spinner', sizeClasses, className].filter(Boolean).join(' ');

  return (
    <div
      className={allClasses}
      style={{ color }}
      role="status"
      aria-label="Cargando"
    >
      <svg className="spinner__svg" viewBox="0 0 50 50">
        <circle
          className="spinner__circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
        />
      </svg>
    </div>
  );
};
```

---

## 📐 Patrones de Diseño

### Compound Components
Patrón para componentes complejos con múltiples partes.

```typescript
// Ejemplo: Card compound component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

interface CardContentProps {
  children: React.ReactNode;
}

interface CardFooterProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
} = ({ children, className }) => {
  return (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );
};

Card.Header = ({ children, actions }) => (
  <div className="card__header">
    <div className="card__header-content">{children}</div>
    {actions && <div className="card__header-actions">{actions}</div>}
  </div>
);

Card.Content = ({ children }) => (
  <div className="card__content">{children}</div>
);

Card.Footer = ({ children }) => (
  <div className="card__footer">{children}</div>
);

// Uso:
<Card>
  <Card.Header actions={<Button>Editar</Button>}>
    Título de la tarjeta
  </Card.Header>
  <Card.Content>
    Contenido de la tarjeta
  </Card.Content>
  <Card.Footer>
    Pie de la tarjeta
  </Card.Footer>
</Card>
```

### Render Props
Patrón para compartir lógica entre componentes.

```typescript
// Ejemplo: DataFetcher con render props
interface DataFetcherProps<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  children: (state: {
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  }) => React.ReactNode;
}

export const DataFetcher = <T,>({
  queryKey,
  queryFn,
  children
}: DataFetcherProps<T>) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn
  });

  return <>{children({ data, isLoading, error, refetch })}</>;
};

// Uso:
<DataFetcher
  queryKey={['tasks']}
  queryFn={() => api.getTasks()}
>
  {({ data, isLoading, error }) => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    return <TaskList tasks={data || []} />;
  }}
</DataFetcher>
```

### Higher-Order Components (HOC)
Patrón para extender funcionalidad de componentes.

```typescript
// Ejemplo: withErrorBoundary HOC
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Uso:
const SafeTaskList = withErrorBoundary(TaskList, ({ error, resetError }) => (
  <div className="error-fallback">
    <h3>Error en la lista de tareas</h3>
    <p>{error.message}</p>
    <Button onClick={resetError}>Reintentar</Button>
  </div>
));
```

---

## 🎨 Guía de Estilo

### Convenciones de Naming
- **Componentes**: PascalCase (`TaskList`, `FilterDebug`)
- **Props**: camelCase (`onTaskUpdate`, `isLoading`)
- **CSS Classes**: kebab-case con BEM (`task-item`, `task-item__title`)
- **Archivos**: PascalCase para componentes (`TaskList.tsx`)

### Estructura de Archivos de Componente
```typescript
// TaskList.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Task } from '../../types';
import { TaskItem } from './TaskItem';
import './TaskList.css';

// 1. Interfaces y tipos
interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
}

// 2. Componente principal
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate
}) => {
  // 3. Estado local
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // 4. Hooks personalizados
  const { dragHandlers } = useDragAndDrop();

  // 5. Memoizaciones
  const sortedTasks = useMemo(() =>
    tasks.sort((a, b) => a.order - b.order),
    [tasks]
  );

  // 6. Callbacks
  const handleTaskSelect = useCallback((taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  // 7. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 8. Early returns
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // 9. Render
  return (
    <div className="task-list">
      {sortedTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          isSelected={selectedTasks.includes(task.id)}
          onUpdate={(updates) => onTaskUpdate(task.id, updates)}
          onSelect={() => handleTaskSelect(task.id)}
        />
      ))}
    </div>
  );
};

// 10. Componentes auxiliares (si son pequeños)
const EmptyState: React.FC = () => (
  <div className="task-list__empty">
    <p>No hay tareas disponibles</p>
  </div>
);
```

### Estilos CSS con BEM
```css
/* TaskList.css */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.task-list__item {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: 1rem;
  transition: all 0.2s ease;
}

.task-list__item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.task-list__item--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.task-list__item--dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}
```

---

## 🧪 Testing de Componentes

### Testing con React Testing Library
```typescript
// TaskList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskList } from './TaskList';
import { mockTasks } from '../../__mocks__/tasks';

// Setup de testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('TaskList', () => {
  const mockOnTaskUpdate = jest.fn();
  const mockOnTaskDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no tasks', () => {
    renderWithProviders(
      <TaskList
        tasks={[]}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskDelete={mockOnTaskDelete}
      />
    );

    expect(screen.getByText('No hay tareas disponibles')).toBeInTheDocument();
  });

  it('renders task items when tasks provided', () => {
    renderWithProviders(
      <TaskList
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskDelete={mockOnTaskDelete}
      />
    );

    expect(screen.getByText(mockTasks[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockTasks[1].title)).toBeInTheDocument();
  });

  it('calls onTaskUpdate when task is toggled', async () => {
    renderWithProviders(
      <TaskList
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskDelete={mockOnTaskDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /completar tarea/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith(
        mockTasks[0].id,
        { completed: !mockTasks[0].completed }
      );
    });
  });

  it('handles drag and drop reordering', async () => {
    // Mock drag and drop functionality
    const mockDragEnd = jest.fn();

    renderWithProviders(
      <TaskList
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskDelete={mockOnTaskDelete}
        onReorder={mockDragEnd}
      />
    );

    // Simulate drag and drop
    // Note: This would require additional setup for @dnd-kit testing
  });
});
```

### Testing de Hooks Personalizados
```typescript
// useTasksQuery.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasksQuery } from './useTasksQuery';
import * as api from '../services/api';

// Mock API
jest.mock('../services/api');
const mockApi = api as jest.Mocked<typeof api>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTasksQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches tasks successfully', async () => {
    const mockTasks = [{ id: '1', title: 'Test Task' }];
    mockApi.getTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(
      () => useTasksQuery({}, { field: 'createdAt', direction: 'desc' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTasks);
    expect(mockApi.getTasks).toHaveBeenCalledWith(
      {},
      { field: 'createdAt', direction: 'desc' }
    );
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('API Error');
    mockApi.getTasks.mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useTasksQuery({}, { field: 'createdAt', direction: 'desc' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});
```

---

*Guía de Componentes - Task Management Frontend - Última actualización: $(date)*
