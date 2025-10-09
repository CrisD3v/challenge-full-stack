import React, { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { processError } from '../../utils/errorHandling';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
  actions?: Array<{
    label: string;
    action: string | (() => void);
  }>;
}

interface ToastContextType {
  showToast: (notification: Omit<ToastNotification, 'id'>) => void;
  showError: (error: any, context?: string) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * Toast Provider Component
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = {
      id,
      duration: 5000,
      ...notification,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-hide toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  };

  const showError = (error: any, context?: string) => {
    const processedError = processError(error);

    showToast({
      title: processedError.title,
      message: processedError.userMessage,
      type: 'error',
      duration: processedError.type === 'NETWORK_ERROR' ? 10000 : 5000,
      actions: processedError.canRetry ? [
        {
          label: 'Reintentar',
          action: 'retry',
        }
      ] : undefined,
    });
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ showToast, showError, hideToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

/**
 * Toast Container Component
 */
const ToastContainer: React.FC<{
  toasts: ToastNotification[];
  onHide: (id: string) => void;
}> = ({ toasts, onHide }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  );
};

/**
 * Individual Toast Component
 */
const Toast: React.FC<{
  toast: ToastNotification;
  onHide: (id: string) => void;
}> = ({ toast, onHide }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleHide = () => {
    setIsVisible(false);
    setTimeout(() => onHide(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = 'transform transition-all duration-300 ease-in-out';
    const visibilityStyles = isVisible
      ? 'translate-x-0 opacity-100'
      : 'translate-x-full opacity-0';

    const typeStyles = {
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[toast.type]} border rounded-lg shadow-lg p-4 max-w-sm`;
  };

  const getIcon = () => {
    const iconStyles = 'h-5 w-5 flex-shrink-0';

    switch (toast.type) {
      case 'error':
        return (
          <svg className={`${iconStyles} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`${iconStyles} text-yellow-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'success':
        return (
          <svg className={`${iconStyles} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className={`${iconStyles} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">{toast.title}</h4>
          <p className="text-sm mt-1 opacity-90">{toast.message}</p>

          {toast.actions && toast.actions.length > 0 && (
            <div className="mt-2 flex space-x-2">
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (typeof action.action === 'function') {
                      action.action();
                    }
                    handleHide();
                  }}
                  className="text-xs underline hover:no-underline opacity-75 hover:opacity-100"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleHide}
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
