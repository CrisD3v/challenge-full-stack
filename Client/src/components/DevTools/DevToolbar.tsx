import React, { useState } from 'react';
import { getEnvironmentOptimizations } from '../../config/queryOptimization';
import { getCacheUtils } from '../../utils/cacheUtils';
import CacheInspector from './CacheInspector';

/**
 * Development toolbar with cache debugging utilities
 */
export const DevToolbar: React.FC = () => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const envOptimizations = getEnvironmentOptimizations();

  // Don't render in production unless explicitly enabled
  if (!envOptimizations.enableDevTools && process.env.NODE_ENV === 'production') {
    return null;
  }

  const updateStats = () => {
    try {
      const cacheUtils = getCacheUtils();
      const currentStats = cacheUtils.inspect.getStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Error getting cache stats:', error);
    }
  };

  React.useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 99998,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    borderRadius: '8px',
    padding: isExpanded ? '16px' : '8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    minWidth: isExpanded ? '300px' : 'auto',
    maxWidth: isExpanded ? '400px' : 'auto',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    padding: '4px 8px',
    margin: '2px',
    cursor: 'pointer',
    fontSize: '11px',
    transition: 'all 0.2s ease',
  };

  const statStyle: React.CSSProperties = {
    display: 'inline-block',
    margin: '0 8px 0 0',
    padding: '2px 6px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    fontSize: '10px',
  };

  return (
    <>
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isExpanded ? '12px' : '0' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>🛠️ Dev Tools</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              ...buttonStyle,
              backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            }}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {isExpanded && (
          <>
            {/* Quick Stats */}
            {stats && (
              <div style={{ marginBottom: '12px', fontSize: '10px' }}>
                <div style={{ marginBottom: '4px', color: '#ccc' }}>Cache Stats:</div>
                <div>
                  <span style={statStyle}>Q: {stats.queries.total}</span>
                  <span style={statStyle}>A: {stats.queries.active}</span>
                  <span style={statStyle}>S: {stats.queries.stale}</span>
                  <span style={statStyle}>F: {stats.queries.fetching}</span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span style={statStyle}>Hit: {stats.performance ? (stats.performance.cacheHitRatio * 100).toFixed(0) : 0}%</span>
                  <span style={statStyle}>Mem: {stats.performance ? Math.round(stats.performance.memoryUsage.estimatedKB) : 0}KB</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <button
                  onClick={() => setIsInspectorOpen(true)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: 'rgba(70, 130, 180, 0.8)',
                    width: '100%',
                  }}
                >
                  🔍 Open Cache Inspector
                </button>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => {
                    try {
                      getCacheUtils().performance.logMetrics();
                      console.log('✅ Metrics logged');
                    } catch (error) {
                      console.error('❌ Error:', error);
                    }
                  }}
                  style={buttonStyle}
                  title="Log performance metrics to console"
                >
                  📊 Log
                </button>

                <button
                  onClick={() => {
                    try {
                      getCacheUtils().invalidation.all();
                      updateStats();
                      console.log('✅ Cache invalidated');
                    } catch (error) {
                      console.error('❌ Error:', error);
                    }
                  }}
                  style={buttonStyle}
                  title="Invalidate all cache"
                >
                  🗑️ Clear
                </button>

                <button
                  onClick={() => {
                    try {
                      getCacheUtils().refresh.all();
                      console.log('✅ Queries refreshed');
                    } catch (error) {
                      console.error('❌ Error:', error);
                    }
                  }}
                  style={buttonStyle}
                  title="Refresh all queries"
                >
                  🔄 Refresh
                </button>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => {
                    try {
                      getCacheUtils().prefetch.essentialData();
                      console.log('✅ Essential data prefetched');
                    } catch (error) {
                      console.error('❌ Error:', error);
                    }
                  }}
                  style={buttonStyle}
                  title="Prefetch essential data"
                >
                  ⚡ Prefetch
                </button>

                <button
                  onClick={() => {
                    updateStats();
                    console.log('✅ Stats updated');
                  }}
                  style={buttonStyle}
                  title="Update statistics"
                >
                  📈 Update
                </button>

                <button
                  onClick={() => {
                    try {
                      getCacheUtils().inspect.debugQueryKeys();
                      console.log('✅ Query keys analyzed');
                    } catch (error) {
                      console.error('❌ Error:', error);
                    }
                  }}
                  style={buttonStyle}
                  title="Debug query keys"
                >
                  🔍 Debug Keys
                </button>
              </div>
            </div>

            {/* Performance Indicators */}
            {stats && stats.performance && (
              <div style={{ marginTop: '12px', fontSize: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '8px' }}>
                <div style={{ color: '#ccc', marginBottom: '4px' }}>Performance:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    color: stats.performance.cacheHitRatio > 0.7 ? '#4CAF50' : stats.performance.cacheHitRatio > 0.5 ? '#FF9800' : '#F44336'
                  }}>
                    Hit Rate: {(stats.performance.cacheHitRatio * 100).toFixed(1)}%
                  </span>
                  <span style={{
                    color: stats.performance.memoryUsage.estimatedMB < 10 ? '#4CAF50' : stats.performance.memoryUsage.estimatedMB < 50 ? '#FF9800' : '#F44336'
                  }}>
                    Memory: {stats.performance.memoryUsage.estimatedMB.toFixed(1)}MB
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CacheInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </>
  );
};

export default DevToolbar;
