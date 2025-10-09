import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useCategories } from '../../hooks/useCategorias';
import { useDebounce } from '../../hooks/useDebounce';
import { useFilterError } from '../../hooks/useFilterError';
import { usePriorityFilterFix } from '../../hooks/usePriorityFilterFix';
import { useTags } from '../../hooks/useTags';
import type { FiltrosTareas, OrdenTareas } from '../../types';

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FilterTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Select = styled.select<{ $disabled?: boolean }>`
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: ${props => props.$disabled ? 'var(--color-bg-secondary)' : 'var(--color-bg)'};
  color: var(--color-text);
  font-size: 0.875rem;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Input = styled.input<{ $hasError?: boolean; $disabled?: boolean }>`
  padding: 0.5rem;
  border: 1px solid ${props => props.$hasError ? 'var(--color-error, #ef4444)' : 'var(--color-border)'};
  border-radius: 6px;
  background-color: ${props => props.$disabled ? 'var(--color-bg-secondary)' : 'var(--color-bg)'};
  color: var(--color-text);
  font-size: 0.875rem;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'text'};

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? 'var(--color-error, #ef4444)' : 'var(--color-primary)'};
  }

  &::placeholder {
    color: var(--color-text-secondary);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text);
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin: 0;
`;

const ClearButton = styled.button`
  padding: 0.5rem;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-bg-tertiary);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0.5rem 0;
