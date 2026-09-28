'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { toastManager, ToastItem, ToastType } from '@/lib/toast';

interface ToastComponentProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: ToastComponentProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = toast.duration || 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (remainingPct <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [toast.id, toast.duration]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200);
  }, [toast.id, onDismiss]);

  const getTypeStyles = (type: ToastType) => {
    switch (type) {
      case 'info':
        return {
          borderAccent: 'border-l-blue-500',
          progressBar: 'bg-blue-500',
          iconRing: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40',
          icon: <Info className="w-3.5 h-3.5 stroke-[2.5]" />,
        };
      case 'warning':
        return {
          borderAccent: 'border-l-amber-500',
          progressBar: 'bg-amber-500',
          iconRing: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />,
        };
      case 'error':
        return {
          borderAccent: 'border-l-rose-500',
          progressBar: 'bg-rose-500',
          iconRing: 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/40',
          icon: <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />,
        };
      case 'success':
      default:
        return {
          borderAccent: 'border-l-emerald-500',
          progressBar: 'bg-emerald-500',
          iconRing: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40',
          icon: <Check className="w-3.5 h-3.5 stroke-[3]" />,
        };
    }
  };

  const style = getTypeStyles(toast.type);

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden w-full max-w-[310px] sm:max-w-sm bg-white dark:bg-[#0E1B38] rounded-xl shadow-lg shadow-slate-900/10 border border-slate-200/90 dark:border-slate-800 border-l-[4px] ${style.borderAccent} transition-all duration-200 select-none ${
        isExiting
          ? 'opacity-0 translate-x-4 scale-95'
          : 'animate-in slide-in-from-top-3 sm:slide-in-from-right-6 fade-in duration-250'
      }`}
    >
      <div className="p-3 sm:p-3.5 flex items-start gap-2.5 sm:gap-3">
        {/* Circle Icon Badge */}
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${style.iconRing}`}>
          {style.icon}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-0.5">
          <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5 break-words">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 -mr-1 -mt-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
        <div
          className={`h-full ${style.progressBar} transition-all ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((newToast) => {
      setToasts((prev) => [...prev.filter((t) => t.id !== newToast.id), newToast]);
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-3.5 sm:top-4 right-3.5 sm:right-4 z-[99999] flex flex-col gap-2 max-w-[310px] sm:max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}
