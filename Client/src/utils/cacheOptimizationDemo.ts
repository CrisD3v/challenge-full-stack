import type { FiltrosTareas, OrdenTareas } from '../types';
import { normalizeFilters, normalizeOrder, queryKeys } from './queryKeys';

/**
 * Demo utility to showcase cache optimization improvements
 * This demonstrates how the normalized filters create consistent cache keys
 */
export function demonstrateCacheOptimization() {
  console.group('🚀 Cache Optimization Demo');

  // Test case 1: Same filters with different formatting should produce same cache key
  const filters1: FiltrosTareas = {
    search: '  test query  ',
    categoryId: '  cat-123  ',
    completed: true,
  };

  const filters2: FiltrosTareas = {
    search: 'test query',
    categoryId: 'cat-123',
    completed: true,
  };

  const key1 = queryKeys.tasksList(filters1);
  const key2 = queryKeys.tasksList(filters2);

  console.log('✅ Normalized filters produce consistent cache keys:');
  console.log('Key 1:', JSON.stringify(key1));
  console.log('Key 2:', JSON.stringify(key2));
  console.log('Keys match:', JSON.stringify(key1) === JSON.stringify(key2));

  // Test case 2: Empty/invalid filters are filtered out
  const filtersWithEmpty: FiltrosTareas = {
    search: 'valid search',
    categoryId: '',
    tagId: '   ',
    priority: 'invalid' as any,
  };

  const normalizedEmpty = normalizeFilters(filtersWithEmpty);
  console.log('\n✅ Invalid/empty filters are cleaned:');
  console.log('Original:', filtersWithEmpty);
  console.log('Normalized:', normalizedEmpty);

  // Test case 3: Order normalization
  const order1: OrdenTareas = { field: 'title', direction: 'asc' };
  const order2: OrdenTareas = { field: 'title', direction: 'asc' };

  const orderKey1 = queryKeys.tasksList(undefined, order1);
  const orderKey2 = queryKeys.tasksList(undefined, order2);

  console.log('\n✅ Order normalization works:');
  console.log('Order key 1:', JSON.stringify(orderKey1));
  console.log('Order key 2:', JSON.stringify(orderKey2));
  console.log('Keys match:', JSON.stringify(orderKey1) === JSON.stringify(orderKey2));

  console.groupEnd();
}

/**
 * Utility to analyze cache key differences
 */
export function analyzeCacheKeys(
  filters1?: FiltrosTareas,
  order1?: OrdenTareas,
  filters2?: FiltrosTareas,
  order2?: OrdenTareas
) {
  const key1 = queryKeys.tasksList(filters1, order1);
  const key2 = queryKeys.tasksList(filters2, order2);

  return {
    key1,
    key2,
    areEqual: JSON.stringify(key1) === JSON.stringify(key2),
    normalizedFilters1: normalizeFilters(filters1),
    normalizedFilters2: normalizeFilters(filters2),
    normalizedOrder1: normalizeOrder(order1),
    normalizedOrder2: normalizeOrder(order2),
  };
}
