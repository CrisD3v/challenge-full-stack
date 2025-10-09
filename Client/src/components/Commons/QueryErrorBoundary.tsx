import { QueryErrorResetBoundary } from '@tanstack/react-query';
import React, { Component, type ReactNode } from 'react';

interface QueryErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * Error Boundary specifically designed for TanStack Query errors
 * Provides graceful error handling and recovery options
 */
class QueryErrorBoundaryClass extends Component<QueryErrorBoundaryProps, QueryErrorBoundaryState> {
  constructor(props: QueryErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): QueryErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('Query Error Boundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  const isServerError = error.message.includes('500') || error.message.includes('server');

  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          {isNetworkError ? (
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-medium text-red-800 mb-2">
          {isNetworkError ? 'Error de conexión' : isServerError ? 'Error del servidor' : 'Error inesperado'}
        </h3>

        <p className="text-sm text-red-600 mb-4">
          {isNetworkError
            ? 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
            : isServerError
              ? 'El servidor está experimentando problemas. Inténtalo de nuevo más tarde.'
              : 'Ocurrió un error inesperado. Puedes intentar recargar la página.'
          }
        </p>

        <div className="space-y-2">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Intentar de nuevo
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Recargar página
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-red-500 cursor-pointer">Detalles del error (desarrollo)</summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

/**
 * Wrapper component that combines QueryErrorResetBoundary with our custom error boundary
 */
export const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({ children, ...props }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <QueryErrorBoundaryClass
          {...props}
          fallback={props.fallback || ((error) => <DefaultErrorFallback error={error} reset={reset} />)}
        >
          {children}
        </QueryErrorBoundaryClass>
      )}
    </QueryErrorResetBoundary>
  );
};

/**
 * Compact error display for inline use
 */
export const InlineQueryError: React.FC<{
  error: Error;
  retry?: () => void;
  className?: string;
}> = ({ error, retry, className = '' }) => {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-3 ${className}`}>
      <div className="flex items-start">
        <svg className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">
            {isNetworkError ? 'Error de conexión' : 'Error al cargar datos'}
          </h4>
          <p className="text-sm text-red-600 mt-1">
            {isNetworkError
              ? 'Verifica tu conexión a internet e inténtalo de nuevo.'
              : 'Ocurrió un problema al cargar los datos.'
            }
          </p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
