import styled from 'styled-components';
import { useCategories } from '../../hooks/useCategorias';
import type { Category } from '../../types';
import { Loading } from '../Commons/Loading';

const ListContainer = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

const CategoryCard = styled.div`
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--color-shadow);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CategoryColor = styled.div<{ $color?: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.$color || 'var(--color-primary)'};
  flex-shrink: 0;
`;

const CategoryDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
  }

  &.danger:hover {
    background-color: var(--color-error-bg);
    color: var(--color-error);
  }
`;

const CategoryStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const StatItem = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.$color || 'var(--color-primary)'};
  padding: 0.25rem 0.5rem;
  width: 100%;
  height: 100%;
  border-radius: 6px;
`;

const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--color-text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
`;

interface ListCategoryProps {
    categorias: Category[];
    isLoading: boolean;
    onEditarCategoria: (categoria: Category) => void;
}

export function ListCategory({ categorias, isLoading, onEditarCategoria }: ListCategoryProps) {
    const { eliminarCategoria } = useCategories();

    // Debug logs
    console.log('ListaCategorias - categorias recibidas:', categorias);
    console.log('ListaCategorias - isLoading:', isLoading);
    console.log('ListaCategorias - Array.isArray(categorias):', Array.isArray(categorias));

    const handleEliminar = async (categoria: Category) => {
        if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoria.name}"?`)) {
            try {
                await eliminarCategoria(categoria.id);
            } catch (error) {
                console.error('Error al eliminar categoría:', error);
            }
        }
    };

    if (isLoading && (!Array.isArray(categorias) || categorias.length === 0)) {
        return (
            <ListContainer>
                <div style={{ padding: '2rem' }}>
                    <Loading texto="Cargando categorías..." />
                </div>
            </ListContainer>
        );
    }

    if (!Array.isArray(categorias) || categorias.length === 0) {
        return (
            <ListContainer>
                <EmptyState>
                    <EmptyIcon>📁</EmptyIcon>
                    <EmptyTitle>No hay categorías</EmptyTitle>
                    <EmptyDescription>
                        Crea tu primera categoría para organizar mejor tus tareas
                    </EmptyDescription>
                </EmptyState>
            </ListContainer>
        );
    }

    return (
        <ListContainer>
            <CategoryGrid>
                {Array.isArray(categorias) && categorias.map((categoria) => (
                    <CategoryCard key={categoria.id}>
                        <CategoryHeader>
                            <CategoryInfo>
                                <CategoryName>
                                    <CategoryColor $color={categoria.color} />
                                    {categoria.name}
                                </CategoryName>
                                {categoria.description && (
                                    <CategoryDescription>
                                        {categoria.description}
                                    </CategoryDescription>
                                )}
                            </CategoryInfo>

                            <CategoryActions>
                                <ActionButton
                                    onClick={() => onEditarCategoria(categoria)}
                                    title="Editar categoría"
                                >
                                    ✏️
                                </ActionButton>
                                <ActionButton
                                    className="danger"
                                    onClick={() => handleEliminar(categoria)}
                                    title="Eliminar categoría"
                                >
                                    🗑️
                                </ActionButton>
                            </CategoryActions>
                        </CategoryHeader>

                        <CategoryStats>
                            <StatItem $color={categoria.color}/>
                        </CategoryStats>
                    </CategoryCard>
                ))}
            </CategoryGrid>
        </ListContainer>
    );
}