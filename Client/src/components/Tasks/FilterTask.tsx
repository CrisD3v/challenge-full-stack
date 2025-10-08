import styled from 'styled-components';
import { useCategories } from '../../hooks/useCategorias';
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

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-secondary);
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

interface FilterTaskProps {
    filtros: FiltrosTareas;
    orden: OrdenTareas;
    onFiltrosChange: (filtros: FiltrosTareas) => void;
    onOrdenChange: (orden: OrdenTareas) => void;
}

export function FilterTask({ filtros, orden, onFiltrosChange, onOrdenChange }: FilterTaskProps) {
    const { categorias } = useCategories();
    const { etiquetas } = useTags();

    const handleFiltroChange = (key: keyof FiltrosTareas, value: any) => {
        onFiltrosChange({
            ...filtros,
            [key]: value === '' ? undefined : value
        });
    };

    const handleOrdenChange = (campo: string, direccion?: string) => {
        if (direccion) {
            onOrdenChange({ ...orden, direction: direccion as 'asc' | 'desc' });
        } else {
            onOrdenChange({ ...orden, field: campo as any });
        }
    };

    const limpiarFiltros = () => {
        onFiltrosChange({});
        onOrdenChange({ field: 'createdAt', direction: 'desc' });
    };

    return (
        <FilterContainer>
            <FilterSection>
                <FilterTitle>Buscar</FilterTitle>
                <Input
                    type="text"
                    placeholder="Buscar por título o descripción..."
                    value={filtros.search || ''}
                    onChange={(e) => handleFiltroChange('search', e.target.value)}
                />
            </FilterSection>

            <FilterSection>
                <FilterTitle>Estado</FilterTitle>
                <CheckboxGroup>
                    <CheckboxItem>
                        <Checkbox
                            type="radio"
                            name="completada"
                            checked={filtros.completed === undefined}
                            onChange={() => handleFiltroChange('completed', undefined)}
                        />
                        Todas
                    </CheckboxItem>
                    <CheckboxItem>
                        <Checkbox
                            type="radio"
                            name="completada"
                            checked={filtros.completed === false}
                            onChange={() => handleFiltroChange('completed', false)}
                        />
                        Pendientes
                    </CheckboxItem>
                    <CheckboxItem>
                        <Checkbox
                            type="radio"
                            name="completada"
                            checked={filtros.completed === true}
                            onChange={() => handleFiltroChange('completed', true)}
                        />
                        Completadas
                    </CheckboxItem>
                </CheckboxGroup>
            </FilterSection>

            <FilterSection>
                <FilterTitle>Prioridad</FilterTitle>
                <Select
                    value={filtros.priority || ''}
                    onChange={(e) => handleFiltroChange('priority', e.target.value)}
                >
                    <option value="">Todas las prioridades</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                </Select>
            </FilterSection>

            <FilterSection>
                <FilterTitle>Categoría</FilterTitle>
                <Select
                    value={filtros.categoryId || ''}
                    onChange={(e) => handleFiltroChange('categoryId', e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {Array.isArray(categorias) && categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.name}
                        </option>
                    ))}
                </Select>
            </FilterSection>

            {Array.isArray(etiquetas) && etiquetas.length > 0 && (
                <FilterSection>
                    <FilterTitle>Etiqueta</FilterTitle>
                    <Select
                        value={filtros.tagId || ''}
                        onChange={(e) => handleFiltroChange('tagId', e.target.value)}
                    >
                        <option value="">Todas las etiquetas</option>
                        {Array.isArray(etiquetas) && etiquetas.map((etiqueta) => (
                            <option key={etiqueta.id} value={etiqueta.id}>
                                {etiqueta.name}
                            </option>
                        ))}
                    </Select>
                </FilterSection>
            )}

            <FilterSection>
                <FilterTitle>Fechas</FilterTitle>
                <FilterGroup>
                    <Input
                        type="date"
                        placeholder="Fecha desde"
                        value={filtros.sinceDate || ''}
                        onChange={(e) => handleFiltroChange('sinceDate', e.target.value)}
                    />
                    <Input
                        type="date"
                        placeholder="Fecha hasta"
                        value={filtros.untilDate || ''}
                        onChange={(e) => handleFiltroChange('untilDate', e.target.value)}
                    />
                </FilterGroup>
            </FilterSection>

            <Divider />

            <FilterSection>
                <FilterTitle>Ordenar por</FilterTitle>
                <FilterGroup>
                    <Select
                        value={orden.field}
                        onChange={(e) => handleOrdenChange(e.target.value)}
                    >
                        <option value="createdAt">Fecha de creación</option>
                        <option value="titulo">Título</option>
                        <option value="prioridad">Prioridad</option>
                        <option value="fechaVencimiento">Fecha de vencimiento</option>
                    </Select>
                    <Select
                        value={orden.direction}
                        onChange={(e) => handleOrdenChange(orden.field, e.target.value)}
                    >
                        <option value="desc">Descendente</option>
                        <option value="asc">Ascendente</option>
                    </Select>
                </FilterGroup>
            </FilterSection>

            <ClearButton onClick={limpiarFiltros}>
                🗑️ Limpiar Filtros
            </ClearButton>
        </FilterContainer>
    );
}