'use client';

import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  Building2, 
  Clock, 
  CalendarDays, 
  Phone, 
  Mail, 
  Search, 
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { RosterEmployee } from './RosterTable';

interface EmployeeDetailsTabProps {
  employees: RosterEmployee[];
  onViewCalendar: (employee: RosterEmployee) => void;
}

export default function EmployeeDetailsTab({
  employees,
  onViewCalendar,
}: EmployeeDetailsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeCode.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111C3D] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Workforce Team Directory
          </h3>
          <p className="text-xs text-slate-500">
            Detailed view of all active agents, supervisors, and trainees
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/30"
          />
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((emp) => {
          const initials = emp.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join('');

          return (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111C3D] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                
                {/* Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1E4E79] to-[#3B82F6] text-white font-black text-base flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {emp.name}
                      </h4>
                      <div className="text-xs text-slate-500 font-medium">
                        ID: {emp.employeeCode}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    emp.status === 'working'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200'
                      : emp.status === 'lunch'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {emp.statusLabel}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Briefcase className="w-3.5 h-3.5" /> Role
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Customer Service Agent
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-3.5 h-3.5" /> Account
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {emp.account || 'Corporate'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> Total Worked
                    </span>
                    <span className="font-bold text-[#2F6798] dark:text-blue-400">
                      {emp.totalHoursFormatted} ({emp.timeElapsed})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <CalendarDays className="w-3.5 h-3.5" /> Last Active
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                      {emp.lastActive}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2">
                <button
                  onClick={() => onViewCalendar(emp)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2F6798] hover:text-white dark:hover:bg-[#2F6798] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>View Attendance Calendar</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
