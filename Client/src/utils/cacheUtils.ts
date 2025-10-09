import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * Cache utility functions for TanStack Query
 * Provides centralized cache management operations
 */
export class CacheUtils {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Cache invalidation helper functions
   */
  invalidation = {
    // Invalidate all tasks-related queries
    tasks: () => {
      return this.queryClient.invalidateQueries({
        queryKey: queryKeys.tasks
      });
    },

    // Invalidate specific task list with filters
    tasksList: (filters?: any, orden?: any) => {
      return this.queryClient.invalidateQueries({
        queryKey: queryKeys.tasksList(filters, orden)
      });
    },

    // Invalidate all categories-related queries
    categories: () => {
      return this.queryClient.invalidateQueries({
        queryKey: queryKeys.categories
      });
    },

    // Invalidate all tags-related queries
    tags: () => {
      return this.queryClient.invalidateQueries({
        queryKey: queryKeys.tags
      });
    },

    // Invalidate user-related queries
    user: () => {
      return this.queryClient.invalidateQueries({
        queryKey: queryKeys.user
      });
    },

    // Invalidate all queries
    all: () => {
      return this.queryClient.invalidateQueries();
    },

    // Smart invalidation based on entity relationships
    onTaskMutation: () => {
      // When tasks change, invalidate tasks and statistics
      return Promise.all([
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() })
      ]);
    },

    onCategoryMutation: (categoryId?: string) => {
      // When categories change, invalidate categories and related tasks
      return Promise.all([
        // Invalidate all category queries
        this.queryClient.invalidateQueries({ queryKey: queryKeys.categories }),

        // Invalidate all task queries since tasks reference categories
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),

        // Invalidate task statistics as they may be affected by category changes
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() }),

        // If specific category ID provided, invalidate specific category detail
        ...(categoryId ? [
          this.queryClient.invalidateQueries({ queryKey: queryKeys.categoriesDetail(categoryId) })
        ] : [])
      ]);
    },

    onTagMutation: (tagId?: string) => {
      // When tags change, invalidate tags and related tasks
      return Promise.all([
        // Invalidate all tag queries
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tags }),

        // Invalidate all task queries since tasks can have tags
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),

        // Invalidate task statistics as they may be affected by tag changes
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() }),

        // If specific tag ID provided, invalidate specific tag detail
        ...(tagId ? [
          this.queryClient.invalidateQueries({ queryKey: queryKeys.tagsDetail(tagId) })
        ] : [])
      ]);
    },

    // Cross-entity invalidation for complex relationships
    onCategoryDeleted: (categoryId: string) => {
      // When a category is deleted, tasks using it need to be refreshed
      return Promise.all([
        this.queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() }),
        // Remove the specific category from cache
        this.queryClient.removeQueries({ queryKey: queryKeys.categoriesDetail(categoryId) })
      ]);
    },

    onTagDeleted: (tagId: string) => {
      // When a tag is deleted, tasks using it need to be refreshed
      return Promise.all([
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() }),
        // Remove the specific tag from cache
        this.queryClient.removeQueries({ queryKey: queryKeys.tagsDetail(tagId) })
      ]);
    },

    // Selective invalidation based on relationships
    onTaskWithCategoryChanged: (categoryId: string) => {
      // When a task with a specific category is modified
      return Promise.all([
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() }),
        // Optionally refresh the category to update task counts if needed
        this.queryClient.invalidateQueries({ queryKey: queryKeys.categoriesDetail(categoryId) })
      ]);
    },

    onTaskWithTagsChanged: (tagIds: string[]) => {
      // When a task with specific tags is modified
      const invalidationPromises = [
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasksStatistics() })
      ];

      // Optionally refresh specific tags to update task counts if needed
      tagIds.forEach(tagId => {
        invalidationPromises.push(
          this.queryClient.invalidateQueries({ queryKey: queryKeys.tagsDetail(tagId) })
        );
      });

      return Promise.all(invalidationPromises);
    }
  };

  /**
   * Manual cache refresh utilities
   */
  refresh = {
    // Refresh tasks data
    tasks: () => {
      return this.queryClient.refetchQueries({
        queryKey: queryKeys.tasks
      });
    },

    // Refresh categories data
    categories: () => {
      return this.queryClient.refetchQueries({
        queryKey: queryKeys.categories
      });
    },

    // Refresh tags data
    tags: () => {
      return this.queryClient.refetchQueries({
        queryKey: queryKeys.tags
      });
    },

    // Refresh user data
    user: () => {
      return this.queryClient.refetchQueries({
        queryKey: queryKeys.user
      });
    },

    // Refresh all active queries
    all: () => {
      return this.queryClient.refetchQueries();
    },

    // Refresh specific task list
    tasksList: (filters?: any, orden?: any) => {
      return this.queryClient.refetchQueries({
        queryKey: queryKeys.tasksList(filters, orden)
      });
    }
  };

  /**
   * Cache clearing functions for auth changes
   */
  auth = {
    // Clear all cache on logout
    onLogout: () => {
      this.queryClient.clear();
      // Also remove any persisted queries if using persistence
      this.queryClient.getQueryCache().clear();
      this.queryClient.getMutationCache().clear();
    },

    // Refresh cache on login
    onLogin: () => {
      // Clear any existing cache to prevent data leakage between users
      this.queryClient.clear();
      // Optionally prefetch essential data
      return this.prefetch.essentialData();
    },

    // Handle token expiration
    onTokenExpired: () => {
      // Clear cache and redirect will be handled by API interceptor
      this.queryClient.clear();
    }
  };

  /**
   * Enhanced prefetching utilities for performance optimization
   */
  prefetch = {
    // Prefetch essential data after login with intelligent prioritization
    essentialData: async () => {
      const prefetchPromises = [
        // High priority: Categories and tags (needed for task creation/editing)
        this.queryClient.prefetchQuery({
          queryKey: queryKeys.categoriesList(),
          staleTime: 10 * 60 * 1000, // 10 minutes - longer for stable data
        }),
        this.queryClient.prefetchQuery({
          queryKey: queryKeys.tagsList(),
          staleTime: 10 * 60 * 1000, // 10 minutes - longer for stable data
        }),
        // Medium priority: Default task list
        this.queryClient.prefetchQuery({
          queryKey: queryKeys.tasksList(),
          staleTime: 5 * 60 * 1000, // 5 minutes
        }),
        // Low priority: Task statistics
        this.queryClient.prefetchQuery({
          queryKey: queryKeys.tasksStatistics(),
          staleTime: 15 * 60 * 1000, // 15 minutes - statistics change less frequently
        })
      ];

      return Promise.allSettled(prefetchPromises);
    },

    // Prefetch tasks with default filters and intelligent caching
    tasks: (filters?: any, orden?: any) => {
      return this.queryClient.prefetchQuery({
        queryKey: queryKeys.tasksList(filters, orden),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },

    // Prefetch related data when viewing a specific task
    relatedToTask: async (_taskId: string, task?: any) => {
      const prefetchPromises = [];

      // If task data is provided, prefetch related entities
      if (task) {
        // Prefetch category details if task has a category
        if (task.categoriaId) {
          prefetchPromises.push(
            this.queryClient.prefetchQuery({
              queryKey: queryKeys.categoriesDetail(task.categoriaId),
              staleTime: 10 * 60 * 1000,
            })
          );
        }

        // Prefetch tag details if task has tags
        if (task.etiquetas && task.etiquetas.length > 0) {
          task.etiquetas.forEach((tagId: string) => {
            prefetchPromises.push(
              this.queryClient.prefetchQuery({
                queryKey: queryKeys.tagsDetail(tagId),
                staleTime: 10 * 60 * 1000,
              })
            );
          });
        }
      }

      // Always prefetch categories and tags for potential editing
      prefetchPromises.push(
        this.queryClient.prefetchQuery({
          queryKey: queryKeys.categoriesList(),
          staleTime: 10 * 60 * 1000,
        }),
        this.queryClient.prefetchQuery({
          queryKey: queryKeys.tagsList(),
          staleTime: 10 * 60 * 1000,
        })
      );

      return Promise.allSettled(prefetchPromises);
    },

    // Prefetch data for task creation/editing forms
    forTaskForm: async () => {
      const prefetchPromises = [
        this.queryClient.prefetchQuery({
          queryKey: queryKeys.categoriesList(),
          staleTime: 10 * 60 * 1000,
        }),
        this.queryClient.prefetchQuery({
          queryKey: queryKeys.tagsList(),
          staleTime: 10 * 60 * 1000,
        })
      ];

      return Promise.allSettled(prefetchPromises);
    },

    // Intelligent prefetching based on user navigation patterns
    anticipatory: {
      // Prefetch likely next pages based on current view
      onTaskListView: async () => {
        // When viewing task list, user might create new task or view categories
        return Promise.allSettled([
          this.queryClient.prefetchQuery({
            queryKey: queryKeys.categoriesList(),
            staleTime: 10 * 60 * 1000,
          }),
          this.queryClient.prefetchQuery({
            queryKey: queryKeys.tagsList(),
            staleTime: 10 * 60 * 1000,
          })
        ]);
      },

      // Prefetch when hovering over task items (for quick preview)
      onTaskHover: (taskId: string) => {
        return this.queryClient.prefetchQuery({
          queryKey: queryKeys.tasksDetail(taskId),
          staleTime: 5 * 60 * 1000,
        });
      },

      // Prefetch common filter combinations
      commonFilters: async () => {
        const commonFilterCombinations = [
          { completed: false }, // Active tasks
          { completed: true },  // Completed tasks
          { priority: 'alta' as const }, // High priority tasks
        ];

        const prefetchPromises = commonFilterCombinations.map(filters =>
          this.queryClient.prefetchQuery({
            queryKey: queryKeys.tasksList(filters),
            staleTime: 5 * 60 * 1000,
          })
        );

        return Promise.allSettled(prefetchPromises);
      }
    }
  };

  /**
   * Query deduplication utilities
   */
  deduplication = {
    // Check if a query is currently being fetched
    isFetching: (queryKey: any[]) => {
      const query = this.queryClient.getQueryCache().find({ queryKey });
      return query?.state.fetchStatus === 'fetching';
    },

    // Get all currently fetching queries
    getFetchingQueries: () => {
      return this.queryClient.getQueryCache().getAll().filter(
        query => query.state.fetchStatus === 'fetching'
      );
    },

    // Cancel duplicate requests for the same query key
    cancelDuplicates: (queryKey: any[]) => {
      return this.queryClient.cancelQueries({ queryKey });
    },

    // Ensure only one instance of a query runs at a time
    ensureSingle: async (queryKey: any[], queryFn: () => Promise<any>) => {
      // Check if query is already fetching
      if (this.deduplication.isFetching(queryKey)) {
        // Wait for existing query to complete
        return this.queryClient.getQueryData(queryKey);
      }

      // Execute the query
      return this.queryClient.fetchQuery({
        queryKey,
        queryFn,
      });
    }
  };

  /**
   * Performance monitoring utilities
   */
  performance = {
    // Track cache hit/miss ratios
    getCacheMetrics: () => {
      const queryCache = this.queryClient.getQueryCache();
      const queries = queryCache.getAll();

      const metrics = {
        totalQueries: queries.length,
        activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
        staleQueries: queries.filter(q => q.isStale()).length,
        fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
        errorQueries: queries.filter(q => q.state.status === 'error').length,
        successQueries: queries.filter(q => q.state.status === 'success').length,
        cacheHitRatio: 0,
        averageDataAge: 0,
        memoryUsage: this.performance.estimateMemoryUsage(),
      };

      // Calculate cache hit ratio (successful queries vs total queries)
      if (metrics.totalQueries > 0) {
        metrics.cacheHitRatio = metrics.successQueries / metrics.totalQueries;
      }

      // Calculate average data age
      const dataAges = queries
        .filter(q => q.state.dataUpdatedAt > 0)
        .map(q => Date.now() - q.state.dataUpdatedAt);

      if (dataAges.length > 0) {
        metrics.averageDataAge = dataAges.reduce((sum, age) => sum + age, 0) / dataAges.length;
      }

      return metrics;
    },

    // Estimate memory usage of cache
    estimateMemoryUsage: () => {
      const queryCache = this.queryClient.getQueryCache();
      const queries = queryCache.getAll();

      let estimatedSize = 0;
      queries.forEach(query => {
        if (query.state.data) {
          // Rough estimation of object size in bytes
          estimatedSize += JSON.stringify(query.state.data).length * 2; // UTF-16 encoding
        }
      });

      return {
        estimatedBytes: estimatedSize,
        estimatedKB: Math.round(estimatedSize / 1024),
        estimatedMB: Math.round(estimatedSize / (1024 * 1024)),
      };
    },

    // Get performance insights and recommendations
    getInsights: () => {
      const metrics = this.performance.getCacheMetrics();
      const insights = [];

      // Memory usage insights
      if (metrics.memoryUsage.estimatedMB > 50) {
        insights.push({
          type: 'warning',
          category: 'memory',
          message: `Cache is using ${metrics.memoryUsage.estimatedMB}MB of memory. Consider reducing gcTime or clearing unused queries.`,
        });
      }

      // Stale data insights
      const staleRatio = metrics.staleQueries / metrics.totalQueries;
      if (staleRatio > 0.3) {
        insights.push({
          type: 'info',
          category: 'freshness',
          message: `${Math.round(staleRatio * 100)}% of cached data is stale. Consider adjusting staleTime values.`,
        });
      }

      // Error rate insights
      const errorRatio = metrics.errorQueries / metrics.totalQueries;
      if (errorRatio > 0.1) {
        insights.push({
          type: 'error',
          category: 'reliability',
          message: `${Math.round(errorRatio * 100)}% of queries have errors. Check network connectivity and API health.`,
        });
      }

      // Cache efficiency insights
      if (metrics.cacheHitRatio < 0.7) {
        insights.push({
          type: 'warning',
          category: 'efficiency',
          message: `Cache hit ratio is ${Math.round(metrics.cacheHitRatio * 100)}%. Consider increasing staleTime for better performance.`,
        });
      }

      return insights;
    },

    // Log performance metrics to console (development only)
    logMetrics: () => {
      if (process.env.NODE_ENV === 'development') {
        const metrics = this.performance.getCacheMetrics();
        const insights = this.performance.getInsights();

        console.group('🚀 TanStack Query Performance Metrics');
        console.table(metrics);

        if (insights.length > 0) {
          console.group('💡 Performance Insights');
          insights.forEach(insight => {
            const emoji = insight.type === 'error' ? '❌' : insight.type === 'warning' ? '⚠️' : 'ℹ️';
            console.log(`${emoji} [${insight.category}] ${insight.message}`);
          });
          console.groupEnd();
        }

        console.groupEnd();
      }
    }
  };

  /**
   * Enhanced cache inspection utilities
   */
  inspect = {
    // Get comprehensive cache statistics
    getStats: () => {
      const queryCache = this.queryClient.getQueryCache();
      const mutationCache = this.queryClient.getMutationCache();

      return {
        queries: {
          total: queryCache.getAll().length,
          active: queryCache.getAll().filter(q => q.getObserversCount() > 0).length,
          stale: queryCache.getAll().filter(q => q.isStale()).length,
          fetching: queryCache.getAll().filter(q => q.state.fetchStatus === 'fetching').length,
          error: queryCache.getAll().filter(q => q.state.status === 'error').length,
          success: queryCache.getAll().filter(q => q.state.status === 'success').length,
        },
        mutations: {
          total: mutationCache.getAll().length,
          pending: mutationCache.getAll().filter(m => m.state.status === 'pending').length,
          error: mutationCache.getAll().filter(m => m.state.status === 'error').length,
          success: mutationCache.getAll().filter(m => m.state.status === 'success').length,
        },
        performance: this.performance.getCacheMetrics(),
      };
    },

    // Get queries by key pattern with enhanced filtering
    getQueriesByKey: (keyPattern: string) => {
      return this.queryClient.getQueryCache().getAll().filter(query =>
        query.queryKey.some(key =>
          typeof key === 'string' && key.includes(keyPattern)
        )
      );
    },

    // Check if specific query exists in cache
    hasQuery: (queryKey: any[]) => {
      return this.queryClient.getQueryCache().find({ queryKey }) !== undefined;
    },

    // Get detailed query information
    getQueryDetails: (queryKey: any[]) => {
      const query = this.queryClient.getQueryCache().find({ queryKey });
      if (!query) return null;

      return {
        queryKey: query.queryKey,
        state: query.state,
        observers: query.getObserversCount(),
        isStale: query.isStale(),
        dataUpdatedAt: new Date(query.state.dataUpdatedAt),
        errorUpdatedAt: query.state.errorUpdatedAt ? new Date(query.state.errorUpdatedAt) : null,
        fetchStatus: query.state.fetchStatus,
        status: query.state.status,
      };
    },

    // Get all queries grouped by entity type
    getQueriesByEntity: () => {
      const queries = this.queryClient.getQueryCache().getAll();
      const grouped: Record<string, any[]> = {};

      queries.forEach(query => {
        const entityType = query.queryKey[0] as string;
        if (!grouped[entityType]) {
          grouped[entityType] = [];
        }
        grouped[entityType].push({
          queryKey: query.queryKey,
          status: query.state.status,
          fetchStatus: query.state.fetchStatus,
          observers: query.getObserversCount(),
          isStale: query.isStale(),
        });
      });

      return grouped;
    },

    // Debug query keys (development only)
    debugQueryKeys: () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          const { getQueryKeyDebugger } = require('../utils/queryKeyDebugger');
          const keyDebugger = getQueryKeyDebugger();
          keyDebugger.logAnalysis();
          return keyDebugger.exportAnalysis();
        } catch (error) {
          console.error('Query key debugger not available:', error);
          return null;
        }
      }
      return null;
    }
  };

  /**
   * Utility to remove specific queries from cache
   */
  remove = {
    // Remove all tasks queries
    tasks: () => {
      this.queryClient.removeQueries({ queryKey: queryKeys.tasks });
    },

    // Remove all categories queries
    categories: () => {
      this.queryClient.removeQueries({ queryKey: queryKeys.categories });
    },

    // Remove all tags queries
    tags: () => {
      this.queryClient.removeQueries({ queryKey: queryKeys.tags });
    },

    // Remove specific query by key
    byKey: (queryKey: any[]) => {
      this.queryClient.removeQueries({ queryKey });
    }
  };
}

