'use client';

import React, { useState, useMemo } from 'react';
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

interface AttendanceCalendarViewProps {
  employeeName?: string;
  onBackToRoster: () => void;
  records?: PhoneTimeRecord[];
}

interface CalendarEvent {
  id: string;
  title: string;
  agent: string;
  account: string;
  category: 'calls' | 'training' | 'break' | 'coaching';
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
    title: 'Scheduled Lunch Interval',
    agent: 'Badz',
    account: 'Corporate',
    category: 'break',
    dayIndex: 1,
    startHour: 12,
    durationHours: 1,
    timeLabel: '12:00 PM – 1:00 PM',
  },
  {
    id: 'ev-4',
    title: 'RM Inbound Call Shift',
    agent: 'Jeremy Rigodon',
    account: 'RM',
    category: 'calls',
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
    title: 'DFT Call Shift & Queue Support',
    agent: 'Matt Riner Balaba',
    account: 'DFT',
    category: 'calls',
    dayIndex: 2,
    startHour: 9,
    durationHours: 3.5,
    timeLabel: '9:00 AM – 12:30 PM',
    tagging: 'Best plan, HOLD',
    ticket: 'f7efd2dd',
  },
  {
    id: 'ev-6',
    title: 'Team Scheduled Lunch',
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
    title: 'BF Account Escalation Handling',
    agent: 'Charles Espinosa',
    account: 'BF',
    category: 'calls',
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
    title: 'Weekly Call Calibration Session',
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
    title: 'XPN Customer Inquiry Shift',
    agent: 'Matt Riner Balaba',
    account: 'XPN',
    category: 'calls',
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
    title: 'Fleet Coverage & Dispatch Shift',
    agent: 'Charles Espinosa',
    account: 'FLEET',
    category: 'calls',
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
    title: 'DFT Evening Queue Support',
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
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month' | 'Schedule'>('Week');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');

  // Calendar filter checkboxes
  const [filterCalls, setFilterCalls] = useState(true);
  const [filterTraining, setFilterTraining] = useState(true);
  const [filterBreaks, setFilterBreaks] = useState(true);
  const [filterCoaching, setFilterCoaching] = useState(true);
  const [filterHolidays, setFilterHolidays] = useState(true);

  // New Event Form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventAgent, setNewEventAgent] = useState(employeeName);
  const [newEventAccount, setNewEventAccount] = useState('DFT');
  const [newEventCategory, setNewEventCategory] = useState<'calls' | 'training' | 'break' | 'coaching'>('calls');
  const [newEventDay, setNewEventDay] = useState(2); // Tuesday
  const [newEventStartHour, setNewEventStartHour] = useState(9);
  const [newEventDuration, setNewEventDuration] = useState(2);
  const [eventsList, setEventsList] = useState<CalendarEvent[]>(INITIAL_EVENTS);

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
      return true;
    });
  }, [eventsList, personSearch, filterCalls, filterTraining, filterBreaks, filterCoaching]);

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
        return 'bg-[#5aa9e6] text-[#062640] border-l-4 border-l-[#3587c8] shadow-xs hover:brightness-95';
      case 'training':
        return 'bg-[#b3dee2] text-[#062d33] border-l-4 border-l-[#80c5cb] shadow-xs hover:brightness-95';
      case 'break':
        return 'bg-[#b3dee2] text-[#062d33] border-l-4 border-l-[#80c5cb] shadow-xs hover:brightness-95';
      case 'coaching':
        return 'bg-[#cdb4db] text-[#341344] border-l-4 border-l-[#a983be] shadow-xs hover:brightness-95';
      default:
        return 'bg-[#5aa9e6] text-[#062640] border-l-4 border-l-[#3587c8]';
    }
  };

  const weekDays = [
    { name: 'SUN', date: 13, isToday: false },
    { name: 'MON', date: 14, isToday: false },
    { name: 'TUE', date: 15, isToday: true },
    { name: 'WED', date: 16, isToday: false },
    { name: 'THU', date: 17, isToday: false },
    { name: 'FRI', date: 18, isToday: false },
    { name: 'SAT', date: 19, isToday: false },
  ];

  return (
    <div className="bg-white dark:bg-[#0E1A33] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[760px]">
      
      {/* 1. GOOGLE CALENDAR STYLE TOPBAR */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0E1A33]">
        
        {/* Left: Brand Icon + Title + Today + Nav Arrows */}
        <div className="flex items-center gap-3">
          
          {/* Calendar App Icon */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2F6798] text-white font-black text-xs flex flex-col items-center justify-center shadow-xs">
              <span className="text-[7px] uppercase tracking-tighter leading-none opacity-80">SEP</span>
              <span className="text-xs leading-none mt-0.5 font-extrabold">15</span>
            </div>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 tracking-tight hidden sm:inline">
              Workforce Calendar
            </span>
          </div>

          {/* Today Button */}
          <button
            onClick={() => {}}
            className="px-3.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            Today
          </button>

          {/* Nav Arrows */}
          <div className="flex items-center">
            <button className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Label */}
          <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 ml-1">
            September 2026
          </span>
        </div>

        {/* Right: Search Bar + View Mode Dropdown */}
        <div className="flex items-center gap-2.5">
          
          {/* Topbar Search Bar */}
          <div className="relative min-w-[180px] sm:min-w-[240px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search shifts, agents..."
              value={personSearch}
              onChange={(e) => setPersonSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/30 transition-all"
            />
          </div>

          {/* View Mode Dropdown (Week / Day / Month) */}
          <div className="relative">
            <button
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>{viewMode}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isViewDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1 text-xs font-bold">
                {(['Day', 'Week', 'Month', 'Schedule'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      setIsViewDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer ${
                      viewMode === mode ? 'text-[#2F6798] dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
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

      {/* 2. BODY LAYOUT: LEFT SIDEBAR + MAIN CALENDAR CANVAS */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT GOOGLE CALENDAR SIDEBAR */}
        <div className="w-full md:w-56 lg:w-60 border-r border-slate-200 dark:border-slate-800 p-3 space-y-4 bg-white dark:bg-[#0E1A33] shrink-0">
          
          {/* + Create Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full py-2 px-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-extrabold text-xs flex items-center gap-2.5 transition-all shadow-xs cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-full bg-[#2F6798] text-white flex items-center justify-center font-bold">
              <Plus className="w-3 h-3" />
            </div>
            <span>Create Shift Entry</span>
          </button>

          {/* Mini Month Calendar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 px-1">
              <span>September 2026</span>
              <div className="flex items-center gap-1">
                <button className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 cursor-pointer">
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 cursor-pointer">
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Mini Days Grid */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 gap-y-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              
              {/* Row 1 */}
              <span className="text-slate-300 dark:text-slate-600">30</span>
              <span className="text-slate-300 dark:text-slate-600">31</span>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              {/* Row 2 */}
              <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
              {/* Row 3 (15 is active) */}
              <span>13</span><span>14</span>
              <span className="w-5 h-5 mx-auto bg-[#2F6798] text-white rounded-full flex items-center justify-center font-black">
                15
              </span>
              <span>16</span><span>17</span><span>18</span><span>19</span>
              {/* Row 4 */}
              <span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span>
              {/* Row 5 */}
              <span>27</span><span>28</span><span>29</span><span>30</span>
              <span className="text-slate-300 dark:text-slate-600">1</span>
              <span className="text-slate-300 dark:text-slate-600">2</span>
              <span className="text-slate-300 dark:text-slate-600">3</span>
            </div>
          </div>

          {/* Search for People Filter */}
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search for people..."
              value={personSearch}
              onChange={(e) => setPersonSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/30"
            />
          </div>

          {/* My Calendars / Categories Filter Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>My Calendars</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-1.5 text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filterCalls}
                  onChange={(e) => setFilterCalls(e.target.checked)}
                  className="rounded text-[#5aa9e6] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#5aa9e6] inline-block"></span>
                <span>Call Shifts (DFT, RM, BF)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filterTraining}
                  onChange={(e) => setFilterTraining(e.target.checked)}
                  className="rounded text-[#b3dee2] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#b3dee2] inline-block"></span>
                <span>PST & Inhouse Training</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filterBreaks}
                  onChange={(e) => setFilterBreaks(e.target.checked)}
                  className="rounded text-[#b3dee2] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#b3dee2] inline-block"></span>
                <span>Lunch & Break Intervals</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filterCoaching}
                  onChange={(e) => setFilterCoaching(e.target.checked)}
                  className="rounded text-[#cdb4db] focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#cdb4db] inline-block"></span>
                <span>Supervisor Coaching & QA</span>
              </label>
            </div>
          </div>

          {/* Other Calendars / Holidays */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Other Calendars</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={filterHolidays}
                onChange={(e) => setFilterHolidays(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>PH & US Shift Holidays</span>
            </label>
          </div>

        </div>

        {/* MAIN CALENDAR WEEK VIEW GRID */}
        <div className="flex-1 flex flex-col overflow-x-auto min-w-[680px]">
          
          {/* Day Headers (SUN 13, MON 14, TUE 15, etc.) */}
          <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1A33] sticky top-0 z-10">
            
            {/* Time zone label */}
            <div className="p-3 text-center text-[10px] font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
              GMT+08
            </div>

            {/* 7 Days Columns Header */}
            {weekDays.map((d, i) => (
              <div 
                key={i}
                className={`p-3 text-center border-r border-slate-200 dark:border-slate-800 ${
                  d.isToday ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase">
                  {d.name}
                </div>
                <div className="mt-1 flex justify-center">
                  <span className={`text-base font-black ${
                    d.isToday 
                      ? 'w-7 h-7 rounded-full bg-[#2F6798] text-white flex items-center justify-center shadow-xs'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {d.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Time Gutter & Event Cells Grid */}
          <div className="flex-1 overflow-y-auto relative max-h-[620px]">
            
            {/* Horizontal Hour Rows */}
            {HOURS.map((hour) => {
              const displayHour = hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;

              return (
                <div key={hour} className="grid grid-cols-8 min-h-[56px] border-b border-slate-100 dark:border-slate-800/80">
                  
                  {/* Left Hour Label */}
                  <div className="p-2 text-right pr-3 text-[10px] font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800 select-none">
                    {displayHour}
                  </div>

                  {/* 7 Day Slot Cells for this hour */}
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                    const isTuesday = dayIdx === 2;
                    return (
                      <div
                        key={dayIdx}
                        onClick={() => {
                          setNewEventDay(dayIdx);
                          setNewEventStartHour(hour);
                          setIsCreateModalOpen(true);
                        }}
                        className={`border-r border-slate-200/60 dark:border-slate-800/60 relative hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${
                          isTuesday ? 'bg-blue-50/10 dark:bg-blue-950/10' : ''
                        }`}
                      >
                        {/* Current time red indicator line on Tuesday (at ~10 AM / 9 PM) */}
                        {isTuesday && hour === 10 && (
                          <div className="absolute top-1/2 left-0 right-0 z-20 flex items-center pointer-events-none">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1 shadow-xs"></div>
                            <div className="flex-1 h-[2px] bg-rose-500"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              );
            })}

            {/* Absolute Overlay Event Cards */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-8">
              {/* Col 0 is time gutter */}
              <div></div>

              {/* Cols 1 to 7 for each day */}
              {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                const dayEvents = filteredEvents.filter((ev) => ev.dayIndex === dayIdx);

                return (
                  <div key={dayIdx} className="relative h-full">
                    {dayEvents.map((ev) => {
                      // Calculate top and height in percentage / pixels
                      // Top calculation: (ev.startHour - 7) * 56px
                      const topPx = (ev.startHour - 7) * 56 + 2;
                      const heightPx = ev.durationHours * 56 - 4;

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                          }}
                          className={`absolute left-1 right-1 rounded-xl p-2 text-xs transition-all pointer-events-auto cursor-pointer overflow-hidden flex flex-col justify-between ${getCategoryStyles(
                            ev.category
                          )}`}
                          title={`${ev.title} - ${ev.agent} (${ev.timeLabel})`}
                        >
                          <div>
                            <div className="font-extrabold text-[11px] leading-tight truncate">
                              {ev.title}
                            </div>
                            <div className="text-[10px] opacity-90 truncate mt-0.5 font-medium">
                              {ev.agent} • {ev.account}
                            </div>
                          </div>

                          <div className="text-[9px] font-bold opacity-80 truncate">
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

      {/* 3. EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#101D3D] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getCategoryStyles(selectedEvent.category)}`}>
                  {selectedEvent.category === 'calls' && <PhoneIncoming className="w-5 h-5 text-white" />}
                  {selectedEvent.category === 'training' && <GraduationCap className="w-5 h-5 text-white" />}
                  {selectedEvent.category === 'break' && <Utensils className="w-5 h-5 text-slate-950" />}
                  {selectedEvent.category === 'coaching' && <Sparkles className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    {selectedEvent.title}
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {selectedEvent.timeLabel}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Meta Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-500">Assigned Agent / Supervisor:</span>
                <span className="font-black text-slate-900 dark:text-slate-100">{selectedEvent.agent}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-500">Account Queue:</span>
                <span className="font-black text-[#2F6798] dark:text-blue-300">{selectedEvent.account}</span>
              </div>

              {selectedEvent.tagging && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <span className="font-bold text-slate-500">Tagging / Reason:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEvent.tagging}</span>
                </div>
              )}

              {selectedEvent.ticket && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <span className="font-bold text-slate-500">Ticket #:</span>
                  <span className="font-mono font-bold text-[#C8A54B]">{selectedEvent.ticket}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. CREATE SHIFT ENTRY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <form onSubmit={handleCreateEvent} className="bg-white dark:bg-[#101D3D] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2F6798] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Add Shift / Event Entry
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
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
