import { useState } from 'react';
import styled from 'styled-components';
import { FormCategory } from '../components/Categories/FormCategory';
import { ListCategory } from '../components/Categories/ListCategory';
import { Loading } from '../components/Commons/Loading';
import { ErrorMessage } from '../components/Commons/ErrorMessage';
import { Modal } from '../components/Commons/Modal';
import { useCategorias } from '../hooks/useCategorias';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
`;

const Button = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Description = styled.p`
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

export function CategoryPage() {
    const { categorias, isLoading, error, limpiarError } = useCategorias();
    const [modalAbierto, setModalAbierto] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState(null);

    const handleNuevaCategoria = () => {
        setCategoriaEditando(null);
        setModalAbierto(true);
    };

    const handleEditarCategoria = (categoria: any) => {
        setCategoriaEditando(categoria);
        setModalAbierto(true);
    };

    const handleCerrarModal = () => {
        setModalAbierto(false);
        setCategoriaEditando(null);
    };

    if (isLoading && (!Array.isArray(categorias) || categorias.length === 0)) {
        return <Loading size="large" texto="Cargando categorías..." />;
    }

    return (
        <PageContainer>
            <PageHeader>
                <div>
                    <PageTitle>Categorías</PageTitle>
                    <Description>
                        Organiza tus tareas en categorías para una mejor gestión
                    </Description>
                </div>
                <Button onClick={handleNuevaCategoria}>
                    ➕ Nueva Categoría
                </Button>
            </PageHeader>

            {error && (
                <ErrorMessage
                    mensaje={error}
                    onCerrar={limpiarError}
                />
            )}

            <ListCategory
                categorias={categorias}
                isLoading={isLoading}
                onEditarCategoria={handleEditarCategoria}
            />

            <Modal
                isOpen={modalAbierto}
                onClose={handleCerrarModal}
                titulo={categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
                size="small"
            >
                <FormCategory
                    category={categoriaEditando}
                    onSuccess={handleCerrarModal}
                    onCancel={handleCerrarModal}
                />
            </Modal>
        </PageContainer>
    );
}