`;

const ErrorMessage = styled.div`
  color: var(--color-error, #ef4444);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RetryButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 0.5rem;

  &:hover {
    background-color: var(--color-primary-dark, #2563eb);
  }

  &:disabled {
    background-color: var(--color-bg-secondary);
    color: var(--color-text-secondary);
    cursor: not-allowed;
  }
`;

const FilterErrorContainer = styled.div`
  background-color: var(--color-error-bg, #fef2f2);
  border: 1px solid var(--color-error-border, #fecaca);
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
`;

const FilterErrorTitle = styled.h4`
  color: var(--color-error, #ef4444);
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterErrorMessage = styled.p`
  color: var(--color-error-text, #991b1b);
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.4;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  display: block;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const FilterGroupWithError = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

interface FilterTaskProps {
    filtros: FiltrosTareas;
    orden: OrdenTareas;
    onFiltrosChange: (filtros: FiltrosTareas) => void;
    onOrdenChange: (orden: OrdenTareas) => void;
    isLoading?: boolean;
    error?: any;
    onRetry?: () => void;
}

export function FilterTask({
    filtros,
    orden,
    onFiltrosChange,
    onOrdenChange,
    isLoading = false,
    error,
    onRetry
}: FilterTaskProps) {
    const { categorias, isLoading: categoriasLoading, error: categoriasError } = useCategories();
    const { etiquetas, isLoading: etiquetasLoading, error: etiquetasError } = useTags();

    // Hook para manejar el filtro de prioridad de manera robusta
    const { applyPriorityFilter } = usePriorityFilterFix(filtros, onFiltrosChange, onRetry);

    // Filter error handling
    const {
        handleFilterError,
        validateFilters,
        showValidationErrors,
        retryFilterOperation
    } = useFilterError();

    // Estado local para el campo de búsqueda (sin debounce)
    const [searchInput, setSearchInput] = useState(filtros.search || '');

    // Estado para errores de validación
    const [dateError, setDateError] = useState<string>('');
    const [filterErrors, setFilterErrors] = useState<string[]>([]);
    const [isRetrying, setIsRetrying] = useState(false);

    // Valor debounced para la búsqueda (300ms de delay)
    const debouncedSearch = useDebounce(searchInput, 300);

    // Efecto para aplicar el filtro de búsqueda cuando el valor debounced cambia
    useEffect(() => {
        // Only update if the debounced search is different from current search
        if (debouncedSearch !== filtros.search) {
            const newFiltros = {
                ...filtros,
                search: debouncedSearch === '' ? undefined : debouncedSearch
            };
            onFiltrosChange(newFiltros);
        }
    }, [debouncedSearch]); // Only depend on debouncedSearch to avoid infinite loop

    // Sincronizar el estado local cuando los filtros cambian externamente
    useEffect(() => {
        if (filtros.search !== searchInput) {
            setSearchInput(filtros.search || '');
        }
    }, [filtros.search]);

    // Validación de rangos de fechas y filtros
    useEffect(() => {
        // Validar filtros usando el hook de error
        const validation = validateFilters(filtros);

        if (!validation.isValid) {
            setFilterErrors(validation.errors);
            // Solo mostrar el primer error como dateError para compatibilidad
            const dateErrors = validation.errors.filter((error: string) =>
                error.includes('fecha') || error.includes('date')
            );
            setDateError(dateErrors[0] || '');
        } else {
            setFilterErrors([]);
            setDateError('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros]); // Only depend on filtros, not on validateFilters function

    // Manejar errores de carga de categorías y etiquetas
    useEffect(() => {
        if (categoriasError) {
            handleFilterError(categoriasError, 'load');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoriasError]); // Only depend on the error, not the handler function

    useEffect(() => {
        if (etiquetasError) {
            handleFilterError(etiquetasError, 'load');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [etiquetasError]); // Only depend on the error, not the handler function

    const handleFiltroChange = async (key: keyof FiltrosTareas, value: any) => {
        console.log('FilterTask: handleFiltroChange called', { key, value, currentFiltros: filtros });

        // Crear nuevos filtros con manejo especial para valores vacíos
        const newFiltros = { ...filtros };

        if (value === '' || value === null || value === undefined) {
            // Eliminar el filtro si el valor está vacío
            delete newFiltros[key];
        } else {
            // Asignar el nuevo valor
            newFiltros[key] = value;
        }

        console.log('FilterTask: newFiltros created', newFiltros);

        // Validar los nuevos filtros antes de aplicarlos
        const validation = validateFilters(newFiltros);
        console.log('FilterTask: validation result', validation);

        if (!validation.isValid) {
            console.log('FilterTask: validation failed, showing errors', validation.errors);
            // Mostrar errores de validación pero no aplicar los filtros
            showValidationErrors(validation.errors, validation.warnings);
            return;
        }

        // Show warnings even if validation passes
        if (validation.warnings && validation.warnings.length > 0) {
            showValidationErrors([], validation.warnings);
        }

        // Log específico para filtro de prioridad
        if (key === 'priority') {
            console.log('FilterTask: Priority filter change detected', {
                oldPriority: filtros.priority,
                newPriority: value,
                finalFilters: newFiltros,
                willRemoveFilter: value === '' || value === null || value === undefined
            });
        }

        // Aplicar los filtros
        console.log('FilterTask: applying filters directly');
        onFiltrosChange(newFiltros);
        console.log('FilterTask: filters applied successfully');
    };

    const handleOrdenChange = (campo: string, direccion?: string) => {
        let newOrden;

        if (direccion) {
            // Cambiar solo la dirección, mantener el campo actual
            newOrden = { ...orden, direction: direccion as 'asc' | 'desc' };
        } else {
            // Cambiar solo el campo, mantener la dirección actual
            newOrden = { ...orden, field: campo as any };
        }

        console.log('FilterTask: handleOrdenChange called', {
            campo,
            direccion,
            currentOrden: orden,
            newOrden
        });

        onOrdenChange(newOrden);
    };

    const limpiarFiltros = () => {
        console.log('FilterTask: limpiarFiltros called');
        setSearchInput(''); // Limpiar también el estado local de búsqueda
        setFilterErrors([]); // Limpiar errores
        setDateError('');
        onFiltrosChange({});
        onOrdenChange({ field: 'createdAt', direction: 'desc' });
    };

    // Función para reintentar la operación actual
    const handleRetry = async () => {
        if (!onRetry) return;

        setIsRetrying(true);
        try {
            await retryFilterOperation(
                async () => {
                    await onRetry();
                    return true;
                },
                'manual-retry',
                1
            );
        } catch (error) {
            handleFilterError(error, 'apply', filtros, orden);
        } finally {
            setIsRetrying(false);
        }
    };

    return (
        <FilterContainer>
            {/* Error display section */}
            {(error || filterErrors.length > 0) && (
                <FilterErrorContainer>
                    <FilterErrorTitle>
                        ⚠️ {error ? 'Error al cargar filtros' : 'Errores de validación'}
                    </FilterErrorTitle>
                    <FilterErrorMessage>
                        {error ? (
                            <>
                                No se pudieron cargar los datos para los filtros.
                                {onRetry && (
                                    <RetryButton
                                        onClick={handleRetry}
                                        disabled={isRetrying || isLoading}
                                    >
                                        {isRetrying ? 'Reintentando...' : 'Reintentar'}
                                    </RetryButton>
                                )}
                            </>
                        ) : (
                            filterErrors.map((error, index) => (
                                <div key={index}>• {error}</div>
                            ))
                        )}
                    </FilterErrorMessage>
                </FilterErrorContainer>
            )}

            <FilterSection>
                <FilterTitle id="search-label">Buscar</FilterTitle>
                <Input
                    type="text"
                    placeholder="Buscar por título o descripción..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    $disabled={isLoading}
                    disabled={isLoading}
                    aria-labelledby="search-label"
                    aria-describedby="search-help"
                />
                <div id="search-help" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    {isLoading && <LoadingSpinner />} Busca en títulos y descripciones de tareas
                </div>
            </FilterSection>

            <FilterSection>
                <FilterTitle id="status-label">Estado</FilterTitle>
                <CheckboxGroup role="radiogroup" aria-labelledby="status-label">
                    <CheckboxItem>
                        <Checkbox
                            type="radio"
                            name="completada"
                            checked={filtros.completed === undefined}
                            onChange={() => handleFiltroChange('completed', undefined)}
                            disabled={isLoading}
                            aria-label="Mostrar todas las tareas"
                        />
                        Todas
                    </CheckboxItem>
                    <CheckboxItem>
                        <Checkbox
                            type="radio"
                            name="completada"
                            checked={filtros.completed === false}
                            onChange={() => handleFiltroChange('completed', false)}
                            disabled={isLoading}
                            aria-label="Mostrar solo tareas pendientes"
                        />
                        Pendientes
                    </CheckboxItem>
                    <CheckboxItem>
                        <Checkbox
                            type="radio"
                            name="completada"
                            checked={filtros.completed === true}
                            onChange={() => handleFiltroChange('completed', true)}
                            disabled={isLoading}
                            aria-label="Mostrar solo tareas completadas"
                        />
                        Completadas
                    </CheckboxItem>
                </CheckboxGroup>
            </FilterSection>

            <FilterSection>
                <Label htmlFor="priority-select">Prioridad</Label>
                <Select
                    id="priority-select"
                    value={filtros.priority || ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log('Priority select onChange:', {
                            value,
                            isEmpty: value === '',
                            currentPriority: filtros.priority,
                            allFilters: filtros
                        });

                        // Aplicar filtro directamente sin el hook complejo
                        const newFiltros = { ...filtros };
                        if (value === '') {
                            delete newFiltros.priority;
                        } else {
                            newFiltros.priority = value as any;
                        }

                        console.log('Priority select: Applying new filterstly:', newFiltros);
                        onFiltrosChange(newFiltros);
                    }}
                    $disabled={isLoading}
                    disabled={isLoading}
                    aria-label="Filtrar por prioridad de tarea"
                >
                    <option value="">Todas las prioridades</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                </Select>
                {isLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        <LoadingSpinner /> Cargando...
                    </div>
                )}
                {/* Debug info para prioridad */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        Debug: Prioridad actual = "{filtros.priority || 'ninguna'}"
                    </div>
                )}
            </FilterSection>

            <FilterSection>
                <Label htmlFor="category-select">Categoría</Label>
                <Select
                    id="category-select"
                    value={filtros.categoryId || ''}
                    onChange={(e) => handleFiltroChange('categoryId', e.target.value)}
                    $disabled={isLoading || categoriasLoading}
                    disabled={isLoading || categoriasLoading}
                    aria-label="Filtrar por categoría de tarea"
                >
                    <option value="">Todas las categorías</option>
                    {Array.isArray(categorias) && categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.name}
                        </option>
                    ))}
                </Select>
                {(isLoading || categoriasLoading) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        <LoadingSpinner /> Cargando categorías...
                    </div>
                )}
            </FilterSection>

            {(Array.isArray(etiquetas) && etiquetas.length > 0) || etiquetasLoading ? (
                <FilterSection>
                    <Label htmlFor="tag-select">Etiqueta</Label>
                    <Select
                        id="tag-select"
                        value={filtros.tagId || ''}
                        onChange={(e) => handleFiltroChange('tagId', e.target.value)}
                        $disabled={isLoading || etiquetasLoading}
                        disabled={isLoading || etiquetasLoading}
                        aria-label="Filtrar por etiqueta de tarea"
                    >
                        <option value="">Todas las etiquetas</option>
                        {Array.isArray(etiquetas) && etiquetas.map((etiqueta) => (
                            <option key={etiqueta.id} value={etiqueta.id}>
                                {etiqueta.name}
                            </option>
                        ))}
                    </Select>
                    {(isLoading || etiquetasLoading) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            <LoadingSpinner /> Cargando etiquetas...
                        </div>
                    )}
                </FilterSection>
            ) : null}

            <FilterSection>
                <FilterTitle id="dates-label">Fechas</FilterTitle>
                <FilterGroupWithError>
                    <Label htmlFor="since-date">Fecha desde</Label>
                    <Input
                        id="since-date"
                        type="date"
                        value={filtros.sinceDate || ''}
                        onChange={(e) => handleFiltroChange('sinceDate', e.target.value)}
                        $disabled={isLoading}
                        $hasError={!!dateError}
                        disabled={isLoading}
                        aria-label="Filtrar tareas desde esta fecha"
                        aria-describedby={dateError ? "date-error" : undefined}
                    />

                    <Label htmlFor="until-date">Fecha hasta</Label>
                    <Input
                        id="until-date"
                        type="date"
                        value={filtros.untilDate || ''}
                        onChange={(e) => handleFiltroChange('untilDate', e.target.value)}
                        $disabled={isLoading}
                        $hasError={!!dateError}
                        disabled={isLoading}
                        aria-label="Filtrar tareas hasta esta fecha"
                        aria-describedby={dateError ? "date-error" : undefined}
                    />

                    {dateError && (
                        <ErrorMessage id="date-error" role="alert">
                            ⚠️ {dateError}
                        </ErrorMessage>
                    )}
                </FilterGroupWithError>
            </FilterSection>

            <Divider />

            <FilterSection>
                <FilterTitle id="sort-label">Ordenar por</FilterTitle>
                <FilterGroup>
                    <Label htmlFor="sort-field">Campo de ordenamiento</Label>
                    <Select
                        id="sort-field"
                        value={orden.field}
                        onChange={(e) => {
                            const field = e.target.value;
                            console.log('Sort field onChange:', {
                                field,
                                currentField: orden.field,
                                currentDirection: orden.direction
                            });
                            handleOrdenChange(field);
                        }}
                        $disabled={isLoading}
                        disabled={isLoading}
                        aria-label="Seleccionar campo para ordenar tareas"
                    >
                        <option value="createdAt">Fecha de creación</option>
                        <option value="title">Título</option>
                        <option value="priority">Prioridad</option>
                        <option value="dueDate">Fecha de vencimiento</option>
                    </Select>

                    <Label htmlFor="sort-direction">Dirección de ordenamiento</Label>
                    <Select
                        id="sort-direction"
                        value={orden.direction}
                        onChange={(e) => {
                            const direction = e.target.value;
                            console.log('Sort direction onChange:', {
                                direction,
                                currentField: orden.field,
                                currentDirection: orden.direction
                            });
                            handleOrdenChange(orden.field, direction);
                        }}
                        $disabled={isLoading}
                        disabled={isLoading}
                        aria-label="Seleccionar dirección de ordenamiento"
                    >
                        <option value="desc">Descendente</option>
                        <option value="asc">Ascendente</option>
                    </Select>
                </FilterGroup>
            </FilterSection>

            <ClearButton
                onClick={limpiarFiltros}
                disabled={isLoading}
                aria-label="Limpiar todos los filtros aplicados"
                style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
                🗑️ Limpiar Filtros
                {isLoading && <LoadingSpinner style={{ marginLeft: '0.5rem' }} />}
            </ClearButton>
        </FilterContainer>
    );
}
