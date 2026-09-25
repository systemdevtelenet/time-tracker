'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target,
  Coffee,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { RosterEmployee } from './RosterTable';
import { PunchLogItem, INITIAL_PUNCH_LOGS } from '@/lib/punchLogs';
import DatePickerPopover from './DatePickerPopover';

interface HoursReportTabProps {
  employees?: RosterEmployee[];
  searchTerm?: string;
  filterAccount?: string;
  onBackToRoster?: () => void;
  isHeadOrAdmin?: boolean;
  supervisorName?: string;
}

interface TeamMemberHours {
  id: string;
  employeeCode: string;
  name: string;
  position: string;
  department: string;
  account: string;
  dailyHours: number;
  actualTotal: number;
  targetHours: number;
  targetDays: number;
  breaksUsedMins: number;
  breakLimitMins: number;
}

function assignShiftDay(date: Date): { year: number; month: number; day: number } {
  const h = date.getHours();
  const shiftDate = new Date(date);
  if (h < 9) {
    shiftDate.setDate(shiftDate.getDate() - 1);
  }
  return {
    year: shiftDate.getFullYear(),
    month: shiftDate.getMonth(),
    day: shiftDate.getDate(),
  };
}

function computeShiftHoursAndBreaksForDay(
  empCode: string,
  empName: string,
  year: number,
  month: number, // 0-indexed
  day: number,
  allLogs: any[],
  overrides: Record<string, string>
): { hours: number; breakMins: number } {
  // Check override
  const fullDateKey = `${empCode}-${year}-${month}-${day}`;
  const nameFullDateKey = `${empName}-${year}-${month}-${day}`;
  const legacyNameKey = `${empName}-${day}`;
  const legacyCodeKey = `${empCode}-${day}`;

  const override = 
    overrides[fullDateKey] !== undefined ? overrides[fullDateKey] :
    overrides[nameFullDateKey] !== undefined ? overrides[nameFullDateKey] :
    (year === 2026 && month === 8 && (overrides[legacyNameKey] !== undefined || overrides[legacyCodeKey] !== undefined))
      ? (overrides[legacyNameKey] || overrides[legacyCodeKey])
      : undefined;

  if (override && override !== 'Clear' && override !== 'None') {
    const isLeave = ['Vacation Leave', 'Sick Leave', 'Bereavement Leave', 'Maternity Leave', 'Paternity Leave', 'Holiday', 'VL', 'SL', 'BL', 'ML', 'PL', 'HOL'].includes(override);
    const isOff = ['Absent', 'A', 'Rest Day', 'RD', 'Suspension', 'SUS'].includes(override);
    if (isLeave) return { hours: 8.00, breakMins: 0 };
    if (isOff) return { hours: 0, breakMins: 0 };
  }

  // Filter logs for this employee and shift date
  const empLogs = allLogs.filter((l) => {
    const lCode = String(l.employee_id || l.empId || '').trim();
    return lCode === empCode || (empCode.length >= 3 && lCode.includes(empCode));
  });

  const dayLogs = empLogs.filter((log) => {
    const rawTs = log.parsedDate || log.timestamp || log.TIMESTAMP;
    if (!rawTs) return false;
    const d = new Date(rawTs);
    if (isNaN(d.getTime())) return false;
    const shift = assignShiftDay(d);
    return shift.year === year && shift.month === month && shift.day === day;
  });

  if (dayLogs.length === 0) {
    return { hours: 0, breakMins: 0 };
  }

  dayLogs.sort((a, b) => {
    const da = new Date(a.parsedDate || a.timestamp || a.TIMESTAMP).getTime();
    const db = new Date(b.parsedDate || b.timestamp || b.TIMESTAMP).getTime();
    return da - db;
  });

  let shiftStartMs: number | null = null;
  let shiftEndMs: number | null = null;
  let completedBreakSecs = 0;
  let completedLunchSecs = 0;
  let pendingBreakStart: number | null = null;
  let pendingLunchStart: number | null = null;

  for (const log of dayLogs) {
    const pType = (log.type || log.punch_type || '').toLowerCase().trim();
    const ts = new Date(log.parsedDate || log.timestamp || log.TIMESTAMP).getTime();
    if (isNaN(ts)) continue;

    if (pType.includes('shift start') || pType.includes('start shift')) {
      shiftStartMs = ts;
      shiftEndMs = null;
    } else if (pType.includes('break 1 start') || pType.includes('start break 1') || pType === 'start break') {
      pendingBreakStart = ts;
      if (!shiftStartMs) shiftStartMs = ts;
    } else if (pType.includes('break 1 end') || pType.includes('end break 1') || pType === 'end break') {
      if (pendingBreakStart) {
        completedBreakSecs += Math.max(0, Math.floor((ts - pendingBreakStart) / 1000));
        pendingBreakStart = null;
      } else {
        const dur = parseFloat(log.duration);
        completedBreakSecs += !isNaN(dur) && dur > 0 ? Math.round(dur * 60) : 15 * 60;
      }
    } else if (pType.includes('start lunch') || pType.includes('lunch start') || pType === 'lunch') {
      pendingLunchStart = ts;
      if (!shiftStartMs) shiftStartMs = ts;
    } else if (pType.includes('end lunch') || pType.includes('lunch end')) {
      if (pendingLunchStart) {
        completedLunchSecs += Math.max(0, Math.floor((ts - pendingLunchStart) / 1000));
        pendingLunchStart = null;
      } else {
        const dur = parseFloat(log.duration);
        completedLunchSecs += !isNaN(dur) && dur > 0 ? Math.round(dur * 60) : 60 * 60;
      }
    } else if (pType.includes('break 2 start') || pType.includes('start break 2')) {
      pendingBreakStart = ts;
      if (!shiftStartMs) shiftStartMs = ts;
    } else if (pType.includes('break 2 end') || pType.includes('end break 2')) {
      if (pendingBreakStart) {
        completedBreakSecs += Math.max(0, Math.floor((ts - pendingBreakStart) / 1000));
        pendingBreakStart = null;
      } else {
        const dur = parseFloat(log.duration);
        completedBreakSecs += !isNaN(dur) && dur > 0 ? Math.round(dur * 60) : 15 * 60;
      }
    } else if (pType.includes('shift end') || pType.includes('end shift')) {
      shiftEndMs = ts;
    }
  }

  const firstTs = new Date(dayLogs[0].parsedDate || dayLogs[0].timestamp || dayLogs[0].TIMESTAMP).getTime();
  const lastTs = new Date(dayLogs[dayLogs.length - 1].parsedDate || dayLogs[dayLogs.length - 1].timestamp || dayLogs[dayLogs.length - 1].TIMESTAMP).getTime();
  const startMs = shiftStartMs || firstTs;
  const endMs = shiftEndMs || lastTs;

  let grossSecs = 0;
  if (endMs > startMs) {
    grossSecs = Math.floor((endMs - startMs) / 1000);
  } else {
    grossSecs = 8 * 3600;
  }

  const netSecs = Math.max(0, grossSecs - completedBreakSecs - completedLunchSecs);
  const hours = Math.round((netSecs / 3600) * 100) / 100;
  const breakMins = Math.round(((completedBreakSecs + completedLunchSecs) / 60) * 10) / 10;

  return { hours, breakMins };
}

