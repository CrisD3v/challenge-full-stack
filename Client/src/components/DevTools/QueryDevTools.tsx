import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { getEnvironmentOptimizations } from '../../config/queryOptimization';

/**
 * React Query DevTools component with environment-aware configuration
 */
export const QueryDevTools: React.FC = () => {
  const envOptimizations = getEnvironmentOptimizations();

  // Only render in development or when explicitly enabled
  if (!envOptimizations.enableDevTools) {
    return null;
  }

  return (
    <ReactQueryDevtools
      initialIsOpen={false}
      position="bottom"
    />
  );
};

export default QueryDevTools;
