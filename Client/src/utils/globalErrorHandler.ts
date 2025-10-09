/**
 * Global error handler for TanStack Query
 * Provides centralized error handling and toast notifications
 */

import { processError } from './errorHandling';

// Global error handler function that can be used without React context
let globalShowError: ((error: any, context?: string) => void) | null = null;

/**
 * Initialize the global error handler
 * This should be called from a component that has access to the toast context
 */
export const initializeGlobalErrorHandler = (showErrorFn: (error: any, context?: string) => void) => {
  globalShowError = showErrorFn;
};

/**
 * Global error handler for queries and mutations
 * Can be used in QueryClient configuration
 */
export const handleGlobalError = (error: any, context?: string) => {
  // Log error for debugging
  console.error('Global error handler:', error, context);

  // If we have a toast function available, use it
  if (globalShowError) {
    globalShowError(error, context);
  } else {
    // Fallback: process error and log to console
    const processedError = processError(error);
    console.error(`Error ${context ? `(${context})` : ''}: ${processedError.userMessage}`);
  }
};

/**
 * Query error handler
 */
export const handleQueryError = (error: any, query: any) => {
  const queryKey = Array.isArray(query.queryKey) ? query.queryKey.join(' > ') : 'unknown';
  handleGlobalError(error, `Query: ${queryKey}`);
};

/**
 * Mutation error handler
 */
export const handleMutationError = (error: any) => {
  handleGlobalError(error, 'Mutation');
};
