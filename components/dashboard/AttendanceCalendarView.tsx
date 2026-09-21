'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Settings, 
  HelpCircle, 
  Plus, 
  Check, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Users, 
  X, 
  Sparkles, 
  ChevronDown,
  RotateCw,
  ArrowLeft,
  CalendarDays,
  Coffee,
  Utensils,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { PhoneTimeRecord } from '@/lib/types';
import AttendanceDetailModal, { TeamMemberDayStatus } from './AttendanceDetailModal';
import AttendanceCellPopover from './AttendanceCellPopover';

interface AttendanceCalendarViewProps {
  employeeName?: string;
  onBackToRoster?: () => void;
  records?: PhoneTimeRecord[];
}

export interface DayPunchItem {
  id: string;
  type: string;
  timeLabel: string;
  rawTimestamp: string;
  duration?: string;
  status?: string;
  parsedDate: Date;
}

export type DayAttendanceStatus = 'Present' | 'Late' | 'Undertime' | 'Late / UT' | 'Absent' | 'Rest Day' | null;

const ALL_ROSTER_EMPLOYEES = [
  { id: '1597', name: 'Nissi-Jeh Reguero', role: 'Head of Training', department: 'TQA', account: 'TRAINING' },
  { id: '1108', name: 'Raymundo Alasagas III', role: 'Head of Quality', department: 'TQA', account: 'QUALITY' },
  { id: '1772', name: 'Bianca Kaye Ernestine Colonia', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '2385', name: 'Michelle Yncierto', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '1035', name: 'Rommel Mendoza', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '1820', name: 'Ronelyn Baguio', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '836', name: 'Krisland Pepito', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '1006', name: 'Niño Elijah R. Reyes', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '1880', name: 'Kier Ariola', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '946', name: 'Vincent Luis Celdran', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '2298', name: 'Nina Joy Briones', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '1954', name: 'Matt Riner Balaba', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
  { id: '2610', name: 'Maegan Marie Cabardo', role: 'Trainer', department: 'TQA', account: 'TRAINING' },
];

function assignShiftDay(date: Date): number {
  const h = date.getHours();
  // Early morning punches (midnight to 8:59 AM) belong to the shift that started the previous evening
  if (h < 9) {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    return prev.getDate();
  }
  return date.getDate();
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function AttendanceCalendarView({
  employeeName = 'Nissi-Jeh Reguero',
  onBackToRoster,
  records = [],
}: AttendanceCalendarViewProps) {
  // Active selected employee
  const [selectedEmpName, setSelectedEmpName] = useState<string>(employeeName);
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8); // September (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [personSearch, setPersonSearch] = useState('');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [punchLogs, setPunchLogs] = useState<any[]>([]);

  // Local overrides & notes
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('attendance_overrides_v1');
        return saved ? JSON.parse(saved) : {};
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  // Cell Popover / Day Modal State
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dayNumber: number;
    status: DayAttendanceStatus;
    punches: DayPunchItem[];
  } | null>(null);

  // Sync with prop change
  useEffect(() => {
    if (employeeName) {
      setSelectedEmpName(employeeName);
    }
  }, [employeeName]);

  // Find active employee record
  const activeEmployee = useMemo(() => {
    return (
      ALL_ROSTER_EMPLOYEES.find(
        (e) => e.name.toLowerCase() === selectedEmpName.toLowerCase() || e.id === selectedEmpName
      ) || ALL_ROSTER_EMPLOYEES[0]
    );
  }, [selectedEmpName]);

  // Fetch real punch logs for the selected employee from Supabase
  const loadLogsForEmployee = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/punch-logs?empId=${activeEmployee.id}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPunchLogs(json.data);
      }
    } catch (err) {
      console.error('Failed to load employee punch logs in calendar:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogsForEmployee();
  }, [activeEmployee.id]);

  // Group punches by shift day for the selected month
  const punchesByShiftDay = useMemo(() => {
    const map: Record<number, DayPunchItem[]> = {};

    punchLogs.forEach((log) => {
      const rawTs = log.timestamp || log.TIMESTAMP;
      if (!rawTs) return;
      const d = new Date(rawTs);
      if (isNaN(d.getTime())) return;

      if (d.getFullYear() === currentYear && d.getMonth() === currentMonthIndex) {
        const shiftDay = assignShiftDay(d);
        if (!map[shiftDay]) map[shiftDay] = [];

        map[shiftDay].push({
          id: log.id || log['LOG ID'] || `punch-${Date.now()}-${Math.random()}`,
          type: log.type || log.TYPE || log.punch_type || 'Shift Event',
          timeLabel: formatTime(d),
          rawTimestamp: rawTs,
          duration: log.duration || log.DURATION,
          status: log.status || log.STATUS,
          parsedDate: d,
        });
      }
    });

    // Sort punches chronologically within each day
    Object.keys(map).forEach((dayKey) => {
      const numKey = Number(dayKey);
      map[numKey].sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    });

    return map;
  }, [punchLogs, currentYear, currentMonthIndex]);

  // Calculate day attendance status for days 1–30
  const dayStatusMap = useMemo(() => {
    const statusMap: Record<number, DayAttendanceStatus> = {};
    const empCode = activeEmployee.id;

    for (let day = 1; day <= 30; day++) {
      const dateObj = new Date(currentYear, currentMonthIndex, day);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6; // Sunday or Saturday

      // 1. Check manual override
      const overrideKey = `${empCode}-${day}`;
      const nameKey = `${activeEmployee.name}-${day}`;
      const manualTag = attendanceOverrides[overrideKey] || attendanceOverrides[nameKey];

      if (manualTag) {
        if (manualTag === 'P') statusMap[day] = 'Present';
        else if (manualTag === 'L') statusMap[day] = 'Late';
        else if (manualTag === 'U') statusMap[day] = 'Undertime';
        else if (manualTag === 'A') statusMap[day] = 'Absent';
        else if (manualTag === 'RD') statusMap[day] = 'Rest Day';
        continue;
      }

      // 2. Check actual logs
      const dayPunches = punchesByShiftDay[day] || [];
      if (dayPunches.length > 0) {
        const hasLate = dayPunches.some((p) => (p.status || '').toLowerCase() === 'late');
        const hasUndertime = dayPunches.some((p) => (p.status || '').toLowerCase() === 'undertime');

        if (hasLate && hasUndertime) {
          statusMap[day] = 'Late / UT';
        } else if (hasLate) {
          statusMap[day] = 'Late';
        } else if (hasUndertime) {
          statusMap[day] = 'Undertime';
        } else {
          statusMap[day] = 'Present';
        }
      } else if (isWeekend) {
        statusMap[day] = 'Rest Day';
      } else if (day <= 22) {
        statusMap[day] = 'Absent';
      } else {
        statusMap[day] = null;
      }
    }

    return statusMap;
  }, [punchesByShiftDay, activeEmployee, attendanceOverrides, currentYear, currentMonthIndex]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Build calendar matrix (Sunday through Saturday grid)
  const calendarGrid = useMemo(() => {
    // 1st day of the selected month
    const firstDay = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0=Sun, 1=Mon, 2=Tue...
    const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate(); // 30 for Sep
    const prevMonthDaysCount = new Date(currentYear, currentMonthIndex, 0).getDate();

    const cells: {
      dayNum: number;
      isCurrentMonth: boolean;
      status: DayAttendanceStatus;
      punches: DayPunchItem[];
      isToday: boolean;
    }[] = [];

    // Leading padding days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        dayNum: prevMonthDaysCount - i,
        isCurrentMonth: false,
        status: null,
        punches: [],
        isToday: false,
      });
    }

    // Days in active month (1 to totalDaysInMonth)
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const isToday = currentYear === 2026 && currentMonthIndex === 8 && d === 22;
      cells.push({
        dayNum: d,
        isCurrentMonth: true,
        status: dayStatusMap[d] || null,
        punches: punchesByShiftDay[d] || [],
        isToday,
      });
    }

    // Trailing padding days to fill 5 or 6 complete weeks
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        status: null,
        punches: [],
        isToday: false,
      });
    }

    return cells;
  }, [currentYear, currentMonthIndex, dayStatusMap, punchesByShiftDay]);

  // Color styles helper for light/pastel aesthetic matching tables
  const getStatusColorStyles = (status: DayAttendanceStatus) => {
    switch (status) {
      case 'Present':
        return {
          banner: 'bg-[#d1fae5] text-[#065f46] border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700',
          punchPill: 'bg-[#ecfdf5] text-[#065f46] border border-emerald-200/90 hover:bg-[#d1fae5] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
          dot: 'bg-[#10B981]',
        };
      case 'Late':
        return {
          banner: 'bg-[#fef3c7] text-[#92400e] border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700',
          punchPill: 'bg-[#fffbeb] text-[#92400e] border border-amber-200/90 hover:bg-[#fef3c7] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
          dot: 'bg-[#F59E0B]',
        };
      case 'Undertime':
      case 'Late / UT':
        return {
          banner: 'bg-[#ffedd5] text-[#9a3412] border border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-700',
          punchPill: 'bg-[#fff7ed] text-[#9a3412] border border-orange-200/90 hover:bg-[#ffedd5] dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
          dot: 'bg-[#EA580C]',
        };
      case 'Absent':
        return {
          banner: 'bg-[#ffe4e6] text-[#9f1239] border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700',
          punchPill: 'bg-[#fff1f2] text-[#9f1239] border border-rose-200/90 hover:bg-[#ffe4e6] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
          dot: 'bg-[#F43F5E]',
        };
      case 'Rest Day':
        return {
          banner: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          punchPill: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800',
          dot: 'bg-slate-400',
        };
      default:
        return {
          banner: 'bg-slate-100 text-slate-500 border border-slate-200',
          punchPill: 'bg-slate-50 text-slate-600 border border-slate-200',
          dot: 'bg-slate-300',
        };
    }
  };

  // KPI Summary for the month
  const totalPresent = Object.values(dayStatusMap).filter((s) => s === 'Present').length;
  const totalLate = Object.values(dayStatusMap).filter((s) => s === 'Late').length;
  const totalUndertime = Object.values(dayStatusMap).filter((s) => s === 'Undertime' || s === 'Late / UT').length;
  const totalAbsent = Object.values(dayStatusMap).filter((s) => s === 'Absent').length;
  const totalRestDays = Object.values(dayStatusMap).filter((s) => s === 'Rest Day').length;

  return (
    <div className="bg-white dark:bg-[#0E1B38] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-sans select-none flex flex-col">
      
      {/* ================= TOP HEADER BAR ================= */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1B38] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Section: Back Button + Date Info + Employee Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {onBackToRoster && (
            <button
              type="button"
              onClick={onBackToRoster}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Roster View</span>
            </button>
          )}

          {/* Date Badge */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2F6798] text-white flex flex-col items-center justify-center font-black shadow-xs shrink-0">
              <span className="text-[7.5px] uppercase tracking-tighter leading-none opacity-85">
                {monthNames[currentMonthIndex].slice(0, 3).toUpperCase()}
              </span>
              <span className="text-xs font-black leading-none mt-0.5">22</span>
            </div>

            {/* Employee Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEmpDropdownOpen(!isEmpDropdownOpen)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-[#2F6798] text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#2F6798]/15 text-[#2F6798] dark:text-blue-300 font-extrabold text-[9px] flex items-center justify-center">
                  {activeEmployee.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                    {activeEmployee.name}
                  </span>
                  <span className="block text-[9.5px] font-semibold text-slate-400 leading-none">
                    ID: {activeEmployee.id} • {activeEmployee.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {isEmpDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-[#101D3D] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                    Select Workforce Member (13)
                  </div>
                  {ALL_ROSTER_EMPLOYEES.map((emp) => {
                    const isSelected = emp.id === activeEmployee.id;
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setSelectedEmpName(emp.name);
                          setIsEmpDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950/60 dark:text-blue-300 font-extrabold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold'
                        }`}
                      >
                        <div>
                          <span className="block">{emp.name}</span>
                          <span className="text-[9.5px] opacity-70 block font-normal">ID: {emp.id} • {emp.role}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#2F6798] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Month Switcher + Refresh + View Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          
          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={loadLogsForEmployee}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Refresh database punch logs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin text-[#2F6798]' : ''}`} />
          </button>

          {/* Month Navigator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="font-extrabold text-slate-900 dark:text-slate-100 px-2">
              {monthNames[currentMonthIndex]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#111C3D] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <span>{viewMode}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isViewDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-32 bg-white dark:bg-[#101D3D] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                {(['Month', 'Week', 'Day'] as const).map((vm) => (
                  <button
                    key={vm}
                    type="button"
                    onClick={() => {
                      setViewMode(vm);
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                      viewMode === vm
                        ? 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {vm}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ================= MONTH SUMMARY METRICS BAR ================= */}
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 sm:gap-5 text-xs font-bold flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>{totalPresent} Present</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>{totalLate} Late</span>
          </span>
          <span className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
            <span>{totalUndertime} Undertime</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
            <span>{totalAbsent} Absent</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>{totalRestDays} Rest Days</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
          Showing verified punches from database for <span className="font-bold text-[#2F6798]">{activeEmployee.name}</span>
        </div>
      </div>

      {/* ================= 7-COLUMN MONTH CALENDAR GRID (CONNECTED TABLE STYLE) ================= */}
      <div className="flex-1 overflow-x-auto bg-white dark:bg-[#0E1B38]">
        <div className="min-w-[840px] border-t border-slate-200 dark:border-slate-800">
          
          {/* Days of Week Header Row - Connected Blue Grid Header with White Text */}
          <div className="grid grid-cols-7 border-b border-[#24537C] bg-[#2F6798] text-white select-none">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((dw) => (
              <div
                key={dw}
                className="text-center py-2.5 text-[11px] font-black uppercase tracking-wider border-r last:border-r-0 border-white/20"
              >
                {dw}
              </div>
            ))}
          </div>

          {/* Month Day Cells Grid - Connected Grid with 1px borders, no gaps */}
          <div className="grid grid-cols-7 border-collapse">
            {calendarGrid.map((cell, idx) => {
              const colIndex = idx % 7;
              const isRightmost = colIndex === 6;

              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`pad-${idx}`}
                    className={`min-h-[155px] bg-slate-50/50 dark:bg-slate-900/20 p-2 border-b border-r ${
                      isRightmost ? 'border-r-0' : ''
                    } border-slate-200 dark:border-slate-800 opacity-40 select-none flex flex-col justify-between`}
                  >
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400">
                        {cell.dayNum}
                      </span>
                    </div>
                  </div>
                );
              }

              const styles = getStatusColorStyles(cell.status);
              const hasPunches = cell.punches && cell.punches.length > 0;

              return (
                <div
                  key={`day-${cell.dayNum}`}
                  onClick={() => {
                    setSelectedDayDetail({
                      dayNumber: cell.dayNum,
                      status: cell.status,
                      punches: cell.punches,
                    });
                  }}
                  className={`min-h-[160px] p-2 flex flex-col justify-start gap-1 border-b border-r ${
                    isRightmost ? 'border-r-0' : ''
                  } border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1B38] hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors cursor-pointer relative group ${
                    cell.isToday ? 'bg-emerald-50/25 dark:bg-emerald-950/15' : ''
                  }`}
                >
                  {/* Day Header with Day Number in Top Right */}
                  <div className="flex items-center justify-between leading-none mb-0.5">
                    {cell.isToday ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Today
                      </span>
                    ) : (
                      <span />
                    )}
                    <span
                      className={`text-xs font-black transition-transform group-hover:scale-110 ${
                        cell.isToday
                          ? 'w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-2xs'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                  </div>

                  {/* Top Status Badge (Light Pastel Background similar to tables) */}
                  {cell.status && (
                    <div
                      className={`w-full py-0.5 px-1.5 rounded-md font-extrabold text-[10.5px] text-center truncate shadow-2xs select-none ${styles.banner}`}
                    >
                      {cell.status}
                    </div>
                  )}

                  {/* Stack of Punch Action Pills */}
                  {hasPunches ? (
                    <div className="flex flex-col gap-1 mt-0.5 overflow-y-auto max-h-[185px] pr-0.5 custom-scrollbar">
                      {cell.punches.map((punch) => (
                        <div
                          key={punch.id}
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold tracking-tight flex items-center justify-between transition-all shadow-2xs ${styles.punchPill}`}
                          title={`${punch.timeLabel} • ${punch.type}${punch.status ? ` (${punch.status})` : ''}`}
                        >
                          <span className="truncate mr-1 shrink-0">{punch.timeLabel}</span>
                          <span className="truncate opacity-95 text-[9px]">
                            {punch.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : cell.status === 'Absent' ? (
                    <div className="flex-1 flex items-center justify-center p-1 text-center text-[10px] text-rose-500/80 font-bold">
                      No time logs
                    </div>
                  ) : cell.status === 'Rest Day' ? (
                    <div className="flex-1 flex items-center justify-center p-1 text-center text-[10px] text-slate-400 font-semibold">
                      Scheduled Rest Day
                    </div>
                  ) : null}

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ================= DAY DETAIL BREAKDOWN RIGHT PANEL ================= */}
      {selectedDayDetail && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={() => setSelectedDayDetail(null)}
        >
          <div
            className="w-full max-w-md h-full bg-white dark:bg-[#101D3D] shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col animate-in slide-in-from-right duration-300 ease-out select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2F6798] text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
                  <span className="text-[8px] uppercase tracking-tighter leading-none opacity-85">SEP</span>
                  <span className="text-sm font-black leading-none mt-0.5">{selectedDayDetail.dayNumber}</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                    September {selectedDayDetail.dayNumber}, 2026
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Shift Breakdown — <span className="font-bold text-slate-800 dark:text-slate-200">{activeEmployee.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="p-2 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* Day Status Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Attendance Status
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {selectedDayDetail.status || 'No Status Recorded'}
                  </span>
                </div>
                {selectedDayDetail.status && (
                  <div
                    className={`py-1 px-3 rounded-lg font-extrabold text-xs shadow-2xs ${
                      getStatusColorStyles(selectedDayDetail.status).banner
                    }`}
                  >
                    {selectedDayDetail.status}
                  </div>
                )}
              </div>

              {/* Punches Timeline List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Recorded Punch Timestamps
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {selectedDayDetail.punches.length} {selectedDayDetail.punches.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {selectedDayDetail.punches.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/40 shadow-2xs">
                    {selectedDayDetail.punches.map((punch, pIdx) => (
                      <div
                        key={punch.id || pIdx}
                        className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#2F6798] shrink-0" />
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 block">
                              {punch.type}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block font-medium mt-0.5">
                              Raw: {punch.rawTimestamp}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-[#2F6798] dark:text-blue-400 text-xs block">
                            {punch.timeLabel}
                          </span>
                          {punch.duration && punch.duration !== 'N/A' && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                              Duration: {punch.duration}m
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No punch timestamps recorded for this date.
                  </div>
                )}
              </div>

            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Verified with Supervisor Punch Logs
              </span>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
