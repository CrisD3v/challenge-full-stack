import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * Hook for managing offline status and providing offline indicators
 * Provides real-time network status and cache information
 */
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState(false);
  const [offlineDuration, setOfflineDuration] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    let offlineStartTime: number | null = null;
    let offlineTimer: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      const wasActuallyOffline = !isOnline;
      setIsOnline(true);

      if (wasActuallyOffline) {
        setWasOffline(true);
        // Clear the "was offline" indicator after 3 seconds
        setTimeout(() => setWasOffline(false), 3000);
      }

      if (offlineTimer) {
        clearInterval(offlineTimer);
        offlineTimer = null;
      }
      setOfflineDuration(0);
      offlineStartTime = null;
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
      offlineStartTime = Date.now();

      // Update offline duration every second
      offlineTimer = setInterval(() => {
        if (offlineStartTime) {
          const duration = Math.floor((Date.now() - offlineStartTime) / 1000);
          setOfflineDuration(duration);
        }
      }, 1000);
    };

    // Set up event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Initialize offline timer if already offline
      if (!navigator.onLine) {
        handleOffline();
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      if (offlineTimer) {
        clearInterval(offlineTimer);
      }
    };
  }, [isOnline]);

  /**
   * Get cache statistics for offline monitoring
   */
  const getCacheInfo = () => {
    const queries = queryClient.getQueryCache().getAll();
    const now = Date.now();

    const activeQueries = queries.filter(q => q.getObserversCount() > 0);
    const staleQueries = queries.filter(q => q.isStale());
    const errorQueries = queries.filter(q => q.state.status === 'error');

    // Find oldest cached data
    const oldestDataAge = queries.reduce((oldest, query) => {
      if (query.state.dataUpdatedAt > 0) {
        const age = now - query.state.dataUpdatedAt;
        return Math.max(oldest, age);
      }
      return oldest;
    }, 0);

    return {
      totalQueries: queries.length,
      activeQueries: activeQueries.length,
      staleQueries: staleQueries.length,
      errorQueries: errorQueries.length,
      oldestDataAge: Math.floor(oldestDataAge / 1000), // in seconds
      hasStaleData: staleQueries.length > 0,
      hasErrors: errorQueries.length > 0,
    };
  };

  /**
   * Force refresh all active queries
   */
  const refreshData = async () => {
    if (!isOnline) {
      throw new Error('Cannot refresh data while offline');
    }

    return queryClient.refetchQueries({
      type: 'active',
      stale: true,
    });
  };

  /**
   * Get formatted offline duration
   */
  const getOfflineDurationText = () => {
    if (offlineDuration < 60) {
      return `${offlineDuration}s`;
    } else if (offlineDuration < 3600) {
      const minutes = Math.floor(offlineDuration / 60);
      const seconds = offlineDuration % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(offlineDuration / 3600);
      const minutes = Math.floor((offlineDuration % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  /**
   * Check if we have usable cached data
   */
  const hasUsableCache = () => {
    const cacheInfo = getCacheInfo();
    return cacheInfo.totalQueries > 0 && !cacheInfo.hasErrors;
  };

  return {
    isOnline,
    wasOffline,
    offlineDuration,
    offlineDurationText: getOfflineDurationText(),
    cacheInfo: getCacheInfo(),
    hasUsableCache: hasUsableCache(),
    refreshData,
  };
};
