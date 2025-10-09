import { useEffect } from 'react';
import { initializeGlobalErrorHandler } from '../../utils/globalErrorHandler';
import { useToast } from './ErrorToast';

/**
 * Component that initializes the global error handler
 * Should be placed inside ToastProvider but outside of QueryClientProvider
 */
export const GlobalErrorHandler: React.FC = () => {
  const { showError } = useToast();

  useEffect(() => {
    // Initialize the global error handler with the toast function
    initializeGlobalErrorHandler(showError);
  }, [showError]);

  // This component doesn't render anything
  return null;
};
