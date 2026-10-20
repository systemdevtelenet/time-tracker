'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  User, 
  Info,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CalendarDays
} from 'lucide-react';
import AttendanceCalendarView from './AttendanceCalendarView';
import AttendanceDetailModal, { TeamMemberDayStatus } from './AttendanceDetailModal';
import AttendanceCellPopover from './AttendanceCellPopover';
import DatePickerPopover from './DatePickerPopover';
import { PhoneTimeRecord } from '@/lib/types';
import { logAttendanceUpdate } from '@/lib/activityLogs';
import { showToast } from '@/lib/toast';

interface AttendanceCalendarTabProps {
  records?: PhoneTimeRecord[];
  searchFilter?: string;
  isAdmin?: boolean;
  supervisorName?: string;
  supervisorId?: string;
  selectedAccountFilter: string;
  rangeView: RangeViewOption;
  selectedPositionFilter: string;
  onPositionFilterChange: (value: string) => void;
  viewFormat: 'matrix' | 'google-calendar';
  onViewFormatChange: (value: 'matrix' | 'google-calendar') => void;
}

export type AttendanceStatus = 
  | 'P' 
  | 'L' 
  | 'U' 
  | 'A' 
  | 'RD' 
  | 'VL' 
  | 'SL' 
  | 'BL' 
  | 'ML' 
  | 'PL' 
  | 'HOL' 
  | 'SUS' 
  | null;

interface EmployeeAttendanceRow {
  id: string;
  databaseId: string;
  startDate: string;
  position: string;
  name: string;
  account?: string;
  attendanceByDay: Record<number, AttendanceStatus>;
}

// Helper to look up overrides across all key formats
function getOverrideForEmployee(
  empCode: string,
  empName: string,
  year: number,
  monthIndex: number,
  day: number,
  overridesMap: Record<string, AttendanceStatus | string | null>
): AttendanceStatus | undefined {
  if (!overridesMap || Object.keys(overridesMap).length === 0) return undefined;
  
  const cleanId = String(empCode || '').replace(/^emp-/, '').trim();
  const trimmedName = String(empName || '').trim();
  const lowerName = trimmedName.toLowerCase();

  const candidateKeys = [
    `${cleanId}-${year}-${monthIndex}-${day}`,
    `${trimmedName}-${year}-${monthIndex}-${day}`,
    `${lowerName}-${year}-${monthIndex}-${day}`,
    `${cleanId}-${day}`,
    `${trimmedName}-${day}`,
    `${lowerName}-${day}`,
  ];

  for (const k of candidateKeys) {
    if (overridesMap[k] !== undefined) {
      return (overridesMap[k] === 'Clear' ? null : overridesMap[k]) as AttendanceStatus;
    }
  }
  return undefined;
}

// Helper to look up notes across all key formats
function getNoteForEmployee(
  empCode: string,
  empName: string,
  year: number,
  monthIndex: number,
  day: number,
  notesMap: Record<string, string>
): string {
  if (!notesMap || Object.keys(notesMap).length === 0) return '';
  
  const cleanId = String(empCode || '').replace(/^emp-/, '').trim();
  const trimmedName = String(empName || '').trim();
  const lowerName = trimmedName.toLowerCase();

  const candidateKeys = [
    `${cleanId}-${year}-${monthIndex}-${day}`,
    `${trimmedName}-${year}-${monthIndex}-${day}`,
    `${lowerName}-${year}-${monthIndex}-${day}`,
    `${cleanId}-${day}`,
    `${trimmedName}-${day}`,
    `${lowerName}-${day}`,
  ];

  for (const k of candidateKeys) {
    if (notesMap[k] !== undefined) {
      return notesMap[k];
    }
  }
  return '';
}

export type RangeViewOption = 'all_30' | 'period_1' | 'period_2' | 'current_week';

function getSingaporeDateParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date());
  const value = (type: 'year' | 'month' | 'day') =>
    Number(parts.find((part) => part.type === type)?.value);

  return { year: value('year'), monthIndex: value('month') - 1, day: value('day') };
}

