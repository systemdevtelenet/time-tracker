'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Calendar as CalendarIcon, 
  Download, 
  User, 
  Info,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  CalendarDays,
  LayoutGrid,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import AttendanceCalendarView from './AttendanceCalendarView';
import AttendanceDetailModal, { TeamMemberDayStatus } from './AttendanceDetailModal';
import AttendanceCellPopover from './AttendanceCellPopover';
import DatePickerPopover from './DatePickerPopover';
import { PhoneTimeRecord } from '@/lib/types';
import { logAttendanceUpdate } from '@/lib/activityLogs';

interface AttendanceCalendarTabProps {
  records?: PhoneTimeRecord[];
  onBackToRoster?: () => void;
  searchFilter?: string;
  isHeadOrAdmin?: boolean;
  supervisorName?: string;
  supervisorId?: string;
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
  startDate: string;
  position: string;
  name: string;
  attendanceByDay: Record<number, AttendanceStatus>;
}

// Full trainer and supervisor team dataset matching exact screenshot
const TEAM_ATTENDANCE_DATA: EmployeeAttendanceRow[] = [
  {
    id: '1',
    startDate: '1/3/2024',
    position: 'Head of Training',
    name: 'Nissi-Jeh Reguero',
    attendanceByDay: {
      1: 'L', 2: 'P', 3: 'P', 4: 'U', 5: 'RD', 6: 'RD',
      7: 'P', 8: 'U', 9: 'U', 10: 'U', 11: 'P', 12: 'RD', 13: 'RD',
      14: 'L', 15: 'P', 16: 'P',
    },
  },
  {
    id: '2',
    startDate: '6/29/2023',
    position: 'Head of Quality',
    name: 'Raymundo Alasagas III',
    attendanceByDay: {
      1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'A', 9: 'A', 10: 'A', 11: 'A', 12: 'RD', 13: 'RD',
      14: 'A', 15: 'A', 16: 'P',
    },
  },
  {
    id: '3',
    startDate: '5/2/2024',
    position: 'Trainer',
    name: 'Bianca Kaye Ernestine Colonia',
    attendanceByDay: {
      1: 'U', 2: 'L', 3: 'P', 4: 'L', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'L', 9: 'L', 10: 'L', 11: 'P', 12: 'RD', 13: 'RD',
      14: 'P', 15: 'L', 16: 'P',
    },
  },
  {
    id: '4',
    startDate: '9/17/2025',
    position: 'Trainer',
    name: 'Michelle Yncierto',
    attendanceByDay: {
      1: 'U', 2: 'L', 3: 'P', 4: 'L', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'P', 9: 'L', 10: 'L', 11: 'L', 12: 'RD', 13: 'RD',
      14: 'P', 15: 'P', 16: 'P',
    },
  },
  {
    id: '5',
    startDate: '11/24/2022',
    position: 'Trainer',
    name: 'Rommel Mendoza',
    attendanceByDay: {
      1: 'L', 2: 'L', 3: 'L', 4: 'L', 5: 'RD', 6: 'RD',
      7: 'L', 8: 'L', 9: 'L', 10: 'L', 11: 'A', 12: 'RD', 13: 'RD',
      14: 'L', 15: 'L', 16: 'P',
    },
  },
  {
    id: '6',
    startDate: '6/3/2024',
    position: 'Trainer',
    name: 'Ronelyn Baguio',
    attendanceByDay: {
      1: 'L', 2: 'L', 3: 'P', 4: 'P', 5: 'RD', 6: 'RD',
      7: 'P', 8: 'P', 9: 'L', 10: 'P', 11: 'P', 12: 'RD', 13: 'RD',
      14: 'A', 15: 'L', 16: 'P',
    },
  },
  {
    id: '7',
    startDate: '7/20/2022',
    position: 'Trainer',
    name: 'Krisland Pepito',
    attendanceByDay: {
      1: 'A', 2: 'A', 3: 'A', 4: 'A', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'U', 9: 'P', 10: 'L', 11: 'L', 12: 'RD', 13: 'RD',
      14: 'P', 15: 'P', 16: 'P',
    },
  },
  {
    id: '8',
    startDate: '11/7/2022',
    position: 'Trainer',
    name: 'Niño Elijah R. Reyes',
    attendanceByDay: {
      1: 'P', 2: 'P', 3: 'L', 4: 'P', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'P', 9: 'L', 10: 'P', 11: 'P', 12: 'RD', 13: 'RD',
      14: 'P', 15: 'A', 16: 'L',
    },
  },
  {
    id: '9',
    startDate: '7/18/2024',
    position: 'Trainer',
    name: 'Kier Ariola',
    attendanceByDay: {
      1: 'L', 2: 'P', 3: 'P', 4: 'L', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'L', 9: 'U', 10: 'P', 11: 'P', 12: 'RD', 13: 'RD',
      14: 'P', 15: 'P', 16: 'P',
    },
  },
  {
    id: '10',
    startDate: '10/5/2022',
    position: 'Trainer',
    name: 'Vincent Luis Celdran',
    attendanceByDay: {
      1: 'L', 2: 'L', 3: 'P', 4: 'L', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'L', 9: 'L', 10: 'P', 11: 'L', 12: 'RD', 13: 'RD',
      14: 'L', 15: 'L', 16: 'P',
    },
  },
  {
    id: '11',
    startDate: '4/8/2026',
    position: 'Trainer',
    name: 'Nina Joy Briones',
    attendanceByDay: {
      1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'L', 9: 'P', 10: 'P', 11: 'L', 12: 'RD', 13: 'RD',
      14: 'P', 15: 'L', 16: 'P',
    },
  },
  {
    id: '12',
    startDate: '4/8/2026',
    position: 'Trainer',
    name: 'Matt Riner Balaba',
    attendanceByDay: {
      1: 'L', 2: 'A', 3: 'P', 4: 'A', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'A', 9: 'L', 10: 'A', 11: 'A', 12: 'RD', 13: 'RD',
      14: 'P', 15: 'P', 16: 'P',
    },
  },
  {
    id: '13',
    startDate: '6/2/2026',
    position: 'Trainer',
    name: 'Maegan Marie Cabardo',
    attendanceByDay: {
      1: 'P', 2: 'P', 3: 'L', 4: 'U', 5: 'RD', 6: 'RD',
      7: 'A', 8: 'U', 9: 'L', 10: 'L', 11: 'L', 12: 'RD', 13: 'RD',
      14: 'P', 15: 'L', 16: 'P',
    },
  },
];

