'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Coffee, 
  ShieldCheck, 
  Users,
  CalendarDays,
  ChevronDown,
  Check,
  Building2,
  Briefcase
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
  timeIn?: string;
  timeOut?: string;
  notes?: string;
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedEmployeeName) {
      setActiveEmployeeName(selectedEmployeeName);
      setActiveTab('individual');
    } else {
      setActiveTab('team');
    }
  }, [selectedEmployeeName, isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          pillBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
        };
      case 'L':
        return {
          label: 'Late',
          pillBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
        };
      case 'U':
        return {
          label: 'Undertime',
          pillBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
        };
      case 'A':
        return {
          label: 'Absent',
          pillBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
        };
      case 'RD':
        return {
          label: 'Rest Day',
          pillBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700',
        };
      default:
        return {
          label: 'Scheduled',
          pillBg: 'bg-slate-100 text-slate-500 border border-slate-200',
        };
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Right Slide-over Panel matching reference drawer style */}
      <div 
        className="w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-[#0E1B38] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 relative border-l border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Solid Primary Blue Header Bar */}
        <div className="bg-[#2F6798] px-5 py-3.5 flex items-center justify-between text-white shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white" />
            <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase">
              ATTENDANCE DETAILS
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Sub-Header: Day & Date Information (Semi-bold) & Tab Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 shrink-0 space-y-3">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {dayName}
              </h2>
              <p className="text-xs font-semibold text-[#2F6798] dark:text-blue-300 mt-0.5">
                {monthName} {dayNumber}, {year}
              </p>
            </div>

            {/* Quick Summary Pill */}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950/60 dark:text-blue-300 border border-[#2F6798]/20">
              {teamMembers.length} Members
            </span>
          </div>

          {/* View Tab Switcher using Primary Brand Blue */}
          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'team'
                  ? 'bg-[#2F6798] text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Roster ({teamMembers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('individual')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'individual'
                  ? 'bg-[#2F6798] text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Employee Detail</span>
            </button>
          </div>

        </div>

        {/* 3. Panel Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB A: TEAM ROSTER SUMMARY */}
          {activeTab === 'team' && (
            <div className="space-y-3.5 animate-in fade-in">
              
              {/* Daily Headcount Summary (Compact Spacing, Absent and Rest Day Centered in Row 2) */}
              <div className="space-y-1.5">
                {/* Row 1: Present, Late, Undertime (3 Equal Boxes) */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">PRESENT</span>
                      <span className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200">{presentCount}</span>
                    </div>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 flex items-center gap-1.5 sm:gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[9.5px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 block">LATE</span>
                      <span className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-200">{lateCount}</span>
                    </div>
                  </div>

                  <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/50 flex items-center gap-1.5 sm:gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <div>
                      <span className="text-[9.5px] sm:text-[10px] font-bold text-orange-700 dark:text-orange-300 block">UNDERTIME</span>
                      <span className="text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-200">{undertimeCount}</span>
                    </div>
                  </div>
                </div>

                {/* Row 2: Absent & Rest Day (Centered with Same Box Size) */}
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-[calc((100%-12px)/3)] p-2 sm:p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 flex items-center gap-1.5 sm:gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <div>
                      <span className="text-[9.5px] sm:text-[10px] font-bold text-rose-700 dark:text-rose-300 block">ABSENT</span>
                      <span className="text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-200">{absentCount}</span>
                    </div>
                  </div>

                  <div className="w-[calc((100%-12px)/3)] p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 sm:gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-400 block">REST DAY</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{restDayCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Employee List with Avatar Circle */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0E1B38]">
                {teamMembers.map((emp, idx) => {
                  const statusInfo = getStatusLabelAndColor(emp.status);
                  const initials = emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('');

                  return (
                    <div
                      key={emp.id ? `${emp.id}-${idx}` : `emp-${idx}`}
                      onClick={() => {
                        setActiveEmployeeName(emp.name);
                        setActiveTab('individual');
                      }}
                      className="p-3.5 hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar Circle */}
                        <div className="w-8 h-8 rounded-full bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950/60 dark:text-blue-300 border border-[#2F6798]/20 font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#2F6798] dark:group-hover:text-blue-300 transition-colors truncate">
                            {emp.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            {emp.position}
                          </p>
                        </div>
                      </div>

                      {/* Status Pill (Flat Light Styling) */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide shrink-0 ${statusInfo.pillBg}`}>
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
              
              {/* Custom Customized Dropdown matching filters */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
                  <User className="w-3.5 h-3.5 text-[#2F6798]" />
                  <span>SELECT EMPLOYEE</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#101D3D] border text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
                    isDropdownOpen
                      ? 'border-[#2F6798] ring-2 ring-[#2F6798]/20 dark:ring-[#2F6798]/40 shadow-xs'
                      : 'border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="truncate">{activeEmp.name} ({activeEmp.position})</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#2F6798] transition-transform duration-200 shrink-0 ml-1.5 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#101D3D] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                    {teamMembers.map((m) => {
                      const isSelected = m.name === activeEmployeeName;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setActiveEmployeeName(m.name);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#2F6798]/10 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-300 font-semibold'
                              : 'text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="truncate">{m.name} ({m.position})</span>
                          {isSelected && <Check className="w-4 h-4 text-[#2F6798] dark:text-blue-400 stroke-[2.5] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Employee Summary Card using Primary Color Accent */}
              <div className="p-4 rounded-2xl bg-[#2F6798]/10 dark:bg-blue-950/40 border border-[#2F6798]/20 dark:border-blue-900/50 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2F6798] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {activeEmp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{activeEmp.name}</h4>
                    <div className="space-y-0.5 mt-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#2F6798] dark:text-blue-300 font-medium">
                        <User className="w-3 h-3 text-[#2F6798] dark:text-blue-400" />
                        <span>{activeEmp.position}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <Calendar className="w-3 h-3 text-[#2F6798] dark:text-blue-400" />
                        <span>Start: {activeEmp.startDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatusLabelAndColor(activeEmp.status).pillBg}`}>
                  {getStatusLabelAndColor(activeEmp.status).label}
                </span>
              </div>

              {/* 4 Shift Metrics with Light Gray Boxes */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* 1. Hours Worked */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#2F6798]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">HOURS WORKED</span>
                  </div>
                  <span className="text-base font-semibold text-slate-900 dark:text-slate-100 block">
                    {activeEmp.hoursWorked ?? (activeEmp.status === 'P' ? 8.00 : activeEmp.status === 'L' ? 7.25 : activeEmp.status === 'U' ? 5.14 : 0.00)} hrs
                  </span>
                </div>

                {/* 2. Shift Schedule */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#2F6798]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">SHIFT SCHEDULE</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#2F6798] dark:text-blue-300 block font-mono">
                    9:00 PM – 6:00 AM
                  </span>
                </div>

                {/* 3. Breaks / Lunch */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                    <Coffee className="w-3.5 h-3.5 text-[#2F6798]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">BREAKS / LUNCH</span>
                  </div>
                  <span className="text-base font-semibold text-slate-900 dark:text-slate-100 block">
                    {activeEmp.status === 'A' || activeEmp.status === 'RD' ? '0m / 0m' : '15m / 60m'}
                  </span>
                </div>

                {/* 4. Verification */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2F6798]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">VERIFICATION</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Portal Logged</span>
                  </span>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* 4. Footer Action Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Date Reference: {monthName} {dayNumber}, {year}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#2F6798] hover:bg-[#235179] active:bg-[#1c4366] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
