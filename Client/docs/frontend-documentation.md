# 📱 Documentación del Frontend - Task Management Client

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Componentes](#componentes)
5. [Hooks Personalizados](#hooks-personalizados)
6. [Servicios y APIs](#servicios-y-apis)
7. [Gestión de Estado](#gestión-de-estado)
8. [Routing y Navegación](#routing-y-navegación)
9. [Tipos y Interfaces](#tipos-y-interfaces)
10. [Utilidades](#utilidades)
11. [Configuración](#configuración)
12. [Debugging y Desarrollo](#debugging-y-desarrollo)
13. [Optimización y Performance](#optimización-y-performance)
14. [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🏗️ Arquitectura General

### Patrón de Arquitectura
El frontend sigue una **arquitectura basada en componentes** con separación clara de responsabilidades:

- **Presentación**: Componentes React con TypeScript
- **Lógica de Negocio**: Hooks personalizados
- **Gestión de Estado**: React Query + Context API
- **Comunicación**: Axios con interceptores
- **Routing**: React Router v7

### Principios de Diseño
- **Composición sobre Herencia**: Componentes reutilizables y modulares
- **Separación de Responsabilidades**: Lógica separada de la presentación
- **Type Safety**: TypeScript estricto en todo el proyecto
- **Performance First**: Optimizaciones de renderizado y caching
- **Developer Experience**: Herramientas de debugging integradas

---

## 🛠️ Stack Tecnológico

### Core Technologies
- **React 19.1.1**: Framework principal con las últimas características
- **TypeScript 5.9.3**: Type safety y mejor DX
- **Vite 7.1.7**: Build tool y dev server ultra-rápido
- **React Router 7.9.3**: Routing declarativo

### State Management & Data Fetching
- **TanStack React Query 5.90.2**: Server state management y caching
- **React Context**: Client state management
- **Axios 1.12.2**: HTTP client con interceptores

### UI & Styling
- **Styled Components 6.1.19**: CSS-in-JS con theming
- **React Hook Form 7.64.0**: Formularios performantes
- **Yup 1.7.1**: Validación de esquemas

### Drag & Drop
- **@dnd-kit**: Biblioteca moderna para drag & drop
  - `@dnd-kit/core`: Funcionalidad principal
  - `@dnd-kit/sortable`: Listas ordenables
  - `@dnd-kit/utilities`: Utilidades adicionales

### Development Tools
- **ESLint 9.36.0**: Linting con reglas estrictas
- **React Query DevTools**: Debugging de queries
- **TypeScript ESLint**: Reglas específicas para TS

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React organizados por dominio
│   ├── Auth/           # Autenticación y autorización
│   ├── Categories/     # Gestión de categorías
│   ├── Commons/        # Componentes reutilizables
│   ├── Debug/          # Herramientas de debugging
│   ├── DevTools/       # Herramientas de desarrollo
│   ├── Layout/         # Componentes de layout
│   └── Tasks/          # Gestión de tareas
├── config/             # Configuraciones del proyecto
│   ├── env.ts          # Variables de entorno
│   ├── queryClient.ts  # Configuración de React Query
│   └── queryOptimization.ts # Optimizaciones de queries
├── context/            # Contextos de React
│   ├── AuthContext.tsx # Contexto de autenticación
│   └── ThemeContext.tsx # Contexto de tema
├── hooks/              # Hooks personalizados
│   ├── useAuth.ts      # Autenticación
│   ├── useTasks.ts     # Gestión de tareas
│   ├── useCategories.ts # Gestión de categorías
│   └── ...             # Otros hooks especializados
├── pages/              # Páginas principales
│   ├── AuthPage.tsx    # Página de login/registro
│   ├── DashboardPage.tsx # Dashboard principal
│   ├── TaskPage.tsx    # Gestión de tareas
│   └── ...             # Otras páginas
├── services/           # Servicios externos
│   └── api.ts          # Cliente API con Axios
├── styles/             # Estilos globales
│   └── globals.css     # CSS global
├── types/              # Definiciones de tipos
│   └── index.ts        # Tipos principales
├── utils/              # Utilidades y helpers
│   ├── errorHandling.ts # Manejo de errores
│   ├── filterValidation.ts # Validación de filtros
│   ├── taskSorting.ts  # Algoritmos de ordenamiento
│   └── ...             # Otras utilidades
├── App.tsx             # Componente raíz
└── main.tsx            # Punto de entrada
```

---

## 🧩 Componentes

### Componentes de Autenticación (`Auth/`)
- **AuthForm**: Formulario unificado de login/registro
- **ProtectedRoute**: HOC para rutas protegidas
- **AuthGuard**: Componente de protección de rutas

### Componentes Comunes (`Commons/`)
- **ErrorBoundary**: Captura errores de React
- **ErrorToast**: Sistema de notificaciones
- **GlobalErrorHandler**: Manejo global de errores
- **QueryErrorBoundary**: Errores específicos de queries
- **OfflineIndicator**: Indicador de estado offline

### Componentes de Tareas (`Tasks/`)
- **TaskList**: Lista principal de tareas
- **TaskItem**: Item individual de tarea
- **TaskForm**: Formulario de creación/edición
- **FilterTask**: Panel de filtros avanzados
- **FilterIndicators**: Indicadores de filtros activos
- **SimpleTaskList**: Lista simplificada para comparación
- **QuickSortTest**: Botones de ordenamiento rápido
- **SimplePriorityTest**: Test de filtros de prioridad

### Componentes de Debug (`Debug/`)
- **FilterDebug**: Información detallada de filtros
- **SortDebug**: Análisis de ordenamiento
- **DueDateSortTest**: Test específico para fechas
- **TaskCreationDebug**: Debug de creación de tareas

### Componentes de DevTools (`DevTools/`)
- **DevToolbar**: Barra de herramientas de desarrollo
- **CacheInspector**: Inspector de caché de React Query

---

## 🎣 Hooks Personalizados

### Hooks de Datos
```typescript
// Gestión de tareas
useTasks()              // Lista de tareas con filtros
useTasksQuery()         // Query optimizada de tareas
useTaskMutations()      // Mutaciones CRUD de tareas
useTaskMutationsSimple() // Versión simplificada
useTaskMutationsDebug() // Versión con debugging

// Gestión de categorías
useCategorias()         // Lista de categorías
useCategoriesQuery()    // Query de categorías
useCategoryMutations()  // Mutaciones de categorías

// Gestión de etiquetas
useTags()              // Lista de etiquetas
useTagsQuery()         // Query de etiquetas
useTagMutations()      // Mutaciones de etiquetas
```

### Hooks de UI y UX
```typescript
// Filtros y ordenamiento
useFilterPersistence() // Persistencia de filtros
useFilterError()       // Manejo de errores de filtros
useSortFix()          // Corrección de ordenamiento
usePriorityFilterFix() // Corrección de filtros de prioridad

// Utilidades
useDebounce()         // Debounce de valores
useDragAndDrop()      // Funcionalidad drag & drop
useOfflineStatus()    // Estado de conexión
useQueryError()       // Manejo de errores de queries
```

### Ejemplo de Hook Personalizado
```typescript
// hooks/useTasksQuery.ts
export const useTasksQuery = (filtros: FiltrosTareas, orden: OrdenTareas) => {
  return useQuery({
    queryKey: ['tasks', filtros, orden],
    queryFn: () => api.getTasks(filtros, orden),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

---

## 🌐 Servicios y APIs

### Cliente API (`services/api.ts`)
```typescript
class ApiService {
  private client: AxiosInstance;

  // Configuración con interceptores
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  // Métodos de tareas
  async getTasks(filtros?: FiltrosTareas, orden?: OrdenTareas): Promise<Task[]>
  async createTask(data: TaskFormData): Promise<Task>
  async updateTask(id: string, data: Partial<TaskFormData>): Promise<Task>
  async deleteTask(id: string): Promise<void>

  // Métodos de categorías
  async getCategories(): Promise<Category[]>
  async createCategory(data: CategoryFormData): Promise<Category>

  // Métodos de autenticación
  async login(credentials: LoginData): Promise<AuthResponse>
  async register(data: RegisterData): Promise<AuthResponse>
}
```

### Interceptores HTTP
- **Request Interceptor**: Añade token de autenticación
- **Response Interceptor**: Maneja errores globalmente
- **Retry Logic**: Reintenta requests fallidos
- **Offline Detection**: Detecta estado de conexión

---

## 🗂️ Gestión de Estado

### React Query (Server State)
```typescript
// Configuración del Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutos
      gcTime: 10 * 60 * 1000,       // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Context API (Client State)
```typescript
// AuthContext - Estado de autenticación
interface AuthContextType {
  usuario: User | null;
  isLoading: boolean;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

// ThemeContext - Estado del tema
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
```

### Query Keys Strategy
```typescript
// utils/queryKeys.ts
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filtros: FiltrosTareas, orden: OrdenTareas) =>
      [...queryKeys.tasks.lists(), filtros, orden] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
  },
} as const;
```

---

## 🛣️ Routing y Navegación

### Configuración de Rutas
```typescript
// App.tsx
function AppRoutes() {
  const { usuario, isLoading } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
```

### Rutas Protegidas
```typescript
// components/Auth/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!usuario) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
```

### Navegación Programática
```typescript
// Uso en componentes
const navigate = useNavigate();
const location = useLocation();

// Navegación con estado
navigate('/tasks', {
  state: { filtros: currentFilters },
  replace: true
});
```

---

## 📝 Tipos y Interfaces

### Tipos Principales
```typescript
// Entidades principales
interface Task {
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

// Tipos de utilidad
type TaskPriority = 'baja' | 'media' | 'alta';
type TaskSortField = 'title' | 'priority' | 'dueDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';
```

### Tipos de Filtros
```typescript
interface FiltrosTareas {
  completed?: boolean;
  priority?: TaskPriority;
  categoryId?: string;
  tagId?: string;
  sinceDate?: string;
  untilDate?: string;
  search?: string;
}

interface OrdenTareas {
  field: TaskSortField;
  direction: SortDirection;
}
```

### Type Guards
```typescript
// Validadores de tipos en runtime
export const isTaskPriority = (value: unknown): value is TaskPriority => {
  return typeof value === 'string' && ['baja', 'media', 'alta'].includes(value);
};

export const isUUID = (value: unknown): value is string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && uuidRegex.test(value);
};
```

---

## 🔧 Utilidades

### Manejo de Errores (`utils/errorHandling.ts`)
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (axios.isAxiosError(error)) {
    return new AppError(
      error.response?.data?.message || 'Error de red',
      'NETWORK_ERROR',
      error.response?.status
    );
  }

  return new AppError('Error desconocido', 'UNKNOWN_ERROR');
};
```

### Validación de Filtros (`utils/filterValidation.ts`)
```typescript
export const validateFilters = (filtros: FiltrosTareas): FilterValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar UUID de categoría
  if (filtros.categoryId && !isUUID(filtros.categoryId)) {
    errors.push('ID de categoría inválido');
  }

  // Validar fechas
  if (filtros.sinceDate && !isISODateString(filtros.sinceDate)) {
    errors.push('Fecha de inicio inválida');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
```

### Algoritmos de Ordenamiento (`utils/taskSorting.ts`)
```typescript
export const sortTasks = (
  tasks: Task[],
  field: TaskSortField,
  direction: SortDirection
): Task[] => {
  return [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority':
        const priorityOrder = { baja: 1, media: 2, alta: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'dueDate':
        comparison = compareDueDates(a.dueDate, b.dueDate);
        break;
      default:
        comparison = new Date(a[field]).getTime() - new Date(b[field]).getTime();
    }

    return direction === 'desc' ? -comparison : comparison;
  });
};
```

### Filtrado del Cliente (`utils/clientSideFiltering.ts`)
```typescript
export const applyClientSideFilters = (
  tasks: Task[],
  filtros: FiltrosTareas
): Task[] => {
  return tasks.filter(task => {
    // Filtro por completado
    if (filtros.completed !== undefined && task.completed !== filtros.completed) {
      return false;
    }

    // Filtro por prioridad
    if (filtros.priority && task.priority !== filtros.priority) {
      return false;
    }

    // Filtro por búsqueda
    if (filtros.search) {
      const searchLower = filtros.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descMatch = task.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) {
        return false;
      }
    }

    return true;
  });
};
```

---

## ⚙️ Configuración

### Variables de Entorno (`config/env.ts`)
```typescript
export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Task Management',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
} as const;
```

### Configuración de React Query (`config/queryClient.ts`)
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof AppError && error.statusCode === 404) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Optimizaciones de Queries (`config/queryOptimization.ts`)
```typescript
export const queryOptimizations = {
  tasks: {
    staleTime: 5 * 60 * 1000,    // 5 minutos
    gcTime: 10 * 60 * 1000,      // 10 minutos
    refetchInterval: false,       // No auto-refetch
    refetchOnWindowFocus: false,  // No refetch en focus
  },
  categories: {
    staleTime: 30 * 60 * 1000,   // 30 minutos (más estable)
    gcTime: 60 * 60 * 1000,      // 1 hora
  },
} as const;
```

---

## 🐛 Debugging y Desarrollo

### Herramientas de Debug Integradas

#### DevToolbar (`components/DevTools/DevToolbar.tsx`)
- **Cache Inspector**: Visualiza el estado de React Query
- **Performance Monitor**: Métricas de rendimiento
- **Error Logger**: Historial de errores
- **Network Monitor**: Estado de requests

#### Componentes de Debug Específicos
```typescript
// FilterDebug - Análisis de filtros
<FilterDebug
  filtros={filtros}
  tasks={tasks}
  onFilterChange={setFiltros}
/>

// SortDebug - Verificación de ordenamiento
<SortDebug
  tasks={tasks}
  orden={orden}
  onOrderChange={setOrden}
/>
```

### Logging y Monitoreo
```typescript
// utils/performanceLogger.ts
export const performanceLogger = {
  startTimer: (label: string) => {
    console.time(label);
  },

  endTimer: (label: string) => {
    console.timeEnd(label);
  },

  logRender: (componentName: string, props: any) => {
    if (env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} rendered`, props);
    }
  },
};
```

### Query Key Debugger
```typescript
// utils/queryKeyDebugger.ts
export const debugQueryKeys = () => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  console.group('🔍 Active Queries');
  queries.forEach(query => {
    console.log('Key:', query.queryKey);
    console.log('State:', query.state);
    console.log('Data:', query.state.data);
  });
  console.groupEnd();
};
```

---

## ⚡ Optimización y Performance

### Estrategias de Optimización

#### 1. Memoización de Componentes
```typescript
// Componentes pesados memoizados
const TaskList = React.memo(({ tasks, onTaskUpdate }) => {
  return (
    <div>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onUpdate={onTaskUpdate} />
      ))}
    </div>
  );
});
```

#### 2. Lazy Loading de Componentes
```typescript
// Carga diferida de páginas
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const ExportPage = lazy(() => import('./pages/ExportPage'));

// Uso con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <StatisticsPage />
</Suspense>
```

#### 3. Optimización de Queries
```typescript
// Prefetching de datos relacionados
const prefetchCategories = () => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: api.getCategories,
    staleTime: 30 * 60 * 1000,
  });
};

// Invalidación selectiva
const invalidateTaskQueries = () => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.tasks.all,
    exact: false,
  });
};
```

#### 4. Debouncing de Inputs
```typescript
// Hook de debounce personalizado
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

