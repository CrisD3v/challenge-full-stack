import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => {
    switch (props.size) {
      case 'small': return '0.5rem';
      case 'large': return '2rem';
      default: return '1rem';
    }
  }};
`;

const Spinner = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  width: ${props => {
    switch (props.size) {
      case 'small': return '16px';
      case 'large': return '48px';
      default: return '24px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '16px';
      case 'large': return '48px';
      default: return '24px';
    }
  }};
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-left: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

interface CargandoProps {
  size?: 'small' | 'medium' | 'large';
  texto?: string;
  mostrarTexto?: boolean;
}

export function Loading({ size = 'medium', texto = 'Cargando...', mostrarTexto = true }: CargandoProps) {
  return (
    <SpinnerContainer size={size}>
      <Spinner size={size} />
      {mostrarTexto && <LoadingText>{texto}</LoadingText>}
    </SpinnerContainer>
  );
}