export default function AttendanceCalendarTab({
  records = [],
  searchFilter = '',
  isAdmin = false,
  supervisorName,
  supervisorId,
  selectedAccountFilter,
  rangeView,
  selectedPositionFilter,
  onPositionFilterChange,
  viewFormat,
  onViewFormatChange,
}: AttendanceCalendarTabProps) {
  const [today, setToday] = useState(getSingaporeDateParts);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => getSingaporeDateParts().monthIndex);
  const [currentYear, setCurrentYear] = useState(() => getSingaporeDateParts().year);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [employeePage, setEmployeePage] = useState(1);
  const [selectedIndividualEmployee, setSelectedIndividualEmployee] = useState<string>(
    supervisorName || ''
  );

  // Attendance tags and notes loaded from the shared attendance records API.
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});

  // Dynamic Database Team Roster List with immediate override integration on first mount
  const [attendanceDataList, setAttendanceDataList] = useState<EmployeeAttendanceRow[]>([]);

  // Detail Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalDayNumber, setModalDayNumber] = useState(16);
  const [modalDayName, setModalDayName] = useState('Wednesday');
  const [modalSelectedEmployeeName, setModalSelectedEmployeeName] = useState<string | null>(null);

  // Cell Popover State matching uploaded reference image
  const [cellPopover, setCellPopover] = useState<{
    isOpen: boolean;
    employeeName: string;
    employeeId?: string;
    employeeDbId?: string;
    position?: string;
    account?: string;
    dayNumber: number;
    currentStatus: AttendanceStatus;
    currentNote?: string;
  }>({
    isOpen: false,
    employeeName: '',
    dayNumber: 22,
    currentStatus: null,
  });

  useEffect(() => {
    const syncOverrides = async () => {
      try {
        const response = await fetch('/api/attendance-overrides?scope=calendar');
        const data = await response.json();
        if (response.ok && data.success) {
          setAttendanceOverrides(data.overrides || {});
          setAttendanceNotes(data.notes || {});
        }
      } catch (error) {
        console.warn('Could not refresh saved attendance:', error);
      }
    };

    syncOverrides();

    if (typeof window !== 'undefined') {
      window.addEventListener('attendance-override-updated', syncOverrides);
      window.addEventListener('punch-updated', syncOverrides);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('attendance-override-updated', syncOverrides);
        window.removeEventListener('punch-updated', syncOverrides);
      }
    };
  }, []);

  const handleOpenCellPopover = (emp: EmployeeAttendanceRow, dayNum: number) => {
    if (!isAdmin) {
      handleOpenDayModal(dayNum, emp.name);
      return;
    }
    const empCode = emp.id.replace(/^emp-/, '');
    const currentNote = getNoteForEmployee(empCode, emp.name, currentYear, currentMonthIndex, dayNum, attendanceNotes);
    
    setCellPopover({
      isOpen: true,
      employeeName: emp.name,
      employeeId: emp.id,
      employeeDbId: emp.databaseId,
      position: emp.position,
      account: emp.account || '',
      dayNumber: dayNum,
      currentStatus: emp.attendanceByDay[dayNum] || null,
      currentNote,
    });
  };

  const handleSelectCellStatus = async (newStatus: AttendanceStatus, note?: string) => {
    const { employeeName, dayNumber, employeeId, employeeDbId } = cellPopover;
    const cleanEmpId = (employeeId || '').replace(/^emp-/, '').trim();
    const trimmedName = employeeName.trim();
    const lowerName = trimmedName.toLowerCase();

    try {
      const response = await fetch('/api/attendance-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeDbId,
          year: currentYear,
          month: currentMonthIndex,
          day: dayNumber,
          status: newStatus,
          note,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to save attendance.');
    } catch (error) {
      console.error('Failed to save attendance status:', error);
      showToast({ title: 'Attendance not saved', message: 'Please try again.', type: 'error' });
      return;
    }

    // Update the visible matrix after the database confirms the change.
    setAttendanceDataList((prev) =>
      prev.map((emp) => {
        const empClean = emp.id.replace(/^emp-/, '').trim();
        const empTrimmed = emp.name.trim();
        const isMatch =
          empTrimmed === trimmedName ||
          empTrimmed.toLowerCase() === lowerName ||
          empClean === cleanEmpId ||
          emp.id === employeeId;

        if (isMatch) {
          return {
            ...emp,
            attendanceByDay: {
              ...emp.attendanceByDay,
              [dayNumber]: newStatus,
            },
          };
        }
        return emp;
      })
    );

    // Keep the current matrix in sync with the persisted record.
    const updatedOverrides = {
      ...attendanceOverrides,
      [`${cleanEmpId}-${currentYear}-${currentMonthIndex}-${dayNumber}`]: newStatus,
      [`${trimmedName}-${currentYear}-${currentMonthIndex}-${dayNumber}`]: newStatus,
      [`${lowerName}-${currentYear}-${currentMonthIndex}-${dayNumber}`]: newStatus,
      [`${cleanEmpId}-${dayNumber}`]: newStatus,
      [`${trimmedName}-${dayNumber}`]: newStatus,
      [`${lowerName}-${dayNumber}`]: newStatus,
    };
    setAttendanceOverrides(updatedOverrides);
    let updatedNotes = { ...attendanceNotes };
    if (note !== undefined) {
      updatedNotes = {
        ...attendanceNotes,
        [`${cleanEmpId}-${currentYear}-${currentMonthIndex}-${dayNumber}`]: note,
        [`${trimmedName}-${currentYear}-${currentMonthIndex}-${dayNumber}`]: note,
        [`${lowerName}-${currentYear}-${currentMonthIndex}-${dayNumber}`]: note,
        [`${cleanEmpId}-${dayNumber}`]: note,
        [`${trimmedName}-${dayNumber}`]: note,
        [`${lowerName}-${dayNumber}`]: note,
      };
      setAttendanceNotes(updatedNotes);
    }

    // 4. Record to Activity Logs
    const fullStatusLabelMap: Record<string, string> = {
      P: 'Present',
      L: 'Late',
      U: 'Undertime',
      A: 'Absent',
      RD: 'Rest Day',
      VL: 'Vacation Leave (VL)',
      SL: 'Sick Leave (SL)',
      BL: 'Bereavement Leave (BL)',
      ML: 'Maternity Leave (ML)',
      PL: 'Paternity Leave (PL)',
      HOL: 'Holiday (HOL)',
      SUS: 'Suspension (SUS)',
    };
    const fullStatusLabel = newStatus ? (fullStatusLabelMap[newStatus] || String(newStatus)) : 'Cleared';
    
    logAttendanceUpdate({
      employeeName: trimmedName,
      dateStr: `${monthNames[currentMonthIndex]} ${dayNumber}, ${currentYear}`,
      status: fullStatusLabel,
      performedBy: supervisorName || 'Supervisor',
      note: note || undefined,
    });

    // 5. Trigger modern global Toast notification with countdown
    showToast(
      'Attendance Saved',
      `${trimmedName} · ${monthNames[currentMonthIndex].slice(0, 3)} ${dayNumber} set to ${fullStatusLabel}.`,
      'success',
      3500
    );

    // 6. Broadcast changes across all views and tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('punch-updated', {
          detail: { empId: cleanEmpId, date: dayNumber, month: currentMonthIndex, year: currentYear },
        })
      );
      window.dispatchEvent(
        new CustomEvent('attendance-override-updated', {
          detail: { empId: cleanEmpId, day: dayNumber, status: newStatus, monthIndex: currentMonthIndex, year: currentYear },
        })
      );
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Keep "today" live while the page stays open. Freezing this value on mount
  // leaves the green header stuck on the date the user first opened the page.
  useEffect(() => {
    const refreshToday = () => setToday(getSingaporeDateParts());
    const intervalId = window.setInterval(refreshToday, 60_000);
    window.addEventListener('focus', refreshToday);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshToday);
    };
  }, []);
  const todayDate = today.day;
  const todayMonth = today.monthIndex;
  const todayYear = today.year;
  const isCurrentViewMonth = currentMonthIndex === todayMonth && currentYear === todayYear;
  const activeDayNumber = isCurrentViewMonth ? todayDate : null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Open Day Summary or Employee Detail Modal
  const handleOpenDayModal = (dayNum: number, employeeName?: string) => {
    const fullDate = new Date(currentYear, currentMonthIndex, dayNum);
    const fullDayName = fullDate.toLocaleDateString('en-US', { weekday: 'long' });
    setModalDayNumber(dayNum);
    setModalDayName(fullDayName);
    setModalSelectedEmployeeName(employeeName || null);
    setIsDetailModalOpen(true);
  };

  // Team members status list for the active modal day
  const teamMembersForModalDay = useMemo<TeamMemberDayStatus[]>(() => {
    return attendanceDataList.map((emp, empIdx) => {
      const status = emp.attendanceByDay[modalDayNumber] || null;
      let hoursWorked = 8.0;
      if (status === 'L') hoursWorked = 7.25;
      else if (status === 'U') hoursWorked = 5.14;
      else if (status === 'A' || status === 'RD') hoursWorked = 0.0;

      return {
        id: emp.id ? `${emp.id}-${empIdx}` : `modal-emp-${empIdx}`,
        name: emp.name,
        position: emp.position,
        startDate: emp.startDate,
        status: status,
        hoursWorked: hoursWorked,
        timeIn: status === 'A' || status === 'RD' ? '-' : '8:00 AM',
        timeOut: status === 'A' || status === 'RD' ? '-' : '5:00 PM',
        notes: status === 'L' ? 'Tardy 15 mins' : status === 'U' ? 'Undertime departure' : status === 'A' ? 'Unexcused absence' : 'Regular Shift',
      };
    });
  }, [attendanceDataList, modalDayNumber]);

  // Days list based on active range
  const totalDaysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  const currentWeekRange = useMemo(() => {
      const currentDay = isCurrentViewMonth && todayDate ? todayDate : 16;
    const start = Math.max(1, currentDay - 3);
    return { start, end: Math.min(totalDaysInMonth, start + 6) };
  }, [isCurrentViewMonth, todayDate, totalDaysInMonth]);

  const displayedDays = useMemo(() => {
    const days: number[] = [];
    let start = 1;
    let end = totalDaysInMonth;

    if (rangeView === 'period_1') {
      start = 1;
      end = Math.min(15, totalDaysInMonth);
    } else if (rangeView === 'period_2') {
      start = 16;
      end = totalDaysInMonth;
    } else if (rangeView === 'current_week') {
      start = currentWeekRange.start;
      end = currentWeekRange.end;
    }

    for (let i = start; i <= end; i++) {
      days.push(i);
    }
    return days;
  }, [rangeView, totalDaysInMonth, currentWeekRange]);

  // Fetch actual live roster & punch logs from database and compute attendance matrix
  useEffect(() => {
    async function loadDbTeam() {
      try {
        const [rosterRes, punchRes] = await Promise.all([
          fetch('/api/team-roster?scope=calendar'),
          fetch('/api/punch-logs?empId=ALL&scope=calendar'),
        ]);

        const [rosterJson, punchJson] = await Promise.all([
          rosterRes.json(),
          punchRes.json(),
        ]);

        if (isAdmin) {
          try {
            const seedResponse = await fetch('/api/attendance-overrides', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'seed-weekends',
                year: currentYear,
                month: currentMonthIndex,
              }),
            });
            if (!seedResponse.ok) console.warn('Could not save weekend rest days for this month.');
          } catch (error) {
            console.warn('Could not save weekend rest days for this month:', error);
          }
        }

        const overridesRes = await fetch('/api/attendance-overrides?scope=calendar').catch(() => null);

        let serverOverrides: any = null;
        if (overridesRes && overridesRes.ok) {
          try {
            serverOverrides = await overridesRes.json();
          } catch (e) {}
        }

        const rosterData: any[] = rosterJson.success && Array.isArray(rosterJson.data) ? rosterJson.data : [];

        const punchLogs: any[] = punchJson.success && Array.isArray(punchJson.data) ? punchJson.data : [];

        // Combine local overrides and server-persisted overrides
        const combinedOverrides: Record<string, AttendanceStatus> = serverOverrides?.success
          ? serverOverrides.overrides || {}
          : {};
        const combinedNotes: Record<string, string> = serverOverrides?.success
          ? serverOverrides.notes || {}
          : {};
        setAttendanceOverrides(combinedOverrides);
        setAttendanceNotes(combinedNotes);

        const { day: liveTodayDate, monthIndex: liveTodayMonth, year: liveTodayYear } = today || getSingaporeDateParts();

        const mapped: EmployeeAttendanceRow[] = rosterData.map((r: any) => {
          const empCode = String(r.employee_id || r.id).trim();
          const empLogs = punchLogs.filter((l) => String(l.employee_id || l.empId || '').trim() === empCode);

          // Compute exact daily attendance status for days 1 to totalDaysInMonth
          const attendanceMap: Record<number, AttendanceStatus> = {};
          for (let d = 1; d <= totalDaysInMonth; d++) {
            const manualOverride = getOverrideForEmployee(empCode, r.name, currentYear, currentMonthIndex, d, combinedOverrides);

            if (manualOverride !== undefined) {
              attendanceMap[d] = manualOverride;
              continue;
            }

            // Check if there are real punch logs for this specific date and month
            const dayLogs = empLogs.filter((l) => {
              const ts = l.timestamp || l.TIMESTAMP;
              const parsed = l.parsedDate ? new Date(l.parsedDate) : new Date(ts);
              return parsed.getFullYear() === currentYear && parsed.getMonth() === currentMonthIndex && parsed.getDate() === d;
            });

            if (dayLogs.length > 0) {
              const hasLate = dayLogs.some((l) => {
                const s = (l.status || '').trim().toLowerCase().replace(/\s+/g, ' ');
                const t = (l.type || l.punch_type || '').toLowerCase();
                return s.includes('late') || t.includes('late');
              });
              const hasUndertime = dayLogs.some((l) => {
                const s = (l.status || '').trim().toLowerCase().replace(/\s+/g, ' ');
                return s === 'u' || s === 'ut' || s.includes('undertime') || s.includes('late / ut') || s.includes('late/ut');
              });
              if (hasLate) attendanceMap[d] = 'L';
              else if (hasUndertime) attendanceMap[d] = 'U';
              else attendanceMap[d] = 'P';
              continue;
            }

            // Match the individual calendar: weekends without punches default to Rest Day.
            // Manual overrides and recorded punches above take precedence.
            const weekday = new Date(currentYear, currentMonthIndex, d).getDay();
            if (weekday === 0 || weekday === 6) {
              attendanceMap[d] = 'RD';
              continue;
            }

            // 1. Check if this date is today (the current day)
            const isToday = currentYear === liveTodayYear && currentMonthIndex === liveTodayMonth && d === liveTodayDate;

            // 2. Check if this date is in the future
            const isFutureDate = 
              currentYear > liveTodayYear || 
              (currentYear === liveTodayYear && currentMonthIndex > liveTodayMonth) ||
              (currentYear === liveTodayYear && currentMonthIndex === liveTodayMonth && d > liveTodayDate);

            if (isToday) {
              // Current day with no punches yet defaults to the clear tag (-)
              attendanceMap[d] = null;
            } else if (isFutureDate) {
              // Future weekdays default to the clear tag (-)
              attendanceMap[d] = null;
            } else {
              attendanceMap[d] = null;
            }
          }

          return {
            id: `emp-${empCode}`,
            databaseId: String(r.database_id || ''),
            name: r.name,
            startDate: r.hire_date || '',
            position: r.position || '',
            account: r.account || '',
            attendanceByDay: attendanceMap,
          };
        });

        // The calendar-scoped APIs enforce the same employee boundary server-side.
        setAttendanceDataList(mapped);
      } catch (err) {
        console.error('Failed to load database roster in calendar tab:', err);
      }
    }
    loadDbTeam();
  }, [currentMonthIndex, currentYear, totalDaysInMonth, isAdmin]);

  const isCurrentUser = (emp: EmployeeAttendanceRow) => {
    if (!supervisorName && !supervisorId) return false;
    const sName = (supervisorName || '').toLowerCase().trim();
    const sId = supervisorId || '';
    const rName = (emp.name || '').toLowerCase().trim();
    const nameMatch = Boolean(sName && (rName === sName || rName.includes(sName) || sName.includes(rName)));
    const idMatch = Boolean(sId && (emp.id === `emp-${sId}` || emp.id === sId));
    return nameMatch || idMatch;
  };

  // Filter employees with top search and status
  const filteredEmployees = useMemo(() => {
    const matches = attendanceDataList.filter((emp) => {
      if (selectedPositionFilter !== 'all' && emp.position.trim() !== selectedPositionFilter) return false;
      if (selectedAccountFilter !== 'all' && (emp.account || '').toLowerCase() !== selectedAccountFilter.toLowerCase()) return false;

      const matchesSearch = 
        emp.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchFilter.toLowerCase());
      
      if (!matchesSearch) return false;

      if (selectedStatusFilter === 'P') return Object.values(emp.attendanceByDay).includes('P');
      if (selectedStatusFilter === 'L') return Object.values(emp.attendanceByDay).includes('L');
      if (selectedStatusFilter === 'U') return Object.values(emp.attendanceByDay).includes('U');
      if (selectedStatusFilter === 'A') return Object.values(emp.attendanceByDay).includes('A');
      if (selectedStatusFilter === 'RD') return Object.values(emp.attendanceByDay).includes('RD');

      return true;
    });

    const currentUserList: EmployeeAttendanceRow[] = [];
    const otherList: EmployeeAttendanceRow[] = [];
    matches.forEach((emp) => {
      if (isCurrentUser(emp)) {
        currentUserList.push(emp);
      } else {
        otherList.push(emp);
      }
    });

    return [...currentUserList, ...otherList];
  }, [attendanceDataList, searchFilter, selectedStatusFilter, selectedPositionFilter, selectedAccountFilter, supervisorName, supervisorId]);

  const employeesPerPage = 10;
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / employeesPerPage));
  const visibleEmployees = useMemo(() => {
    const start = (employeePage - 1) * employeesPerPage;
    return filteredEmployees.slice(start, start + employeesPerPage);
  }, [filteredEmployees, employeePage]);

  useEffect(() => {
    setEmployeePage(1);
  }, [searchFilter, selectedStatusFilter, selectedPositionFilter, selectedAccountFilter, currentMonthIndex, currentYear]);

  useEffect(() => {
    if (employeePage > pageCount) setEmployeePage(pageCount);
  }, [employeePage, pageCount]);

  // Status Styling Helper (Reduced size by 1)
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'P':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#d1fae5] text-[#065f46] dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/60 font-extrabold text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            P
          </span>
        );
      case 'L':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#fef3c7] text-[#92400e] dark:bg-amber-950/80 dark:text-amber-300 dark:border dark:border-amber-800/60 font-extrabold text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            L
          </span>
        );
      case 'U':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#ffedd5] text-[#9a3412] dark:bg-orange-950/80 dark:text-orange-300 dark:border dark:border-orange-800/60 font-extrabold text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            U
          </span>
        );
      case 'A':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#ffe4e6] text-[#9f1239] dark:bg-rose-950/80 dark:text-rose-300 dark:border dark:border-rose-800/60 font-extrabold text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            A
          </span>
        );
      case 'RD':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-100 text-slate-600 dark:bg-[#272626] dark:text-slate-400 dark:border dark:border-[#434142] font-extrabold text-[9.5px] sm:text-[10px] flex items-center justify-center shadow-2xs">
            RD
          </span>
        );
      case 'VL':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#2563eb] text-white font-extrabold text-[9px] sm:text-[10px] flex items-center justify-center shadow-xs">
            VL
          </span>
        );
      case 'SL':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#ef4444] text-white font-extrabold text-[9px] sm:text-[10px] flex items-center justify-center shadow-xs">
            SL
          </span>
        );
      case 'BL':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#8b5cf6] text-white font-extrabold text-[9px] sm:text-[10px] flex items-center justify-center shadow-xs">
            BL
          </span>
        );
      case 'ML':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#ec4899] text-white font-extrabold text-[9px] sm:text-[10px] flex items-center justify-center shadow-xs">
            ML
          </span>
        );
      case 'PL':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#0d9488] text-white font-extrabold text-[9px] sm:text-[10px] flex items-center justify-center shadow-xs">
            PL
          </span>
        );
      case 'HOL':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#f59e0b] text-white font-extrabold text-[8px] sm:text-[8.5px] flex items-center justify-center shadow-xs">
            HOL
          </span>
        );
      case 'SUS':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#334155] text-white font-extrabold text-[8px] sm:text-[8.5px] flex items-center justify-center shadow-xs">
            SUS
          </span>
        );
      default:
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 dark:text-slate-600 flex items-center justify-center text-xs">
            -
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* Unified White Container for Controls & Matrix Table */}
      {viewFormat === 'matrix' ? (
        <div className="bg-white dark:bg-[#363435] rounded-xl border border-slate-200/90 dark:border-[#434142] shadow-xs overflow-visible">
          
          {/* Controls Area */}
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Top Header Row: Title & Action Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8F8F6] tracking-tight whitespace-nowrap font-sans">
                  {isAdmin ? 'Attendance Calendar (All Employees)' : 'My Attendance Calendar'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAdmin
                    ? 'Monthly presence, tardiness, and rest day distribution across the workforce'
                    : 'Your monthly attendance and recorded punch history'}
                </p>
              </div>

              {/* Month Switcher Controls & View Mode */}
              <div className="flex items-center gap-2.5 flex-wrap justify-end">
                
                {/* Unified Date & Month Picker */}
                <DatePickerPopover
                  selectedDate={new Date(currentYear, currentMonthIndex, 1)}
                  onSelectDate={(d) => {
                    setCurrentMonthIndex(d.getMonth());
                    setCurrentYear(d.getFullYear());
                  }}
                  format="month-year"
                  showArrows
                  align="right"
                />

              </div>

            </div>

            {/* Legend Row with Full Word Colors and Dashes Matching User Request */}
            <div className="flex items-center gap-x-4 gap-y-2 text-[11px] sm:text-xs font-semibold flex-wrap pt-0.5 border-t border-slate-100 dark:border-[#434142] pt-2">
              <span className="flex items-center gap-1.5 text-[#059669] dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
                <span>P - Present</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#d97706] dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                <span>L - Late</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#ea580c] dark:text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shrink-0" />
                <span>U - Undertime</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#e11d48] dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shrink-0" />
                <span>A - Absent</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#64748b] dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
                <span>RD - Rest Day</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#2563eb] dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shrink-0" />
                <span>VL - Vacation Leave</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#ef4444] dark:text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
                <span>SL - Sick Leave</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#8b5cf6] dark:text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shrink-0" />
                <span>BL - Bereavement Leave</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#ec4899] dark:text-pink-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shrink-0" />
                <span>ML - Maternity Leave</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#0d9488] dark:text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488] shrink-0" />
                <span>PL - Paternity Leave</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#d97706] dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                <span>HOL - Holiday</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#334155] dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#334155] dark:bg-slate-400 shrink-0" />
                <span>SUS - Suspension</span>
              </span>
            </div>

            {/* Dynamic Month & Year Text below Legends */}
            <div className="pt-2 pb-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8F8F6] tracking-tight">
                {monthNames[currentMonthIndex]} {currentYear}
              </h3>
            </div>

          </div>

          {/* Matrix Table inside the same container */}
          <div className="overflow-x-auto relative border-t border-slate-100 dark:border-[#434142] rounded-b-xl" ref={scrollContainerRef}>
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Vibrant Solid Blue Table Headers */}
              <thead>
                {/* 1st Header Row: Days of the week in Primary Blue #2F6798 */}
                <tr className="bg-[#2F6798] dark:bg-[#1D2433] text-white dark:text-[#F8F8F6] select-none text-[10px] font-semibold">
                  
                  {/* Sticky Frozen Columns on Left in Primary Blue */}
                  <th className="sticky left-0 z-30 bg-[#2F6798] dark:bg-[#1D2433] py-2.5 px-3 border-r border-white/15 dark:border-[#434142] uppercase tracking-wider min-w-[90px]">
                    START DATE
                  </th>
                  <th className="sticky left-[90px] z-30 bg-[#2F6798] dark:bg-[#1D2433] py-2.5 px-3 border-r border-white/15 dark:border-[#434142] uppercase tracking-wider min-w-[210px]">
                    POSITION
                  </th>
                  <th className="sticky left-[300px] z-30 bg-[#2F6798] dark:bg-[#1D2433] py-2.5 px-4 border-r border-white/25 dark:border-[#434142] uppercase tracking-wider min-w-[210px] shadow-[4px_0_8px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.5)]">
                    EMPLOYEE NAME
                  </th>

                  {/* Day of Week Columns */}
                  {displayedDays.map((dayNum) => {
                    const dayDate = new Date(currentYear, currentMonthIndex, dayNum);
                    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const isToday = isCurrentViewMonth && dayNum === activeDayNumber;

                    return (
                      <th
                        key={dayNum}
                        onClick={() => handleOpenDayModal(dayNum)}
                        title={`Click to view team summary for ${monthNames[currentMonthIndex]} ${dayNum}`}
                        data-today-header={isToday ? 'true' : undefined}
                        className={`py-2 px-1 text-center font-semibold min-w-[42px] sm:min-w-[46px] border-r border-white/15 dark:border-[#434142]/60 cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-colors ${
                          isToday ? 'bg-[#059669] dark:bg-[#059669] text-white font-bold ring-1 ring-white/40' : ''
                        }`}
                      >
                        {dayName}
                      </th>
                    );
                  })}

                  {/* Monthly Summary Header */}
                  <th className="py-2.5 px-3 bg-[#24537C] dark:bg-[#161D2B] text-white dark:text-[#F8F8F6] font-semibold text-center border-l border-white/20 dark:border-[#434142] uppercase tracking-wider min-w-[130px]">
                    Monthly Totals
                  </th>
                </tr>

                {/* 2nd Header Row: Date numbers (SEP 1, SEP 2, ...) with Number Always on Next Line */}
                <tr className="bg-[#24537C] dark:bg-[#161D2B] text-white/95 dark:text-slate-300 select-none border-b border-white/20 dark:border-[#434142]">
                  <th className="sticky left-0 z-30 bg-[#24537C] dark:bg-[#161D2B] py-1.5 px-3 border-r border-white/15 dark:border-[#434142]"></th>
                  <th className="sticky left-[90px] z-30 bg-[#24537C] dark:bg-[#161D2B] py-1.5 px-3 border-r border-white/15 dark:border-[#434142]"></th>
                  <th className="sticky left-[300px] z-30 bg-[#24537C] dark:bg-[#161D2B] py-1.5 px-4 border-r border-white/25 dark:border-[#434142] shadow-[4px_0_8px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.5)]"></th>

                  {displayedDays.map((dayNum) => {
                    const isToday = isCurrentViewMonth && dayNum === activeDayNumber;

                    return (
                      <th
                        key={dayNum}
                        onClick={() => handleOpenDayModal(dayNum)}
                        title={`Click to view team summary for ${monthNames[currentMonthIndex]} ${dayNum}`}
                        className={`py-1 px-1 text-center border-r border-white/15 dark:border-[#434142]/60 cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-colors ${
                          isToday ? 'bg-[#047857] text-white' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center leading-tight">
                          <span className="text-[9px] font-semibold opacity-90 tracking-wider">
                            {monthNames[currentMonthIndex].slice(0, 3).toUpperCase()}
                          </span>
                          <span className="text-[11px] font-bold">{dayNum}</span>
                        </div>
                      </th>
                    );
                  })}

                  <th className="py-1.5 px-3 bg-[#1D4568] dark:bg-[#121722] text-white/90 dark:text-slate-300 text-[9px] font-bold text-center uppercase tracking-wider min-w-[130px]">
                    P / L / U / A / VL / SL
                  </th>
                </tr>
              </thead>

              {/* Table Body with Fixed Left Columns & Clean Matrix Cells */}
              <tbody className="divide-y divide-slate-100 dark:divide-[#434142] text-slate-700 dark:text-slate-300 font-medium">
                {visibleEmployees.map((emp, empIdx) => {
                  // Calculate monthly summary counts
                  const allStatuses = Object.values(emp.attendanceByDay);
                  const countP = allStatuses.filter((s) => s === 'P').length;
                  const countL = allStatuses.filter((s) => s === 'L').length;
                  const countU = allStatuses.filter((s) => s === 'U').length;
                  const countA = allStatuses.filter((s) => s === 'A').length;
                  const countVL = allStatuses.filter((s) => s === 'VL').length;
                  const countSL = allStatuses.filter((s) => s === 'SL').length;
                  const countBL = allStatuses.filter((s) => s === 'BL').length;
                  const countML = allStatuses.filter((s) => s === 'ML').length;
                  const countPL = allStatuses.filter((s) => s === 'PL').length;
                  const countHOL = allStatuses.filter((s) => s === 'HOL').length;
                  const countSUS = allStatuses.filter((s) => s === 'SUS').length;
                  const hasLeaves = countVL > 0 || countSL > 0 || countBL > 0 || countML > 0 || countPL > 0 || countHOL > 0 || countSUS > 0;
                  const initials = emp.name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('');

                  return (
                    <tr 
                      key={emp.id ? `${emp.id}-${empIdx}` : `emp-${empIdx}`}
                      className="hover:bg-blue-50/40 dark:hover:bg-[#272626] transition-colors group"
                    >
                      {/* Fixed Column 1: Start Date */}
                      <td className="sticky left-0 z-20 bg-white dark:bg-[#363435] group-hover:bg-[#f8fafc] dark:group-hover:bg-[#272626] py-2.5 px-3 text-slate-500 dark:text-slate-400 font-sans font-medium text-[11px] border-r border-slate-100 dark:border-[#434142]">
                        {emp.startDate}
                      </td>

                      {/* Fixed Column 2: Position */}
                      <td className="sticky left-[90px] z-20 bg-white dark:bg-[#363435] group-hover:bg-[#f8fafc] dark:group-hover:bg-[#272626] py-2.5 px-3 text-slate-500 dark:text-slate-400 font-medium text-xs border-r border-slate-100 dark:border-[#434142] truncate max-w-[210px]">
                        {emp.position}
                      </td>

                      {/* Fixed Column 3: Name with Circular Avatar Badge */}
                      <td 
                        onClick={() => {
                          setSelectedIndividualEmployee(emp.name);
                          onViewFormatChange('google-calendar');
                        }}
                        className="sticky left-[300px] z-20 bg-white dark:bg-[#363435] group-hover:bg-[#f8fafc] dark:group-hover:bg-[#272626] py-2.5 px-4 font-bold text-slate-900 dark:text-[#F8F8F6] text-xs border-r border-slate-200 dark:border-[#434142] shadow-[4px_0_8px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.4)] cursor-pointer hover:text-[#2F6798] dark:hover:text-[#3678B0]"
                        title="Click to view detailed individual calendar"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#2F6798]/10 text-[#2F6798] dark:bg-[#1D2433] dark:text-[#F8F8F6] font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#2F6798]/20 dark:border-[#434142]">
                            {initials}
                          </div>
                          <span className="whitespace-nowrap">{emp.name}</span>
                        </div>
                      </td>

                      {/* Day Columns */}
                      {displayedDays.map((dayNum) => {
                        const status = emp.attendanceByDay[dayNum] || null;
                        const isToday = isCurrentViewMonth && dayNum === activeDayNumber;

                        return (
                          <td
                            key={dayNum}
                            onClick={() => handleOpenCellPopover(emp, dayNum)}
                            title={isAdmin ? `Click to set attendance tag for ${emp.name} on ${monthNames[currentMonthIndex]} ${dayNum}` : `View ${emp.name}'s attendance for ${monthNames[currentMonthIndex]} ${dayNum}`}
                            className={`py-2 px-1 text-center border-r border-slate-100 dark:border-[#434142]/60 ${isAdmin ? 'cursor-pointer hover:bg-[#2F6798]/15 dark:hover:bg-[#1D2433]' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1D2433]'} transition-all ${
                              isToday ? 'bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center transform hover:scale-110 transition-transform">
                              {getStatusBadge(status)}
                            </div>
                          </td>
                        );
                      })}

                      {/* Monthly Summary Column with Style A Clean 2-Row Layout */}
                      <td className="py-2 px-2 text-center font-bold text-[11px] bg-slate-50/60 dark:bg-[#272626] border-l border-slate-200 dark:border-[#434142] min-w-[130px]">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {/* Row 1: Core Attendance Counts */}
                          <div className="flex items-center justify-center gap-1 whitespace-nowrap text-[11px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">{countP}P</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-black">{countL}L</span>
                            {countU > 0 && (
                              <>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-orange-600 dark:text-orange-400 font-black">{countU}U</span>
                              </>
                            )}
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-rose-600 dark:text-rose-400 font-black">{countA}A</span>
                          </div>

                          {/* Row 2: Dynamic Leave & Special Status Badges */}
                          {hasLeaves && (
                            <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5">
                              {countVL > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#2563eb] text-white text-[9px] font-black shadow-2xs">
                                  {countVL}VL
                                </span>
                              )}
                              {countSL > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#ef4444] text-white text-[9px] font-black shadow-2xs">
                                  {countSL}SL
                                </span>
                              )}
                              {countBL > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#8b5cf6] text-white text-[9px] font-black shadow-2xs">
                                  {countBL}BL
                                </span>
                              )}
                              {countML > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#ec4899] text-white text-[9px] font-black shadow-2xs">
                                  {countML}ML
                                </span>
                              )}
                              {countPL > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#0d9488] text-white text-[9px] font-black shadow-2xs">
                                  {countPL}PL
                                </span>
                              )}
                              {countHOL > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#f59e0b] text-white text-[9px] font-black shadow-2xs">
                                  {countHOL}HOL
                                </span>
                              )}
                              {countSUS > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-[#334155] text-white text-[9px] font-black shadow-2xs">
                                  {countSUS}SUS
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {/* Footer Summary Bar with Light Gray Tip */}
          <div className="p-3.5 border-t border-slate-100 dark:border-[#434142] bg-slate-50/60 dark:bg-[#272626] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
            <span>
              Showing {filteredEmployees.length === 0 ? 0 : (employeePage - 1) * employeesPerPage + 1}
              {'–'}{Math.min(employeePage * employeesPerPage, filteredEmployees.length)} of {filteredEmployees.length} workforce members
              {' '}({displayedDays.length} days in view)
            </span>
            <div className="flex items-center gap-1.5" aria-label="Attendance list pages">
              <button
                type="button"
                onClick={() => setEmployeePage((page) => Math.max(1, page - 1))}
                disabled={employeePage <= 1}
                className="rounded-md border border-slate-200 dark:border-[#434142] px-2.5 py-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#363435] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="px-2 font-semibold text-slate-600 dark:text-slate-300" aria-live="polite">
                Page {employeePage} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setEmployeePage((page) => Math.min(pageCount, page + 1))}
                disabled={employeePage >= pageCount}
                className="rounded-md border border-slate-200 dark:border-[#434142] px-2.5 py-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#363435] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Detailed Calendar View for Selected Employee */
        <div className="animate-in fade-in">
          <AttendanceCalendarView
            employeeName={selectedIndividualEmployee}
            supervisorName={supervisorName}
            records={records}
            canEdit={isAdmin}
          />
        </div>
      )}

      {/* Interactive Day Summary & Individual Employee Attendance Modal */}
      <AttendanceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        dayNumber={modalDayNumber}
        dayName={modalDayName}
        monthName={monthNames[currentMonthIndex]}
        year={currentYear}
        teamMembers={teamMembersForModalDay}
        selectedEmployeeName={modalSelectedEmployeeName}
      />

      {/* Quick Attendance Cell Tagging Popover (Matching Screenshot) */}
      {isAdmin && <AttendanceCellPopover
        isOpen={cellPopover.isOpen}
        onClose={() => setCellPopover((prev) => ({ ...prev, isOpen: false }))}
        employeeName={cellPopover.employeeName}
        employeeId={cellPopover.employeeId}
        position={cellPopover.position}
        account={cellPopover.account}
        dayNumber={cellPopover.dayNumber}
        monthName={monthNames[currentMonthIndex]}
        year={currentYear}
        currentStatus={cellPopover.currentStatus}
        currentNote={cellPopover.currentNote}
        onSelectStatus={handleSelectCellStatus}
        onOpenFullBreakdown={handleOpenDayModal}
      />}

    </div>
  );
}
