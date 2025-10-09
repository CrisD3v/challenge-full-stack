/**
 * Performance logging utilities for TanStack Query
 * Provides production-safe performance monitoring and logging
 */

import { QueryClient } from '@tanstack/react-query';
import { performanceThresholds } from '../config/queryOptimization';

export interface PerformanceMetrics {
  timestamp: number;
  cacheHitRatio: number;
  memoryUsageMB: number;
  activeQueries: number;
  totalQueries: number;
  errorRate: number;
  averageDataAge: number;
  fetchingQueries: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  category: 'memory' | 'performance' | 'errors' | 'cache';
  message: string;
  timestamp: number;
  metrics?: Partial<PerformanceMetrics>;
}

/**
 * Performance logger class for monitoring TanStack Query performance
 */
export class PerformanceLogger {
  private queryClient: QueryClient;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private maxMetricsHistory = 100;
  private maxAlertsHistory = 50;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Collect current performance metrics
   */
  collectMetrics(): PerformanceMetrics {
    const queryCache = this.queryClient.getQueryCache();
    const queries = queryCache.getAll();

    const totalQueries = queries.length;
    const activeQueries = queries.filter(q => q.getObserversCount() > 0).length;
    const errorQueries = queries.filter(q => q.state.status === 'error').length;
    const successQueries = queries.filter(q => q.state.status === 'success').length;
    const fetchingQueries = queries.filter(q => q.state.fetchStatus === 'fetching').length;

    // Calculate cache hit ratio
    const cacheHitRatio = totalQueries > 0 ? successQueries / totalQueries : 0;

    // Calculate error rate
    const errorRate = totalQueries > 0 ? errorQueries / totalQueries : 0;

    // Estimate memory usage
    let estimatedBytes = 0;
    queries.forEach(query => {
      if (query.state.data) {
        try {
          estimatedBytes += JSON.stringify(query.state.data).length * 2; // UTF-16 encoding
        } catch (error) {
          // Skip queries with non-serializable data
        }
      }
    });
    const memoryUsageMB = estimatedBytes / (1024 * 1024);

    // Calculate average data age
    const dataAges = queries
      .filter(q => q.state.dataUpdatedAt > 0)
      .map(q => Date.now() - q.state.dataUpdatedAt);
    const averageDataAge = dataAges.length > 0
      ? dataAges.reduce((sum, age) => sum + age, 0) / dataAges.length
      : 0;

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      cacheHitRatio,
      memoryUsageMB,
      activeQueries,
      totalQueries,
      errorRate,
      averageDataAge,
      fetchingQueries,
    };

    // Store metrics (keep only recent history)
    this.metrics.push(metrics);
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Check for performance issues
    this.checkPerformanceThresholds(metrics);

