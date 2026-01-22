import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): Omit<ToastContextType, 'toasts'> {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return {
    addToast: context.addToast,
    removeToast: context.removeToast,
  };
}

export function useToastState(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastState must be used within ToastProvider');
  }
  return context;
}
