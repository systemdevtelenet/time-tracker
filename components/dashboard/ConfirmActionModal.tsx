'use client';

import React from 'react';
import { X, LogOut, Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  subDescription?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  iconType?: 'logout' | 'delete' | 'warning';
}

export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  subDescription,
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  iconType = 'logout',
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200/90 dark:border-slate-800 shadow-2xl p-8 relative flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-right close X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center Red Icon Circle (80px × 80px, #ED1C25, 36px icon) */}
        <div className="w-20 h-20 rounded-full bg-[#ED1C25] text-white flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0 mt-1">
          {iconType === 'logout' ? (
            <LogOut className="h-9 w-9 text-white stroke-[2.5]" />
          ) : iconType === 'delete' ? (
            <Trash2 className="h-9 w-9 text-white stroke-[2.5]" />
          ) : (
            <AlertTriangle className="h-9 w-9 text-white stroke-[2.5]" />
          )}
        </div>

        {/* Title & Explanations (20px Title, 14px Prompt Text) */}
        <div className="space-y-1.5 px-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
            {title}
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {description}
          </p>
          {subDescription && (
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed pt-0.5">
              {subDescription}
            </p>
          )}
        </div>

        {/* Action Buttons: Cancel and Yes pill buttons (rounded-full, px-6 py-2.5, text-sm font-bold) */}
        <div className="flex items-center gap-3 pt-2 w-full justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold transition-all cursor-pointer shadow-2xs"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2.5 rounded-full bg-[#ED1C25] hover:bg-[#c8161e] text-white text-sm font-bold shadow-md shadow-red-200 dark:shadow-none transition-all cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