    return metrics;
  }

  /**
   * Check metrics against performance thresholds and generate alerts
   */
  private checkPerformanceThresholds(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];

    // Memory usage alerts
    if (metrics.memoryUsageMB > performanceThresholds.memoryCriticalMB) {
      alerts.push({
        type: 'error',
        category: 'memory',
        message: `Critical memory usage: ${metrics.memoryUsageMB.toFixed(1)}MB (threshold: ${performanceThresholds.memoryCriticalMB}MB)`,
        timestamp: Date.now(),
        metrics,
      });
    } else if (metrics.memoryUsageMB > performanceThresholds.memoryWarningMB) {
      alerts.push({
        type: 'warning',
        category: 'memory',
        message: `High memory usage: ${metrics.memoryUsageMB.toFixed(1)}MB (threshold: ${performanceThresholds.memoryWarningMB}MB)`,
        timestamp: Date.now(),
        metrics,
      });
    }

    // Cache performance alerts
    if (metrics.cacheHitRatio < performanceThresholds.minCacheHitRatio) {
      alerts.push({
        type: 'warning',
        category: 'performance',
        message: `Low cache hit ratio: ${(metrics.cacheHitRatio * 100).toFixed(1)}% (threshold: ${(performanceThresholds.minCacheHitRatio * 100).toFixed(1)}%)`,
        timestamp: Date.now(),
        metrics,
      });
    }

    // Error rate alerts
    if (metrics.errorRate > performanceThresholds.maxErrorRatio) {
      alerts.push({
        type: 'error',
        category: 'errors',
        message: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}% (threshold: ${(performanceThresholds.maxErrorRatio * 100).toFixed(1)}%)`,
        timestamp: Date.now(),
        metrics,
      });
    }

    // Query count alerts
    if (metrics.totalQueries > performanceThresholds.maxTotalQueries) {
      alerts.push({
        type: 'warning',
        category: 'cache',
        message: `High query count: ${metrics.totalQueries} (threshold: ${performanceThresholds.maxTotalQueries})`,
        timestamp: Date.now(),
        metrics,
      });
    }

    if (metrics.activeQueries > performanceThresholds.maxActiveQueries) {
      alerts.push({
        type: 'warning',
        category: 'performance',
        message: `High active query count: ${metrics.activeQueries} (threshold: ${performanceThresholds.maxActiveQueries})`,
        timestamp: Date.now(),
        metrics,
      });
    }

    // Data freshness alerts
    if (metrics.averageDataAge > performanceThresholds.maxAverageDataAge) {
      alerts.push({
        type: 'info',
        category: 'cache',
        message: `Stale data detected: average age ${(metrics.averageDataAge / 60000).toFixed(1)}min (threshold: ${(performanceThresholds.maxAverageDataAge / 60000).toFixed(1)}min)`,
        timestamp: Date.now(),
        metrics,
      });
    }

    // Store alerts
    this.alerts.push(...alerts);
    if (this.alerts.length > this.maxAlertsHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertsHistory);
    }

    // Log alerts in development
    if (process.env.NODE_ENV === 'development' && alerts.length > 0) {
      console.group('⚠️ TanStack Query Performance Alerts');
      alerts.forEach(alert => {
        const logFn = alert.type === 'error' ? console.error : alert.type === 'warning' ? console.warn : console.info;
        logFn(`[${alert.category}] ${alert.message}`);
      });
      console.groupEnd();
    }
  }

  /**
   * Get recent performance metrics
   */
  getMetrics(count = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get recent performance alerts
   */
  getAlerts(count = 10): PerformanceAlert[] {
    return this.alerts.slice(-count);
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    current: PerformanceMetrics | null;
    trend: 'improving' | 'stable' | 'degrading';
    alerts: PerformanceAlert[];
  } {
    const current = this.metrics[this.metrics.length - 1] || null;
    const previous = this.metrics[this.metrics.length - 2] || null;

    let trend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (current && previous) {
      const currentScore = this.calculatePerformanceScore(current);
      const previousScore = this.calculatePerformanceScore(previous);

      if (currentScore > previousScore + 0.1) {
        trend = 'improving';
      } else if (currentScore < previousScore - 0.1) {
        trend = 'degrading';
      }
    }

    return {
      current,
      trend,
      alerts: this.getAlerts(5),
    };
  }

  /**
   * Calculate a performance score (0-1, higher is better)
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 0;

    // Cache hit ratio (40% weight)
    score += metrics.cacheHitRatio * 0.4;

    // Memory efficiency (20% weight)
    const memoryScore = Math.max(0, 1 - (metrics.memoryUsageMB / performanceThresholds.memoryCriticalMB));
    score += memoryScore * 0.2;

    // Error rate (20% weight)
    const errorScore = Math.max(0, 1 - (metrics.errorRate / performanceThresholds.maxErrorRatio));
    score += errorScore * 0.2;

    // Query efficiency (20% weight)
    const queryScore = Math.max(0, 1 - (metrics.totalQueries / performanceThresholds.maxTotalQueries));
    score += queryScore * 0.2;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Start automatic performance monitoring
   */
  startMonitoring(intervalMs = 30000): () => void {
    const interval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    return () => clearInterval(interval);
  }

  /**
   * Log performance metrics to console (development only)
   */
  logMetrics(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const metrics = this.collectMetrics();
    const summary = this.getSummary();

    console.group('📊 TanStack Query Performance Report');

    console.table({
      'Cache Hit Ratio': `${(metrics.cacheHitRatio * 100).toFixed(1)}%`,
      'Memory Usage': `${metrics.memoryUsageMB.toFixed(1)}MB`,
      'Total Queries': metrics.totalQueries,
      'Active Queries': metrics.activeQueries,
      'Error Rate': `${(metrics.errorRate * 100).toFixed(1)}%`,
      'Avg Data Age': `${(metrics.averageDataAge / 60000).toFixed(1)}min`,
      'Performance Score': `${(this.calculatePerformanceScore(metrics) * 100).toFixed(1)}%`,
      'Trend': summary.trend,
    });

    if (summary.alerts.length > 0) {
      console.group('🚨 Recent Alerts');
      summary.alerts.forEach(alert => {
        const emoji = alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${emoji} [${alert.category}] ${alert.message}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Export metrics for external monitoring (production)
   */
  exportMetrics(): {
    metrics: PerformanceMetrics[];
    alerts: PerformanceAlert[];
    summary: ReturnType<PerformanceLogger['getSummary']>;
  } {
    return {
      metrics: this.getMetrics(),
      alerts: this.getAlerts(),
      summary: this.getSummary(),
    };
  }

  /**
   * Clear stored metrics and alerts
   */
  clear(): void {
    this.metrics = [];
    this.alerts = [];
  }
}

/**
 * Create a performance logger instance
 */
export const createPerformanceLogger = (queryClient: QueryClient): PerformanceLogger => {
  return new PerformanceLogger(queryClient);
};

/**
 * Global performance logger instance (will be initialized with the main query client)
 */
let globalPerformanceLogger: PerformanceLogger | null = null;

export const initializePerformanceLogger = (queryClient: QueryClient): PerformanceLogger => {
  globalPerformanceLogger = new PerformanceLogger(queryClient);
  return globalPerformanceLogger;
};

export const getPerformanceLogger = (): PerformanceLogger => {
  if (!globalPerformanceLogger) {
    throw new Error('Performance logger not initialized. Call initializePerformanceLogger first.');
  }
  return globalPerformanceLogger;
};
