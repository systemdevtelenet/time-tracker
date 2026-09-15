'use client';

import React, { useState } from 'react';
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
  Utensils
} from 'lucide-react';
import RosterTable, { RosterEmployee } from './RosterTable';
import AttendanceCalendarTab from './AttendanceCalendarTab';
import AttendanceCalendarView from './AttendanceCalendarView';
import HoursReportTab from './HoursReportTab';
import EmployeeDetailsTab from './EmployeeDetailsTab';
import EndShiftModal from './EndShiftModal';
import { PhoneTimeRecord } from '@/lib/types';

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
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
  };

  // KPI calculations for Roster
  const totalEmployees = employeesList.length;
  const activeCount = employeesList.filter((e) => e.status === 'working').length;
  const onBreakCount = employeesList.filter((e) => e.status === 'break').length;
  const onLunchCount = employeesList.filter((e) => e.status === 'lunch').length;
  const lateArrivalsCount = employeesList.filter((e) => e.trafficLight === 'YELLOW' || e.trafficLight === 'RED').length;
  const undertimeCount = employeesList.filter((e) => e.totalHoursWorked < 4 && e.status !== 'working').length;

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* 1. Header with Title, Badge, and Refresh Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Team Roster
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            TEAM ROSTER
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2F6798]' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Sub-Navigation Tabs matching Screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        
        {/* Tab 1: Roster */}
        <button
          type="button"
          onClick={() => setActiveSubTab('roster')}
          className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
            activeSubTab === 'roster'
              ? 'bg-[#2F6798] text-white shadow-md'
              : 'bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Roster
        </button>

        {/* Tab 2: Attendance Calendar */}
        <button
          type="button"
          onClick={() => setActiveSubTab('calendar')}
          className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
            activeSubTab === 'calendar'
              ? 'bg-[#2F6798] text-white shadow-md'
              : 'bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Attendance Calendar
        </button>

        {/* Tab 3: Hours Report */}
        <button
          type="button"
          onClick={() => setActiveSubTab('hours')}
          className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
            activeSubTab === 'hours'
              ? 'bg-[#2F6798] text-white shadow-md'
              : 'bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Hours Report
        </button>

        {/* Tab 4: Employee Details */}
        <button
          type="button"
          onClick={() => setActiveSubTab('details')}
          className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
            activeSubTab === 'details'
              ? 'bg-[#2F6798] text-white shadow-md'
              : 'bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Employee Details
        </button>

      </div>

      {/* 3. Sub-Tab Content Rendering */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* 6 Status KPI Boxes matching the exact uniform design with Watermark and Pastel Icon Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 my-1">
            
            {/* 1. Total Employees */}
            <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[96px] group">
              <div 
                className="absolute right-0 top-0 bottom-0 w-3/5 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
                style={{ backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png")` }}
              />
              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  TOTAL EMPLOYEES
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight mt-1">
                  {totalEmployees}
                </span>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* 2. Active */}
            <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[96px] group">
              <div 
                className="absolute right-0 top-0 bottom-0 w-3/5 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
                style={{ backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png")` }}
              />
              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  ACTIVE
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#059669] dark:text-emerald-400 tracking-tight mt-1">
                  {activeCount}
                </span>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0 shadow-xs">
                <UserCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* 3. On Break */}
            <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[96px] group">
              <div 
                className="absolute right-0 top-0 bottom-0 w-3/5 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
                style={{ backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png")` }}
              />
              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  ON BREAK
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#D97706] dark:text-amber-400 tracking-tight mt-1">
                  {onBreakCount}
                </span>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0 shadow-xs">
                <Coffee className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* 4. On Lunch */}
            <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[96px] group">
              <div 
                className="absolute right-0 top-0 bottom-0 w-3/5 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
                style={{ backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png")` }}
              />
              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  ON LUNCH
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#9333EA] dark:text-purple-400 tracking-tight mt-1">
                  {onLunchCount}
                </span>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0 shadow-xs">
                <Utensils className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* 5. Late Arrivals */}
            <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[96px] group">
              <div 
                className="absolute right-0 top-0 bottom-0 w-3/5 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
                style={{ backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png")` }}
              />
              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  LATE ARRIVALS
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#DC2626] dark:text-rose-400 tracking-tight mt-1">
                  {lateArrivalsCount}
                </span>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* 6. Undertime */}
            <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between min-h-[96px] group">
              <div 
                className="absolute right-0 top-0 bottom-0 w-3/5 bg-no-repeat bg-right bg-contain opacity-25 dark:opacity-10 pointer-events-none transform transition-transform group-hover:scale-105 duration-500"
                style={{ backgroundImage: `url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png")` }}
              />
              <div className="relative z-10 flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  UNDERTIME
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#EA580C] dark:text-amber-400 tracking-tight mt-1">
                  {undertimeCount}
                </span>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40 flex items-center justify-center shrink-0 shadow-xs">
                <Clock className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

          </div>

          {/* Roster Data Table with Search, Date Picker, Traffic Light & Actions */}
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
          />

        </div>
      )}

      {/* Attendance Calendar Sub-Tab */}
      {activeSubTab === 'calendar' && (
        <div className="animate-in fade-in">
          <AttendanceCalendarTab
            records={records}
            onBackToRoster={() => setActiveSubTab('roster')}
          />
        </div>
      )}

      {/* Hours Report Sub-Tab */}
      {activeSubTab === 'hours' && (
        <div className="animate-in fade-in">
          <HoursReportTab
            onBackToRoster={() => setActiveSubTab('roster')}
          />
        </div>
      )}

      {/* Employee Details Sub-Tab */}
      {activeSubTab === 'details' && (
        <div className="animate-in fade-in">
          <EmployeeDetailsTab
            employees={employeesList}
            onViewCalendar={handleViewCalendar}
          />
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
