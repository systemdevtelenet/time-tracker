'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Utensils, 
  Coffee, 
  ShieldCheck, 
  Users,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export type AttendanceStatus = 'P' | 'L' | 'U' | 'A' | 'RD' | null;

export interface TeamMemberDayStatus {
  id: string;
  name: string;
  position: string;
  startDate: string;
  status: AttendanceStatus;
  hoursWorked?: number;
  breakMins?: number;
  lunchMins?: number;
  shiftSchedule?: string;
}

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  dayName: string;
  monthName: string;
  year: number;
  teamMembers: TeamMemberDayStatus[];
  selectedEmployeeName?: string | null;
}

export default function AttendanceDetailModal({
  isOpen,
  onClose,
  dayNumber,
  dayName,
  monthName,
  year,
  teamMembers,
  selectedEmployeeName,
}: AttendanceDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'individual'>('team');
  const [activeEmployeeName, setActiveEmployeeName] = useState<string>(
    selectedEmployeeName || teamMembers[0]?.name || ''
  );

  useEffect(() => {
    if (selectedEmployeeName) {
      setActiveEmployeeName(selectedEmployeeName);
      setActiveTab('individual');
    } else {
      setActiveTab('team');
    }
  }, [selectedEmployeeName, isOpen]);

  if (!isOpen) return null;

  // Selected employee data
  const activeEmp = teamMembers.find((m) => m.name === activeEmployeeName) || teamMembers[0];

  // Headcount breakdown for this day
  const presentCount = teamMembers.filter((m) => m.status === 'P').length;
  const lateCount = teamMembers.filter((m) => m.status === 'L').length;
  const undertimeCount = teamMembers.filter((m) => m.status === 'U').length;
  const absentCount = teamMembers.filter((m) => m.status === 'A').length;
  const restDayCount = teamMembers.filter((m) => m.status === 'RD').length;

  const getStatusLabelAndColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'P':
        return {
          label: 'Present',
          pillBg: 'bg-[#10b981] text-white',
          border: 'border-emerald-200',
          badgeText: 'text-emerald-700 dark:text-emerald-300',
        };
      case 'L':
        return {
          label: 'Late',
          pillBg: 'bg-[#f59e0b] text-white',
          border: 'border-amber-200',
          badgeText: 'text-amber-700 dark:text-amber-300',
        };
      case 'U':
        return {
          label: 'Undertime',
          pillBg: 'bg-[#f97316] text-white',
          border: 'border-orange-200',
          badgeText: 'text-orange-700 dark:text-orange-300',
        };
      case 'A':
        return {
          label: 'Absent',
          pillBg: 'bg-[#f43f5e] text-white',
          border: 'border-rose-200',
          badgeText: 'text-rose-700 dark:text-rose-300',
        };
      case 'RD':
        return {
          label: 'Rest Day',
          pillBg: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
          border: 'border-slate-200',
          badgeText: 'text-slate-500',
        };
      default:
        return {
          label: 'Scheduled',
          pillBg: 'bg-slate-100 text-slate-400',
          border: 'border-slate-200',
          badgeText: 'text-slate-400',
        };
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#0E1B38] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Header Area with Date Title and Close Button */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 relative">
          
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Date Information */}
          <div className="text-center space-y-0.5">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              {dayName}
            </h3>
            <p className="text-xs font-bold text-[#2F6798] dark:text-blue-300">
              {monthName} {dayNumber}, {year}
            </p>
          </div>

          {/* Tab Switcher: Team Summary vs Individual Detail */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'team'
                    ? 'bg-[#2F6798] text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Roster ({teamMembers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('individual')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'individual'
                    ? 'bg-[#2F6798] text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Employee Detail</span>
              </button>
            </div>
          </div>

        </div>

        {/* 2. Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB A: TEAM SUMMARY VIEW (Matching User Reference Image) */}
          {activeTab === 'team' && (
            <div className="space-y-3.5">
              
              {/* Daily Headcount Pill Summary */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F7FB] dark:bg-[#070D1E] border border-slate-200/80 dark:border-slate-800 text-[11px] font-black text-slate-700 dark:text-slate-300 flex-wrap gap-2">
                <span className="text-emerald-700 dark:text-emerald-400">● {presentCount} Present</span>
                <span className="text-amber-700 dark:text-amber-400">● {lateCount} Late</span>
                <span className="text-orange-700 dark:text-orange-400">● {undertimeCount} Undertime</span>
                <span className="text-rose-700 dark:text-rose-400">● {absentCount} Absent</span>
                <span className="text-slate-500 dark:text-slate-400">● {restDayCount} Rest Day</span>
              </div>

              {/* Scrollable Employee List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                {teamMembers.map((emp) => {
                  const statusInfo = getStatusLabelAndColor(emp.status);

                  return (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setActiveEmployeeName(emp.name);
                        setActiveTab('individual');
                      }}
                      className="p-3.5 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-[#2F6798] dark:group-hover:text-blue-300 transition-colors">
                          {emp.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {emp.position}
                        </p>
                      </div>

                      {/* Status Pill matching user design */}
                      <span className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wide shadow-2xs shrink-0 ${statusInfo.pillBg}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB B: INDIVIDUAL EMPLOYEE DETAIL VIEW */}
          {activeTab === 'individual' && activeEmp && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Employee Selector Bar */}
              <div className="flex items-center gap-2 pb-1">
                <span className="text-xs font-bold text-slate-400">Employee:</span>
                <select
                  value={activeEmployeeName}
                  onChange={(e) => setActiveEmployeeName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.position})
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Card Header */}
              <div className="p-4 rounded-2xl bg-[#153B5E] text-white border border-white/10 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F2A44] border border-[#C8A54B]/40 text-[#E5CA80] font-black text-xs flex items-center justify-center shadow-inner">
                    {activeEmp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{activeEmp.name}</h4>
                    <p className="text-[11px] text-blue-200/80 font-bold">{activeEmp.position} • Start: {activeEmp.startDate}</p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black shadow-xs ${getStatusLabelAndColor(activeEmp.status).pillBg}`}>
                  {getStatusLabelAndColor(activeEmp.status).label}
                </span>
              </div>

              {/* 4 Shift Metrics for that day */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">HOURS WORKED</span>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {activeEmp.hoursWorked ?? (activeEmp.status === 'P' ? 8.00 : activeEmp.status === 'L' ? 7.25 : activeEmp.status === 'U' ? 5.14 : 0.00)} hrs
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">SHIFT SCHEDULE</span>
                  <span className="text-base font-black text-[#2F6798] dark:text-blue-300 mt-0.5 block font-mono">
                    9:00 PM – 6:00 AM
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">BREAKS / LUNCH</span>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {activeEmp.status === 'A' || activeEmp.status === 'RD' ? '0m / 0m' : '15m / 60m'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase block">VERIFICATION</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Portal Logged</span>
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 3. Footer Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500">
          <span>Date Reference: {monthName} {dayNumber}, {year}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-black shadow-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
