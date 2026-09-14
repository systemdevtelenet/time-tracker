'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Coffee,
  Download,
  Filter
} from 'lucide-react';
import { RosterEmployee } from './RosterTable';

interface AttendanceCalendarTabProps {
  employees: RosterEmployee[];
  onSelectEmployeeCalendar: (employee: RosterEmployee) => void;
}

export default function AttendanceCalendarTab({
  employees,
  onSelectEmployeeCalendar,
}: AttendanceCalendarTabProps) {
  const [currentMonth, setCurrentMonth] = useState('September 2026');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');

  // Days of current calendar month (September 2026)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      
      {/* Calendar Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C3D] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setCurrentMonth('August 2026')}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {currentMonth}
            </span>
            <button 
              onClick={() => setCurrentMonth('October 2026')}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> 98.4% Monthly Team Adherence
          </span>
        </div>

        {/* Agent Filter Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Employee:</span>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Team Members</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Calendar Grid View */}
      <div className="bg-white dark:bg-[#111C3D] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-center py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          
          {/* Empty initial cells for Sep 2026 offset (Sep 1 was Tuesday) */}
          <div className="min-h-[100px] p-2 bg-slate-50/30 dark:bg-slate-900/20 text-slate-400">30</div>
          <div className="min-h-[100px] p-2 bg-slate-50/30 dark:bg-slate-900/20 text-slate-400">31</div>

          {daysInMonth.map((day) => {
            const isToday = day === 15;
            const isWeekend = (day + 1) % 7 === 0 || (day + 1) % 7 === 1;

            return (
              <div 
                key={day} 
                className={`min-h-[105px] sm:min-h-[120px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors ${
                  isToday 
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-400/50' 
                    : isWeekend 
                    ? 'bg-slate-50/40 dark:bg-slate-900/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${isToday ? 'px-2 py-0.5 rounded-full bg-[#2F6798] text-white font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">Today</span>
                  )}
                </div>

                {/* Day Attendance Content */}
                <div className="my-1.5 space-y-1">
                  {isWeekend ? (
                    <span className="block px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 text-center">
                      Rest Day
                    </span>
                  ) : day <= 15 ? (
                    <>
                      <div className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                        <span>Present</span>
                        <span>{day === 15 ? '7 Active' : '13/13'}</span>
                      </div>
                      {day === 8 && (
                        <div className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-[9px] font-semibold text-amber-700 dark:text-amber-300">
                          1 Late (8m)
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="block text-[10px] text-slate-400 italic text-center py-1">
                      Scheduled
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 text-right font-medium">
                  {day <= 15 && !isWeekend ? '9.0h shift' : ''}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
