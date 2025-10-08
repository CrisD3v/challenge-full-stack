import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import * as yup from 'yup';
import type { RegisterData } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../Commons/Loading';
import { ErrorMessage } from '../Commons/ErrorMessage';


const FormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--color-bg);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-text);
  font-size: 1.875rem;
  font-weight: 700;
`;

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

const ErrorText = styled.span`
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
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

const LinkButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
  text-align: center;

  &:hover {
    color: var(--color-primary-dark);
  }
`;

const schema = yup.object({
  name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es requerido'),
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

interface FormularioRegistroProps {
  onSwitchToLogin: () => void;
}

export function FormRegister({ onSwitchToLogin }: FormularioRegistroProps) {
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData & { confirmPassword: string }>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    try {
      clearError();
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
    } catch (error) {
      // El error se maneja en el contexto
    }
  };

  return (
    <FormContainer>
      <Title>Crear Cuenta</Title>

      {error && (
        <ErrorMessage
          mensaje={error}
          onCerrar={clearError}
        />
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre completo"
            $hasError={!!errors.name}
            {...register('name')}
          />
          {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            $hasError={!!errors.email}
            {...register('email')}
          />
          {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            $hasError={!!errors.password}
            {...register('password')}
          />
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            $hasError={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <ErrorText>{errors.confirmPassword.message}</ErrorText>}
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <Loading size="small" mostrarTexto={false} /> : 'Crear Cuenta'}
        </SubmitButton>

        <LinkButton type="button" onClick={onSwitchToLogin}>
          ¿Ya tienes cuenta? Inicia sesión
        </LinkButton>
      </Form>
    </FormContainer>
  );
}