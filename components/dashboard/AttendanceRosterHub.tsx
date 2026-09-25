import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, 
  CalendarDays, 
  FileText, 
  UserCheck, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Coffee,
  Utensils,
  Calendar,
  Building2,
  Search,
  ChevronDown,
  Check,
  X
} from 'lucide-react';
import RosterTable, { RosterEmployee } from './RosterTable';
import AttendanceCalendarTab from './AttendanceCalendarTab';
import AttendanceCalendarView from './AttendanceCalendarView';
import HoursReportTab from './HoursReportTab';
import EmployeeDetailsTab from './EmployeeDetailsTab';
import EndShiftModal from './EndShiftModal';
import DatePickerPopover from './DatePickerPopover';
import { PhoneTimeRecord } from '@/lib/types';
import { isHeadOrAdminUser } from './CompanySidebar';

interface FilterDropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}

function FilterDropdown({ label, icon, value, onChange, options }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || options[0]?.label;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
        {icon}
        <span>{label}</span>
      </label>

      {/* Trigger Button styled like reference image */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#272626] border text-xs font-bold text-slate-900 dark:text-[#F8F8F6] flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-[#3678B0] ring-2 ring-[#3678B0]/20 dark:ring-[#3678B0]/40 shadow-xs'
            : 'border-slate-200/90 dark:border-[#434142] hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#3678B0] transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#363435] rounded-2xl shadow-xl border border-slate-200/90 dark:border-[#434142] p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#2F6798]/10 dark:bg-[#132247] text-[#2F6798] dark:text-blue-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-[#132247]/60'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#2F6798] dark:text-blue-400 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AttendanceRosterHubProps {
  records: PhoneTimeRecord[];
  supervisorName: string;
  supervisorId?: string;
  supervisorRole?: string;
  supervisorPosition?: string;
  supervisor?: {
    name: string;
    id: string;
    role: string;
    position: string;
    avatarUrl?: string;
  };
  initialEmployee?: string | null;
}

export interface EmployeeShiftMeta {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
  account: string;
  trafficLight: 'GREEN' | 'YELLOW' | 'RED';
  status: 'working' | 'lunch' | 'break_1' | 'break_2' | 'offline';
  statusLabel: string;
  shiftStartMs: number | null;
  shiftEndMs: number | null;
  completedBreakSecs: number;
  completedLunchSecs: number;
  activeBreakStartMs: number | null;
  activeLunchStartMs: number | null;
  lastActive: string;
}

const createInitialMetas = (): EmployeeShiftMeta[] => {
  const now = Date.now();
  const t7h45m = now - (7 * 3600 + 45 * 60) * 1000;

  return [
    {
      id: 'emp-1597',
      name: 'Nissi-Jeh Reguero',
      employeeCode: '1597',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 4 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-1108',
      name: 'Raymundo Alasagas III',
      employeeCode: '1108',
      department: 'TQA',
      account: 'QUALITY',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 12 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-1772',
      name: 'Bianca Kaye Ernestine Colonia',
      employeeCode: '1772',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 15 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-2385',
      name: 'Michelle Yncierto',
      employeeCode: '2385',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 20 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-1035',
      name: 'Rommel Mendoza',
      employeeCode: '1035',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 8 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-1820',
      name: 'Ronelyn Baguio',
      employeeCode: '1820',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: now - (6 * 3600 + 34 * 60) * 1000,
      shiftEndMs: null,
      completedBreakSecs: 12.2 * 60,
      completedLunchSecs: 73.5 * 60,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 6 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-836',
      name: 'Krisland Pepito',
      employeeCode: '836',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 25 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-1006',
      name: 'Niño Elijah R. Reyes',
      employeeCode: '1006',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: now - (7 * 3600 + 13 * 60) * 1000,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 31.9 * 60,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 14 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-1880',
      name: 'Kier Ariola',
      employeeCode: '1880',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 18 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-946',
      name: 'Vincent Luis Celdran',
      employeeCode: '946',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 30 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-2298',
      name: 'Nina Joy Briones',
      employeeCode: '2298',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 22 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-1954',
      name: 'Matt Riner Balaba',
      employeeCode: '1954',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 45 * 60 * 1000).toLocaleString(),
    },
    {
      id: 'emp-2610',
      name: 'Maegan Marie Cabardo',
      employeeCode: '2610',
      department: 'TQA',
      account: 'TRAINING',
      trafficLight: 'GREEN',
      status: 'working',
      statusLabel: 'Active (Working)',
      shiftStartMs: t7h45m,
      shiftEndMs: null,
      completedBreakSecs: 15 * 60,
      completedLunchSecs: 0,
      activeBreakStartMs: null,
      activeLunchStartMs: null,
      lastActive: new Date(now - 11 * 60 * 1000).toLocaleString(),
    },
  ];
};

