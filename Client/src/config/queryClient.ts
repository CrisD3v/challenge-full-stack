import { QueryClient } from '@tanstack/react-query';
import { initializeCacheUtils } from '../utils/cacheUtils';

// Simple and functional QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Initialize cache utilities with the query client
export const cacheUtils = initializeCacheUtils(queryClient);