export default function HoursReportTab({
  employees: propEmployees,
  searchTerm = '',
  filterAccount = 'all',
  onBackToRoster,
  isHeadOrAdmin = true,
  supervisorName,
}: HoursReportTabProps = {}) {
  const [viewMode, setViewMode] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-16');
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);
  const [punchLogs, setPunchLogs] = useState<PunchLogItem[]>(INITIAL_PUNCH_LOGS);
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadLocalOverrides = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('attendance_overrides_v1');
        if (saved) {
          setAttendanceOverrides(JSON.parse(saved));
        }
      } catch (e) {}
    }
  };

  // Fetch real team members from Supabase /api/team-roster if not provided
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Fetch team roster
        const rosterRes = await fetch('/api/team-roster');
        const rosterJson = await rosterRes.json();
        if (isMounted && rosterJson.success && Array.isArray(rosterJson.data)) {
          setDbEmployees(rosterJson.data);
        }

        // 2. Fetch all punch logs
        const punchRes = await fetch('/api/punch-logs?empId=ALL');
        const punchJson = await punchRes.json();
        if (isMounted && punchJson.success && Array.isArray(punchJson.data)) {
          setPunchLogs(punchJson.data);
        }

        loadLocalOverrides();
      } catch (err) {
        console.error('Error loading hours report data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    const handleSync = () => {
      loadData();
      loadLocalOverrides();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('punch-updated', handleSync);
      window.addEventListener('attendance-override-updated', handleSync);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('punch-updated', handleSync);
        window.removeEventListener('attendance-override-updated', handleSync);
      }
    };
  }, []);

  // Format header day title based on selectedDate, e.g. "WED 16"
  const dayColumnHeader = useMemo(() => {
    if (viewMode === 'Weekly') return 'THIS WEEK';
    if (viewMode === 'Monthly') {
      const d = new Date(selectedDate);
      return isNaN(d.getTime()) ? 'SEP 2026' : d.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
    }
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return 'WED 16';
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dateNum = d.getDate();
    return `${dayStr} ${dateNum}`;
  }, [selectedDate, viewMode]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('');
  };

  // Compute calculated metrics for all team members dynamically from punch records
  const calculatedReportData: TeamMemberHours[] = useMemo(() => {
    let rosterSource = (propEmployees && propEmployees.length > 0)
      ? propEmployees.map((e) => ({
          id: e.id,
          employeeCode: e.employeeCode,
          name: e.name,
          position: (e.department || '').includes('Quality') || (e.department || '').includes('QA') ? 'Head of Quality' : 'Trainer',
          department: e.department || 'Training',
          account: e.account || 'Corporate',
        }))
      : (dbEmployees && dbEmployees.length > 0)
      ? dbEmployees.map((r: any) => ({
          id: String(r.id || r.employee_id),
          employeeCode: String(r.employee_id || r.id),
          name: r.name,
          position: r.position || 'Trainer',
          department: r.department || 'Training',
          account: r.account || 'Corporate',
        }))
      : [];

    if (!isHeadOrAdmin && supervisorName) {
      const sName = supervisorName.toLowerCase().trim();
      rosterSource = rosterSource.filter(
        (e) => (sName && (e.name.toLowerCase().trim().includes(sName) || sName.includes(e.name.toLowerCase().trim())))
      );
    }

    if (rosterSource.length === 0) return [];

    const selDateObj = new Date(selectedDate);
    const selYear = isNaN(selDateObj.getTime()) ? 2026 : selDateObj.getFullYear();
    const selMonth = isNaN(selDateObj.getTime()) ? 8 : selDateObj.getMonth(); // 0-indexed
    const selDay = isNaN(selDateObj.getTime()) ? 16 : selDateObj.getDate();

    // Target configuration based on view mode
    const targetHours = viewMode === 'Daily' ? 8.00 : viewMode === 'Weekly' ? 40.00 : 160.00;
    const targetDays = viewMode === 'Daily' ? 1 : viewMode === 'Weekly' ? 5 : 20;
    const breakLimitMins = viewMode === 'Daily' ? 90 : viewMode === 'Weekly' ? 450 : 1800;

    return rosterSource.map((emp) => {
      let computedWorkHours = 0;
      let totalBreakMins = 0;
      let singleDayHours = 0;

      if (viewMode === 'Daily') {
        const stats = computeShiftHoursAndBreaksForDay(
          emp.employeeCode,
          emp.name,
          selYear,
          selMonth,
          selDay,
          punchLogs,
          attendanceOverrides
        );
        singleDayHours = stats.hours;
        computedWorkHours = stats.hours;
        totalBreakMins = stats.breakMins;
      } else if (viewMode === 'Weekly') {
        // Calculate 7 days centered/starting from week of selDateObj
        const currDayOfWeek = selDateObj.getDay(); // 0 = Sun, 1 = Mon
        const startOfWeek = new Date(selDateObj);
        startOfWeek.setDate(selDateObj.getDate() - (currDayOfWeek === 0 ? 6 : currDayOfWeek - 1)); // Monday

        let sumHours = 0;
        let sumBreaks = 0;

        for (let i = 0; i < 7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + i);
          const stats = computeShiftHoursAndBreaksForDay(
            emp.employeeCode,
            emp.name,
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            punchLogs,
            attendanceOverrides
          );
          sumHours += stats.hours;
          sumBreaks += stats.breakMins;
          if (d.getDate() === selDay && d.getMonth() === selMonth) {
            singleDayHours = stats.hours;
          }
        }

        computedWorkHours = sumHours;
        totalBreakMins = sumBreaks;
      } else {
        // Monthly: calculate all days of selMonth
        const totalDaysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
        let sumHours = 0;
        let sumBreaks = 0;

        for (let d = 1; d <= totalDaysInMonth; d++) {
          const stats = computeShiftHoursAndBreaksForDay(
            emp.employeeCode,
            emp.name,
            selYear,
            selMonth,
            d,
            punchLogs,
            attendanceOverrides
          );
          sumHours += stats.hours;
          sumBreaks += stats.breakMins;
          if (d === selDay) {
            singleDayHours = stats.hours;
          }
        }

        computedWorkHours = sumHours;
        totalBreakMins = sumBreaks;
      }

      const finalActual = Number(computedWorkHours.toFixed(2));
      const finalDaily = Number((singleDayHours || (viewMode === 'Daily' ? computedWorkHours : computedWorkHours / (viewMode === 'Weekly' ? 5 : 20))).toFixed(2));

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.name,
        position: emp.position,
        department: emp.department,
        account: emp.account,
        dailyHours: finalDaily,
        actualTotal: finalActual,
        targetHours,
        targetDays,
        breaksUsedMins: Math.round(totalBreakMins),
        breakLimitMins,
      };
    });
  }, [dbEmployees, propEmployees, punchLogs, attendanceOverrides, selectedDate, viewMode, isHeadOrAdmin, supervisorName]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const isCurrentUser = (emp: TeamMemberHours) => {
    if (!supervisorName) return false;
    const sName = supervisorName.toLowerCase().trim();
    const rName = (emp.name || '').toLowerCase().trim();
    return Boolean(sName && (rName === sName || rName.includes(sName) || sName.includes(rName)));
  };

  // Filter based on search & account
  const filteredData = useMemo(() => {
    const matches = calculatedReportData.filter((member) => {
      const matchesSearch =
        !searchTerm ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeCode.includes(searchTerm);

      const matchesAccount =
        filterAccount === 'all' ||
        member.account.toLowerCase() === filterAccount.toLowerCase() ||
        member.department.toLowerCase() === filterAccount.toLowerCase();

      return matchesSearch && matchesAccount;
    });

    const currentUserList: TeamMemberHours[] = [];
    const otherList: TeamMemberHours[] = [];
    matches.forEach((emp) => {
      if (isCurrentUser(emp)) {
        currentUserList.push(emp);
      } else {
        otherList.push(emp);
      }
    });

    return [...currentUserList, ...otherList];
  }, [calculatedReportData, searchTerm, filterAccount, supervisorName]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAccount, selectedDate, viewMode]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="space-y-2.5 font-sans">
      
      {/* Top Header Controls: Title + Period Toggles + Date Navigator */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-sans">
        
        {/* Left: Section Title */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
              Total Hours Worked
            </h3>
            {isLoading && (
              <Loader2 className="w-4 h-4 text-[#2F6798] animate-spin shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            Shift completion metrics and target variance for trainers & quality specialists
          </p>
        </div>

        {/* Right: Period Switcher & Date Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          
          {/* Daily / Weekly / Monthly Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white dark:bg-[#2F6798] text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Unified Date & Period Picker */}
          <DatePickerPopover
            selectedDate={selectedDate}
            onSelectDate={(_, dateStr) => setSelectedDate(dateStr)}
            format={viewMode === 'Monthly' ? 'month-year' : 'date'}
            showArrows
            align="right"
          />

        </div>

      </div>

      {/* Main Hours Report Data Table */}
      <div className="bg-white dark:bg-[#0E1B38] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[10px] tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold whitespace-nowrap">
                  EMPLOYEE
                </th>
                <th className="py-2.5 px-4 font-semibold whitespace-nowrap">
                  POSITION
                </th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">
                  {dayColumnHeader}
                </th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">
                  ACTUAL
                </th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">
                  TARGET ({viewMode === 'Daily' ? '8H/DAY' : viewMode === 'Weekly' ? '40H/WK' : '160H/MO'})
                </th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">
                  Δ VS TARGET
                </th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">
                  BREAKS (USED/LIMIT)
                </th>
                <th className="py-2.5 px-4 font-semibold text-center whitespace-nowrap">
                  TARGET VS ACTUAL
                </th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No employee hours records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((member) => {
                  const delta = member.actualTotal - member.targetHours;
                  const deltaFormatted = delta >= 0 ? `+${delta.toFixed(2)}` : `${delta.toFixed(2)}`;
                  const isPositiveDelta = delta >= 0;
                  const percent = Math.min(100, Math.round((member.actualTotal / member.targetHours) * 100));
                  const isOverBreak = member.breaksUsedMins > member.breakLimitMins;
                  const initials = getInitials(member.name);

                  return (
                    <tr 
                      key={member.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Employee Name with Circular Avatar */}
                      <td className="py-1.5 px-4 border-r border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6.5 h-6.5 rounded-full bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#2F6798]/20">
                            {initials}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {member.name}
                          </span>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-1.5 px-4 text-slate-500 dark:text-slate-400 font-medium border-r border-slate-100 dark:border-slate-800/80 whitespace-nowrap">
                        {member.position}
                      </td>

                      {/* Day Cell */}
                      <td className="py-1.5 px-3 text-center border-r border-slate-100 dark:border-slate-800/80">
                        {member.dailyHours > 0 ? (
                          <span className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-md border ${
                            member.dailyHours >= 8.0
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-900/40 dark:text-blue-300 border-[#2F6798]/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              member.dailyHours >= 8.0 ? 'bg-emerald-500' : 'bg-[#2F6798]'
                            }`} />
                            {member.dailyHours.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">...</span>
                        )}
                      </td>

                      {/* Actual Total Hours */}
                      <td className="py-1.5 px-3 text-center font-bold text-slate-900 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
                        {member.actualTotal.toFixed(2)}
                      </td>

                      {/* Target Hours */}
                      <td className="py-1.5 px-3 text-center font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800/80">
                        {member.targetHours.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">({member.targetDays}d)</span>
                      </td>

                      {/* Delta vs Target */}
                      <td className="py-1.5 px-3 text-center font-bold border-r border-slate-100 dark:border-slate-800/80">
                        <span className={`font-sans font-bold ${
                          isPositiveDelta 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-[#DC2626] dark:text-rose-400'
                        }`}>
                          {deltaFormatted}
                        </span>
                      </td>

                      {/* Breaks used / limit */}
                      <td className="py-1.5 px-3 text-center font-semibold border-r border-slate-100 dark:border-slate-800/80">
                        <span className={isOverBreak ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {member.breaksUsedMins}/{member.breakLimitMins}m
                        </span>
                      </td>

                      {/* Target vs Actual Progress Bar */}
                      <td className="py-1.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                percent >= 100 
                                  ? 'bg-emerald-500' 
                                  : percent >= 50 
                                  ? 'bg-[#2F6798]' 
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className={`w-9 text-right font-sans font-bold text-xs ${
                            percent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {percent}%
                          </span>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 sm:p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0E1B38] text-xs flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, filteredData.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredData.length}</span> employees
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                currentPage <= 1
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400'
                  : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentPage === pageNum
                    ? 'bg-[#2F6798] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                currentPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400'
                  : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Legend in Bold with Tailwind Icons and Bold Highlight Words */}
        <div className="p-3 sm:p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 text-xs space-y-1.5 font-sans">
          <div className="flex items-center gap-5 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
              <Target className="w-3.5 h-3.5 text-[#2F6798] shrink-0" />
              <span>Target = 8 hours net work/day.</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
              <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Break limit = 1h 30m/day (Lunch 1h + 1st Break 15m + 2nd Break 15m).</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Day cells: <span className="text-emerald-600 font-bold">green</span> = reached 8h • <span className="text-amber-600 font-bold">amber</span> = partial/under • <span className="text-slate-400 font-medium">empty</span> = no punches. <span className="text-rose-600 font-bold">red Breaks</span> = over limit.
          </div>
        </div>

      </div>

    </div>
  );
}
