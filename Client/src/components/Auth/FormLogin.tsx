import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import type { LoginData } from '../../types';
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

const DemoInfo = styled.div`
  background-color: var(--color-bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
`;

const schema = yup.object({
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

interface FormLoginProps {
  onSwitchToRegister: () => void;
}

export function FormLogin({ onSwitchToRegister }: FormLoginProps) {
  const { login, isLoading, error, clearError, usuario, token } = useAuth();
  const [showDemo, setShowDemo] = useState(true);

  // Debug: mostrar estado actual
  console.log('FormularioLogin - Estado auth:', { usuario, token, isLoading, error });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      clearError();
      console.log('Intentando login con:', data);
      await login(data);
      console.log('Login exitoso');
    } catch (error) {
      console.error('Error en login:', error);
      // El error se maneja en el contexto
    }
  };

  const usarCuentaDemo = () => {
    setValue('email', 'demo@example.com');
    setValue('password', 'demo123');
    setShowDemo(false);
  };

  return (
    <FormContainer>
      <Title>Iniciar Sesión</Title>

      {showDemo && (
        <DemoInfo>
          <p><strong>Cuenta de prueba:</strong></p>
          <p>Email: demo@example.com</p>
          <p>Contraseña: demo123</p>
          <LinkButton type="button" onClick={usarCuentaDemo}>
            Usar cuenta demo
          </LinkButton>
        </DemoInfo>
      )}

      {error && (
        <ErrorMessage
          mensaje={error}
          onCerrar={clearError}
        />
      )}

      {/* Debug info */}
      {/* <div style={{
        background: '#f0f0f0',
        padding: '10px',
        margin: '10px 0',
        fontSize: '12px',
        borderRadius: '4px'
      }}>
        <strong>Debug Info:</strong><br />
        Usuario: {usuario ? `Logueado (${usuario.email})` : 'No logueado'}<br />
        Token: {token ? `Presente (${token.substring(0, 20)}...)` : 'Ausente'}<br />
        Token en localStorage: {localStorage.getItem('token') ? 'Presente' : 'Ausente'}<br />
        Loading: {isLoading ? 'Sí' : 'No'}<br />
        Error: {error || 'Ninguno'}
      </div> */}

      <Form onSubmit={handleSubmit(onSubmit)}>
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
            placeholder="Tu contraseña"
            $hasError={!!errors.password}
            {...register('password')}
          />
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <Loading size="small" mostrarTexto={false} /> : 'Iniciar Sesión'}
        </SubmitButton>

        <LinkButton type="button" onClick={onSwitchToRegister}>
          ¿No tienes cuenta? Regístrate
        </LinkButton>

        {/* Botón de test directo */}
        <button
          type="button"
          onClick={() => onSubmit({ email: 'demo@example.com', password: 'demo123' })}
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          TEST LOGIN DIRECTO
        </button>

        {/* Botón para probar API con token */}
        {token && (
          <button
            type="button"
            onClick={async () => {
              try {
                console.log('Probando API con token...');
                const response = await fetch('http://localhost:3000/api/tareas', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                const data = await response.json();
                console.log('Respuesta de API tareas:', data);
                alert(`API Response: ${JSON.stringify(data, null, 2)}`);
              } catch (error) {
                console.error('Error en API test:', error);
                alert(`Error: ${error}`);
              }
            }}
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            TEST API CON TOKEN
          </button>
        )}
      </Form>
    </FormContainer >
  );
}