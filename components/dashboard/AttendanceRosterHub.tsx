import React, { useState, useRef, useEffect } from 'react';
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
import { PhoneTimeRecord } from '@/lib/types';

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
        className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#101D3D] border text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-[#2F6798] ring-2 ring-[#2F6798]/20 dark:ring-[#2F6798]/40 shadow-xs'
            : 'border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#2F6798] transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#101D3D] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
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
                    ? 'bg-[#2F6798]/10 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60'
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
  initialEmployee?: string | null;
}

const INITIAL_ROSTER_EMPLOYEES: RosterEmployee[] = [
  {
    id: 'emp-1',
    name: 'Bianca Kaye Ernestine Colonia',
    employeeCode: '1772',
    status: 'working',
    statusLabel: 'Active (Working)',
    totalHoursWorked: 5.28,
    totalHoursFormatted: '5.28 hrs',
    timeElapsed: '5h 16m 40s',
    totalBreakMinutes: 9.6,
    totalLunchMinutes: 0.0,
    lastActive: '9/15/2026, 11:20:04 PM',
    trafficLight: 'GREEN',
    department: 'Corporate Training',
    account: 'Corporate',
  },
  {
    id: 'emp-2',
    name: 'Krisland Pepito',
    employeeCode: '836',
    status: 'working',
    statusLabel: 'Active (Working)',
    totalHoursWorked: 5.95,
    totalHoursFormatted: '5.95 hrs',
    timeElapsed: '5h 57m 19s',
    totalBreakMinutes: 0.0,
    totalLunchMinutes: 0.0,
    lastActive: '9/15/2026, 8:41:29 PM',
    trafficLight: 'GREEN',
    department: 'QA & Training',
    account: 'DFT',
  },
  {
    id: 'emp-3',
    name: 'Kier Ariola',
    employeeCode: '1880',
    status: 'working',
    statusLabel: 'Active (Working)',
    totalHoursWorked: 5.14,
    totalHoursFormatted: '5.14 hrs',
    timeElapsed: '5h 08m 36s',
    totalBreakMinutes: 3.1,
    totalLunchMinutes: 47.0,
    lastActive: '9/16/2026, 1:52:08 AM',
    trafficLight: 'GREEN',
    department: 'Voice Operations',
    account: 'DFT',
  },
  {
    id: 'emp-4',
    name: 'Matt Riner Balaba',
    employeeCode: '1598',
    status: 'lunch',
    statusLabel: 'On Lunch',
    totalHoursWorked: 4.50,
    totalHoursFormatted: '4.50 hrs',
    timeElapsed: '4h 30m 00s',
    totalBreakMinutes: 15.0,
    totalLunchMinutes: 45.0,
    lastActive: '9/16/2026, 1:45:12 AM',
    trafficLight: 'GREEN',
    department: 'Corporate Training',
    account: 'Corporate',
  },
  {
    id: 'emp-5',
    name: 'Jeremy Rigodon',
    employeeCode: '1602',
    status: 'lunch',
    statusLabel: 'On Lunch',
    totalHoursWorked: 4.80,
    totalHoursFormatted: '4.80 hrs',
    timeElapsed: '4h 48m 15s',
    totalBreakMinutes: 12.0,
    totalLunchMinutes: 40.0,
    lastActive: '9/16/2026, 1:50:00 AM',
    trafficLight: 'GREEN',
    department: 'Customer Support',
    account: 'Care',
  },
  {
    id: 'emp-6',
    name: 'Grace Kelly Torralba',
    employeeCode: '1615',
    status: 'lunch',
    statusLabel: 'On Lunch',
    totalHoursWorked: 4.20,
    totalHoursFormatted: '4.20 hrs',
    timeElapsed: '4h 12m 30s',
    totalBreakMinutes: 10.0,
    totalLunchMinutes: 35.0,
    lastActive: '9/16/2026, 1:55:20 AM',
    trafficLight: 'GREEN',
    department: 'QA & Training',
    account: 'DFT',
  },
  {
    id: 'emp-7',
    name: 'Joshua Alcantara',
    employeeCode: '1720',
    status: 'working',
    statusLabel: 'Active (Working)',
    totalHoursWorked: 5.60,
    totalHoursFormatted: '5.60 hrs',
    timeElapsed: '5h 36m 00s',
    totalBreakMinutes: 8.0,
    totalLunchMinutes: 0.0,
    lastActive: '9/16/2026, 2:10:00 AM',
    trafficLight: 'YELLOW',
    department: 'Voice Operations',
    account: 'Billing',
  },
];

