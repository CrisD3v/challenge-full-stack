import styled from 'styled-components';

const ErrorContainer = styled.div`
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ErrorIcon = styled.div`
  color: var(--color-error);
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ErrorContent = styled.div`
  flex: 1;
`;

const ErrorTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  color: var(--color-error);
  font-size: 0.875rem;
  font-weight: 600;
`;

const ErrorMessageText = styled.p`
  margin: 0;
  color: var(--color-error);
  font-size: 0.875rem;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }
`;

interface ErrorMessageProps {
    mensaje: string;
    titulo?: string;
    onCerrar?: () => void;
    mostrarIcono?: boolean;
}

export function ErrorMessage({
    mensaje,
    titulo = 'Error',
    onCerrar,
    mostrarIcono = true
}: ErrorMessageProps) {
    return (
        <ErrorContainer>
            {mostrarIcono && (
                <ErrorIcon>
                    ⚠️
                </ErrorIcon>
            )}
            <ErrorContent>
                <ErrorTitle>{titulo}</ErrorTitle>
                <ErrorMessageText>{mensaje}</ErrorMessageText>
            </ErrorContent>
            {onCerrar && (
                <CloseButton onClick={onCerrar} title="Cerrar">
                    ✕
                </CloseButton>
            )}
        </ErrorContainer>
    );
}