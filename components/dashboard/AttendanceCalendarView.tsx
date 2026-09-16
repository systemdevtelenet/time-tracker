'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  CheckSquare, 
  Square, 
  X, 
  Layers, 
  Sparkles, 
  ChevronDown,
  List,
  Grid,
  Filter,
  RefreshCw,
  PhoneIncoming,
  Utensils,
  Coffee,
  GraduationCap
} from 'lucide-react';
import { PhoneTimeRecord } from '@/lib/types';
import { ROSTER_PROFILES } from '@/lib/shiftCalendarHelper';

interface AttendanceCalendarViewProps {
  employeeName?: string;
  onBackToRoster?: () => void;
  records?: PhoneTimeRecord[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  agent: string;
  account: string;
  category: 'calls' | 'training' | 'break' | 'coaching' | 'present' | 'late_ut';
  dayIndex: number; // 0=Sun (13), 1=Mon (14), 2=Tue (15), 3=Wed (16), 4=Thu (17), 5=Fri (18), 6=Sat (19)
  startHour: number; // e.g. 9 for 9:00 AM, 13 for 1:00 PM
  durationHours: number; // e.g. 2 for 2 hours
  timeLabel: string;
  tagging?: string;
  ticket?: string;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  // Sunday 13
  {
    id: 'ev-1',
    title: 'Weekend On-Call DFT Coverage',
    agent: 'Charles Espinosa',
    account: 'DFT',
    category: 'calls',
    dayIndex: 0,
    startHour: 9,
    durationHours: 3,
    timeLabel: '9:00 AM – 12:00 PM',
    tagging: 'HOLD, Emergency Coverage',
    ticket: 'DFT-9821',
  },
  // Monday 14
  {
    id: 'ev-2',
    title: 'PST Training Batch 12 - Inhouse Wave',
    agent: 'Badz',
    account: 'Corporate',
    category: 'training',
    dayIndex: 1,
    startHour: 8,
    durationHours: 4,
    timeLabel: '8:00 AM – 12:00 PM',
    tagging: 'PST Foundation',
  },
  {
    id: 'ev-3',
    title: 'Scheduled Lunch Interval (60m)',
    agent: 'Nissi-Jeh Reguero',
    account: 'Corporate',
    category: 'break',
    dayIndex: 1,
    startHour: 12,
    durationHours: 1,
    timeLabel: '12:00 PM – 1:00 PM',
  },
  {
    id: 'ev-4',
    title: 'RM Inbound Call Shift (On-Time Present)',
    agent: 'Jeremy Rigodon',
    account: 'RM',
    category: 'present',
    dayIndex: 1,
    startHour: 13,
    durationHours: 4,
    timeLabel: '1:00 PM – 5:00 PM',
    tagging: 'Requested Info, Past Due',
    ticket: 'RM-3042',
  },
  // Tuesday 15 (Today)
  {
    id: 'ev-5',
    title: 'DFT Call Shift & Queue Support (Late +14m)',
    agent: 'Matt Riner Balaba',
    account: 'DFT',
    category: 'late_ut',
    dayIndex: 2,
    startHour: 9,
    durationHours: 3.5,
    timeLabel: '9:00 AM – 12:30 PM',
    tagging: 'Best plan, HOLD',
    ticket: 'f7efd2dd',
  },
  {
    id: 'ev-6',
    title: 'Team Scheduled Lunch & Break Interval',
    agent: 'Nissi-Jeh Reguero',
    account: 'Corporate',
    category: 'break',
    dayIndex: 2,
    startHour: 13,
    durationHours: 1,
    timeLabel: '1:00 PM – 2:00 PM',
  },
  {
    id: 'ev-7',
    title: 'Operations Coaching with June Babe',
    agent: 'Nissi-Jeh Reguero',
    account: 'Corporate',
    category: 'coaching',
    dayIndex: 2,
    startHour: 14,
    durationHours: 2,
    timeLabel: '2:00 PM – 4:00 PM',
    tagging: 'Supervisor QA Calibration',
  },
  {
    id: 'ev-8',
    title: 'BF Account Escalation Handling (Present)',
    agent: 'Charles Espinosa',
    account: 'BF',
    category: 'present',
    dayIndex: 2,
    startHour: 16,
    durationHours: 3,
    timeLabel: '4:00 PM – 7:00 PM',
    tagging: 'Billing Issue, Escalation',
    ticket: 'BF-8819',
  },
  // Wednesday 16
  {
    id: 'ev-9',
    title: 'Weekly Call Calibration Session (Present)',
    agent: 'Nissi-Jeh Reguero',
    account: 'Corporate',
    category: 'coaching',
    dayIndex: 3,
    startHour: 10,
    durationHours: 2,
    timeLabel: '10:00 AM – 12:00 PM',
    tagging: 'AHT Optimization',
  },
  {
    id: 'ev-10',
    title: 'XPN Customer Inquiry Shift (Late +7m)',
    agent: 'Matt Riner Balaba',
    account: 'XPN',
    category: 'late_ut',
    dayIndex: 3,
    startHour: 13,
    durationHours: 4,
    timeLabel: '1:00 PM – 5:00 PM',
    tagging: 'Technical Support',
    ticket: 'XPN-4120',
  },
  // Thursday 17
  {
    id: 'ev-11',
    title: 'Fleet Coverage & Dispatch Shift (Present)',
    agent: 'Charles Espinosa',
    account: 'FLEET',
    category: 'present',
    dayIndex: 4,
    startHour: 8,
    durationHours: 5,
    timeLabel: '8:00 AM – 1:00 PM',
    tagging: 'Inhouse Coverage',
    ticket: 'FLT-0912',
  },
  // Friday 18
  {
    id: 'ev-12',
    title: 'Live Shift Performance Wrap-up',
    agent: 'Nissi-Jeh Reguero',
    account: 'Corporate',
    category: 'coaching',
    dayIndex: 5,
    startHour: 9,
    durationHours: 3,
    timeLabel: '9:00 AM – 12:00 PM',
    tagging: 'Weekly Attendance & Hours Audit',
  },
  {
    id: 'ev-13',
    title: 'DFT Evening Queue Support (Present)',
    agent: 'Jeremy Rigodon',
    account: 'DFT',
    category: 'calls',
    dayIndex: 5,
    startHour: 14,
    durationHours: 4,
    timeLabel: '2:00 PM – 6:00 PM',
    tagging: 'Customer Follow-up',
    ticket: 'DFT-5541',
  },
];

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function AttendanceCalendarView({
  employeeName = 'Nissi-Jeh Reguero',
  onBackToRoster,
  records = [],
}: AttendanceCalendarViewProps) {
  // Navigation & View State
  const [viewMode, setViewMode] = useState<'Week' | 'Month' | 'Day' | 'Schedule'>('Week');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');

  // Calendar filter checkboxes (keeping colors: Blue for Calls, Light Cyan for Training, Pink/Purple for Coaching, Green for Present, Orange for Late/UT)
  const [filterCalls, setFilterCalls] = useState(true);
  const [filterTraining, setFilterTraining] = useState(true);
  const [filterBreaks, setFilterBreaks] = useState(true);
  const [filterCoaching, setFilterCoaching] = useState(true);
  const [filterPresent, setFilterPresent] = useState(true);
  const [filterLateUT, setFilterLateUT] = useState(true);
  const [filterHolidays, setFilterHolidays] = useState(true);

  // New Event Form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventAgent, setNewEventAgent] = useState(employeeName);
  const [newEventAccount, setNewEventAccount] = useState('DFT');
  const [newEventCategory, setNewEventCategory] = useState<CalendarEvent['category']>('calls');
  const [newEventDay, setNewEventDay] = useState(2); // Tuesday
  const [newEventStartHour, setNewEventStartHour] = useState(9);
  const [newEventDuration, setNewEventDuration] = useState(2);
  const [eventsList, setEventsList] = useState<CalendarEvent[]>(INITIAL_EVENTS);

  // Live database roster
  const [dbRoster, setDbRoster] = useState<any[]>([]);

  useEffect(() => {
    async function loadDbRoster() {
      try {
        const res = await fetch('/api/team-roster');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDbRoster(json.data);
        }
      } catch (err) {
        console.error('Failed to load database roster in calendar:', err);
      }
    }
    loadDbRoster();
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      if (personSearch && !ev.agent.toLowerCase().includes(personSearch.toLowerCase()) && !ev.title.toLowerCase().includes(personSearch.toLowerCase())) {
        return false;
      }
      if (ev.category === 'calls' && !filterCalls) return false;
      if (ev.category === 'training' && !filterTraining) return false;
      if (ev.category === 'break' && !filterBreaks) return false;
      if (ev.category === 'coaching' && !filterCoaching) return false;
      if (ev.category === 'present' && !filterPresent) return false;
      if (ev.category === 'late_ut' && !filterLateUT) return false;
      return true;
    });
  }, [eventsList, personSearch, filterCalls, filterTraining, filterBreaks, filterCoaching, filterPresent, filterLateUT]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const startH = Number(newEventStartHour);
    const durH = Number(newEventDuration);
    const endH = startH + durH;
    const formatH = (h: number) => {
      const isPm = h >= 12;
      const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${display}:00 ${isPm ? 'PM' : 'AM'}`;
    };

    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle,
      agent: newEventAgent,
      account: newEventAccount,
      category: newEventCategory,
      dayIndex: Number(newEventDay),
      startHour: startH,
      durationHours: durH,
      timeLabel: `${formatH(startH)} – ${formatH(endH)}`,
    };

    setEventsList((prev) => [newEv, ...prev]);
    setIsCreateModalOpen(false);
    setNewEventTitle('');
  };

  const getCategoryStyles = (category: CalendarEvent['category']) => {
    switch (category) {
      case 'calls':
        return {
          bg: 'bg-[#5aa9e6] text-[#062640] hover:bg-[#499cdb]',
          border: 'border-[#3587c8]',
          badge: 'bg-[#5aa9e6]/20 text-[#062640]',
          dot: 'bg-[#5aa9e6]',
        };
      case 'training':
      case 'break':
        return {
          bg: 'bg-[#b3dee2] text-[#062d33] hover:bg-[#a1d3d8]',
          border: 'border-[#80c5cb]',
          badge: 'bg-[#b3dee2]/30 text-[#062d33]',
          dot: 'bg-[#80c5cb]',
        };
      case 'coaching':
        return {
          bg: 'bg-[#cdb4db] text-[#341344] hover:bg-[#bda0cc]',
          border: 'border-[#a983be]',
          badge: 'bg-[#cdb4db]/30 text-[#341344]',
          dot: 'bg-[#cdb4db]',
        };
      case 'present':
        return {
          bg: 'bg-[#10B981] text-white hover:bg-[#059669]',
          border: 'border-[#059669]',
          badge: 'bg-[#d1fae5] text-[#065f46]',
          dot: 'bg-[#10B981]',
        };
      case 'late_ut':
        return {
          bg: 'bg-[#E56A24] text-white hover:bg-[#c2410c]',
          border: 'border-[#c2410c]',
          badge: 'bg-[#ffedd5] text-[#9a3412]',
          dot: 'bg-[#E56A24]',
        };
      default:
        return {
          bg: 'bg-[#5aa9e6] text-[#062640]',
          border: 'border-[#3587c8]',
          badge: 'bg-blue-100 text-blue-800',
          dot: 'bg-blue-500',
        };
    }
  };

  const weekDays = [
    { dayName: 'SUN', dayNum: 13, isToday: false },
    { dayName: 'MON', dayNum: 14, isToday: false },
    { dayName: 'TUE', dayNum: 15, isToday: true },
    { dayName: 'WED', dayNum: 16, isToday: false },
    { dayName: 'THU', dayNum: 17, isToday: false },
    { dayName: 'FRI', dayNum: 18, isToday: false },
    { dayName: 'SAT', dayNum: 19, isToday: false },
  ];

  return (
    <div className="flex flex-col xl:flex-row bg-white dark:bg-[#0E1B38] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-sans select-none min-h-[760px]">
      
      {/* ================= LEFT SIDEBAR (GOOGLE CALENDAR STYLE) ================= */}
      <div className="w-full xl:w-64 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 p-4 space-y-5 bg-white dark:bg-[#0E1B38] shrink-0">
        
        {/* Create Shift Entry Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-[#152347] border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg text-slate-800 dark:text-slate-100 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1c2e5c]"
        >
          <div className="w-5 h-5 rounded-full bg-[#2F6798] text-white flex items-center justify-center font-bold">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span>Create Shift Entry</span>
        </button>

        {/* Mini Calendar Date Picker */}
        <div className="bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              September 2026
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <ChevronLeft className="w-3.5 h-3.5 cursor-pointer hover:text-slate-700" />
              <ChevronRight className="w-3.5 h-3.5 cursor-pointer hover:text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1.5">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-semibold gap-y-1 text-slate-600 dark:text-slate-300">
            <span className="text-slate-300 dark:text-slate-600">30</span>
            <span className="text-slate-300 dark:text-slate-600">31</span>
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
            <span>13</span><span>14</span>
            <span className="w-5 h-5 rounded-full bg-[#2F6798] text-white font-bold flex items-center justify-center mx-auto shadow-2xs">
              15
            </span>
            <span>16</span><span>17</span><span>18</span><span>19</span>
            <span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span>
            <span>27</span><span>28</span><span>29</span><span>30</span>
            <span className="text-slate-300 dark:text-slate-600">1</span>
            <span className="text-slate-300 dark:text-slate-600">2</span>
            <span className="text-slate-300 dark:text-slate-600">3</span>
          </div>
        </div>

        {/* Search For People Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search for people..."
            value={personSearch}
            onChange={(e) => setPersonSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2F6798]"
          />
        </div>

        {/* My Calendars Filter Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <span>My Calendars</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <label className="flex items-center gap-2 cursor-pointer hover:text-[#5aa9e6] transition-colors">
              <input
                type="checkbox"
                checked={filterCalls}
                onChange={(e) => setFilterCalls(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#5aa9e6] focus:ring-0 cursor-pointer accent-[#5aa9e6]"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-[#5aa9e6] shrink-0" />
              <span className="truncate">Call Shifts (DFT, RM, BF)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#10B981] transition-colors">
              <input
                type="checkbox"
                checked={filterPresent}
                onChange={(e) => setFilterPresent(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#10B981] focus:ring-0 cursor-pointer accent-[#10B981]"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
              <span className="truncate">Present Shifts (On-Time)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#E56A24] transition-colors">
              <input
                type="checkbox"
                checked={filterLateUT}
                onChange={(e) => setFilterLateUT(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#E56A24] focus:ring-0 cursor-pointer accent-[#E56A24]"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E56A24] shrink-0" />
              <span className="truncate">Late & Undertime</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#80c5cb] transition-colors">
              <input
                type="checkbox"
                checked={filterTraining}
                onChange={(e) => setFilterTraining(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#80c5cb] focus:ring-0 cursor-pointer accent-[#80c5cb]"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-[#80c5cb] shrink-0" />
              <span className="truncate">PST & Inhouse Training</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#80c5cb] transition-colors">
              <input
                type="checkbox"
                checked={filterBreaks}
                onChange={(e) => setFilterBreaks(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#80c5cb] focus:ring-0 cursor-pointer accent-[#80c5cb]"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-[#80c5cb] shrink-0" />
              <span className="truncate">Lunch & Break Intervals</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#cdb4db] transition-colors">
              <input
                type="checkbox"
                checked={filterCoaching}
                onChange={(e) => setFilterCoaching(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#cdb4db] focus:ring-0 cursor-pointer accent-[#cdb4db]"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-[#cdb4db] shrink-0" />
              <span className="truncate">Supervisor Coaching & QA</span>
            </label>
          </div>
        </div>

        {/* Other Calendars Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <span>Other Calendars</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <label className="flex items-center gap-2 cursor-pointer hover:text-emerald-600 transition-colors">
              <input
                type="checkbox"
                checked={filterHolidays}
                onChange={(e) => setFilterHolidays(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-0 cursor-pointer accent-emerald-600"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">PH & US Shift Holidays</span>
            </label>
          </div>
        </div>

      </div>

      {/* ================= MAIN CALENDAR VIEW ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0E1B38]">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2F6798] text-white flex flex-col items-center justify-center font-bold shadow-sm shrink-0">
              <span className="text-[8px] uppercase tracking-tighter opacity-80 leading-none">SEP</span>
              <span className="text-sm font-black leading-none mt-0.5">15</span>
            </div>

            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
              Workforce Calendar
            </h1>

            <button
              type="button"
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              Today
            </button>

            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <button
                type="button"
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 hidden md:inline ml-1">
              September 2026
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search shifts, agents..."
                value={personSearch}
                onChange={(e) => setPersonSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2F6798] w-48 lg:w-60"
              />
            </div>

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
                  {(['Week', 'Month', 'Day', 'Schedule'] as const).map((vm) => (
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

        {/* ================= 7-DAY GOOGLE CALENDAR TIME GRID ================= */}
        <div className="flex-1 flex flex-col overflow-x-auto min-w-[760px]">
          
          {/* Header Row: Days with Circular Highlight on Today */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-center py-2.5">
            <div className="text-[11px] font-extrabold text-slate-400 flex items-center justify-center">
              GMT+08
            </div>

            {weekDays.map((w) => (
              <div key={w.dayNum} className="flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  {w.dayName}
                </span>
                <span className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center mt-0.5 ${
                  w.isToday
                    ? 'bg-[#2F6798] text-white shadow-xs'
                    : 'text-slate-800 dark:text-slate-100'
                }`}>
                  {w.dayNum}
                </span>
              </div>
            ))}
          </div>

          {/* Time Grid Rows (7 AM to 8 PM) */}
          <div className="flex-1 overflow-y-auto relative divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[640px]">
            
            {/* Red Current Time Line on Active Day */}
            <div 
              className="absolute left-[80px] right-0 border-t-2 border-rose-500 z-20 pointer-events-none"
              style={{ top: '35%' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -mt-[5px] -ml-[5px]" />
            </div>

            {HOURS.map((h) => {
              const hourLabel = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;

              return (
                <div key={h} className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[58px] relative group">
                  
                  {/* Time Axis Column */}
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 p-2 text-right border-r border-slate-100 dark:border-slate-800/80 -mt-2.5 select-none">
                    {hourLabel}
                  </div>

                  {/* 7 Day Column Slots */}
                  {weekDays.map((w) => (
                    <div
                      key={w.dayNum}
                      className="border-r last:border-r-0 border-slate-100 dark:border-slate-800/50 hover:bg-blue-50/20 dark:hover:bg-slate-800/20 transition-colors relative"
                    />
                  ))}
                </div>
              );
            })}

            {/* Positioned Calendar Cards (Google Calendar Format) */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-[80px_repeat(7,1fr)]">
              <div /> {/* Time axis offset */}
              
              {weekDays.map((w, dayColIdx) => {
                const dayEvents = filteredEvents.filter((ev) => ev.dayIndex === dayColIdx);

                return (
                  <div key={w.dayNum} className="relative h-full pointer-events-auto px-1">
                    {dayEvents.map((ev) => {
                      const style = getCategoryStyles(ev.category);
                      const topOffset = ((ev.startHour - 7) / (HOURS.length)) * 100;
                      const heightPercent = (ev.durationHours / (HOURS.length)) * 100;

                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          style={{
                            top: `${Math.max(1, topOffset)}%`,
                            height: `${Math.max(7, heightPercent)}%`,
                          }}
                          className={`absolute left-1 right-1 rounded-xl p-2.5 text-left cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between overflow-hidden z-10 ${style.bg}`}
                        >
                          <div>
                            <h4 className="font-extrabold text-[11px] leading-tight truncate">
                              {ev.title}
                            </h4>
                            <p className="text-[10px] opacity-90 truncate mt-0.5">
                              {ev.agent} {ev.account ? `• ${ev.account}` : ''}
                            </p>
                          </div>

                          <div className="text-[9px] font-black opacity-90 mt-1">
                            {ev.timeLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* ================= EVENT DETAIL MODAL ================= */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#101D3D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-full ${getCategoryStyles(selectedEvent.category).dot}`} />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Agent</span>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">{selectedEvent.agent}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Time Interval</span>
                  <span className="text-xs font-black text-[#2F6798] dark:text-blue-400">{selectedEvent.timeLabel}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Account Queue:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedEvent.account}</span>
                </div>
                {selectedEvent.ticket && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Ticket Reference:</span>
                    <code className="text-[#2F6798] dark:text-blue-400 font-bold">{selectedEvent.ticket}</code>
                  </div>
                )}
                {selectedEvent.tagging && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Call Tagging:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{selectedEvent.tagging}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE SHIFT MODAL ================= */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <form 
            onSubmit={handleCreateEvent}
            className="w-full max-w-lg bg-white dark:bg-[#101D3D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Create Shift / Schedule Entry
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Shift / Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DFT Inbound Support Shift"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-[#2F6798]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Agent / Trainee</label>
                  <input
                    type="text"
                    value={newEventAgent}
                    onChange={(e) => setNewEventAgent(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Account Queue</label>
                  <select
                    value={newEventAccount}
                    onChange={(e) => setNewEventAccount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold cursor-pointer"
                  >
                    <option value="DFT">DFT</option>
                    <option value="RM">RM</option>
                    <option value="BF">BF</option>
                    <option value="XPN">XPN</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Day</label>
                  <select
                    value={newEventDay}
                    onChange={(e) => setNewEventDay(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold cursor-pointer"
                  >
                    <option value={0}>Sun 13</option>
                    <option value={1}>Mon 14</option>
                    <option value={2}>Tue 15 (Today)</option>
                    <option value={3}>Wed 16</option>
                    <option value={4}>Thu 17</option>
                    <option value={5}>Fri 18</option>
                    <option value={6}>Sat 19</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Start Time</label>
                  <select
                    value={newEventStartHour}
                    onChange={(e) => setNewEventStartHour(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold cursor-pointer"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Duration</label>
                  <select
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold cursor-pointer"
                  >
                    <option value={1}>1 Hour</option>
                    <option value={2}>2 Hours</option>
                    <option value={3}>3 Hours</option>
                    <option value={4}>4 Hours</option>
                    <option value={8}>8 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 block mb-1">Category Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewEventCategory('calls')}
                    className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      newEventCategory === 'calls'
                        ? 'bg-[#5aa9e6] text-[#062640] border-[#3587c8]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    📞 Call Shifts (DFT/RM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEventCategory('training')}
                    className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      newEventCategory === 'training'
                        ? 'bg-[#b3dee2] text-[#062d33] border-[#80c5cb]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🎓 PST & Inhouse
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEventCategory('break')}
                    className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      newEventCategory === 'break'
                        ? 'bg-[#b3dee2] text-[#062d33] border-[#80c5cb]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🍴 Lunch & Breaks
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEventCategory('coaching')}
                    className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      newEventCategory === 'coaching'
                        ? 'bg-[#cdb4db] text-[#341344] border-[#a983be]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ✨ Coaching & QA
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] text-white text-xs font-black shadow-sm cursor-pointer"
              >
                Save Entry
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
