'use client';

import React from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Coffee, 
  Utensils, 
  Download, 
  CheckCircle,
  PieChart
} from 'lucide-react';
import { RosterEmployee } from './RosterTable';

interface HoursReportTabProps {
  employees: RosterEmployee[];
}

export default function HoursReportTab({ employees }: HoursReportTabProps) {
  // Aggregate stats
  const totalWorked = employees.reduce((sum, e) => sum + e.totalHoursWorked, 0);
  const totalBreaks = employees.reduce((sum, e) => sum + e.totalBreakMinutes, 0);
  const totalLunches = employees.reduce((sum, e) => sum + e.totalLunchMinutes, 0);
  const avgHours = employees.length > 0 ? (totalWorked / employees.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C3D] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Total Team Hours Today</span>
            <Clock className="w-4 h-4 text-[#2F6798]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {totalWorked.toFixed(2)} hrs
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            +4.2% vs same shift yesterday
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C3D] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Average Agent Hours</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {avgHours} hrs
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Target shift length: 8.00 hrs
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C3D] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Total Break Time</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {totalBreaks.toFixed(0)} mins
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {employees.length} team members
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C3D] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <span>Total Lunch Utilization</span>
            <Utensils className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {totalLunches.toFixed(0)} mins
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Standard: 60 mins/agent
          </p>
        </div>

      </div>

      {/* Employee Hours Breakdown List */}
      <div className="bg-white dark:bg-[#111C3D] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6">
        
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Agent Shift Completion & Hours Progress
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live progression towards 8.00 standard daily hours
            </p>
          </div>

          <button
            onClick={() => alert('Exporting full analytics report PDF...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          {employees.map((emp) => {
            const percent = Math.min(100, Math.round((emp.totalHoursWorked / 8) * 100));

            return (
              <div key={emp.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {emp.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (ID: {emp.employeeCode})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2F6798] dark:text-blue-400">
                      {emp.totalHoursFormatted}
                    </span>
                    <span className="text-slate-400 font-medium w-12 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#2F6798] to-[#10B981] transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