function assignShiftDay(date: Date): { year: number; month: number; day: number } {
  const h = date.getHours();
  const shiftDate = new Date(date);
  if (h < 9) {
    shiftDate.setDate(shiftDate.getDate() - 1);
  }
  return {
    year: shiftDate.getFullYear(),
    month: shiftDate.getMonth(), // 0-indexed
    day: shiftDate.getDate(),
  };
}

export default function AttendanceRosterHub({
  records,
  supervisorName,
  supervisorId,
  supervisorRole,
  supervisorPosition,
  supervisor,
  initialEmployee,
}: AttendanceRosterHubProps) {
  const isHeadOrAdmin = isHeadOrAdminUser(
    supervisor || { name: supervisorName, id: supervisorId, role: supervisorRole, position: supervisorPosition }
  );

  const [activeSubTab, setActiveSubTabState] = useState<'roster' | 'calendar' | 'hours' | 'details'>(
    initialEmployee ? 'calendar' : 'calendar'
  );

  useEffect(() => {
    if (initialEmployee) {
      setActiveSubTabState('calendar');
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('attendance_active_subtab');
        if (saved === 'roster' || saved === 'calendar' || saved === 'hours' || saved === 'details') {
          setActiveSubTabState(saved);
        }
      } catch (e) {}
    }
  }, [initialEmployee]);

  const setActiveSubTab = (tab: 'roster' | 'calendar' | 'hours' | 'details') => {
    setActiveSubTabState(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('attendance_active_subtab', tab);
      } catch (e) {}
    }
  };

  const [selectedCalendarEmployee, setSelectedCalendarEmployee] = useState<string>(
    initialEmployee || supervisorName || 'Nissi-Jeh Reguero'
  );

  // Selected date in Roster DatePicker (defaults to Sept 26, 2026 or current active date)
  const [filterDate, setFilterDate] = useState<Date | null>(new Date(2026, 8, 26));
  const [filterQuarter, setFilterQuarter] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');

  // Raw team roster data and punch logs from DB
  const [dbRoster, setDbRoster] = useState<any[]>([]);
  const [allPunchLogs, setAllPunchLogs] = useState<any[]>([]);
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>({});

  // Real-time second-by-second live clock ticker
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load manual attendance overrides from local storage
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

  // Fetch actual live roster and compute live punch metrics from time_tracker_logs
  const loadRosterFromDb = async () => {
    try {
      const [rosterRes, punchRes] = await Promise.all([
        fetch('/api/team-roster'),
        fetch('/api/punch-logs?empId=ALL'),
      ]);

      const [rosterJson, punchJson] = await Promise.all([
        rosterRes.json(),
        punchRes.json(),
      ]);

      if (rosterJson.success && Array.isArray(rosterJson.data) && rosterJson.data.length > 0) {
        setDbRoster(rosterJson.data);
      }
      if (punchJson.success && Array.isArray(punchJson.data)) {
        setAllPunchLogs(punchJson.data);
      }
      loadLocalOverrides();
    } catch (err) {
      console.error('Failed to load roster from database:', err);
    }
  };

  useEffect(() => {
    loadRosterFromDb();

    const handleSync = () => {
      loadRosterFromDb();
      loadLocalOverrides();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('punch-updated', handleSync);
      window.addEventListener('attendance-override-updated', handleSync);
    }

    const pollInterval = setInterval(() => {
      loadRosterFromDb();
    }, 4000);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('punch-updated', handleSync);
        window.removeEventListener('attendance-override-updated', handleSync);
      }
      clearInterval(pollInterval);
    };
  }, []);

  const sortWithCurrentUserFirst = (list: RosterEmployee[]) => {
    const sName = (supervisorName || supervisor?.name || '').toLowerCase().trim();
    const sId = supervisorId || supervisor?.id;
    const currentUserList: RosterEmployee[] = [];
    const otherList: RosterEmployee[] = [];

    list.forEach((emp) => {
      const rName = (emp.name || '').toLowerCase().trim();
      const nameMatch = Boolean(sName && (rName === sName || rName.includes(sName) || sName.includes(rName)));
      const idMatch = Boolean(sId && (emp.employeeCode === sId || emp.id === sId || emp.id === `emp-${sId}`));
      if (nameMatch || idMatch) {
        currentUserList.push(emp);
      } else {
        otherList.push(emp);
      }
    });

    return [...currentUserList, ...otherList];
  };

  // Derive dynamic roster employees list computed directly from punch logs & overrides for the target filterDate
  const employeesList = useMemo<RosterEmployee[]>(() => {
    const targetDate = filterDate || new Date();
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth(); // 0-indexed
    const targetDay = targetDate.getDate();

    const today = new Date();
    const isToday = (
      targetYear === today.getFullYear() &&
      targetMonth === today.getMonth() &&
      targetDay === today.getDate()
    );

    const baseMetas = createInitialMetas();
    const rosterSource = dbRoster.length > 0 ? dbRoster : baseMetas.map((b) => ({
      employee_id: b.employeeCode,
      name: b.name,
      department: b.department,
      account: b.account,
      traffic_light_status: b.trafficLight,
    }));

    const computed: RosterEmployee[] = rosterSource.map((r: any) => {
      const empCode = String(r.employee_id || r.id || r.employeeCode).trim();
      const empName = String(r.name || '').trim();
      const department = r.department || 'TQA';
      const account = r.account || 'TRAINING';
      const fallback = baseMetas.find((b) => b.employeeCode === empCode || b.id === `emp-${empCode}`) || baseMetas[0];

      // 1. Check manual attendance overrides for this employee and date
      const fullDateKey = `${empCode}-${targetYear}-${targetMonth}-${targetDay}`;
      const nameFullDateKey = `${empName}-${targetYear}-${targetMonth}-${targetDay}`;
      const legacyNameKey = `${empName}-${targetDay}`;
      const legacyCodeKey = `${empCode}-${targetDay}`;

      const manualOverride = 
        attendanceOverrides[fullDateKey] !== undefined ? attendanceOverrides[fullDateKey] :
        attendanceOverrides[nameFullDateKey] !== undefined ? attendanceOverrides[nameFullDateKey] :
        (targetYear === 2026 && targetMonth === 8 && (attendanceOverrides[legacyNameKey] !== undefined || attendanceOverrides[legacyCodeKey] !== undefined))
          ? (attendanceOverrides[legacyNameKey] || attendanceOverrides[legacyCodeKey])
          : undefined;

      // 2. Filter punch logs belonging to this employee and target shift date
      const empLogs = allPunchLogs.filter((l) => {
        const lCode = String(l.employee_id || l.empId || '').trim();
        const codeMatch = lCode === empCode || (empCode.length >= 3 && lCode.includes(empCode));
        return codeMatch;
      });

      const dayShiftLogs = empLogs.filter((log) => {
        const rawTs = log.parsedDate || log.timestamp || log.TIMESTAMP;
        if (!rawTs) return false;
        const d = new Date(rawTs);
        if (isNaN(d.getTime())) return false;
        const shift = assignShiftDay(d);
        return shift.year === targetYear && shift.month === targetMonth && shift.day === targetDay;
      });

      // Sort logs chronologically
      dayShiftLogs.sort((a, b) => {
        const da = new Date(a.parsedDate || a.timestamp || a.TIMESTAMP).getTime();
        const db = new Date(b.parsedDate || b.timestamp || b.TIMESTAMP).getTime();
        return da - db;
      });

      // If manual leave/rest day override exists
      if (manualOverride && manualOverride !== 'Clear' && manualOverride !== 'None') {
        const isLeave = ['Vacation Leave', 'Sick Leave', 'Bereavement Leave', 'Maternity Leave', 'Paternity Leave', 'Holiday', 'VL', 'SL', 'BL', 'ML', 'PL', 'HOL'].includes(manualOverride);
        const isOff = ['Absent', 'A', 'Rest Day', 'RD', 'Suspension', 'SUS'].includes(manualOverride);
        
        if (isLeave || isOff) {
          const totalHoursWorked = isLeave ? 8.00 : 0.00;
          return {
            id: `emp-${empCode}`,
            name: empName,
            employeeCode: empCode,
            status: 'offline',
            statusLabel: manualOverride,
            totalHoursWorked,
            totalHoursFormatted: `${totalHoursWorked.toFixed(2)} hrs`,
            timeElapsed: '0h 00m 00s',
            totalBreakMinutes: 0,
            totalLunchMinutes: 0,
            lastActive: `Scheduled ${manualOverride}`,
            trafficLight: manualOverride === 'Absent' || manualOverride === 'A' ? 'RED' : 'GREEN',
            department,
            account,
          };
        }
      }

      // Compute from actual shift punch logs
      let shiftStartMs: number | null = null;
      let shiftEndMs: number | null = null;
      let completedBreakSecs = 0;
      let completedLunchSecs = 0;
      let pendingBreakStart: number | null = null;
      let pendingLunchStart: number | null = null;
      let status: 'working' | 'lunch' | 'break_1' | 'break_2' | 'offline' = 'working';
      let statusLabel = 'Active (Working)';
      let trafficLight: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
      let lastActive = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (dayShiftLogs.length > 0) {
        const lastLog = dayShiftLogs[dayShiftLogs.length - 1];
        lastActive = lastLog.timestamp || lastLog.TIMESTAMP || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        for (const log of dayShiftLogs) {
          const pType = (log.type || log.punch_type || '').toLowerCase().trim();
          const pStatus = (log.status || '').toLowerCase().trim();
          const ts = new Date(log.parsedDate || log.timestamp || log.TIMESTAMP).getTime();
          if (isNaN(ts)) continue;

          if (pStatus.includes('late')) trafficLight = 'YELLOW';
          if (pStatus.includes('undertime')) trafficLight = 'YELLOW';

          if (pType.includes('shift start') || pType.includes('start shift')) {
            shiftStartMs = ts;
            status = 'working';
            statusLabel = 'Active (Working)';
            shiftEndMs = null;
          } else if (pType.includes('break 1 start') || pType.includes('start break 1') || pType === 'start break') {
            pendingBreakStart = ts;
            status = 'break_1';
            statusLabel = 'On Break 1';
            if (!shiftStartMs) shiftStartMs = ts;
          } else if (pType.includes('break 1 end') || pType.includes('end break 1') || pType === 'end break') {
            if (pendingBreakStart) {
              completedBreakSecs += Math.max(0, Math.floor((ts - pendingBreakStart) / 1000));
              pendingBreakStart = null;
            } else {
              const durNum = parseFloat(log.duration);
              completedBreakSecs += !isNaN(durNum) && durNum > 0 ? Math.round(durNum * 60) : 15 * 60;
            }
            status = 'working';
            statusLabel = 'Active (Working)';
          } else if (pType.includes('start lunch') || pType.includes('lunch start') || pType === 'lunch') {
            pendingLunchStart = ts;
            status = 'lunch';
            statusLabel = 'On Lunch';
            if (!shiftStartMs) shiftStartMs = ts;
          } else if (pType.includes('end lunch') || pType.includes('lunch end')) {
            if (pendingLunchStart) {
              completedLunchSecs += Math.max(0, Math.floor((ts - pendingLunchStart) / 1000));
              pendingLunchStart = null;
            } else {
              const durNum = parseFloat(log.duration);
              completedLunchSecs += !isNaN(durNum) && durNum > 0 ? Math.round(durNum * 60) : 60 * 60;
            }
            status = 'working';
            statusLabel = 'Active (Working)';
          } else if (pType.includes('break 2 start') || pType.includes('start break 2')) {
            pendingBreakStart = ts;
            status = 'break_2';
            statusLabel = 'On Break 2';
            if (!shiftStartMs) shiftStartMs = ts;
          } else if (pType.includes('break 2 end') || pType.includes('end break 2')) {
            if (pendingBreakStart) {
              completedBreakSecs += Math.max(0, Math.floor((ts - pendingBreakStart) / 1000));
              pendingBreakStart = null;
            } else {
              const durNum = parseFloat(log.duration);
              completedBreakSecs += !isNaN(durNum) && durNum > 0 ? Math.round(durNum * 60) : 15 * 60;
            }
            status = 'working';
            statusLabel = 'Active (Working)';
          } else if (pType.includes('shift end') || pType.includes('end shift')) {
            shiftEndMs = ts;
            status = 'offline';
            statusLabel = 'Shift Ended';
            pendingBreakStart = null;
            pendingLunchStart = null;
          }
        }
      }

      // Calculate durations
      let shiftElapsedSecs = 0;
      let breakSecs = completedBreakSecs;
      let lunchSecs = completedLunchSecs;

      if (isToday) {
        // Today's live tracking
        if (!shiftStartMs && fallback && fallback.shiftStartMs) {
          shiftStartMs = fallback.shiftStartMs;
          breakSecs = fallback.completedBreakSecs;
          lunchSecs = fallback.completedLunchSecs;
          status = fallback.status;
          statusLabel = fallback.statusLabel;
        }

        if (shiftStartMs) {
          if (status === 'offline' && shiftEndMs) {
            shiftElapsedSecs = Math.max(0, Math.floor((shiftEndMs - shiftStartMs) / 1000));
          } else {
            shiftElapsedSecs = Math.max(0, Math.floor((currentTimeMs - shiftStartMs) / 1000));
            if (pendingBreakStart) {
              breakSecs += Math.max(0, Math.floor((currentTimeMs - pendingBreakStart) / 1000));
            }
            if (pendingLunchStart) {
              lunchSecs += Math.max(0, Math.floor((currentTimeMs - pendingLunchStart) / 1000));
            }
          }
        }
      } else {
        // Past / specified date calculations
        if (dayShiftLogs.length > 0) {
          status = 'offline';
          statusLabel = manualOverride || 'Shift Ended';
          const firstTs = new Date(dayShiftLogs[0].parsedDate || dayShiftLogs[0].timestamp || dayShiftLogs[0].TIMESTAMP).getTime();
          const lastTs = new Date(dayShiftLogs[dayShiftLogs.length - 1].parsedDate || dayShiftLogs[dayShiftLogs.length - 1].timestamp || dayShiftLogs[dayShiftLogs.length - 1].TIMESTAMP).getTime();
          const startMs = shiftStartMs || firstTs;
          const endMs = shiftEndMs || lastTs;

          if (endMs > startMs) {
            shiftElapsedSecs = Math.floor((endMs - startMs) / 1000);
          } else {
            // Default 8-hour shift if single punch recorded
            shiftElapsedSecs = 8 * 3600;
          }
        } else {
          // No punches on this past date
          const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
          status = 'offline';
          statusLabel = isWeekend ? 'Rest Day' : 'Absent';
          trafficLight = isWeekend ? 'GREEN' : 'RED';
          shiftElapsedSecs = 0;
          breakSecs = 0;
          lunchSecs = 0;
        }
      }

      const totalBreakMinutes = Math.round((breakSecs / 60) * 10) / 10;
      const totalLunchMinutes = Math.round((lunchSecs / 60) * 10) / 10;
      const netWorkedSecs = Math.max(0, shiftElapsedSecs - breakSecs - lunchSecs);
      const totalHoursWorked = Math.round((netWorkedSecs / 3600) * 100) / 100;
      const totalHoursFormatted = `${totalHoursWorked.toFixed(2)} hrs`;

      const wholeHours = Math.floor(shiftElapsedSecs / 3600);
      const mins = Math.floor((shiftElapsedSecs % 3600) / 60);
      const secs = shiftElapsedSecs % 60;
      const timeElapsed = `${wholeHours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;

      return {
        id: `emp-${empCode}`,
        name: empName,
        employeeCode: empCode,
        status,
        statusLabel,
        totalHoursWorked,
        totalHoursFormatted,
        timeElapsed,
        totalBreakMinutes,
        totalLunchMinutes,
        lastActive,
        trafficLight,
        department,
        account,
      };
    });

    if (!isHeadOrAdmin) {
      const sName = (supervisorName || supervisor?.name || '').toLowerCase().trim();
      const sId = supervisorId || supervisor?.id;
      const filtered = computed.filter((r) => {
        const rName = (r.name || '').toLowerCase().trim();
        return (sName && (rName === sName || rName.includes(sName) || sName.includes(rName))) || (sId && r.employeeCode === sId);
      });
      return sortWithCurrentUserFirst(filtered.length > 0 ? filtered : computed.slice(0, 1));
    }

    return sortWithCurrentUserFirst(computed);
  }, [dbRoster, allPunchLogs, attendanceOverrides, filterDate, currentTimeMs, isHeadOrAdmin, supervisorName, supervisorId, supervisor]);

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-22');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [endShiftTarget, setEndShiftTarget] = useState<RosterEmployee | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setToastMsg('Roster data refreshed and synchronized from database!');
    loadRosterFromDb();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  const handleViewCalendar = (employee: RosterEmployee) => {
    setSelectedCalendarEmployee(employee.name);
    setActiveSubTab('calendar');
  };

  const handleConfirmEndShift = async (empId: string) => {
    try {
      const targetEmp = employeesList.find((e) => e.id === empId || e.employeeCode === empId);
      if (targetEmp) {
        await fetch('/api/punch-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empId: targetEmp.employeeCode,
            type: 'Shift End',
            status: 'On Time',
            duration: 'N/A',
            timestamp: new Date().toLocaleString(),
          }),
        });
      }
      loadRosterFromDb();
      setToastMsg('Employee shift successfully ended.');
    } catch (err) {
      console.error('Failed to end shift:', err);
    }
    setTimeout(() => setToastMsg(null), 2500);
  };

  // KPI calculations for Roster
  const totalEmployees = employeesList.length;
  const activeCount = employeesList.filter((e) => e.status === 'working').length;
  const onBreakCount = employeesList.filter((e) => e.status === 'break_1' || e.status === 'break_2' || e.status === 'break').length;
  const onLunchCount = employeesList.filter((e) => e.status === 'lunch').length;
  const lateArrivalsCount = employeesList.filter((e) => e.trafficLight === 'YELLOW' || e.trafficLight === 'RED').length;
  const undertimeCount = employeesList.filter((e) => e.totalHoursWorked < 4 && e.status !== 'working').length;

  return (
    <div className="space-y-4 animate-in fade-in relative">
      
      {/* 1. Header with Badge Only (Title removed) & Functional Refresh Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
            TEAM ROSTER
          </span>
        </div>

        {/* Functional Top Refresh Button */}
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-98"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2F6798]' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. 6 Status KPI Boxes (More circle corners rounded-2xl, background image consuming whole box) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-1 mb-5">
        
        {/* 1. Total Employees */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase">
              TOTAL EMPLOYEES
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8F8F6] tracking-tight mt-0.5">
              {totalEmployees}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-blue-50 dark:bg-[#272626] text-[#3678B0] dark:text-[#3678B0] border border-blue-100 dark:border-[#434142] flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 2. Active */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase">
              ACTIVE
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#059669] dark:text-emerald-400 tracking-tight mt-0.5">
              {activeCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-emerald-50 dark:bg-[#272626] text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-[#434142] flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 3. On Break */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase">
              ON BREAK
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#D97706] dark:text-amber-400 tracking-tight mt-0.5">
              {onBreakCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-amber-50 dark:bg-[#272626] text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-[#434142] flex items-center justify-center shrink-0 shadow-2xs">
            <Coffee className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 4. On Lunch */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase">
              ON LUNCH
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#9333EA] dark:text-purple-400 tracking-tight mt-0.5">
              {onLunchCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-purple-50 dark:bg-[#272626] text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-[#434142] flex items-center justify-center shrink-0 shadow-2xs">
            <Utensils className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 5. Late Arrivals */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase">
              LATE ARRIVALS
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#DC2626] dark:text-rose-400 tracking-tight mt-0.5">
              {lateArrivalsCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-rose-50 dark:bg-[#272626] text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-[#434142] flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 6. Undertime */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase">
              UNDERTIME
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#EA580C] dark:text-amber-400 tracking-tight mt-0.5">
              {undertimeCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-orange-50 dark:bg-[#272626] text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-[#434142] flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

      </div>

      {/* 3. ONE Unified External White Container for Filters, Tabs & Content */}
      <div className="rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs overflow-visible">
        
        {/* Row A: Top Filters Bar (4 filters: 2 + 2 + 3 + 5 = 12 cols) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#434142]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 items-end">
            
            {/* Quarter Filter (Span 2) */}
            <div className="md:col-span-2">
              <FilterDropdown
                label="QUARTER"
                icon={<Calendar className="w-3.5 h-3.5 text-[#3678B0]" />}
                value={filterQuarter}
                onChange={setFilterQuarter}
                options={[
                  { label: 'All Quarters', value: 'all' },
                  { label: 'Q1', value: 'q1' },
                  { label: 'Q2', value: 'q2' },
                  { label: 'Q3', value: 'q3' },
                  { label: 'Q4', value: 'q4' },
                ]}
              />
            </div>

            {/* Month Filter (Span 2) */}
            <div className="md:col-span-2">
              <FilterDropdown
                label="MONTH"
                icon={<Calendar className="w-3.5 h-3.5 text-[#3678B0]" />}
                value={filterMonth}
                onChange={setFilterMonth}
                options={[
                  { label: 'All Months', value: 'all' },
                  { label: 'September 2026', value: '9' },
                  { label: 'August 2026', value: '8' },
                  { label: 'July 2026', value: '7' },
                  { label: 'June 2026', value: '6' },
                ]}
              />
            </div>

            {/* Client Account Filter (Span 3) */}
            <div className="md:col-span-3">
              <FilterDropdown
                label="CLIENT ACCOUNT"
                icon={<Building2 className="w-3.5 h-3.5 text-[#3678B0]" />}
                value={filterAccount}
                onChange={setFilterAccount}
                options={[
                  { label: 'All Client Accounts', value: 'all' },
                  { label: 'Corporate', value: 'Corporate' },
                  { label: 'DFT', value: 'DFT' },
                  { label: 'Care', value: 'Care' },
                  { label: 'Billing', value: 'Billing' },
                ]}
              />
            </div>

            {/* Search Employee / Trainee (Span 5) */}
            <div className="md:col-span-5">
              <label className="block text-[10px] font-extrabold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
                <Search className="w-3.5 h-3.5 text-[#3678B0]" />
                <span>SEARCH EMPLOYEE / TRAINEE</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type name, role, or ID..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#272626] border border-slate-200 dark:border-[#434142] text-xs font-medium text-slate-800 dark:text-[#F8F8F6] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3678B0]/20 focus:border-[#3678B0]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Row B: Sub-Navigation Tabs Placed BELOW the Filters with Date Picker exclusively on Roster Tab */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/60 dark:bg-[#272626]/60 border-b border-slate-100 dark:border-[#434142] flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Tab Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Tab 1: Roster */}
            <button
              type="button"
              onClick={() => setActiveSubTab('roster')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'roster'
                  ? 'bg-[#3678B0] text-white shadow-xs'
                  : 'bg-white dark:bg-[#363435] text-slate-700 dark:text-[#F8F8F6] hover:bg-slate-100 dark:hover:bg-[#2C2A2B] border border-slate-200 dark:border-[#434142]'
              }`}
            >
              Roster
            </button>

            {/* Tab 2: Attendance Calendar */}
            <button
              type="button"
              onClick={() => setActiveSubTab('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'calendar'
                  ? 'bg-[#2F6798] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1A38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132247] border border-slate-200 dark:border-[#1E2E4E]'
              }`}
            >
              Attendance Calendar
            </button>

            {/* Tab 3: Hours Report */}
            <button
              type="button"
              onClick={() => setActiveSubTab('hours')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'hours'
                  ? 'bg-[#2F6798] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0E1A38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132247] border border-slate-200 dark:border-[#1E2E4E]'
              }`}
            >
              Hours Report
            </button>

            {/* Tab 4: Employee Details */}
            <button
              type="button"
              onClick={() => setActiveSubTab('details')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'details'
                  ? 'bg-[#2F6798] text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1A38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132247] border border-slate-200 dark:border-[#1E2E4E]'
              }`}
            >
              Employee Details
            </button>
          </div>

          {/* Right: Date Picker ONLY visible when on Roster tab (activeSubTab === 'roster') */}
          {activeSubTab === 'roster' && (
            <div className="flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
              <DatePickerPopover
                selectedDate={filterDate}
                onSelectDate={(d) => setFilterDate(d)}
                format="date"
                showArrows
                align="right"
              />
            </div>
          )}

        </div>

        {/* Row C: Active Tab Content */}
        {activeSubTab === 'roster' && (
          <RosterTable
            employees={employeesList}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            activeStatusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onViewCalendar={handleViewCalendar}
            onEndShift={(emp) => setEndShiftTarget(emp)}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterQuarter={filterQuarter}
            filterMonth={filterMonth}
            filterAccount={filterAccount}
            onToast={(msg) => {
              setToastMsg(msg);
              setTimeout(() => setToastMsg(null), 2500);
            }}
            onRefresh={handleRefresh}
            currentUserName={supervisorName || supervisor?.name}
            currentUserId={supervisorId || supervisor?.id}
          />
        )}

        {activeSubTab === 'calendar' && (
          <div className="p-4 sm:p-5 animate-in fade-in">
            <AttendanceCalendarTab
              records={records}
              onBackToRoster={() => setActiveSubTab('roster')}
              searchFilter={searchTerm}
              isHeadOrAdmin={isHeadOrAdmin}
              supervisorName={supervisorName}
              supervisorId={supervisorId}
            />
          </div>
        )}

        {activeSubTab === 'hours' && (
          <div className="p-4 sm:p-5 animate-in fade-in">
            <HoursReportTab
              employees={employeesList}
              searchTerm={searchTerm}
              filterAccount={filterAccount}
              onBackToRoster={() => setActiveSubTab('roster')}
              isHeadOrAdmin={isHeadOrAdmin}
              supervisorName={supervisorName}
            />
          </div>
        )}

        {activeSubTab === 'details' && (
          <div className="p-4 sm:p-5 animate-in fade-in">
            <EmployeeDetailsTab
              employees={employeesList}
              onViewCalendar={handleViewCalendar}
              searchTerm={searchTerm}
              filterAccount={filterAccount}
              isHeadOrAdmin={isHeadOrAdmin}
              supervisorName={supervisorName}
            />
          </div>
        )}

      </div>

      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl text-xs font-bold border border-slate-700/50 dark:border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* End Shift Modal Dialog */}
      <EndShiftModal
        isOpen={!!endShiftTarget}
        onClose={() => setEndShiftTarget(null)}
        employee={endShiftTarget}
        onConfirmEndShift={handleConfirmEndShift}
      />

    </div>
  );
}
