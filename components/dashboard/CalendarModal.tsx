'use client';

import React from 'react';
import { X, CalendarDays, Clock, CheckCircle2, Coffee, Utensils, AlertCircle } from 'lucide-react';
import { RosterEmployee } from './RosterTable';

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
  if (!isOpen || !employee) return null;

  // Mock past week activity
  const punchHistory = [
    {
      date: 'Sep 15, 2026 (Today)',
      clockIn: '9:00:15 PM',
      lunchStart: '1:12:00 AM',
      lunchEnd: '1:58:42 AM',
      breakMins: `${employee.totalBreakMinutes.toFixed(1)} mins`,
      totalHours: employee.totalHoursFormatted,
      status: employee.statusLabel,
      traffic: employee.trafficLight,
    },
    {
      date: 'Sep 14, 2026',
      clockIn: '9:00:02 PM',
      lunchStart: '1:00:10 AM',
      lunchEnd: '2:00:00 AM',
      breakMins: '15.0 mins',
      totalHours: '8.00 hrs',
      status: 'Completed',
      traffic: 'GREEN',
    },
    {
      date: 'Sep 13, 2026',
      clockIn: '8:58:45 PM',
      lunchStart: '1:05:22 AM',
      lunchEnd: '2:05:00 AM',
      breakMins: '14.5 mins',
      totalHours: '8.02 hrs',
      status: 'Completed',
      traffic: 'GREEN',
    },
    {
      date: 'Sep 12, 2026',
      clockIn: '9:02:11 PM',
      lunchStart: '1:10:00 AM',
      lunchEnd: '2:10:00 AM',
      breakMins: '15.2 mins',
      totalHours: '7.96 hrs',
      status: 'Completed',
      traffic: 'GREEN',
    },
    {
      date: 'Sep 11, 2026',
      clockIn: '9:00:00 PM',
      lunchStart: '1:00:00 AM',
      lunchEnd: '2:00:00 AM',
      breakMins: '15.0 mins',
      totalHours: '8.00 hrs',
      status: 'Completed',
      traffic: 'GREEN',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#111C3D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2F6798] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Attendance Calendar — {employee.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Employee ID: <span className="font-bold text-slate-700 dark:text-slate-300">{employee.employeeCode}</span> • Shift: 9:00 PM - 6:00 AM
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Punch History Table */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Recent Shift Punch Activity</span>
            <span className="text-emerald-600 dark:text-emerald-400">Traffic Status: {employee.trafficLight}</span>
          </div>

          <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {punchHistory.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  idx === 0 ? 'bg-blue-50/30 dark:bg-blue-950/20' : 'bg-white dark:bg-[#111C3D]'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {item.date}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mt-1">
                    <span>Clock In: <b className="text-slate-700 dark:text-slate-300">{item.clockIn}</b></span>
                    <span>•</span>
                    <span>Lunch: <b className="text-slate-700 dark:text-slate-300">{item.lunchStart} - {item.lunchEnd}</b></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center">
                  <div className="text-right">
                    <div className="font-extrabold text-[#2F6798] dark:text-blue-400 text-sm">
                      {item.totalHours}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Breaks: {item.breakMins}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    item.status.includes('Active') || item.status === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200'
                      : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Close Calendar
          </button>
        </div>

      </div>
    </div>
  );
}
