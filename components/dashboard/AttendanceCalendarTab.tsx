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
import { PhoneTimeRecord } from '@/lib/types';

interface AttendanceCalendarTabProps {
  records?: PhoneTimeRecord[];
  onBackToRoster?: () => void;
}

type AttendanceStatus = 'P' | 'L' | 'U' | 'A' | 'RD' | null;

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
}: AttendanceCalendarTabProps) {
  const [viewFormat, setViewFormat] = useState<'matrix' | 'google-calendar'>('matrix');
  const [rangeView, setRangeView] = useState<RangeViewOption>('all_30');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8); // September (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedIndividualEmployee, setSelectedIndividualEmployee] = useState<string>('Nissi-Jeh Reguero');

  // Detail Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalDayNumber, setModalDayNumber] = useState(16);
  const [modalDayName, setModalDayName] = useState('Wednesday');
  const [modalSelectedEmployeeName, setModalSelectedEmployeeName] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeDayNumber = 16;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Open Day Summary or Employee Detail Modal
  const handleOpenDayModal = (dayNum: number, employeeName?: string) => {
    const dayIndex = (dayNum - 1) % FULL_DAY_NAMES.length;
    const fullDayName = FULL_DAY_NAMES[dayIndex] || 'Wednesday';
    setModalDayNumber(dayNum);
    setModalDayName(fullDayName);
    setModalSelectedEmployeeName(employeeName || null);
    setIsDetailModalOpen(true);
  };

  // Team members status list for the active modal day
  const teamMembersForModalDay = useMemo<TeamMemberDayStatus[]>(() => {
    return TEAM_ATTENDANCE_DATA.map((emp) => {
      const status = emp.attendanceByDay[modalDayNumber] || null;
      let hoursWorked = 8.0;
      if (status === 'L') hoursWorked = 7.25;
      else if (status === 'U') hoursWorked = 5.14;
      else if (status === 'A' || status === 'RD') hoursWorked = 0.0;

      return {
        id: emp.id,
        name: emp.name,
        position: emp.position,
        startDate: emp.startDate,
        status,
        hoursWorked,
        breakMins: status === 'A' || status === 'RD' ? 0 : 15,
        lunchMins: status === 'A' || status === 'RD' ? 0 : 60,
        shiftSchedule: '9:00 PM – 6:00 AM',
      };
    });
  }, [modalDayNumber]);

  // Determine active days slice based on rangeView
  const displayedDays = useMemo(() => {
    if (rangeView === 'period_1') {
      return Array.from({ length: 15 }, (_, i) => i + 1); // Days 1 - 15
    }
    if (rangeView === 'period_2') {
      return Array.from({ length: 15 }, (_, i) => i + 16); // Days 16 - 30
    }
    if (rangeView === 'current_week') {
      return [14, 15, 16, 17, 18, 19, 20]; // Current Week around Sep 16
    }
    return Array.from({ length: 30 }, (_, i) => i + 1); // Full Month (1 - 30)
  }, [rangeView]);

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

  // Scroll to active day
  const handleJumpToToday = () => {
    setRangeView('all_30');
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const todayHeader = scrollContainerRef.current.querySelector('[data-today-header="true"]');
        if (todayHeader) {
          todayHeader.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, 100);
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return TEAM_ATTENDANCE_DATA.filter((emp) => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (selectedStatusFilter === 'P') return Object.values(emp.attendanceByDay).includes('P');
      if (selectedStatusFilter === 'L') return Object.values(emp.attendanceByDay).includes('L');
      if (selectedStatusFilter === 'U') return Object.values(emp.attendanceByDay).includes('U');
      if (selectedStatusFilter === 'A') return Object.values(emp.attendanceByDay).includes('A');
      if (selectedStatusFilter === 'RD') return Object.values(emp.attendanceByDay).includes('RD');

      return true;
    });
  }, [searchQuery, selectedStatusFilter]);

  // Status Styling Helper
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'P':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#d1fae5] text-[#065f46] dark:bg-emerald-950/70 dark:text-emerald-300 font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            P
          </span>
        );
      case 'L':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#fef3c7] text-[#92400e] dark:bg-amber-950/70 dark:text-amber-300 font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            L
          </span>
        );
      case 'U':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#ffedd5] text-[#9a3412] dark:bg-orange-950/70 dark:text-orange-300 font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            U
          </span>
        );
      case 'A':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#ffe4e6] text-[#9f1239] dark:bg-rose-950/70 dark:text-rose-300 font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            A
          </span>
        );
      case 'RD':
        return (
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow-2xs">
            RD
          </span>
        );
      default:
        return (
          <span className="w-5 h-5 text-slate-300 dark:text-slate-700 flex items-center justify-center text-xs">
            -
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* Unified White Container for Controls & Matrix Table */}
      {viewFormat === 'matrix' ? (
        <div className="bg-white dark:bg-[#0E1B38] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Controls Area */}
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* Top Header Row: Title & Action Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">
                  Attendance Calendar (All Employees)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monthly presence, tardiness, and rest day distribution across the workforce
                </p>
              </div>

              {/* Month Switcher Controls & View Mode */}
              <div className="flex items-center gap-2.5 flex-wrap justify-end">
                
                {/* View Format Toggle (Matrix vs Calendar) */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setViewFormat('matrix')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewFormat === 'matrix'
                        ? 'bg-[#2F6798] text-white shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                        ? 'bg-[#2F6798] text-white shadow-xs font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Calendar View</span>
                  </button>
                </div>

                {/* Month Navigator with Blue Accents */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    Prev
                  </button>

                  <span className="font-black text-slate-900 dark:text-slate-100 px-2 text-xs sm:text-sm">
                    {monthNames[currentMonthIndex]} {currentYear}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>

              </div>

            </div>

            {/* Range Switcher Row */}
            <div className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-[#070D1E] border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Range Toggle Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mr-1 shrink-0">
                  Date Range:
                </span>
                
                <button
                  type="button"
                  onClick={() => setRangeView('all_30')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    rangeView === 'all_30'
                      ? 'bg-[#2F6798] text-white shadow-xs font-black'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Full Month (1–30)
                </button>

                <button
                  type="button"
                  onClick={() => setRangeView('period_1')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    rangeView === 'period_1'
                      ? 'bg-[#2F6798] text-white shadow-xs font-black'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  1st Pay Period (1–15)
                </button>

                <button
                  type="button"
                  onClick={() => setRangeView('period_2')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    rangeView === 'period_2'
                      ? 'bg-[#2F6798] text-white shadow-xs font-black'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  2nd Pay Period (16–30)
                </button>

                <button
                  type="button"
                  onClick={() => setRangeView('current_week')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    rangeView === 'current_week'
                      ? 'bg-[#2F6798] text-white shadow-xs font-black'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Current Week (14–20)
                </button>
              </div>

              {/* Jump to Today Quick Button */}
              <button
                type="button"
                onClick={handleJumpToToday}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#2F6798]/30 hover:border-[#2F6798] text-[#2F6798] dark:text-blue-300 text-xs font-black shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2F6798]" />
                <span>Jump to Today (Sep 16)</span>
              </button>

            </div>

            {/* Legend Row & Search Filter (No line divider above) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              
              {/* Status Color Legend */}
              <div className="flex items-center gap-4 text-xs font-bold flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>P - Present</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span>L - Late</span>
                </span>
                <span className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  <span>U - Undertime</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                  <span>A - Absent</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>RD - Rest Day</span>
                </span>
              </div>

              {/* Polished & Longer Search Bar */}
              <div className="relative w-full sm:w-80 md:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] dark:text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type name, code, or email..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#cbd5e1] dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-[#94a3b8] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/20 focus:border-[#2F6798] shadow-2xs transition-all"
                />
              </div>

            </div>

          </div>

          {/* Matrix Table inside the same container */}
          <div className="overflow-x-auto relative border-t border-slate-100 dark:border-slate-800" ref={scrollContainerRef}>
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Vibrant Solid Blue Table Headers */}
              <thead>
                {/* 1st Header Row: Days of the week in Primary Blue #2F6798 */}
                <tr className="bg-[#2F6798] text-white select-none text-[10px] font-black">
                  
                  {/* Sticky Frozen Columns on Left in Primary Blue */}
                  <th className="sticky left-0 z-30 bg-[#2F6798] py-2.5 px-3 border-r border-white/15 uppercase tracking-wider min-w-[85px]">
                    start_date
                  </th>
                  <th className="sticky left-[85px] z-30 bg-[#2F6798] py-2.5 px-3 border-r border-white/15 uppercase tracking-wider min-w-[125px]">
                    position
                  </th>
                  <th className="sticky left-[210px] z-30 bg-[#2F6798] py-2.5 px-4 border-r border-white/25 uppercase tracking-wider min-w-[195px] shadow-[4px_0_8px_rgba(0,0,0,0.18)]">
                    name
                  </th>

                  {/* Day of Week Columns */}
                  {displayedDays.map((dayNum) => {
                    const dayIndex = dayNum - 1;
                    const dayName = DAYS_NAME_SEP_2026[dayIndex % DAYS_NAME_SEP_2026.length];
                    const isToday = dayNum === activeDayNumber;

                    return (
                      <th
                        key={dayNum}
                        onClick={() => handleOpenDayModal(dayNum)}
                        title={`Click to view team summary for Sep ${dayNum}`}
                        data-today-header={isToday ? 'true' : undefined}
                        className={`py-2 px-1 text-center font-black min-w-[36px] sm:min-w-[40px] border-r border-white/15 cursor-pointer hover:bg-white/20 transition-colors ${
                          isToday ? 'bg-[#059669] text-white font-extrabold ring-1 ring-white/40' : ''
                        }`}
                      >
                        {dayName}
                      </th>
                    );
                  })}

                  {/* Monthly Summary Header */}
                  <th className="py-2.5 px-3 bg-[#24537C] text-white font-black text-center border-l border-white/20 uppercase tracking-wider min-w-[90px]">
                    Monthly Totals
                  </th>
                </tr>

                {/* 2nd Header Row: Date numbers (SEP 1, SEP 2, ...) in Slightly Deeper Blue #24537C */}
                <tr className="bg-[#24537C] text-white/95 select-none text-[10px] font-black border-b border-white/20">
                  <th className="sticky left-0 z-30 bg-[#24537C] py-1.5 px-3 border-r border-white/15"></th>
                  <th className="sticky left-[85px] z-30 bg-[#24537C] py-1.5 px-3 border-r border-white/15"></th>
                  <th className="sticky left-[210px] z-30 bg-[#24537C] py-1.5 px-4 border-r border-white/25 shadow-[4px_0_8px_rgba(0,0,0,0.18)]"></th>

                  {displayedDays.map((dayNum) => {
                    const isToday = dayNum === activeDayNumber;

                    return (
                      <th
                        key={dayNum}
                        onClick={() => handleOpenDayModal(dayNum)}
                        title={`Click to view team summary for Sep ${dayNum}`}
                        className={`py-1.5 px-1 text-center border-r border-white/15 cursor-pointer hover:bg-white/20 transition-colors ${
                          isToday ? 'bg-[#047857] text-white font-extrabold' : ''
                        }`}
                      >
                        SEP {dayNum}
                      </th>
                    );
                  })}

                  <th className="py-1.5 px-3 bg-[#1D4568] text-white/80 text-[9px] text-center uppercase tracking-wider">
                    P / L / A
                  </th>
                </tr>
              </thead>

              {/* Table Body with Fixed Left Columns & Clean Matrix Cells */}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {filteredEmployees.map((emp) => {
                  // Calculate monthly summary counts
                  const allStatuses = Object.values(emp.attendanceByDay);
                  const countP = allStatuses.filter((s) => s === 'P').length;
                  const countL = allStatuses.filter((s) => s === 'L').length;
                  const countA = allStatuses.filter((s) => s === 'A').length;

                  return (
                    <tr 
                      key={emp.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Fixed Column 1: Start Date */}
                      <td className="sticky left-0 z-20 bg-white dark:bg-[#0E1B38] group-hover:bg-blue-50/70 dark:group-hover:bg-slate-800/80 py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] border-r border-slate-100 dark:border-slate-800">
                        {emp.startDate}
                      </td>

                      {/* Fixed Column 2: Position */}
                      <td className="sticky left-[85px] z-20 bg-white dark:bg-[#0E1B38] group-hover:bg-blue-50/70 dark:group-hover:bg-slate-800/80 py-2.5 px-3 text-slate-500 dark:text-slate-400 font-medium text-xs border-r border-slate-100 dark:border-slate-800 truncate max-w-[125px]">
                        {emp.position}
                      </td>

                      {/* Fixed Column 3: Name */}
                      <td 
                        onClick={() => {
                          setSelectedIndividualEmployee(emp.name);
                          setViewFormat('google-calendar');
                        }}
                        className="sticky left-[210px] z-20 bg-white dark:bg-[#0E1B38] group-hover:bg-blue-50/70 dark:group-hover:bg-slate-800/80 py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100 text-xs border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_8px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_8px_rgba(0,0,0,0.3)] cursor-pointer hover:text-[#2F6798] hover:underline"
                        title="Click to view detailed individual calendar"
                      >
                        {emp.name}
                      </td>

                      {/* Day Columns */}
                      {displayedDays.map((dayNum) => {
                        const status = emp.attendanceByDay[dayNum] || null;
                        const isToday = dayNum === activeDayNumber;

                        return (
                          <td
                            key={dayNum}
                            onClick={() => handleOpenDayModal(dayNum, emp.name)}
                            title={`Click to view Sep ${dayNum} detail for ${emp.name}`}
                            className={`py-2 px-1 text-center border-r border-slate-100 dark:border-slate-800/60 cursor-pointer hover:bg-[#2F6798]/10 dark:hover:bg-blue-900/30 transition-colors ${
                              isToday ? 'bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center transform group-hover:scale-105 transition-transform">
                              {getStatusBadge(status)}
                            </div>
                          </td>
                        );
                      })}

                      {/* Monthly Summary Column */}
                      <td className="py-2.5 px-2.5 text-center font-bold text-[11px] bg-slate-50/60 dark:bg-slate-900/30 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        <span className="text-emerald-600 font-black">{countP}P</span>
                        <span className="text-slate-300 mx-1">•</span>
                        <span className="text-amber-600 font-black">{countL}L</span>
                        <span className="text-slate-300 mx-1">•</span>
                        <span className="text-rose-600 font-black">{countA}A</span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {/* Footer Summary Bar with Range Info */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
            <span>Showing attendance for {filteredEmployees.length} workforce members ({displayedDays.length} days in view)</span>
            <span className="font-semibold text-[#2F6798]">Tip: Click any cell or date header to view full team or individual breakdown</span>
          </div>

        </div>
      ) : (
        /* Detailed Google Calendar View for Selected Employee */
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between bg-white dark:bg-[#0E1B38] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Selected Employee:</span>
              <span className="text-xs font-black text-[#2F6798]">{selectedIndividualEmployee}</span>
            </div>
            <button
              type="button"
              onClick={() => setViewFormat('matrix')}
              className="text-xs font-bold text-[#2F6798] hover:underline cursor-pointer"
            >
              ← Back to All Employees Matrix
            </button>
          </div>

          <AttendanceCalendarView
            employeeName={selectedIndividualEmployee}
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

    </div>
  );
}
