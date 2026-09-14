'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  Utensils, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { PhoneTimeRecord } from '@/lib/types';

interface AttendanceCalendarViewProps {
  employeeName?: string;
  onBackToRoster: () => void;
  records?: PhoneTimeRecord[];
}

interface ShiftPunchDetail {
  type: 'present' | 'absent' | 'late' | 'undertime';
  punches: string[];
}

export default function AttendanceCalendarView({
  employeeName = 'Nissi-Jeh Reguero',
  onBackToRoster,
  records = [],
}: AttendanceCalendarViewProps) {
  // Calendar Navigation State
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(8); // 8 = September (0-indexed)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [activeTab, setActiveTab] = useState<'roster' | 'calendar' | 'hours' | 'details'>('calendar');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ day: number; dateStr: string; shiftData: ShiftPunchDetail } | null>(null);

  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Static Mock attendance data mapping days for realistic Google Calendar view
  const shiftEventsByDay: Record<number, ShiftPunchDetail> = {
    1: {
      type: 'late',
      punches: [
        '9:24 PM Shift Start',
        '11:31 PM Start Break',
        '11:46 PM End Break',
        '1:34 AM Start Lunch',
        '2:06 AM End Lunch',
      ],
    },
    2: {
      type: 'present',
      punches: [
        '8:43 PM Shift End',
        '8:43 PM Shift Start',
        '11:39 PM Break 1 Start',
        '11:45 PM Break 1 End',
        '1:05 AM Start Lunch',
        '1:23 AM End Lunch',
        '4:42 AM Break 2 Start',
        '4:45 AM Break 2 End',
        '6:05 AM Shift End',
      ],
    },
    3: {
      type: 'present',
      punches: [
        '8:13 PM Shift Start',
        '10:53 PM Break 1 Start',
        '11:12 PM Break 1 End',
        '4:57 AM Break 2 Start',
        '5:05 AM Break 2 End',
        '6:04 AM Shift End',
      ],
    },
    4: {
      type: 'undertime',
      punches: [
        '8:36 PM Shift Start',
        '11:22 PM Break 1 Start',
        '11:35 PM Break 1 End',
        '1:09 AM Start Lunch',
        '2:07 AM End Lunch',
      ],
    },
    7: {
      type: 'present',
      punches: [
        '6:16 PM Shift End',
        '7:39 PM Shift Start',
      ],
    },
    8: {
      type: 'undertime',
      punches: [
        '8:28 PM Shift Start',
        '11:15 PM Break 1 Start',
      ],
    },
    9: {
      type: 'undertime',
      punches: [
        '8:48 PM Shift End',
        '8:49 PM Shift Start',
      ],
    },
    10: {
      type: 'undertime',
      punches: [
        '3:05 PM Shift End',
        '3:05 PM Shift Start',
      ],
    },
    11: {
      type: 'present',
      punches: [
        '8:44 PM Shift Start',
        '11:19 PM Break 1 Start',
      ],
    },
    14: {
      type: 'present',
      punches: [
        '9:00 PM Shift Start',
        '11:30 PM Break 1 Start',
        '11:45 PM Break 1 End',
        '1:00 AM Start Lunch',
        '2:00 AM End Lunch',
        '6:00 AM Shift End',
      ],
    },
    15: {
      type: 'present',
      punches: [
        '9:00 PM Shift Start',
        '11:30 PM Break 1 Start',
        '11:45 PM Break 1 End',
        '1:57 AM Start Lunch',
      ],
    },
  };

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

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonthIndex(8); // September 2026
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Generate Days Grid for September 2026 (Starts on Tuesday = 2 empty cells for Sun, Mon)
  // September 2026: 30 days. Sep 1 is Tuesday.
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, etc.
  const prevMonthDays = new Date(currentYear, currentMonthIndex, 0).getDate();

  const calendarGrid = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarGrid.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      monthOffset: -1,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarGrid.push({
      day: d,
      isCurrentMonth: true,
      monthOffset: 0,
      shiftData: shiftEventsByDay[d] || (d === 31 ? { type: 'absent', punches: [] } : null),
    });
  }

  // Next month leading days to complete full grid (multiple of 7)
  const remainingCells = 35 - calendarGrid.length > 0 ? 35 - calendarGrid.length : (42 - calendarGrid.length);
  for (let n = 1; n <= remainingCells; n++) {
    calendarGrid.push({
      day: n,
      isCurrentMonth: false,
      monthOffset: 1,
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & BACK TO ROSTER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            {employeeName}&apos;s Attendance
          </h2>
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black bg-[#C8A54B]/20 text-[#C8A54B] dark:text-amber-300 border border-[#C8A54B]/30 uppercase tracking-wider">
            TEAM ROSTER
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between">
          <button
            onClick={onBackToRoster}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2F6798] hover:text-white dark:hover:bg-[#2F6798] text-slate-700 dark:text-slate-300 text-xs font-black border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Roster</span>
          </button>

          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2F6798]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={onBackToRoster}
          className="px-4 py-2 rounded-xl text-xs font-black transition-all bg-[#2F6798] text-white shadow-xs cursor-pointer"
        >
          Roster
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-[#101D3D] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#2F6798] cursor-pointer"
        >
          Attendance Calendar
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-[#101D3D] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#2F6798] cursor-pointer"
        >
          Hours Report
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-[#101D3D] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#2F6798] cursor-pointer"
        >
          Employee Details
        </button>
      </div>

      {/* 3. KPI / STATUS SUMMARY STAT CARDS matching screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Employees */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            Total Employees
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mt-1">
            13
          </div>
        </div>

        {/* Active */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#101D3D] border-l-4 border-emerald-500 border-y border-r border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
            Active
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            9
          </div>
        </div>

        {/* On Break */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#101D3D] border-l-4 border-[#C8A54B] border-y border-r border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-[#C8A54B] block">
            On Break
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#C8A54B] mt-1">
            0
          </div>
        </div>

        {/* On Lunch */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#101D3D] border-l-4 border-[#2F6798] border-y border-r border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-[#2F6798] dark:text-blue-400 block">
            On Lunch
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#2F6798] dark:text-blue-400 mt-1">
            1
          </div>
        </div>

        {/* Late Arrivals */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#101D3D] border-l-4 border-rose-500 border-y border-r border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-500 block">
            Late Arrivals
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-500 mt-1">
            0
          </div>
        </div>

        {/* Undertime */}
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#101D3D] border-l-4 border-amber-600 border-y border-r border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 block">
            Undertime
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            0
          </div>
        </div>

      </div>

      {/* 4. GOOGLE CALENDAR CONTAINER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#101D3D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Google Calendar Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          
          {/* Left: Navigation Arrows & Today Button (Google Calendar Style) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              today
            </button>
          </div>

          {/* Center: Month and Year Header */}
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {monthNames[currentMonthIndex]} {currentYear}
          </h3>

          {/* Right: View Mode Dropdown / Button (Month View) */}
          <div>
            <span className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-xs uppercase tracking-wide">
              month
            </span>
          </div>

        </div>

        {/* 5. GOOGLE CALENDAR GRID */}
        <div className="overflow-x-auto">
          <div className="min-w-[760px] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            
            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-600 dark:text-slate-400 py-2.5">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Date Grid Cells (7 columns) */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#101D3D]">
              {calendarGrid.map((item, idx) => {
                const shift = item.shiftData;
                const isToday = item.day === 15 && item.isCurrentMonth;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (shift) {
                        setSelectedDayDetail({
                          day: item.day,
                          dateStr: `${monthNames[currentMonthIndex]} ${item.day}, ${currentYear}`,
                          shiftData: shift,
                        });
                      }
                    }}
                    className={`min-h-[140px] p-2 flex flex-col justify-between transition-colors ${
                      !item.isCurrentMonth
                        ? 'bg-slate-50/40 dark:bg-slate-900/20 text-slate-300 dark:text-slate-600'
                        : 'hover:bg-blue-50/20 dark:hover:bg-slate-800/30 text-slate-800 dark:text-slate-200'
                    } ${shift ? 'cursor-pointer' : ''}`}
                  >
                    {/* Top Row: Date Number */}
                    <div className="flex items-center justify-end">
                      <span
                        className={`text-xs font-extrabold ${
                          isToday
                            ? 'w-6 h-6 rounded-full bg-[#2F6798] text-white flex items-center justify-center'
                            : item.isCurrentMonth
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>

                    {/* Google Calendar Style Events / Shift Pills */}
                    <div className="space-y-1 mt-1 flex-1">
                      {shift && (
                        <>
                          {/* Status Badge (Present / Late / Undertime / Absent) */}
                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${
                              shift.type === 'present'
                                ? 'bg-emerald-600'
                                : shift.type === 'late'
                                ? 'bg-amber-600'
                                : shift.type === 'undertime'
                                ? 'bg-orange-600'
                                : 'bg-rose-600'
                            }`}
                          >
                            {shift.type === 'present' && 'Present'}
                            {shift.type === 'late' && 'Late / UT'}
                            {shift.type === 'undertime' && 'Undertime'}
                            {shift.type === 'absent' && 'Absent'}
                          </div>

                          {/* Event punch lines in Google Calendar style */}
                          {shift.punches.slice(0, 4).map((p, pIdx) => (
                            <div
                              key={pIdx}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate text-white ${
                                shift.type === 'present'
                                  ? 'bg-emerald-500/90'
                                  : shift.type === 'late'
                                  ? 'bg-amber-500/90'
                                  : 'bg-orange-500/90'
                              }`}
                            >
                              {p}
                            </div>
                          ))}

                          {shift.punches.length > 4 && (
                            <div className="text-[9px] font-bold text-[#2F6798] dark:text-blue-400 pl-1">
                              +{shift.punches.length - 4} more punches...
                            </div>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* Day Details Modal */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#101D3D] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2F6798]/10 text-[#2F6798] flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {selectedDayDetail.dateStr}
                  </h3>
                  <span className="text-[11px] text-slate-400">{employeeName}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDayDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-xs font-bold text-slate-500">Attendance Status:</span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase text-white ${
                selectedDayDetail.shiftData.type === 'present'
                  ? 'bg-emerald-600'
                  : selectedDayDetail.shiftData.type === 'late'
                  ? 'bg-amber-600'
                  : selectedDayDetail.shiftData.type === 'undertime'
                  ? 'bg-orange-600'
                  : 'bg-rose-600'
              }`}>
                {selectedDayDetail.shiftData.type}
              </span>
            </div>

            {/* Punches Timeline */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Shift Time Actions & Punches
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {selectedDayDetail.shiftData.punches.map((punch, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold"
                  >
                    <span className="text-slate-800 dark:text-slate-200">{punch}</span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#2F6798] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
