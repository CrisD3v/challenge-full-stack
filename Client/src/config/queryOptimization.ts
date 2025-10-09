/**
 * Performance optimization configurations for TanStack Query
 * Fine-tuned settings for different types of data and use cases
 */

export interface QueryOptimizationConfig {
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  refetchOnMount: boolean | 'always' | ((query: any) => boolean | 'always');
  retry: number | boolean | ((failureCount: number, error: any) => boolean);
  retryDelay: number | ((retryAttempt: number, error: any) => number);
  networkMode: 'online' | 'always' | 'offlineFirst';
  notifyOnChangeProps?: readonly string[];
}

/**
 * Optimized configurations for different data types
 */
export const queryOptimizations = {
  // Static/rarely changing data (categories, tags, user profile)
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: (query: any) => {
      // Only refetch if data is older than staleTime
      const dataAge = Date.now() - query.state.dataUpdatedAt;
      return dataAge > (15 * 60 * 1000);
    },
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    networkMode: 'offlineFirst' as const,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  },

  // Dynamic data (tasks, frequently updated content)
  dynamic: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: (query: any) => {
      // Refetch if data is older than staleTime or if there are active observers
      const dataAge = Date.now() - query.state.dataUpdatedAt;
      const hasActiveObservers = query.getObserversCount() > 0;
      return dataAge > (5 * 60 * 1000) || hasActiveObservers;
    },
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(500 * 2 ** attemptIndex, 15000),
    networkMode: 'offlineFirst' as const,
    notifyOnChangeProps: ['data', 'error', 'isLoading', 'isFetching'],
  },

  // Real-time data (notifications, live updates)
  realtime: {
    staleTime: 30 * 1000,      // 30 seconds
    gcTime: 2 * 60 * 1000,     // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always' as const,
    retry: 1,
    retryDelay: 1000,
    networkMode: 'online' as const,
    notifyOnChangeProps: ['data', 'error', 'isLoading', 'isFetching', 'isStale'],
  },

  // Statistics and analytics (less critical, can be stale)
  analytics: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 5000,
    networkMode: 'offlineFirst' as const,
    notifyOnChangeProps: ['data', 'error'],
  },

  // Background/prefetch data (low priority)
  background: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000,    // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 10000,
    networkMode: 'offlineFirst' as const,
    notifyOnChangeProps: ['data'],
  },
} as const;

/**
 * Entity-specific optimization mappings
 */
export const entityOptimizations = {
  // Tasks are dynamic and frequently updated
  tasks: queryOptimizations.dynamic,

  // Categories are relatively static
  categories: queryOptimizations.static,

  // Tags are relatively static
  tags: queryOptimizations.static,

  // User data is static during session
  user: queryOptimizations.static,

  // Statistics can be stale
  statistics: queryOptimizations.analytics,

  // Prefetched data is background priority
  prefetch: queryOptimizations.background,
} as const;

/**
 * Get optimized configuration for a specific entity type
 */
export const getOptimizedConfig = (entityType: keyof typeof entityOptimizations): QueryOptimizationConfig => {
  return entityOptimizations[entityType] || queryOptimizations.dynamic;
};

/**
 * Performance monitoring thresholds
 */
export const performanceThresholds = {
  // Memory usage warnings
  memoryWarningMB: 50,
  memoryCriticalMB: 100,

  // Cache efficiency thresholds
  minCacheHitRatio: 0.7,
  maxStaleRatio: 0.3,
  maxErrorRatio: 0.1,

  // Query count thresholds
  maxActiveQueries: 50,
  maxTotalQueries: 200,

  // Data age thresholds (in milliseconds)
  maxAverageDataAge: 10 * 60 * 1000, // 10 minutes

  // Network request thresholds
  maxConcurrentRequests: 10,
  maxRetryAttempts: 3,
} as const;

/**
 * Development-specific optimizations
 */
export const developmentOptimizations = {
  // More aggressive caching in development for faster iteration
  enableDevTools: true,
  logCacheMetrics: true,
  logQueryKeys: true,

  // Shorter stale times for development to see changes quickly
  developmentStaleTime: 30 * 1000, // 30 seconds

  // Enable additional debugging
  enableQueryDebugging: true,
  enableMutationDebugging: true,
} as const;

/**
 * Production-specific optimizations
 */
export const productionOptimizations = {
  // Optimized for performance in production
  enableDevTools: false,
  logCacheMetrics: false,
  logQueryKeys: false,

  // Longer stale times for better performance
  productionStaleTime: 5 * 60 * 1000, // 5 minutes

  // Disable debugging in production
  enableQueryDebugging: false,
  enableMutationDebugging: false,

  // Enable performance monitoring
  enablePerformanceMonitoring: true,
} as const;

/**
 * Get environment-specific optimizations
 */
export const getEnvironmentOptimizations = () => {
  return process.env.NODE_ENV === 'development'
    ? developmentOptimizations
    : productionOptimizations;
};
