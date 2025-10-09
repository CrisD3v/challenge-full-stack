import React from 'react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

interface OfflineIndicatorProps {
  /**
   * Position of the indicator
   */
  position?: 'top' | 'bottom' | 'inline';
  /**
   * Show detailed cache information
   */
  showCacheInfo?: boolean;
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Offline Indicator Component
 * Shows network status and provides offline functionality feedback
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  showCacheInfo = false,
  className = '',
}) => {
  const {
    isOnline,
    wasOffline,
    offlineDuration,
    offlineDurationText,
    cacheInfo,
    hasUsableCache,
    refreshData,
  } = useOfflineStatus();

  // Don't show anything if online and never was offline
  if (isOnline && !wasOffline && !showCacheInfo) {
    return null;
  }

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const getIndicatorStyle = () => {
    const baseStyle = 'px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out';

    if (position === 'top') {
      return `${baseStyle} fixed top-0 left-0 right-0 z-50 text-center`;
    } else if (position === 'bottom') {
      return `${baseStyle} fixed bottom-0 left-0 right-0 z-50 text-center`;
    } else {
      return `${baseStyle} rounded-md`;
    }
  };

  const getIndicatorColor = () => {
    if (!isOnline) {
      return 'bg-red-500 text-white';
    } else if (wasOffline) {
      return 'bg-green-500 text-white';
    } else if (cacheInfo.hasStaleData) {
      return 'bg-yellow-500 text-white';
    } else {
      return 'bg-blue-500 text-white';
    }
  };

  const getIndicatorMessage = () => {
    if (!isOnline) {
      if (hasUsableCache) {
        return `📴 Sin conexión (${offlineDurationText}) - Mostrando datos guardados`;
      } else {
        return `📴 Sin conexión (${offlineDurationText}) - Datos no disponibles`;
      }
    } else if (wasOffline) {
      return '🌐 Conexión restaurada - Actualizando datos...';
    } else if (cacheInfo.hasStaleData) {
      return '⚠️ Algunos datos pueden estar desactualizados';
    } else {
      return '✅ Conectado - Datos actualizados';
    }
  };

  return (
    <div className={`${getIndicatorStyle()} ${getIndicatorColor()} ${className}`}>
      <div className="flex items-center justify-center space-x-2">
        <span>{getIndicatorMessage()}</span>

        {/* Refresh button when online and has stale data */}
        {isOnline && (cacheInfo.hasStaleData || wasOffline) && (
          <button
            onClick={handleRefresh}
            className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
            title="Actualizar datos"
          >
            🔄 Actualizar
          </button>
        )}
      </div>

      {/* Detailed cache information */}
      {showCacheInfo && (
        <div className="mt-2 text-xs opacity-75">
          <div className="flex justify-center space-x-4">
            <span>Consultas: {cacheInfo.totalQueries}</span>
            <span>Activas: {cacheInfo.activeQueries}</span>
            {cacheInfo.staleQueries > 0 && (
              <span>Desactualizadas: {cacheInfo.staleQueries}</span>
            )}
            {cacheInfo.errorQueries > 0 && (
              <span className="text-red-200">Errores: {cacheInfo.errorQueries}</span>
            )}
            {cacheInfo.oldestDataAge > 0 && (
              <span>Datos más antiguos: {Math.floor(cacheInfo.oldestDataAge / 60)}m</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact offline status badge for use in headers or toolbars
 */
export const OfflineStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isOnline, hasUsableCache } = useOfflineStatus();

  if (isOnline) {
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
        En línea
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${hasUsableCache ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
      } ${className}`}>
      <div className={`w-2 h-2 rounded-full mr-1 ${hasUsableCache ? 'bg-yellow-500' : 'bg-red-500'
        }`}></div>
      {hasUsableCache ? 'Sin conexión' : 'Sin datos'}
    </div>
  );
};

/**
 * Offline banner for critical offline states
 */
export const OfflineBanner: React.FC = () => {
  const { isOnline, hasUsableCache, offlineDurationText } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Sin conexión a internet
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {hasUsableCache
                ? `Estás trabajando sin conexión desde hace ${offlineDurationText}. Los datos mostrados provienen de la memoria caché y pueden no estar actualizados.`
                : `No hay conexión a internet desde hace ${offlineDurationText} y no hay datos guardados disponibles.`
              }
            </p>
            {hasUsableCache && (
              <p className="mt-1">
                Los cambios que realices se sincronizarán automáticamente cuando se restaure la conexión.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
