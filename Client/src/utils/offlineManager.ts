import { QueryClient } from '@tanstack/react-query';

/**
 * Offline Manager for handling network status and background refetching
 * Implements stale-while-revalidate strategy with intelligent background updates
 */
export class OfflineManager {
  private queryClient: QueryClient;
  private isOnline: boolean = true;
  private backgroundRefetchInterval: NodeJS.Timeout | null = null;
  private onlineListeners: Set<(isOnline: boolean) => void> = new Set();
  private lastOnlineTime: number = Date.now();

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.setupNetworkListeners();
    this.startBackgroundRefetch();
  }

  /**
   * Set up network status listeners
   */
  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;

    // Initial online status
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Also listen for visibility changes to refetch when tab becomes visible
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Handle coming back online
   */
  private handleOnline = () => {
    const wasOffline = !this.isOnline;
    this.isOnline = true;
    this.lastOnlineTime = Date.now();

    // Notify listeners
    this.notifyOnlineStatusChange(true);

    if (wasOffline) {
      console.log('🌐 Back online - refreshing stale data');
      // Refetch all stale queries when coming back online
      this.queryClient.refetchQueries({
        type: 'active',
        stale: true,
      });
    }
  };

  /**
   * Handle going offline
   */
  private handleOffline = () => {
    this.isOnline = false;
    console.log('📴 Gone offline - using cached data');

    // Notify listeners
    this.notifyOnlineStatusChange(false);
  };

  /**
   * Handle visibility change (tab focus)
   */
  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && this.isOnline) {
      // Only refetch if we've been away for more than 5 minutes
      const timeSinceLastOnline = Date.now() - this.lastOnlineTime;
      if (timeSinceLastOnline > 5 * 60 * 1000) {
        console.log('👁️ Tab visible after long absence - refreshing data');
        this.queryClient.refetchQueries({
          type: 'active',
          stale: true,
        });
      }
    }
  };

  /**
   * Start background refetching for stale data
   */
  private startBackgroundRefetch() {
    // Check every 2 minutes for stale data that needs refreshing
    this.backgroundRefetchInterval = setInterval(() => {
      if (this.isOnline) {
        this.performBackgroundRefetch();
      }
    }, 2 * 60 * 1000);
  }

  /**
   * Perform intelligent background refetch
   */
  private performBackgroundRefetch() {
    const queries = this.queryClient.getQueryCache().getAll();
    const staleQueries = queries.filter(query => {
      // Only refetch queries that:
      // 1. Are stale
      // 2. Have active observers (are being used)
      // 3. Haven't been fetched recently (avoid too frequent refetches)
      const lastFetch = query.state.dataUpdatedAt;
      const timeSinceLastFetch = Date.now() - lastFetch;

      return (
        query.isStale() &&
        query.getObserversCount() > 0 &&
        timeSinceLastFetch > 60 * 1000 && // At least 1 minute since last fetch
        query.state.fetchStatus !== 'fetching' // Not already fetching
      );
    });

    if (staleQueries.length > 0) {
      console.log(`🔄 Background refetch: updating ${staleQueries.length} stale queries`);

      // Refetch stale queries in the background
      staleQueries.forEach(query => {
        this.queryClient.refetchQueries({
          queryKey: query.queryKey,
          type: 'active',
        });
      });
    }
  }

  /**
   * Subscribe to online status changes
   */
  public onOnlineStatusChange(callback: (isOnline: boolean) => void) {
    this.onlineListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.onlineListeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of online status change
   */
  private notifyOnlineStatusChange(isOnline: boolean) {
    this.onlineListeners.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error('Error in online status callback:', error);
      }
    });
  }

  /**
   * Get current online status
   */
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Force refresh all active queries (useful for manual refresh)
   */
  public forceRefreshAll() {
    if (!this.isOnline) {
      console.warn('Cannot refresh while offline');
      return Promise.resolve();
    }

    console.log('🔄 Force refreshing all active queries');
    return this.queryClient.refetchQueries({
      type: 'active',
    });
  }

  /**
   * Get cache statistics for offline monitoring
   */
  public getCacheStats() {
    const queries = this.queryClient.getQueryCache().getAll();
    const now = Date.now();

    return {
      total: queries.length,
      active: queries.filter(q => q.getObserversCount() > 0).length,
      stale: queries.filter(q => q.isStale()).length,
      fresh: queries.filter(q => !q.isStale()).length,
      fetching: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      error: queries.filter(q => q.state.status === 'error').length,
      oldestData: queries.reduce((oldest, query) => {
        const age = now - query.state.dataUpdatedAt;
        return Math.max(oldest, age);
      }, 0),
      isOnline: this.isOnline,
    };
  }

  /**
   * Clean up listeners and intervals
   */
  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    if (this.backgroundRefetchInterval) {
      clearInterval(this.backgroundRefetchInterval);
      this.backgroundRefetchInterval = null;
    }

    this.onlineListeners.clear();
  }
}

/**
 * Create and initialize offline manager
 */
export const createOfflineManager = (queryClient: QueryClient) => {
  return new OfflineManager(queryClient);
};
