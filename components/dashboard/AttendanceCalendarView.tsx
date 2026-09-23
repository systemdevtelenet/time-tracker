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
  CalendarDays, 
  Coffee, 
  Utensils, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  Edit2,
  Trash2,
  Save,
  PlusCircle,
  LogIn
} from 'lucide-react';
import { PhoneTimeRecord } from '@/lib/types';
import { logAttendanceUpdate } from '@/lib/activityLogs';
import AttendanceDetailModal, { TeamMemberDayStatus } from './AttendanceDetailModal';
import AttendanceCellPopover from './AttendanceCellPopover';
import DatePickerPopover from './DatePickerPopover';

interface AttendanceCalendarViewProps {
  employeeName?: string;
  supervisorName?: string;
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

export type DayAttendanceStatus = 'Present' | 'Late' | 'Undertime' | 'Late / UT' | 'Absent' | 'Rest Day' | 'P' | 'L' | 'U' | 'A' | 'RD' | string | null;

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

const PUNCH_TYPES = [
  'Shift Start',
  'Break 1 Start',
  'Break 1 End',
  'Start Lunch',
  'End Lunch',
  'Break 2 Start',
  'Break 2 End',
  'Shift End',
];

const PUNCH_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  'Shift Start': { label: 'Shift Start', icon: LogIn, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
  'Break 1 Start': { label: 'Break 1 Start', icon: Coffee, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' },
  'Break 1 End': { label: 'Break 1 End', icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/60' },
  'Start Lunch': { label: 'Start Lunch', icon: Utensils, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60' },
  'End Lunch': { label: 'End Lunch', icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/60' },
  'Break 2 Start': { label: 'Break 2 Start', icon: Coffee, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' },
  'Break 2 End': { label: 'Break 2 End', icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/60' },
  'Shift End': { label: 'Shift End', icon: Clock, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
};

const STATUS_PILL_CONFIG: Record<string, { active: string; inactive: string }> = {
  'Present': {
    active: 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/30',
    inactive: 'bg-[#E6F4EA] text-[#137333] border-emerald-200/80 hover:bg-emerald-100/80 hover:border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  'Late': {
    active: 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-400/30',
    inactive: 'bg-[#FEF7E0] text-[#B06000] border-amber-200/80 hover:bg-amber-100/80 hover:border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
  },
  'Undertime': {
    active: 'bg-orange-500 text-white border-orange-500 shadow-xs ring-2 ring-orange-400/30',
    inactive: 'bg-[#FFF0E0] text-[#C2410C] border-orange-200/80 hover:bg-orange-100/80 hover:border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
  },
  'Absent': {
    active: 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-400/30',
    inactive: 'bg-[#FCE8E6] text-[#C5221F] border-rose-200/80 hover:bg-rose-100/80 hover:border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
  },
  'Rest Day': {
    active: 'bg-slate-700 text-white border-slate-700 shadow-xs ring-2 ring-slate-400/30 dark:bg-slate-600 dark:border-slate-500',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80 hover:border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
  },
};

function PunchTypeCustomDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentConfig = PUNCH_TYPE_CONFIG[value] || {
    label: value || 'Select Type',
    icon: Clock,
    color: 'text-slate-600 dark:text-slate-300',
    bg: 'bg-slate-100 dark:bg-slate-800',
  };
  const IconComponent = currentConfig.icon;

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-left text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2F6798]"
      >
        <div className="flex items-center gap-2 truncate">
          <div className={`p-1 rounded-md ${currentConfig.bg} ${currentConfig.color} shrink-0`}>
            <IconComponent className="w-3.5 h-3.5" />
          </div>
          <span className="truncate font-extrabold">{currentConfig.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-60 w-56 bg-white dark:bg-[#111C3D] border border-slate-200/90 dark:border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95">
          {PUNCH_TYPES.map((pt) => {
            const isSelected = pt === value;
            const config = PUNCH_TYPE_CONFIG[pt] || {
              label: pt,
              icon: Clock,
              color: 'text-slate-600 dark:text-slate-300',
              bg: 'bg-slate-100 dark:bg-slate-800',
            };
            const ItemIcon = config.icon;

            return (
              <button
                key={pt}
                type="button"
                onClick={() => {
                  onChange(pt);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300 font-black'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${config.bg} ${config.color} shrink-0`}>
                    <ItemIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>{pt}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2F6798] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function assignShiftDay(date: Date): number {
  const h = date.getHours();
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

export function getFullStatusLabel(status: DayAttendanceStatus): string {
  const s = String(status || '').trim();
  switch (s) {
    case 'P':
    case 'Present':
      return 'Present';
    case 'L':
    case 'Late':
      return 'Late';
    case 'U':
    case 'Undertime':
      return 'Undertime';
    case 'Late / UT':
      return 'Late / UT';
    case 'A':
    case 'Absent':
      return 'Absent';
    case 'RD':
    case 'Rest Day':
      return 'Rest Day';
    case 'Clear':
    case 'None':
    case 'null':
    case 'undefined':
      return '';
    default:
      return s;
  }
}

function parseTimeToDate(dayNumber: number, monthIndex: number, year: number, timeStr: string): string {
  const isAM = /am/i.test(timeStr);
  const match = timeStr.match(/(\d+):(\d+)/);
  let hour = match ? parseInt(match[1], 10) : 8;
  if (/pm/i.test(timeStr) && hour < 12) hour += 12;
  if (/am/i.test(timeStr) && hour === 12) hour = 0;

  // Night shift rule: AM punches (< 9 AM) belong to next morning of this shift
  let targetDay = dayNumber;
  if (isAM && hour < 9) {
    targetDay = dayNumber + 1;
  }
  return `${monthIndex + 1}/${targetDay}/${year} ${timeStr}`;
}

export default function AttendanceCalendarView({
  employeeName = 'Nissi-Jeh Reguero',
  supervisorName = 'Nissi-Jeh Reguero',
  onBackToRoster,
  records = [],
}: AttendanceCalendarViewProps) {
  const [rosterEmployees, setRosterEmployees] = useState(ALL_ROSTER_EMPLOYEES);
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
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch dynamic roster from Supabase database
  useEffect(() => {
    async function fetchRoster() {
      try {
        const res = await fetch('/api/team-roster');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setRosterEmployees(
            json.data.map((emp: any) => ({
              id: String(emp.employee_id || emp.id),
              name: emp.name,
              role: emp.position || emp.role || 'Trainer',
              department: emp.department || 'TQA',
              account: emp.account || 'TRAINING',
            }))
          );
        }
      } catch (err) {
        console.warn('Could not fetch dynamic team roster:', err);
      }
    }
    fetchRoster();
  }, []);

  useEffect(() => {
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
  }, []);

  // Cell Popover / Day Modal State (Supports both View & Edit modes)
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dayNumber: number;
    status: DayAttendanceStatus;
    punches: DayPunchItem[];
  } | null>(null);

  const [panelMode, setPanelMode] = useState<'view' | 'edit'>('view');
  const [editStatus, setEditStatus] = useState<DayAttendanceStatus>('Present');
  const [editPunches, setEditPunches] = useState<Array<{ id: string; type: string; time: string; duration?: string }>>([]);
  const [editNote, setEditNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync with prop change
  useEffect(() => {
    if (employeeName) {
      setSelectedEmpName(employeeName);
    }
  }, [employeeName]);

  // Find active employee record dynamically
  const activeEmployee = useMemo(() => {
    return (
      rosterEmployees.find(
        (e) => e.name.toLowerCase() === selectedEmpName.toLowerCase() || e.id === selectedEmpName
      ) || rosterEmployees[0]
    );
  }, [selectedEmpName, rosterEmployees]);

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

  // Group punches by shift date key across all months (YYYY-M-D)
  const punchesByDateKey = useMemo(() => {
    const map: Record<string, DayPunchItem[]> = {};

    punchLogs.forEach((log) => {
      const rawTs = log.timestamp || log.TIMESTAMP;
      if (!rawTs) return;
      const d = new Date(rawTs);
      if (isNaN(d.getTime())) return;

      const logMonth = d.getMonth();
      const logYear = d.getFullYear();
      const shiftDay = assignShiftDay(d);

      let shiftMonth = logMonth;
      let shiftYear = logYear;
      if (d.getHours() < 9 && d.getDate() === 1) {
        const prev = new Date(d);
        prev.setDate(prev.getDate() - 1);
        shiftMonth = prev.getMonth();
        shiftYear = prev.getFullYear();
      }

      const key = `${shiftYear}-${shiftMonth}-${shiftDay}`;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push({
        id: String(log.id || `punch-${Date.now()}-${Math.random()}`),
        type: log.type || log.punch_type || 'Shift Action',
        timeLabel: formatTime(d),
        rawTimestamp: rawTs,
        duration: log.duration && log.duration !== 'N/A' ? String(log.duration) : undefined,
        status: log.status || undefined,
        parsedDate: d,
      });
    });

    // Sort chronologically within each date
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    });

    return map;
  }, [punchLogs]);

  // Compute status & punches for any specific date
  const getDayAttendanceInfo = (
    year: number,
    monthIndex: number,
    day: number
  ): { status: DayAttendanceStatus; punches: DayPunchItem[] } => {
    const key = `${year}-${monthIndex}-${day}`;
    const dayPunches = punchesByDateKey[key] || [];

    // Check manual overrides for current month or specific date key
    const nameKey = `${activeEmployee.name}-${day}`;
    const codeKey = `${activeEmployee.id}-${day}`;
    const fullDateKey = `${activeEmployee.id}-${year}-${monthIndex}-${day}`;

    if (monthIndex === currentMonthIndex && year === currentYear) {
      const manualOverride = (attendanceOverrides[nameKey] || attendanceOverrides[codeKey] || attendanceOverrides[fullDateKey]) as DayAttendanceStatus;
      if (manualOverride !== undefined) {
        if (manualOverride === 'Clear' || manualOverride === 'None' || manualOverride === null) {
          return { status: null, punches: [] };
        }
        return { status: getFullStatusLabel(manualOverride), punches: dayPunches };
      }
    } else if (attendanceOverrides[fullDateKey]) {
      const manualOverride = attendanceOverrides[fullDateKey] as DayAttendanceStatus;
      if (manualOverride === 'Clear' || manualOverride === 'None' || manualOverride === null) {
        return { status: null, punches: [] };
      }
      return { status: getFullStatusLabel(manualOverride), punches: dayPunches };
    }

    const d = new Date(year, monthIndex, day);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    if (dayPunches.length > 0) {
      const hasLate = dayPunches.some((p) => (p.status || '').toLowerCase() === 'late' || p.type.toLowerCase().includes('late'));
      const hasUndertime = dayPunches.some((p) => (p.status || '').toLowerCase() === 'undertime');

      if (hasLate && hasUndertime) {
        return { status: 'Late / UT', punches: dayPunches };
      } else if (hasLate) {
        return { status: 'Late', punches: dayPunches };
      } else if (hasUndertime) {
        return { status: 'Undertime', punches: dayPunches };
      } else {
        return { status: 'Present', punches: dayPunches };
      }
    } else if (isWeekend) {
      return { status: 'Rest Day', punches: [] };
    } else {
      const now = new Date();
      const isPast = new Date(year, monthIndex, day) <= new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (isPast) {
        return { status: 'Absent', punches: [] };
      }
      return { status: null, punches: [] };
    }
  };

  // Status map for current month
  const dayStatusMap = useMemo(() => {
    const statusMap: Record<number, DayAttendanceStatus> = {};
    const totalDays = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      statusMap[day] = getDayAttendanceInfo(currentYear, currentMonthIndex, day).status;
    }

    return statusMap;
  }, [punchesByDateKey, activeEmployee, attendanceOverrides, currentYear, currentMonthIndex]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar matrix computation with full padding day reflection
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonthIndex, 0).getDate();

    const grid: Array<{
      dayNum: number;
      isCurrentMonth: boolean;
      status: DayAttendanceStatus;
      punches: DayPunchItem[];
      isToday: boolean;
      dateObj: Date;
    }> = [];

    const today = new Date();

    // Previous month padding (reflects real data, but disabled)
    const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
    const prevYear = currentMonthIndex === 0 ? currentYear - 1 : currentYear;

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const { status, punches } = getDayAttendanceInfo(prevYear, prevMonthIndex, dayNum);
      grid.push({
        dayNum,
        isCurrentMonth: false,
        status,
        punches,
        isToday: false,
        dateObj: new Date(prevYear, prevMonthIndex, dayNum),
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentMonthIndex &&
        today.getFullYear() === currentYear;

      const { status, punches } = getDayAttendanceInfo(currentYear, currentMonthIndex, day);

      grid.push({
        dayNum: day,
        isCurrentMonth: true,
        status,
        punches,
        isToday,
        dateObj: new Date(currentYear, currentMonthIndex, day),
      });
    }

    // Next month padding to fill complete weeks (multiples of 7)
    const nextMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
    const nextYear = currentMonthIndex === 11 ? currentYear + 1 : currentYear;
    const remainder = (7 - (grid.length % 7)) % 7;
    for (let i = 1; i <= remainder; i++) {
      const { status, punches } = getDayAttendanceInfo(nextYear, nextMonthIndex, i);
      grid.push({
        dayNum: i,
        isCurrentMonth: false,
        status,
        punches,
        isToday: false,
        dateObj: new Date(nextYear, nextMonthIndex, i),
      });
    }

    return grid;
  }, [currentYear, currentMonthIndex, punchesByDateKey, attendanceOverrides, activeEmployee]);

  // Statistics counters
  const totalPresents = useMemo(() => Object.values(dayStatusMap).filter((s) => s === 'Present' || s === 'P').length, [dayStatusMap]);
  const totalLates = useMemo(() => Object.values(dayStatusMap).filter((s) => s === 'Late' || s === 'Late / UT' || s === 'L').length, [dayStatusMap]);
  const totalUndertimes = useMemo(() => Object.values(dayStatusMap).filter((s) => s === 'Undertime' || s === 'Late / UT' || s === 'U').length, [dayStatusMap]);
  const totalAbsents = useMemo(() => Object.values(dayStatusMap).filter((s) => s === 'Absent' || s === 'A').length, [dayStatusMap]);
  const totalRestDays = useMemo(() => Object.values(dayStatusMap).filter((s) => s === 'Rest Day' || s === 'RD').length, [dayStatusMap]);

  // Open Day Panel in either View or Edit mode
  const handleOpenDayPanel = (
    dayNumber: number,
    status: DayAttendanceStatus,
    punches: DayPunchItem[],
    initialMode: 'view' | 'edit' = 'view'
  ) => {
    setSelectedDayDetail({ dayNumber, status, punches });
    setPanelMode(initialMode);
    setEditStatus(status || 'Present');
    setEditPunches(
      punches.length > 0
        ? punches.map((p) => ({
            id: p.id,
            type: p.type,
            time: p.timeLabel,
            duration: p.duration,
          }))
        : []
    );
    const key = `${activeEmployee.name}-${dayNumber}`;
    const codeKey = `${activeEmployee.id}-${dayNumber}`;
    setEditNote(attendanceNotes[key] || attendanceNotes[codeKey] || '');
  };

  // Add a new punch in edit mode
  const handleAddNewPunch = () => {
    setEditPunches((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'Shift Start',
        time: '8:00 AM',
      },
    ]);
  };

  // Remove a punch in edit mode
  const handleRemovePunch = (id: string) => {
    setEditPunches((prev) => prev.filter((p) => p.id !== id));
  };

  // Update a punch property in edit mode
  const handleUpdatePunchField = (id: string, field: 'type' | 'time', value: string) => {
    setEditPunches((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Save changes to database and local state
  const handleSaveDayChanges = async () => {
    if (!selectedDayDetail) return;
    setIsSaving(true);
    const dayNumber = selectedDayDetail.dayNumber;
    const nameKey = `${activeEmployee.name}-${dayNumber}`;
    const codeKey = `${activeEmployee.id}-${dayNumber}`;

    try {
      // 1. Update local overrides & notes
      const updatedOverrides = { ...attendanceOverrides };
      if (editStatus) {
        updatedOverrides[nameKey] = editStatus;
        updatedOverrides[codeKey] = editStatus;
      } else {
        // User explicitly set to Clear -> mark as Clear so no status or fallback badge displays
        updatedOverrides[nameKey] = 'Clear';
        updatedOverrides[codeKey] = 'Clear';
      }
      setAttendanceOverrides(updatedOverrides);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('attendance_overrides_v1', JSON.stringify(updatedOverrides));
        } catch (e) {}
      }

      if (editNote !== undefined) {
        const updatedNotes = {
          ...attendanceNotes,
          [nameKey]: editNote,
          [codeKey]: editNote,
        };
        setAttendanceNotes(updatedNotes);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('attendance_notes_v1', JSON.stringify(updatedNotes));
          } catch (e) {}
        }
      }

      // 2. Persist to Supabase time_tracker_logs
      // Clean previous punches for this specific employee & day first
      await fetch(
        `/api/punch-logs?empId=${activeEmployee.id}&month=${currentMonthIndex}&day=${dayNumber}&year=${currentYear}`,
        { method: 'DELETE' }
      ).catch(() => {});

      const punchStatusStr =
        editStatus === 'Present'
          ? 'On Time'
          : editStatus === 'Late'
          ? 'Late'
          : editStatus === 'Undertime'
          ? 'Undertime'
          : editStatus === 'Absent'
          ? 'Absent'
          : editStatus === 'Rest Day'
          ? 'Rest Day'
          : 'On Time';

      if (editPunches.length > 0) {
        for (const p of editPunches) {
          const formattedTs = parseTimeToDate(dayNumber, currentMonthIndex, currentYear, p.time);
          await fetch('/api/punch-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              empId: activeEmployee.id,
              type: p.type,
              status: punchStatusStr,
              duration: p.duration || 'N/A',
              timestamp: formattedTs,
            }),
          });
        }
      }

      // 3. Reload fresh logs
      await loadLogsForEmployee();

      // 4. Record to Activity Logs
      logAttendanceUpdate({
        employeeName: activeEmployee.name,
        dateStr: `${monthNames[currentMonthIndex]} ${dayNumber}, ${currentYear}`,
        status: editStatus || 'Present',
        punchesCount: editPunches.length,
        performedBy: supervisorName || 'Supervisor',
        note: editNote || undefined,
      });

      // 5. Update current open panel view
      setSelectedDayDetail({
        dayNumber,
        status: editStatus,
        punches: editPunches.map((p) => ({
          id: p.id,
          type: p.type,
          timeLabel: p.time,
          rawTimestamp: `${currentMonthIndex + 1}/${dayNumber}/${currentYear} ${p.time}`,
          parsedDate: new Date(currentYear, currentMonthIndex, dayNumber),
        })),
      });

      setPanelMode('view');
      setToastMsg(`Changes for ${monthNames[currentMonthIndex]} ${dayNumber} saved successfully!`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save shift changes:', err);
      setToastMsg('Failed to save changes. Please try again.');
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColorStyles = (status: DayAttendanceStatus) => {
    const s = String(status || '').trim();
    switch (s) {
      case 'Present':
      case 'P':
        return {
          banner: 'bg-[#D1FAE5] text-[#065F46] dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/80',
          punchPill: 'bg-[#E6F4EA] text-[#137333] dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/50',
        };
      case 'Late':
      case 'L':
        return {
          banner: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/80',
          punchPill: 'bg-[#FEF7E0] text-[#B06000] dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/50',
        };
      case 'Undertime':
      case 'U':
      case 'Late / UT':
        return {
          banner: 'bg-[#FFEDD5] text-[#9A3412] dark:bg-orange-950 dark:text-orange-300 border border-orange-300/60 dark:border-orange-800/80',
          punchPill: 'bg-[#FFF0E0] text-[#C2410C] dark:bg-orange-950/60 dark:text-orange-200 border border-orange-200/80 dark:border-orange-800/50',
        };
      case 'Absent':
      case 'A':
        return {
          banner: 'bg-[#FFE4E6] text-[#9F1239] dark:bg-rose-950 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800/80',
          punchPill: 'bg-[#FCE8E6] text-[#C5221F] dark:bg-rose-950/60 dark:text-rose-200 border border-rose-200/80 dark:border-rose-800/50',
        };
      case 'Rest Day':
      case 'RD':
        return {
          banner: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700',
          punchPill: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        };
      default:
        return {
          banner: 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-500 border border-slate-200 dark:border-slate-800',
          punchPill: 'bg-slate-50 text-slate-400 dark:bg-slate-900 dark:text-slate-500 border border-slate-200 dark:border-slate-800',
        };
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-sans select-none animate-in fade-in">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-60 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-bold border border-slate-700/50 dark:border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* ================= TOP CONTROLS & NAVIGATION BAR ================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-white dark:bg-[#0E1B38] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        
        {/* Left: Employee Pill Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsEmpDropdownOpen(!isEmpDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#111C3D] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer shadow-2xs"
          >
            <div className="w-6 h-6 rounded-full bg-[#2F6798] text-white font-black text-[10px] flex items-center justify-center shrink-0">
              {activeEmployee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left">
              <span className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {activeEmployee.name}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium leading-none">
                ID: {activeEmployee.id} • {activeEmployee.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Employee Dropdown Menu */}
          {isEmpDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-white dark:bg-[#111C3D] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={personSearch}
                  onChange={(e) => setPersonSearch(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
                {rosterEmployees.filter((emp) =>
                  emp.name.toLowerCase().includes(personSearch.toLowerCase()) ||
                  emp.id.includes(personSearch)
                ).map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmpName(emp.name);
                      setIsEmpDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      emp.name === activeEmployee.name
                        ? 'bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">{emp.name}</span>
                      <span className="block text-[10px] text-slate-400">{emp.id} • {emp.role}</span>
                    </div>
                    {emp.name === activeEmployee.name && <Check className="w-3.5 h-3.5 text-[#2F6798]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Refresh + Unified DatePicker + View Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh Database Logs Button */}
          <button
            type="button"
            onClick={loadLogsForEmployee}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Refresh database punch logs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin text-[#2F6798]' : ''}`} />
          </button>

          {/* Unified Month Picker */}
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
              <div className="absolute right-0 top-full mt-1.5 z-50 w-28 bg-white dark:bg-[#111C3D] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 animate-in fade-in zoom-in-95">
                {(['Month', 'Week', 'Day'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setViewMode(mode);
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left rounded-lg font-bold transition-colors cursor-pointer ${
                      viewMode === mode
                        ? 'bg-[#2F6798]/10 text-[#2F6798] dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ================= METRIC BADGES BAR ================= */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-[#111C3D] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3 text-xs font-bold flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{totalPresents} Present</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>{totalLates} Late</span>
          </span>
          <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>{totalUndertimes} Undertime</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>{totalAbsents} Absent</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>{totalRestDays} Rest Days</span>
          </span>
        </div>
      </div>

      {/* ================= 7-COLUMN MONTH CALENDAR GRID ================= */}
      <div className="flex-1 overflow-x-auto bg-white dark:bg-[#0E1B38] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="min-w-[840px]">
          
          {/* Days of Week Header Row */}
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

          {/* Month Day Cells Grid */}
          <div className="grid grid-cols-7 border-collapse">
            {calendarGrid.map((cell, idx) => {
              const colIndex = idx % 7;
              const isRightmost = colIndex === 6;

              if (!cell.isCurrentMonth) {
                const styles = getStatusColorStyles(cell.status);
                const hasPunches = cell.punches && cell.punches.length > 0;

                return (
                  <div
                    key={`pad-${idx}`}
                    className={`min-h-[160px] p-2 flex flex-col justify-start gap-1 border-b border-r ${
                      isRightmost ? 'border-r-0' : ''
                    } border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/30 opacity-40 grayscale-[25%] select-none cursor-default`}
                  >
                    {/* Header with Month Abbreviation and Day Number */}
                    <div className="flex items-center justify-between leading-none mb-0.5">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        {cell.dateObj.toLocaleDateString([], { month: 'short' })}
                      </span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        {cell.dayNum}
                      </span>
                    </div>

                    {/* Top Status Badge (Disabled) */}
                    {cell.status && (
                      <div
                        className={`w-full py-0.5 px-1.5 rounded-md font-bold text-[10px] text-center truncate shadow-2xs ${styles.banner}`}
                      >
                        {getFullStatusLabel(cell.status)}
                      </div>
                    )}

                    {/* Stack of Punch Action Pills or Rest Day / No Logs */}
                    {hasPunches ? (
                      <div className="flex flex-col gap-1 mt-0.5 overflow-hidden max-h-[185px] pr-0.5">
                        {cell.punches.map((punch) => (
                          <div
                            key={punch.id}
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-medium tracking-tight flex items-center justify-between shadow-2xs ${styles.punchPill}`}
                          >
                            <span className="truncate mr-1 shrink-0">{punch.timeLabel}</span>
                            <span className="truncate opacity-80 text-[9px]">{punch.type}</span>
                          </div>
                        ))}
                      </div>
                    ) : (cell.status === 'Absent' || cell.status === 'A') ? (
                      <div className="flex-1 flex items-center justify-center p-1 text-center text-[10px] text-rose-500/60 font-medium">
                        No time logs
                      </div>
                    ) : (cell.status === 'Rest Day' || cell.status === 'RD') ? (
                      <div className="flex-1 flex items-center justify-center p-1 text-center text-[10px] text-slate-400 font-medium">
                        Scheduled Rest Day
                      </div>
                    ) : null}
                  </div>
                );
              }

              const styles = getStatusColorStyles(cell.status);
              const hasPunches = cell.punches && cell.punches.length > 0;

              return (
                <div
                  key={`day-${cell.dayNum}`}
                  onClick={() => handleOpenDayPanel(cell.dayNum, cell.status, cell.punches, 'view')}
                  className={`min-h-[160px] p-2 flex flex-col justify-start gap-1 border-b border-r ${
                    isRightmost ? 'border-r-0' : ''
                  } border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1B38] hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors cursor-pointer relative group ${
                    cell.isToday ? 'bg-emerald-50/25 dark:bg-emerald-950/15' : ''
                  }`}
                >
                  {/* Day Header with Day Number in Top Right & Quick Edit Button on Hover */}
                  <div className="flex items-center justify-between leading-none mb-0.5">
                    {cell.isToday ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Today
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-1.5">
                      {/* Quick Action Button on Hover: Edit pencil if has data, or Plus icon if empty */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDayPanel(cell.dayNum, cell.status || 'Present', cell.punches, 'edit');
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-[#2F6798] hover:text-white text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
                        title={hasPunches || cell.status ? "Edit shift data for this day" : "Add shift punches / attendance for this day"}
                      >
                        {hasPunches || cell.status ? (
                          <Edit2 className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3 text-[#2F6798] hover:text-white" />
                        )}
                      </button>

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
                  </div>

                  {/* Top Status Badge */}
                  {cell.status && (
                    <div
                      className={`w-full py-0.5 px-1.5 rounded-md font-extrabold text-[10.5px] text-center truncate shadow-2xs select-none ${styles.banner}`}
                    >
                      {getFullStatusLabel(cell.status)}
                    </div>
                  )}

                  {/* Stack of Punch Action Pills or Interactive Empty State */}
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
                  ) : (cell.status === 'Absent' || cell.status === 'A') ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-1 text-center group/empty">
                      <span className="text-[10px] text-rose-500/80 font-bold group-hover:hidden">No time logs</span>
                      <div className="hidden group-hover:flex items-center gap-1 text-[10px] font-bold text-[#2F6798] dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50 px-2 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
                        <Plus className="w-3 h-3" />
                        <span>Add Logs</span>
                      </div>
                    </div>
                  ) : (cell.status === 'Rest Day' || cell.status === 'RD') ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-1 text-center group/empty">
                      <span className="text-[10px] text-slate-400 font-semibold group-hover:hidden">Scheduled Rest Day</span>
                      <div className="hidden group-hover:flex items-center gap-1 text-[10px] font-bold text-[#2F6798] dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50 px-2 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
                        <Plus className="w-3 h-3" />
                        <span>Add Shift</span>
                      </div>
                    </div>
                  ) : (
                    /* Blank / Future Empty Dates */
                    <div className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-transparent group-hover:border-blue-300/80 dark:group-hover:border-blue-700/60 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-950/20 transition-all cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#2F6798] text-slate-400 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                        <Plus className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="text-[10px] font-bold text-[#2F6798] dark:text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Add Data
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ================= INTERACTIVE VIEW & EDIT DAY DETAIL PANEL ================= */}
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
                  <span className="text-[8px] uppercase tracking-tighter leading-none opacity-85">
                    {monthNames[currentMonthIndex].slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-sm font-black leading-none mt-0.5">{selectedDayDetail.dayNumber}</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                    {monthNames[currentMonthIndex]} {selectedDayDetail.dayNumber}, {currentYear}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {panelMode === 'edit' ? 'Edit Shift Punches' : 'Shift Breakdown'} — <span className="font-bold text-slate-800 dark:text-slate-200">{activeEmployee.name}</span>
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

            {/* Mode Switcher Tabs */}
            <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPanelMode('view')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
                  panelMode === 'view'
                    ? 'bg-white dark:bg-[#1E293B] text-[#2F6798] dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                View Summary
              </button>
              <button
                type="button"
                onClick={() => setPanelMode('edit')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  panelMode === 'edit'
                    ? 'bg-[#2F6798] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Shift</span>
              </button>
            </div>

            {/* Panel Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* ================= VIEW MODE ================= */}
              {panelMode === 'view' && (
                <>
                  {/* Day Status Summary Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Attendance Status
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                        {getFullStatusLabel(selectedDayDetail.status) || 'No Status Recorded'}
                      </span>
                    </div>
                    {selectedDayDetail.status && (
                      <div
                        className={`py-1 px-3 rounded-lg font-extrabold text-xs shadow-2xs ${
                          getStatusColorStyles(selectedDayDetail.status).banner
                        }`}
                      >
                        {getFullStatusLabel(selectedDayDetail.status)}
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

                  {/* Supervisor Note if present */}
                  {editNote && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        Supervisor Note
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                        {editNote}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ================= EDIT MODE ================= */}
              {panelMode === 'edit' && (
                <div className="space-y-4">
                  
                  {/* Status Picker */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                      Change Day Attendance Status
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {(['Present', 'Late', 'Undertime', 'Absent', 'Rest Day'] as const).map((st) => {
                        const isSelected = editStatus === st;
                        const colors = STATUS_PILL_CONFIG[st];
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setEditStatus(st)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shadow-2xs ${
                              isSelected ? colors.active : colors.inactive
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                      {/* Clear Tag Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditStatus(null);
                          setEditPunches([]);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center justify-center gap-1 shadow-2xs ${
                          editStatus === null
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-400/30'
                            : 'bg-rose-50/70 text-rose-600 border-rose-200/80 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40'
                        }`}
                        title="Clear attendance status override"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Editable Punches List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Punch Event Times
                      </label>
                      <button
                        type="button"
                        onClick={handleAddNewPunch}
                        className="flex items-center gap-1 text-xs font-bold text-[#2F6798] dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Punch</span>
                      </button>
                    </div>

                    {editPunches.length > 0 ? (
                      <div className="space-y-2">
                        {editPunches.map((punch, idx) => (
                          <div
                            key={punch.id}
                            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-2"
                          >
                            {/* Custom Styled Punch Type Dropdown */}
                            <PunchTypeCustomDropdown
                              value={punch.type}
                              onChange={(newType) => handleUpdatePunchField(punch.id, 'type', newType)}
                            />

                            {/* Time Input */}
                            <input
                              type="text"
                              value={punch.time}
                              onChange={(e) => handleUpdatePunchField(punch.id, 'time', e.target.value)}
                              placeholder="e.g. 9:00 PM"
                              className="w-28 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:ring-1 focus:ring-[#2F6798]"
                            />

                            {/* Delete Punch Button */}
                            <button
                              type="button"
                              onClick={() => handleRemovePunch(punch.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete this punch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                        No punches recorded for this day yet. Click <strong>+ Add Punch</strong> to insert one.
                      </div>
                    )}
                  </div>

                  {/* Supervisor Note Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      Supervisor Remarks / Reason (Optional)
                    </label>
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="e.g. Approved adjustment due to transport delay or schedule swap..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2F6798]"
                    />
                  </div>

                </div>
              )}

            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between gap-3">
              {panelMode === 'view' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPanelMode('edit')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#2F6798]" />
                    <span>Edit Shift</span>
                  </button>
                  <button
                    onClick={() => setSelectedDayDetail(null)}
                    className="px-4 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    Close Panel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPanelMode('view')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveDayChanges}
                    className="px-5 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
