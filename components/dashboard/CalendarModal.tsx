'use client';

import React, { useState } from 'react';
import { X, CalendarDays, Clock, CheckCircle2, Coffee, Utensils, AlertCircle, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { RosterEmployee } from './RosterTable';
import AttendanceCalendarView from './AttendanceCalendarView';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: RosterEmployee | null;
}

export default function CalendarModal({
  isOpen,
  onClose,
  employee,
}: CalendarModalProps) {
  const [modalView, setModalView] = useState<'calendar' | 'activity'>('calendar');

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-white dark:bg-[#111C3D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2F6798] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Shift Punch Calendar — {employee.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Employee ID: <span className="font-bold text-slate-700 dark:text-slate-300">{employee.employeeCode}</span> • Shift: 9:00 PM – 6:00 AM • Traffic: <span className="font-bold text-emerald-600 dark:text-emerald-400">{employee.trafficLight}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded Shift Punch Calendar View */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1">
          <AttendanceCalendarView
            employeeName={employee.name}
            onBackToRoster={onClose}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Shift timestamps & break intervals verified by Supervisor Attendance Sync
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
