/**
 * Query key debugging utilities for TanStack Query
 * Helps developers understand and debug query key structures
 */

import { QueryClient } from '@tanstack/react-query';

export interface QueryKeyInfo {
  key: readonly unknown[];
  stringified: string;
  entity: string;
  operation: string;
  parameters?: any;
  isActive: boolean;
  status: string;
  fetchStatus: string;
  dataUpdatedAt: number;
  errorUpdatedAt: number;
  observers: number;
}

/**
 * Query key debugger class for analyzing query key patterns
 */
export class QueryKeyDebugger {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Analyze all query keys in the cache
   */
  analyzeQueryKeys(): QueryKeyInfo[] {
    const queries = this.queryClient.getQueryCache().getAll();

    return queries.map(query => {
      const key = query.queryKey;
      const entity = (key[0] as string) || 'unknown';
      const operation = (key[1] as string) || 'default';
      const parameters = key.length > 2 ? key.slice(2) : undefined;

      return {
        key,
        stringified: JSON.stringify(key),
        entity,
        operation,
        parameters,
        isActive: query.getObserversCount() > 0,
        status: query.state.status,
        fetchStatus: query.state.fetchStatus,
        dataUpdatedAt: query.state.dataUpdatedAt,
        errorUpdatedAt: query.state.errorUpdatedAt,
        observers: query.getObserversCount(),
      };
    });
  }

  /**
   * Group query keys by entity type
   */
  groupByEntity(): Record<string, QueryKeyInfo[]> {
    const queryInfos = this.analyzeQueryKeys();
    const grouped: Record<string, QueryKeyInfo[]> = {};

    queryInfos.forEach(info => {
      if (!grouped[info.entity]) {
        grouped[info.entity] = [];
      }
      grouped[info.entity].push(info);
    });

    return grouped;
  }

  /**
   * Find queries matching a pattern
   */
  findQueriesByPattern(pattern: string | RegExp): QueryKeyInfo[] {
    const queryInfos = this.analyzeQueryKeys();

    if (typeof pattern === 'string') {
      return queryInfos.filter(info =>
        info.stringified.includes(pattern) ||
        info.entity.includes(pattern) ||
        info.operation.includes(pattern)
      );
    } else {
      return queryInfos.filter(info =>
        pattern.test(info.stringified) ||
        pattern.test(info.entity) ||
        pattern.test(info.operation)
      );
    }
  }

  /**
   * Get query key statistics
   */
  getStatistics(): {
    totalQueries: number;
    entitiesCount: number;
    operationsCount: number;
    activeQueries: number;
    staleQueries: number;
    errorQueries: number;
    entitiesBreakdown: Record<string, number>;
    operationsBreakdown: Record<string, number>;
  } {
    const queryInfos = this.analyzeQueryKeys();
    const entities = new Set<string>();
    const operations = new Set<string>();
    const entitiesBreakdown: Record<string, number> = {};
    const operationsBreakdown: Record<string, number> = {};

    let activeQueries = 0;
    let staleQueries = 0;
    let errorQueries = 0;

    queryInfos.forEach(info => {
      entities.add(info.entity);
      operations.add(info.operation);

      // Count by entity
      entitiesBreakdown[info.entity] = (entitiesBreakdown[info.entity] || 0) + 1;

      // Count by operation
      const operationKey = `${info.entity}.${info.operation}`;
      operationsBreakdown[operationKey] = (operationsBreakdown[operationKey] || 0) + 1;

      // Count status
      if (info.isActive) activeQueries++;
      if (info.status === 'error') errorQueries++;

      // Check if stale (simplified check)
      const isStale = Date.now() - info.dataUpdatedAt > 5 * 60 * 1000; // 5 minutes
      if (isStale) staleQueries++;
    });

    return {
      totalQueries: queryInfos.length,
      entitiesCount: entities.size,
      operationsCount: operations.size,
      activeQueries,
      staleQueries,
      errorQueries,
      entitiesBreakdown,
      operationsBreakdown,
    };
  }