/**
 * Factory function to create cache utilities instance
 */
export const createCacheUtils = (queryClient: QueryClient) => {
  return new CacheUtils(queryClient);
};

/**
 * Default cache utilities instance (will be initialized with the main query client)
 */
let defaultCacheUtils: CacheUtils | null = null;

export const initializeCacheUtils = (queryClient: QueryClient) => {
  defaultCacheUtils = new CacheUtils(queryClient);
  return defaultCacheUtils;
};

export const getCacheUtils = (): CacheUtils => {
  if (!defaultCacheUtils) {
    // Return a simple fallback instead of throwing an error
    console.warn('Cache utilities not initialized, using fallback');
    return {
      invalidation: {
        tasks: () => Promise.resolve(),
        tasksList: () => Promise.resolve(),
        categories: () => Promise.resolve(),
        tags: () => Promise.resolve(),
        user: () => Promise.resolve(),
        all: () => Promise.resolve(),
        onTaskMutation: () => Promise.resolve(),
        onCategoryMutation: () => Promise.resolve(),
        onTagMutation: () => Promise.resolve(),
        onCategoryDeleted: () => Promise.resolve(),
        onTagDeleted: () => Promise.resolve(),
        onTaskWithCategoryChanged: () => Promise.resolve(),
        onTaskWithTagsChanged: () => Promise.resolve(),
      }
    } as any;
  }
  return defaultCacheUtils;
};