const DAYS_NAME_SEP_2026 = [
  'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN',
  'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN',
  'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN',
  'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN',
  'MON', 'TUE'
];

const FULL_DAY_NAMES = [
  'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Monday', 'Tuesday'
];

type RangeViewOption = 'all_30' | 'period_1' | 'period_2' | 'current_week';

export default function AttendanceCalendarTab({
  records = [],
  onBackToRoster,
  searchFilter = '',
  isHeadOrAdmin = true,
  supervisorName,
  supervisorId,
}: AttendanceCalendarTabProps) {
  const [viewFormat, setViewFormat] = useState<'matrix' | 'google-calendar'>('matrix');
  const [rangeView, setRangeView] = useState<RangeViewOption>('all_30');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8); // September (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedIndividualEmployee, setSelectedIndividualEmployee] = useState<string>(
    supervisorName || 'Nissi-Jeh Reguero'
  );

  // Dynamic Database Team Roster List
  const [attendanceDataList, setAttendanceDataList] = useState<EmployeeAttendanceRow[]>(() => {
    if (!isHeadOrAdmin && supervisorName) {
      const sName = supervisorName.toLowerCase().trim();
      const filtered = TEAM_ATTENDANCE_DATA.filter(
        (e) => (sName && (e.name.toLowerCase().trim().includes(sName) || sName.includes(e.name.toLowerCase().trim())))
      );
      return filtered.length > 0 ? filtered : TEAM_ATTENDANCE_DATA.slice(0, 1);
    }
    return TEAM_ATTENDANCE_DATA;
  });

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

  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const syncOverrides = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('attendance_overrides_v1');
          if (saved) setAttendanceOverrides(JSON.parse(saved));
        } catch (e) {}
        try {
          const savedNotes = localStorage.getItem('attendance_notes_v1');
          if (savedNotes) setAttendanceNotes(JSON.parse(savedNotes));
        } catch (e) {}
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
    const key = `${emp.name}-${currentYear}-${currentMonthIndex}-${dayNum}`;
    const empCode = emp.id.replace(/^emp-/, '');
    const overrideKey = `${empCode}-${currentYear}-${currentMonthIndex}-${dayNum}`;
    const legacyKey = `${emp.name}-${dayNum}`;
    const legacyIdKey = `${empCode}-${dayNum}`;
    const currentNote = 
      attendanceNotes[key] || 
      attendanceNotes[overrideKey] || 
      (currentMonthIndex === 8 && currentYear === 2026 ? (attendanceNotes[legacyKey] || attendanceNotes[legacyIdKey]) : '') || 
      '';
    
    setCellPopover({
      isOpen: true,
      employeeName: emp.name,
      employeeId: emp.id,
      position: emp.position,
      account: 'TRAINING',
      dayNumber: dayNum,
      currentStatus: emp.attendanceByDay[dayNum] || null,
      currentNote,
    });
  };

  const handleSelectCellStatus = async (newStatus: AttendanceStatus, note?: string) => {
    const { employeeName, dayNumber, employeeId } = cellPopover;
    const nameKey = `${employeeName}-${currentYear}-${currentMonthIndex}-${dayNumber}`;
    const cleanEmpId = (employeeId || '').replace(/^emp-/, '');
    const idKey = `${cleanEmpId}-${currentYear}-${currentMonthIndex}-${dayNumber}`;

    // 1. Update React state immediately
    setAttendanceDataList((prev) =>
      prev.map((emp) => {
        if (emp.name === employeeName || emp.id === employeeId || emp.id === `emp-${cleanEmpId}`) {
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

    // 2. Persist overrides to localStorage
    const updatedOverrides = {
      ...attendanceOverrides,
      [nameKey]: newStatus,
      [idKey]: newStatus,
      ...(currentMonthIndex === 8 && currentYear === 2026 ? {
        [`${employeeName}-${dayNumber}`]: newStatus,
        [`${cleanEmpId}-${dayNumber}`]: newStatus,
      } : {}),
    };
    setAttendanceOverrides(updatedOverrides);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('attendance_overrides_v1', JSON.stringify(updatedOverrides));
      } catch (e) {}
    }

    if (note !== undefined) {
      const updatedNotes = {
        ...attendanceNotes,
        [nameKey]: note,
        [idKey]: note,
        ...(currentMonthIndex === 8 && currentYear === 2026 ? {
          [`${employeeName}-${dayNumber}`]: note,
          [`${cleanEmpId}-${dayNumber}`]: note,
        } : {}),
      };
      setAttendanceNotes(updatedNotes);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('attendance_notes_v1', JSON.stringify(updatedNotes));
        } catch (e) {}
      }
    }

    // 3. Persist to Supabase time_tracker_logs
    if (cleanEmpId) {
      try {
        const statusMapLabel: Record<string, string> = {
          P: 'On Time',
          L: 'Late',
          U: 'Undertime',
          A: 'Absent',
          RD: 'Rest Day',
          VL: 'Vacation Leave',
          SL: 'Sick Leave',
          BL: 'Bereavement Leave',
          ML: 'Maternity Leave',
          PL: 'Paternity Leave',
          HOL: 'Holiday',
          SUS: 'Suspension',
        };
        const statusStr = newStatus ? (statusMapLabel[newStatus] || 'Attendance Override') : 'Cleared';

        await fetch('/api/punch-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empId: cleanEmpId,
            type: 'Shift Start',
            status: statusStr,
            duration: 'N/A',
            timestamp: `${currentMonthIndex + 1}/${dayNumber}/${currentYear} 8:00:00`,
          }),
        });
      } catch (err) {
        console.error('Error persisting attendance status to database:', err);
      }
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
      employeeName: employeeName,
      dateStr: `${monthNames[currentMonthIndex]} ${dayNumber}, ${currentYear}`,
      status: fullStatusLabel,
      performedBy: supervisorName || 'Supervisor',
      note: note || undefined,
    });

    // 5. Broadcast changes across all views
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
  
  // Dynamic Today detection
  const today = useMemo(() => new Date(), []);
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
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

  // Jump to active day column
  const handleJumpToToday = () => {
    const now = new Date();
    if (currentMonthIndex !== now.getMonth() || currentYear !== now.getFullYear()) {
      setCurrentMonthIndex(now.getMonth());
      setCurrentYear(now.getFullYear());
    }
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const todayTh = scrollContainerRef.current.querySelector('[data-today-header="true"]');
        if (todayTh) {
          todayTh.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, 50);
  };

  // Days list based on active range
  const totalDaysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

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
      const now = new Date();
      const currentDay = isCurrentViewMonth ? now.getDate() : 16;
      start = Math.max(1, currentDay - 3);
      end = Math.min(totalDaysInMonth, start + 6);
    }

    for (let i = start; i <= end; i++) {
      days.push(i);
    }
    return days;
  }, [rangeView, totalDaysInMonth, isCurrentViewMonth]);

  // Fetch actual live roster & punch logs from database and compute attendance matrix
  useEffect(() => {
    async function loadDbTeam() {
      try {
        const [rosterRes, punchRes] = await Promise.all([
          fetch('/api/team-roster'),
          fetch('/api/punch-logs?empId=ALL'),
        ]);

        const [rosterJson, punchJson] = await Promise.all([
          rosterRes.json(),
          punchRes.json(),
        ]);

        const rosterData: any[] = rosterJson.success && Array.isArray(rosterJson.data) && rosterJson.data.length > 0
          ? rosterJson.data
          : TEAM_ATTENDANCE_DATA.map((e) => ({
              employee_id: e.id,
              name: e.name,
              position: e.position,
              hire_date: e.startDate,
            }));

        const punchLogs: any[] = punchJson.success && Array.isArray(punchJson.data) ? punchJson.data : [];

        // Load local overrides
        let savedOverrides: Record<string, AttendanceStatus> = {};
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem('attendance_overrides_v1');
            if (saved) savedOverrides = JSON.parse(saved);
          } catch (e) {}
        }

        const now = new Date();
        const liveTodayDate = now.getDate();
        const liveTodayMonth = now.getMonth();
        const liveTodayYear = now.getFullYear();

        const mapped: EmployeeAttendanceRow[] = rosterData.map((r: any) => {
          const empCode = String(r.employee_id || r.id).trim();
          const empLogs = punchLogs.filter((l) => String(l.employee_id || l.empId || '').trim() === empCode);

          // Compute exact daily attendance status for days 1 to totalDaysInMonth
          const attendanceMap: Record<number, AttendanceStatus> = {};
          for (let d = 1; d <= totalDaysInMonth; d++) {
            const cellDate = new Date(currentYear, currentMonthIndex, d);
            const dayOfWeek = cellDate.getDay(); // 0 = Sunday, 6 = Saturday
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const overrideKey = `${empCode}-${currentYear}-${currentMonthIndex}-${d}`;
            const nameOverrideKey = `${r.name}-${currentYear}-${currentMonthIndex}-${d}`;
            const legacyKey = `${empCode}-${d}`;
            const legacyNameKey = `${r.name}-${d}`;

            const manualOverride = 
              savedOverrides[overrideKey] !== undefined ? savedOverrides[overrideKey] :
              savedOverrides[nameOverrideKey] !== undefined ? savedOverrides[nameOverrideKey] :
              (currentMonthIndex === 8 && currentYear === 2026 && savedOverrides[legacyKey] !== undefined) ? savedOverrides[legacyKey] :
              (currentMonthIndex === 8 && currentYear === 2026 && savedOverrides[legacyNameKey] !== undefined) ? savedOverrides[legacyNameKey] :
              undefined;

            if (manualOverride !== undefined) {
              attendanceMap[d] = manualOverride;
              continue;
            }

            // Saturday & Sunday are ALWAYS automatically Rest Day (RD) for any month
            if (isWeekend) {
              attendanceMap[d] = 'RD';
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
                const s = (l.status || '').toLowerCase();
                const t = (l.type || l.punch_type || '').toLowerCase();
                return s === 'late' || t.includes('late');
              });
              const hasUndertime = dayLogs.some((l) => (l.status || '').toLowerCase() === 'undertime');
              if (hasLate) attendanceMap[d] = 'L';
              else if (hasUndertime) attendanceMap[d] = 'U';
              else attendanceMap[d] = 'P';
              continue;
            }

            // Check if this date is in the future
            const isFutureDate = 
              currentYear > liveTodayYear || 
              (currentYear === liveTodayYear && currentMonthIndex > liveTodayMonth) ||
              (currentYear === liveTodayYear && currentMonthIndex === liveTodayMonth && d > liveTodayDate);

            if (isFutureDate) {
              // Future weekdays MUST be a clear tag (-) unless manually assigned
              attendanceMap[d] = null;
            } else if (currentMonthIndex === 8 && currentYear === 2026) {
              // Baseline historical demo data for past days in September 2026
              const baseData = TEAM_ATTENDANCE_DATA.find((t) => t.name.toLowerCase() === r.name.toLowerCase());
              if (baseData?.attendanceByDay[d]) {
                attendanceMap[d] = baseData.attendanceByDay[d];
              } else {
                attendanceMap[d] = 'A';
              }
            } else {
              // Other past dates without logs default to clear
              attendanceMap[d] = null;
            }
          }

          return {
            id: `emp-${empCode}`,
            name: r.name,
            startDate: r.hire_date || '1/3/2024',
            position: r.position || 'Trainer',
            attendanceByDay: attendanceMap,
          };
        });

        if (!isHeadOrAdmin) {
          const sName = (supervisorName || '').toLowerCase().trim();
          const filtered = mapped.filter((r) => {
            const rName = (r.name || '').toLowerCase().trim();
            return (sName && (rName === sName || rName.includes(sName) || sName.includes(rName))) || (supervisorId && r.id === `emp-${supervisorId}`);
          });
          setAttendanceDataList(filtered.length > 0 ? filtered : mapped.slice(0, 1));
        } else {
          setAttendanceDataList(mapped);
        }
      } catch (err) {
        console.error('Failed to load database roster in calendar tab:', err);
      }
    }
    loadDbTeam();
  }, [currentMonthIndex, currentYear, totalDaysInMonth, isHeadOrAdmin, supervisorName, supervisorId, attendanceOverrides]);

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
  }, [attendanceDataList, searchFilter, selectedStatusFilter, supervisorName, supervisorId]);

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
        <div className="bg-white dark:bg-[#363435] rounded-xl border border-slate-200/90 dark:border-[#434142] shadow-xs overflow-hidden">
          
          {/* Controls Area */}
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Top Header Row: Title & Action Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8F8F6] tracking-tight whitespace-nowrap font-sans">
                  Attendance Calendar (All Employees)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monthly presence, tardiness, and rest day distribution across the workforce
                </p>
              </div>

              {/* Month Switcher Controls & View Mode */}
              <div className="flex items-center gap-2.5 flex-wrap justify-end">
                
                {/* View Format Toggle (Matrix vs Calendar) */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#272626] border border-slate-200 dark:border-[#434142] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setViewFormat('matrix')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewFormat === 'matrix'
                        ? 'bg-[#2F6798] dark:bg-[#3678B0] text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8F8F6]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>All Employees</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewFormat('google-calendar')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      (viewFormat as string) === 'google-calendar'
                        ? 'bg-[#2F6798] dark:bg-[#3678B0] text-white shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8F8F6]'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Calendar View</span>
                  </button>
                </div>

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

            {/* Range Switcher Row */}
            <div className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#272626] border border-slate-200/80 dark:border-[#434142] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Range Toggle Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 mr-1 shrink-0">
                  Date Range:
                </span>
                
                <button
                  type="button"
                  onClick={() => setRangeView('all_30')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    rangeView === 'all_30'
                      ? 'bg-[#2F6798] dark:bg-[#3678B0] text-white shadow-xs'
                      : 'bg-white dark:bg-[#363435] text-slate-700 dark:text-[#F8F8F6] hover:bg-slate-100 dark:hover:bg-[#434142] border border-slate-200 dark:border-[#434142]'
                  }`}
                >
                  Full Month (1–30)
                </button>

                <button
                  type="button"
                  onClick={() => setRangeView('period_1')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    rangeView === 'period_1'
                      ? 'bg-[#2F6798] dark:bg-[#3678B0] text-white shadow-xs'
                      : 'bg-white dark:bg-[#363435] text-slate-700 dark:text-[#F8F8F6] hover:bg-slate-100 dark:hover:bg-[#434142] border border-slate-200 dark:border-[#434142]'
                  }`}
                >
                  1st Pay Period (1–15)
                </button>

                <button
                  type="button"
                  onClick={() => setRangeView('period_2')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    rangeView === 'period_2'
                      ? 'bg-[#2F6798] dark:bg-[#3678B0] text-white shadow-xs'
                      : 'bg-white dark:bg-[#363435] text-slate-700 dark:text-[#F8F8F6] hover:bg-slate-100 dark:hover:bg-[#434142] border border-slate-200 dark:border-[#434142]'
                  }`}
                >
                  2nd Pay Period (16–30)
                </button>

                <button
                  type="button"
                  onClick={() => setRangeView('current_week')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    rangeView === 'current_week'
                      ? 'bg-[#2F6798] dark:bg-[#3678B0] text-white shadow-xs'
                      : 'bg-white dark:bg-[#363435] text-slate-700 dark:text-[#F8F8F6] hover:bg-slate-100 dark:hover:bg-[#434142] border border-slate-200 dark:border-[#434142]'
                  }`}
                >
                  Current Week (14–20)
                </button>
              </div>

              {/* Jump to Today Quick Button */}
              <button
                type="button"
                onClick={handleJumpToToday}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-[#363435] border border-[#2F6798]/30 dark:border-[#434142] hover:border-[#2F6798] dark:hover:border-[#C8A54B] text-[#2F6798] dark:text-[#C8A54B] text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2F6798] dark:text-[#C8A54B]" />
                <span>Jump to Today ({monthNames[todayMonth].slice(0, 3)} {todayDate})</span>
              </button>

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

          </div>

          {/* Matrix Table inside the same container */}
          <div className="overflow-x-auto relative border-t border-slate-100 dark:border-[#434142]" ref={scrollContainerRef}>
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Vibrant Solid Blue Table Headers */}
              <thead>
                {/* 1st Header Row: Days of the week in Primary Blue #2F6798 */}
                <tr className="bg-[#2F6798] dark:bg-[#1D2433] text-white dark:text-[#F8F8F6] select-none text-[10px] font-semibold">
                  
                  {/* Sticky Frozen Columns on Left in Primary Blue */}
                  <th className="sticky left-0 z-30 bg-[#2F6798] dark:bg-[#1D2433] py-2.5 px-3 border-r border-white/15 dark:border-[#434142] uppercase tracking-wider min-w-[90px]">
                    START DATE
                  </th>
                  <th className="sticky left-[90px] z-30 bg-[#2F6798] dark:bg-[#1D2433] py-2.5 px-3 border-r border-white/15 dark:border-[#434142] uppercase tracking-wider min-w-[125px]">
                    POSITION
                  </th>
                  <th className="sticky left-[215px] z-30 bg-[#2F6798] dark:bg-[#1D2433] py-2.5 px-4 border-r border-white/25 dark:border-[#434142] uppercase tracking-wider min-w-[210px] shadow-[4px_0_8px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.5)]">
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
                  <th className="sticky left-[215px] z-30 bg-[#24537C] dark:bg-[#161D2B] py-1.5 px-4 border-r border-white/25 dark:border-[#434142] shadow-[4px_0_8px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.5)]"></th>

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
                {filteredEmployees.map((emp, empIdx) => {
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
                      <td className="sticky left-0 z-20 bg-white dark:bg-[#363435] group-hover:bg-blue-50/70 dark:group-hover:bg-[#272626] py-2.5 px-3 text-slate-500 dark:text-slate-400 font-sans font-medium text-[11px] border-r border-slate-100 dark:border-[#434142]">
                        {emp.startDate}
                      </td>

                      {/* Fixed Column 2: Position */}
                      <td className="sticky left-[90px] z-20 bg-white dark:bg-[#363435] group-hover:bg-blue-50/70 dark:group-hover:bg-[#272626] py-2.5 px-3 text-slate-500 dark:text-slate-400 font-medium text-xs border-r border-slate-100 dark:border-[#434142] truncate max-w-[125px]">
                        {emp.position}
                      </td>

                      {/* Fixed Column 3: Name with Circular Avatar Badge */}
                      <td 
                        onClick={() => {
                          setSelectedIndividualEmployee(emp.name);
                          setViewFormat('google-calendar');
                        }}
                        className="sticky left-[215px] z-20 bg-white dark:bg-[#363435] group-hover:bg-blue-50/70 dark:group-hover:bg-[#272626] py-2.5 px-4 font-bold text-slate-900 dark:text-[#F8F8F6] text-xs border-r border-slate-200 dark:border-[#434142] shadow-[4px_0_8px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.4)] cursor-pointer hover:text-[#2F6798] dark:hover:text-[#3678B0]"
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
                            title={`Click to set attendance tag for ${emp.name} on ${monthNames[currentMonthIndex]} ${dayNum}`}
                            className={`py-2 px-1 text-center border-r border-slate-100 dark:border-[#434142]/60 cursor-pointer hover:bg-[#2F6798]/15 dark:hover:bg-[#1D2433] transition-all ${
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
            <span>Showing attendance for {filteredEmployees.length} workforce members ({displayedDays.length} days in view)</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">Tip: Click any cell or date header to view full team or individual breakdown</span>
          </div>

        </div>
      ) : (
        /* Detailed Calendar View for Selected Employee */
        <div className="animate-in fade-in">
          <AttendanceCalendarView
            employeeName={selectedIndividualEmployee}
            supervisorName={supervisorName}
            onBackToRoster={() => setViewFormat('matrix')}
            records={records}
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
      <AttendanceCellPopover
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
      />

    </div>
  );
}
