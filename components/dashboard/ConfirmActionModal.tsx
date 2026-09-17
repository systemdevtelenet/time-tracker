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
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200"
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

        {/* Center Red Icon Circle matching exact user screenshot */}
        <div className="w-14 h-14 rounded-full bg-[#E53935] text-white flex items-center justify-center shadow-lg shadow-rose-500/25 shrink-0 mt-1">
          {iconType === 'logout' ? (
            <LogOut className="w-6 h-6 stroke-[2.5]" />
          ) : iconType === 'delete' ? (
            <Trash2 className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          )}
        </div>

        {/* Title & Explanations */}
        <div className="space-y-1.5 px-2">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h3>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {description}
          </p>
          {subDescription && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed pt-0.5">
              {subDescription}
            </p>
          )}
        </div>

        {/* Action Buttons: Cancel and Yes pill buttons */}
        <div className="flex items-center gap-3 pt-2 w-full justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2 rounded-full bg-[#E53935] hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
