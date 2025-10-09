/**
 * Authentication event utilities for cache management
 * Provides centralized handling of auth-related cache operations
 */

import { getCacheUtils } from './cacheUtils';

/**
 * Authentication event types
 */
export const AuthEventType = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED'
} as const;

export type AuthEventType = typeof AuthEventType[keyof typeof AuthEventType];

/**
 * Authentication event handler
 * Manages cache operations based on authentication state changes
 */
export class AuthEventHandler {
  private static instance: AuthEventHandler | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthEventHandler {
    if (!AuthEventHandler.instance) {
      AuthEventHandler.instance = new AuthEventHandler();
    }
    return AuthEventHandler.instance;
  }

  /**
   * Handle authentication events with proper cache management
   */
  public async handleAuthEvent(eventType: AuthEventType, data?: any): Promise<void> {
    try {
      const cacheUtils = getCacheUtils();

      switch (eventType) {
        case AuthEventType.LOGIN:
          console.log('AuthEventHandler: Handling login event');
          await cacheUtils.auth.onLogin();
          // Dispatch custom event for components that need to react
          window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data }));
          break;

        case AuthEventType.LOGOUT:
          console.log('AuthEventHandler: Handling logout event');
          cacheUtils.auth.onLogout();
          // Dispatch custom event for components that need to react
          window.dispatchEvent(new CustomEvent('userLoggedOut'));
          break;

        case AuthEventType.TOKEN_EXPIRED:
          console.log('AuthEventHandler: Handling token expiration event');
          cacheUtils.auth.onTokenExpired();
          // Dispatch custom event for components that need to react
          window.dispatchEvent(new CustomEvent('tokenExpired'));
          break;

        case AuthEventType.TOKEN_REFRESHED:
          console.log('AuthEventHandler: Handling token refresh event');
          // Optionally refresh essential data after token refresh
          await cacheUtils.prefetch.essentialData();
          // Dispatch custom event for components that need to react
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: data }));
          break;

        default:
          console.warn('AuthEventHandler: Unknown auth event type:', eventType);
      }
    } catch (error) {
      console.error('AuthEventHandler: Error handling auth event:', eventType, error);
      // Don't throw error to prevent breaking the auth flow
    }
  }

  /**
   * Convenience methods for common auth events
   */
  public async onLogin(userData?: any): Promise<void> {
    return this.handleAuthEvent(AuthEventType.LOGIN, userData);
  }

  public async onLogout(): Promise<void> {
    return this.handleAuthEvent(AuthEventType.LOGOUT);
  }

  public async onTokenExpired(): Promise<void> {
    return this.handleAuthEvent(AuthEventType.TOKEN_EXPIRED);
  }

  public async onTokenRefreshed(tokenData?: any): Promise<void> {
    return this.handleAuthEvent(AuthEventType.TOKEN_REFRESHED, tokenData);
  }
}

/**
 * Singleton instance for easy access
 */
export const authEventHandler = AuthEventHandler.getInstance();

/**
 * Utility functions for auth event handling
 */
export const authEvents = {
  /**
   * Handle user login with cache management
   */
  onLogin: (userData?: any) => authEventHandler.onLogin(userData),

  /**
   * Handle user logout with cache cleanup
   */
  onLogout: () => authEventHandler.onLogout(),

  /**
   * Handle token expiration with cache cleanup
   */
  onTokenExpired: () => authEventHandler.onTokenExpired(),

  /**
   * Handle token refresh with cache update
   */
  onTokenRefreshed: (tokenData?: any) => authEventHandler.onTokenRefreshed(tokenData),
};