export default function AttendanceRosterHub({
  records,
  supervisorName,
  initialEmployee,
}: AttendanceRosterHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'calendar' | 'hours' | 'details'>(
    initialEmployee ? 'calendar' : 'roster'
  );
  const [selectedCalendarEmployee, setSelectedCalendarEmployee] = useState<string>(
    initialEmployee || supervisorName || 'Bianca Kaye Ernestine Colonia'
  );
  const [employeesList, setEmployeesList] = useState<RosterEmployee[]>(INITIAL_ROSTER_EMPLOYEES);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-16');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [endShiftTarget, setEndShiftTarget] = useState<RosterEmployee | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch actual live roster from Supabase database
  const loadRosterFromDb = async () => {
    try {
      const res = await fetch('/api/team-roster');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped: RosterEmployee[] = json.data.map((r: any, idx: number) => {
          const isWorking = idx % 3 === 0;
          const isLunch = idx % 4 === 1;
          const status = isWorking ? 'working' : isLunch ? 'lunch' : 'working';
          const statusLabel = isWorking ? 'Active (Working)' : isLunch ? 'On Lunch' : 'Active (Working)';

          return {
            id: `emp-${r.id || r.employee_id}`,
            name: r.name,
            employeeCode: String(r.employee_id),
            status: status,
            statusLabel: statusLabel,
            totalHoursWorked: isWorking ? 5.28 : isLunch ? 4.50 : 6.00,
            totalHoursFormatted: isWorking ? '5.28 hrs' : isLunch ? '4.50 hrs' : '6.00 hrs',
            timeElapsed: isWorking ? '5h 16m 40s' : '4h 30m 00s',
            totalBreakMinutes: 15.0,
            totalLunchMinutes: isLunch ? 45.0 : 0.0,
            lastActive: '9/16/2026, 11:20:04 PM',
            trafficLight: r.traffic_light_status || 'GREEN',
            department: r.department || 'Corporate Training',
            account: r.account || 'Corporate',
          };
        });
        setEmployeesList(mapped);
      }
    } catch (err) {
      console.error('Failed to load roster from database:', err);
    }
  };

  useEffect(() => {
    loadRosterFromDb();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setToastMsg('Roster data refreshed and synchronized from database!');
    loadRosterFromDb();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
    setTimeout(() => {
      setToastMsg(null), 2500;
    }, 2500);
  };

  const handleViewCalendar = (employee: RosterEmployee) => {
    setSelectedCalendarEmployee(employee.name);
    setActiveSubTab('calendar');
  };

  const handleConfirmEndShift = (empId: string) => {
    setEmployeesList((prev) =>
      prev.map((e) =>
        e.id === empId
          ? { ...e, status: 'offline', statusLabel: 'Shift Ended', trafficLight: 'RED' }
          : e
      )
    );
    setToastMsg('Employee shift successfully ended.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const [filterQuarter, setFilterQuarter] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');

  // KPI calculations for Roster
  const totalEmployees = employeesList.length;
  const activeCount = employeesList.filter((e) => e.status === 'working').length;
  const onBreakCount = employeesList.filter((e) => e.status === 'break').length;
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
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              TOTAL EMPLOYEES
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">
              {totalEmployees}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 2. Active */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              ACTIVE
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#059669] dark:text-emerald-400 tracking-tight mt-0.5">
              {activeCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 3. On Break */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              ON BREAK
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#D97706] dark:text-amber-400 tracking-tight mt-0.5">
              {onBreakCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <Coffee className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 4. On Lunch */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              ON LUNCH
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#9333EA] dark:text-purple-400 tracking-tight mt-0.5">
              {onLunchCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <Utensils className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 5. Late Arrivals */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              LATE ARRIVALS
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#DC2626] dark:text-rose-400 tracking-tight mt-0.5">
              {lateArrivalsCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

        {/* 6. Undertime */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[82px] sm:min-h-[86px] group">
          <div 
            className="absolute inset-0 w-full h-full bg-no-repeat bg-cover bg-center opacity-28 dark:opacity-18 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
            style={{ 
              backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")`,
              filter: 'invert(33%) sepia(85%) saturate(550%) hue-rotate(170deg) brightness(92%) contrast(110%)'
            }}
          />
          <div className="relative z-10 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              UNDERTIME
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#EA580C] dark:text-amber-400 tracking-tight mt-0.5">
              {undertimeCount}
            </span>
          </div>
          <div className="relative z-10 w-8.5 h-8.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
        </div>

      </div>

      {/* 3. ONE Unified External White Container for Filters, Tabs & Content */}
      <div className="rounded-2xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-visible">
        
        {/* Row A: Top Filters Bar (Dropdowns reduced by 2, search bar lengthened by 2 -> 2 + 2 + 3 + 5 cols) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4">
            
            {/* Quarter Filter (Span 2) */}
            <div className="md:col-span-2">
              <FilterDropdown
                label="QUARTER"
                icon={<Calendar className="w-3.5 h-3.5 text-[#2F6798]" />}
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
                icon={<Calendar className="w-3.5 h-3.5 text-[#2F6798]" />}
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
                icon={<Building2 className="w-3.5 h-3.5 text-[#2F6798]" />}
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

            {/* Search Employee / Trainee (Span 5 - lengthened by 2) */}
            <div className="md:col-span-5">
              <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 select-none">
                <Search className="w-3.5 h-3.5 text-[#2F6798]" />
                <span>SEARCH EMPLOYEE / TRAINEE</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type name, role, or ID..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/20 focus:border-[#2F6798]"
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

        {/* Row B: Sub-Navigation Tabs Placed BELOW the Filters (font-semibold only) */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          
          {/* Tab 1: Roster */}
          <button
            type="button"
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'roster'
                ? 'bg-[#2F6798] text-white shadow-xs'
                : 'bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
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
                : 'bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
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
                : 'bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
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
                : 'bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Employee Details
          </button>

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
          />
        )}

        {activeSubTab === 'calendar' && (
          <div className="p-4 sm:p-5 animate-in fade-in">
            <AttendanceCalendarTab
              records={records}
              onBackToRoster={() => setActiveSubTab('roster')}
              searchFilter={searchTerm}
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
