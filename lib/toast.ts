// Global Toast Notification Manager
// Provides centralized event dispatching for toast notifications with countdown progress bars.

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  id?: string;
  title: string;
  message: string;
  type?: ToastType;
  duration?: number; // Duration in milliseconds (default: 4000ms)
}

export interface ToastItem extends Required<Omit<ToastOptions, 'id'>> {
  id: string;
  createdAt: number;
}

type ToastListener = (toast: ToastItem) => void;

class ToastManager {
  private listeners: Set<ToastListener> = new Set();

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public show(optionsOrTitle: ToastOptions | string, message?: string, type: ToastType = 'success', duration = 4000): void {
    let toastItem: ToastItem;

    if (typeof optionsOrTitle === 'string') {
      toastItem = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: optionsOrTitle,
        message: message || '',
        type,
        duration,
        createdAt: Date.now(),
      };
    } else {
      toastItem = {
        id: optionsOrTitle.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: optionsOrTitle.title,
        message: optionsOrTitle.message,
        type: optionsOrTitle.type || 'success',
        duration: optionsOrTitle.duration || 4000,
        createdAt: Date.now(),
      };
    }

    this.listeners.forEach((listener) => {
      try {
        listener(toastItem);
      } catch (err) {
        console.error('Error invoking toast listener:', err);
      }
    });
  }
}

export const toastManager = new ToastManager();

/**
 * Trigger a toast notification anywhere in the application.
 * Example: showToast('Welcome Back', 'You have successfully logged into the hub.', 'success')
 */
export function showToast(
  optionsOrTitle: ToastOptions | string,
  message?: string,
  type: ToastType = 'success',
  duration = 4000
): void {
  toastManager.show(optionsOrTitle, message, type, duration);
}