### Métricas de Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 500KB (gzipped)

---

## 👨‍💻 Guía de Desarrollo

### Configuración del Entorno
```bash
# Instalación de dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Estructura de Commits
```
feat(tasks): add priority filter with client-side fallback
fix(auth): resolve token refresh issue
docs(readme): update installation instructions
style(ui): improve button hover states
refactor(hooks): extract common query logic
test(utils): add unit tests for sorting algorithms
```

### Convenciones de Código

#### Naming Conventions
- **Componentes**: PascalCase (`TaskList`, `FilterDebug`)
- **Hooks**: camelCase con prefijo `use` (`useTasksQuery`, `useDebounce`)
- **Utilidades**: camelCase (`sortTasks`, `validateFilters`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`, `QUERY_KEYS`)

#### Estructura de Archivos
```typescript
// Orden de imports
import React from 'react';                    // React
import { useState, useEffect } from 'react';  // React hooks
import { useQuery } from '@tanstack/react-query'; // Librerías externas
import { TaskList } from '../Tasks/TaskList'; // Componentes internos
import { useTasksQuery } from '../../hooks';  // Hooks internos
import { Task } from '../../types';           // Tipos
import './TaskPage.css';                      // Estilos

// Orden dentro del componente
export const TaskPage: React.FC = () => {
  // 1. Hooks de estado
  const [filtros, setFiltros] = useState<FiltrosTareas>({});

  // 2. Hooks de datos
  const { data: tasks, isLoading } = useTasksQuery(filtros);

  // 3. Handlers
  const handleFilterChange = useCallback((newFiltros: FiltrosTareas) => {
    setFiltros(newFiltros);
  }, []);

  // 4. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 5. Early returns
  if (isLoading) return <LoadingSpinner />;

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Testing Strategy
```typescript
// Ejemplo de test unitario
describe('sortTasks', () => {
  it('should sort tasks by title in ascending order', () => {
    const tasks = [
      { id: '1', title: 'Z Task', priority: 'baja' },
      { id: '2', title: 'A Task', priority: 'alta' },
    ];

    const sorted = sortTasks(tasks, 'title', 'asc');

    expect(sorted[0].title).toBe('A Task');
    expect(sorted[1].title).toBe('Z Task');
  });
});
```

### Debugging Tips
1. **React Query DevTools**: Siempre habilitado en desarrollo
2. **Console Logs**: Usar `performanceLogger` para logs estructurados
3. **Error Boundaries**: Capturan errores en componentes específicos
4. **Network Tab**: Monitorear requests HTTP
5. **React DevTools**: Inspeccionar estado de componentes

---

## 📚 Recursos Adicionales

### Documentación Externa
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### Herramientas de Desarrollo
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

---

*Documentación generada automáticamente - Última actualización: $(date)*