  /**
   * Validate query key structure against expected patterns
   */
  validateQueryKeys(): {
    valid: QueryKeyInfo[];
    invalid: QueryKeyInfo[];
    warnings: string[];
  } {
    const queryInfos = this.analyzeQueryKeys();
    const valid: QueryKeyInfo[] = [];
    const invalid: QueryKeyInfo[] = [];
    const warnings: string[] = [];

    // Define expected patterns
    const expectedEntities = ['tasks', 'categories', 'tags', 'user'];
    const expectedOperations = ['list', 'detail', 'statistics'];

    queryInfos.forEach(info => {
      let isValid = true;

      // Check if entity is expected
      if (!expectedEntities.includes(info.entity)) {
        warnings.push(`Unexpected entity: ${info.entity}`);
        isValid = false;
      }

      // Check if operation is expected
      if (!expectedOperations.includes(info.operation)) {
        warnings.push(`Unexpected operation: ${info.operation} for entity ${info.entity}`);
      }

      // Check key structure
      if (info.key.length < 2) {
        warnings.push(`Query key too short: ${info.stringified}`);
        isValid = false;
      }

      // Check for undefined/null values in key
      if (info.key.some(part => part === undefined || part === null)) {
        warnings.push(`Query key contains undefined/null: ${info.stringified}`);
        isValid = false;
      }

      if (isValid) {
        valid.push(info);
      } else {
        invalid.push(info);
      }
    });

    return { valid, invalid, warnings };
  }

  /**
   * Generate query key documentation
   */
  generateDocumentation(): string {
    const grouped = this.groupByEntity();
    const stats = this.getStatistics();

    let doc = '# Query Keys Documentation\n\n';
    doc += `Generated at: ${new Date().toISOString()}\n\n`;
    doc += `## Statistics\n`;
    doc += `- Total Queries: ${stats.totalQueries}\n`;
    doc += `- Entities: ${stats.entitiesCount}\n`;
    doc += `- Operations: ${stats.operationsCount}\n`;
    doc += `- Active Queries: ${stats.activeQueries}\n`;
    doc += `- Stale Queries: ${stats.staleQueries}\n`;
    doc += `- Error Queries: ${stats.errorQueries}\n\n`;

    doc += `## Entities Breakdown\n`;
    Object.entries(stats.entitiesBreakdown).forEach(([entity, count]) => {
      doc += `- ${entity}: ${count} queries\n`;
    });
    doc += '\n';

    doc += `## Query Keys by Entity\n\n`;

    Object.entries(grouped).forEach(([entity, queries]) => {
      doc += `### ${entity.toUpperCase()}\n\n`;

      const operations = new Set(queries.map(q => q.operation));
      operations.forEach(operation => {
        const operationQueries = queries.filter(q => q.operation === operation);
        doc += `#### ${operation}\n`;

        operationQueries.forEach(query => {
          doc += `- \`${query.stringified}\`\n`;
          doc += `  - Status: ${query.status}\n`;
          doc += `  - Active: ${query.isActive}\n`;
          doc += `  - Observers: ${query.observers}\n`;
          if (query.parameters) {
            doc += `  - Parameters: ${JSON.stringify(query.parameters)}\n`;
          }
        });
        doc += '\n';
      });
    });

    return doc;
  }

  /**
   * Log query key analysis to console
   */
  logAnalysis(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const stats = this.getStatistics();
    const validation = this.validateQueryKeys();

    console.group('🔍 Query Key Analysis');

    console.table(stats);

    if (validation.warnings.length > 0) {
      console.group('⚠️ Warnings');
      validation.warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }

    console.group('📊 Entities Breakdown');
    console.table(stats.entitiesBreakdown);
    console.groupEnd();

    console.group('🔧 Operations Breakdown');
    console.table(stats.operationsBreakdown);
    console.groupEnd();

    console.groupEnd();
  }

  /**
   * Export query key analysis for external tools
   */
  exportAnalysis(): {
    queryKeys: QueryKeyInfo[];
    statistics: ReturnType<QueryKeyDebugger['getStatistics']>;
    validation: ReturnType<QueryKeyDebugger['validateQueryKeys']>;
    documentation: string;
  } {
    return {
      queryKeys: this.analyzeQueryKeys(),
      statistics: this.getStatistics(),
      validation: this.validateQueryKeys(),
      documentation: this.generateDocumentation(),
    };
  }
}

/**
 * Create a query key debugger instance
 */
export const createQueryKeyDebugger = (queryClient: QueryClient): QueryKeyDebugger => {
  return new QueryKeyDebugger(queryClient);
};

/**
 * Global query key debugger instance
 */
let globalQueryKeyDebugger: QueryKeyDebugger | null = null;

export const initializeQueryKeyDebugger = (queryClient: QueryClient): QueryKeyDebugger => {
  globalQueryKeyDebugger = new QueryKeyDebugger(queryClient);
  return globalQueryKeyDebugger;
};

export const getQueryKeyDebugger = (): QueryKeyDebugger => {
  if (!globalQueryKeyDebugger) {
    throw new Error('Query key debugger not initialized. Call initializeQueryKeyDebugger first.');
  }
  return globalQueryKeyDebugger;
};
