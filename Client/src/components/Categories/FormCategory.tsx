import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import * as yup from 'yup';
import { useCategorias } from '../../hooks/useCategorias';
import type { Category } from '../../types';
import { generarColorAleatorio } from '../../utils/helpers';
import { Loading } from '../Commons/Loading';
import { ErrorMessage } from '../Commons/ErrorMessage';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.875rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.$hasError ? 'var(--color-error)' : 'var(--color-border)'};
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.$hasError ? 'var(--color-error)' : 'var(--color-border)'};
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: border-color 0.2s;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ColorInput = styled.input`
  width: 50px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  background: none;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
  }
`;

const ColorPresets = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ColorPreset = styled.button<{ $color: string; $selected?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${props => props.$selected ? 'var(--color-primary)' : 'var(--color-border)'};
  background-color: ${props => props.$color};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const RandomColorButton = styled.button`
  padding: 0.5rem 1rem;
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

const ErrorText = styled.span`
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.variant === 'primary' ? `
    background-color: var(--color-primary);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }
  ` : `
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    border: 1px solid var(--color-border);

    &:hover:not(:disabled) {
      background-color: var(--color-bg-tertiary);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const colorPresets = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
];

const schema = yup.object({
    name: yup
        .string()
        .required('El nombre es requerido')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    description: yup
        .string()
        .required('La descripcion es requerida')
        .max(200, 'La descripción no puede exceder 200 caracteres'),
    color: yup
        .string()
        .required('El color es requerido')
        .matches(/^#[0-9A-F]{6}$/i, 'Debe ser un color hexadecimal válido'),
});

interface FormCategoryProps {
    category?: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function FormCategory({ category, onSuccess, onCancel }: FormCategoryProps) {
    const { crearCategoria, actualizarCategoria, error, limpiarError } = useCategorias();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            color: generarColorAleatorio(),
        },
    });

    const colorActual = watch('color');

    useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                description: category.description || '',
                color: category.color || generarColorAleatorio(),
            });
        }
    }, [category, reset]);

    const onSubmit = async (data: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        try {
            limpiarError();

            if (category) {
                await actualizarCategoria(category.id, data);
            } else {
                await crearCategoria(data);
            }

            onSuccess();
        } catch (error) {
            // El error se maneja en el hook
        }
    };

    const handleColorPresetClick = (color: string) => {
        setValue('color', color);
    };

    const handleRandomColor = () => {
        setValue('color', generarColorAleatorio());
    };

    return (
        <>
            {error && (
                <ErrorMessage
                    mensaje={error}
                    onCerrar={limpiarError}
                />
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormGroup>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                        id="nombre"
                        type="text"
                        placeholder="Nombre de la categoría"
                        $hasError={!!errors.name}
                        {...register('name')}
                    />
                    {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <TextArea
                        id="descripcion"
                        placeholder="Describe esta categoría..."
                        $hasError={!!errors.description}
                        {...register('description')}
                    />
                    {errors.description && <ErrorText>{errors.description.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label>Color</Label>
                    <ColorPicker>
                        <ColorInput
                            type="color"
                            value={colorActual}
                            {...register('color')}
                        />
                        <RandomColorButton type="button" onClick={handleRandomColor}>
                            🎲 Aleatorio
                        </RandomColorButton>
                    </ColorPicker>

                    <ColorPresets>
                        {colorPresets.map((color) => (
                            <ColorPreset
                                key={color}
                                type="button"
                                $color={color}
                                $selected={colorActual === color}
                                onClick={() => handleColorPresetClick(color)}
                                title={`Seleccionar color ${color}`}
                            />
                        ))}
                    </ColorPresets>

                    {errors.color && <ErrorText>{errors.color.message}</ErrorText>}
                </FormGroup>

                <FormActions>
                    <Button type="button" onClick={onCancel} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loading size="small" mostrarTexto={false} />
                        ) : (
                            category ? 'Actualizar Categoría' : 'Crear Categoría'
                        )}
                    </Button>
                </FormActions>
            </Form>
        </>
    );
}