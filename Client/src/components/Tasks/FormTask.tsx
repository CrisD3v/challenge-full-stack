import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import * as yup from 'yup';
import { useCategories } from '../../hooks/useCategorias';
import { useTags } from '../../hooks/useTags';
import { useTasks } from '../../hooks/useTasks';
import type { Task, TaskFormData } from '../../types';
import { ErrorMessage } from '../Commons/ErrorMessage';
import { Loading } from '../Commons/Loading';

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
  min-height: 100px;
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

const Select = styled.select<{ $hasError?: boolean }>`
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

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const TagCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-bg-secondary);
  }

  input:checked + & {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary);
  }
`;

const schema: yup.ObjectSchema<TaskFormData> = yup.object({
    title: yup
        .string()
        .required('El título es requerido')
        .min(3, 'El título debe tener al menos 3 caracteres')
        .max(100, 'El título no puede exceder 100 caracteres'),
    description: yup
        .string()
        .optional()
        .max(500, 'La descripción no puede exceder 500 caracteres'),
    priority: yup
        .mixed<'baja' | 'media' | 'alta'>()
        .oneOf(['baja', 'media', 'alta'], 'Selecciona una prioridad válida')
        .required('La prioridad es requerida'),
    dueDate: yup
        .string()
        .optional(),
    categoryId: yup
        .string()
        .optional(),
    tagIds: yup
        .array()
        .of(yup.string().required())
        .optional(),
});

interface FormTaskProps {
    tarea?: Task | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function FormTask({ tarea, onSuccess, onCancel }: FormTaskProps) {
    const { crearTarea, actualizarTarea, error, limpiarError } = useTasks();
    const { categorias } = useCategories();
    const { etiquetas } = useTags();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<TaskFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'media',
            dueDate: '',
            categoryId: '',
            tagIds: [],
        },
    });

    const tagIds = watch('tagIds') || [];

    useEffect(() => {
        if (tarea) {
            reset({
                title: tarea.title,
                description: tarea.description || '',
                priority: tarea.priority,
                dueDate: tarea.dueDate ? tarea.dueDate.split('T')[0] : '',
                categoryId: tarea.categoryId || '',
                tagIds: tarea.tags?.map(e => e.id) || [],
            });
        }
    }, [tarea, reset]);

    const onSubmit = async (data: TaskFormData) => {
        try {
            limpiarError();

            // Limpiar campos vacíos
            const cleanData = {
                ...data,
                descripcion: data.description || undefined,
                fechaVencimiento: data.dueDate || undefined,
                categoriaId: data.categoryId || undefined,
                etiquetaIds: data.tagIds?.length ? data.tagIds : undefined,
            };

            if (tarea) {
                await actualizarTarea(tarea.id, cleanData);
            } else {
                await crearTarea(cleanData);
            }

            onSuccess();
        } catch (error) {
            // El error se maneja en el hook
        }
    };

    const handleEtiquetaChange = (tagId: string, checked: boolean) => {
        const currentIds = tagIds || [];
        if (checked) {
            setValue('tagIds', [...currentIds, tagId]);
        } else {
            setValue('tagIds', currentIds.filter(id => id !== tagId));
        }
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
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                        id="titulo"
                        type="text"
                        placeholder="¿Qué necesitas hacer?"
                        $hasError={!!errors.title}
                        {...register('title')}
                    />
                    {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <TextArea
                        id="descripcion"
                        placeholder="Agrega más detalles sobre esta tarea..."
                        $hasError={!!errors.description}
                        {...register('description')}
                    />
                    {errors.description && <ErrorText>{errors.description.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="prioridad">Prioridad *</Label>
                    <Select
                        id="prioridad"
                        $hasError={!!errors.priority}
                        {...register('priority')}
                    >
                        <option value="baja">🟢 Baja</option>
                        <option value="media">🟡 Media</option>
                        <option value="alta">🔴 Alta</option>
                    </Select>
                    {errors.priority && <ErrorText>{errors.priority.message}</ErrorText>}
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                    <Input
                        id="fechaVencimiento"
                        type="date"
                        $hasError={!!errors.dueDate}
                        {...register('dueDate')}
                    />
                    {errors.dueDate && <ErrorText>{errors.dueDate.message}</ErrorText>}
                </FormGroup>

                {Array.isArray(categorias) && categorias.length > 0 && (
                    <FormGroup>
                        <Label htmlFor="categoriaId">Categoría</Label>
                        <Select
                            id="categoriaId"
                            $hasError={!!errors.categoryId}
                            {...register('categoryId')}
                        >
                            <option value="">Sin categoría</option>
                            {Array.isArray(categorias) && categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.name}
                                </option>
                            ))}
                        </Select>
                        {errors.categoryId && <ErrorText>{errors.categoryId.message}</ErrorText>}
                    </FormGroup>
                )}

                {Array.isArray(etiquetas) && etiquetas.length > 0 && (
                    <FormGroup>
                        <Label>Etiquetas</Label>
                        <TagsContainer>
                            {Array.isArray(etiquetas) && etiquetas.map((etiqueta) => (
                                <TagCheckbox key={etiqueta.id}>
                                    <input
                                        type="checkbox"
                                        checked={tagIds.includes(etiqueta.id)}
                                        onChange={(e) => handleEtiquetaChange(etiqueta.id, e.target.checked)}
                                    />
                                    #{etiqueta.name}
                                </TagCheckbox>
                            ))}
                        </TagsContainer>
                    </FormGroup>
                )}

                <FormActions>
                    <Button type="button" onClick={onCancel} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loading size="small" mostrarTexto={false} />
                        ) : (
                            tarea ? 'Actualizar Tarea' : 'Crear Tarea'
                        )}
                    </Button>
                </FormActions>
            </Form>
        </>
    );
}