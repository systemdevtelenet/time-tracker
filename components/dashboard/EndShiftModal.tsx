'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Check, Clock, User, LogOut } from 'lucide-react';
import { RosterEmployee } from './RosterTable';

interface EndShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: RosterEmployee | null;
  onConfirmEndShift: (employeeId: string, notes: string) => void;
}

export default function EndShiftModal({
  isOpen,
  onClose,
  employee,
  onConfirmEndShift,
}: EndShiftModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !employee) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmEndShift(employee.id, notes);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#111C3D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/60 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                End Agent Shift
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Supervisor Override Action
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Employee:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{employee.name} (ID: {employee.employeeCode})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Time Worked:</span>
              <span className="font-bold text-[#2F6798] dark:text-blue-400">{employee.totalHoursFormatted} ({employee.timeElapsed})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Current Status:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{employee.statusLabel}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Shift End Reason / Handover Notes:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed scheduled 8h shift, queue covered, endorsed to next lead..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm & End Shift</span>
          </button>
        </div>

      </div>
    </div>
  );
}
