import React, { useEffect, useState } from 'react';
import { getEnvironmentOptimizations } from '../../config/queryOptimization';
import { getCacheUtils } from '../../utils/cacheUtils';

interface CacheInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Advanced cache inspector for development and debugging
 */
export const CacheInspector: React.FC<CacheInspectorProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [selectedEntity] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);

  const envOptimizations = getEnvironmentOptimizations();

  // Don't render in production unless explicitly enabled
  if (!envOptimizations.enableDevTools && process.env.NODE_ENV === 'production') {
    return null;
  }

  useEffect(() => {
    if (!isOpen) return;

    const updateStats = () => {
      try {
        const cacheUtils = getCacheUtils();
        const currentStats = cacheUtils.inspect.getStats();
        const currentInsights = cacheUtils.performance.getInsights();

        setStats(currentStats);
        setInsights(currentInsights);
      } catch (error) {
        console.error('Error updating cache stats:', error);
      }
    };

    // Initial update
    updateStats();

    // Set up interval
    const interval = setInterval(updateStats, refreshInterval);

    return () => clearInterval(interval);
  }, [isOpen, refreshInterval]);

  if (!isOpen || !stats) return null;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        minWidth: '600px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '16px',
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>🔍 Cache Inspector</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
            <button
              onClick={onClose}
              style={{
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Performance Insights */}
        {insights.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#333', marginBottom: '12px' }}>💡 Performance Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {insights.map((insight, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: insight.type === 'error' ? '#fee' : insight.type === 'warning' ? '#fff3cd' : '#e7f3ff',
                    border: `1px solid ${insight.type === 'error' ? '#fcc' : insight.type === 'warning' ? '#ffeaa7' : '#b3d9ff'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{getInsightIcon(insight.type)}</span>
                  <div>
                    <strong style={{ textTransform: 'capitalize' }}>{insight.category}:</strong>
                    <span style={{ marginLeft: '8px' }}>{insight.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cache Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Query Stats */}
          <div>
            <h3 style={{ color: '#333', marginBottom: '12px' }}>📊 Query Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
              <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Total:</strong> {stats.queries.total}
              </div>
              <div style={{ padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                <strong>Active:</strong> {stats.queries.active}
              </div>
              <div style={{ padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                <strong>Stale:</strong> {stats.queries.stale}
              </div>
              <div style={{ padding: '8px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                <strong>Fetching:</strong> {stats.queries.fetching}
              </div>
              <div style={{ padding: '8px', backgroundColor: '#fee', borderRadius: '4px' }}>
                <strong>Error:</strong> {stats.queries.error}
              </div>
              <div style={{ padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                <strong>Success:</strong> {stats.queries.success}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 style={{ color: '#333', marginBottom: '12px' }}>⚡ Performance Metrics</h3>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Cache Hit Ratio:</strong> {(stats.performance.cacheHitRatio * 100).toFixed(1)}%
              </div>
              <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Memory Usage:</strong> {formatBytes(stats.performance.memoryUsage.estimatedBytes)}
              </div>
              <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Avg Data Age:</strong> {formatDuration(stats.performance.averageDataAge)}
              </div>
            </div>
          </div>
        </div>

        {/* Mutation Stats */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#333', marginBottom: '12px' }}>🔄 Mutation Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '14px' }}>
            <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong>Total:</strong> {stats.mutations.total}
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
              <strong>Pending:</strong> {stats.mutations.pending}
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fee', borderRadius: '4px' }}>
              <strong>Error:</strong> {stats.mutations.error}
            </div>
            <div style={{ padding: '8px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
              <strong>Success:</strong> {stats.mutations.success}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 style={{ color: '#333', marginBottom: '12px' }}>🛠️ Quick Actions</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                try {
                  getCacheUtils().invalidation.all();
                  console.log('✅ All cache invalidated');
                } catch (error) {
                  console.error('❌ Error invalidating cache:', error);
                }
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Invalidate All
            </button>
            <button
              onClick={() => {
                try {
                  getCacheUtils().refresh.all();
                  console.log('✅ All queries refreshed');
                } catch (error) {
                  console.error('❌ Error refreshing queries:', error);
                }
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#4ecdc4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Refresh All
            </button>
            <button
              onClick={() => {
                try {
                  getCacheUtils().performance.logMetrics();
                  console.log('✅ Metrics logged to console');
                } catch (error) {
                  console.error('❌ Error logging metrics:', error);
                }
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#45b7d1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Log Metrics
            </button>
            <button
              onClick={() => {
                try {
                  getCacheUtils().prefetch.essentialData();
                  console.log('✅ Essential data prefetched');
                } catch (error) {
                  console.error('❌ Error prefetching data:', error);
                }
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#96ceb4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Prefetch Essential
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheInspector;
