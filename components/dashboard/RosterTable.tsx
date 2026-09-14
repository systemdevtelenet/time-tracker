'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronRight, 
  CalendarDays, 
  PowerOff, 
  Filter, 
  ArrowUpDown,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export interface RosterEmployee {
  id: string;
  name: string;
  employeeCode: string;
  status: 'working' | 'lunch' | 'break' | 'offline';
  statusLabel: string;
  totalHoursWorked: number;
  totalHoursFormatted: string;
  timeElapsed: string;
  totalBreakMinutes: number;
  totalLunchMinutes: number;
  lastActive: string;
  trafficLight: 'GREEN' | 'YELLOW' | 'RED';
  department?: string;
  account?: string;
}

interface RosterTableProps {
  employees: RosterEmployee[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onViewCalendar: (employee: RosterEmployee) => void;
  onEndShift: (employee: RosterEmployee) => void;
  searchTerm?: string;
  onSearchTermChange?: (s: string) => void;
}

export default function RosterTable({
  employees,
  selectedDate,
  onDateChange,
  activeStatusFilter,
  onStatusFilterChange,
  onViewCalendar,
  onEndShift,
  searchTerm: externalSearchTerm,
  onSearchTermChange,
}: RosterTableProps) {
  const [internalSearch, setInternalSearch] = useState('');
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearch;
  const setSearchTerm = onSearchTermChange || setInternalSearch;

  const [sortField, setSortField] = useState<keyof RosterEmployee>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  // Filter & Search Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search matches
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (activeStatusFilter === 'active') {
        matchesStatus = emp.status === 'working';
      } else if (activeStatusFilter === 'lunch') {
        matchesStatus = emp.status === 'lunch';
      } else if (activeStatusFilter === 'break') {
        matchesStatus = emp.status === 'break';
      } else if (activeStatusFilter === 'late') {
        matchesStatus = emp.trafficLight === 'YELLOW' || emp.trafficLight === 'RED';
      } else if (activeStatusFilter === 'undertime') {
        matchesStatus = emp.totalHoursWorked < 4;
      }

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [employees, searchTerm, activeStatusFilter, sortField, sortAsc]);

  const handleSort = (field: keyof RosterEmployee) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const exportCSV = () => {
    const headers = ['Employee Name', 'ID', 'Current Status', 'Total Hours Worked', 'Time Elapsed', 'Break Mins', 'Lunch Mins', 'Last Active', 'Traffic Light'];
    const rows = filteredEmployees.map((e) => [
      `"${e.name}"`,
      `"${e.employeeCode}"`,
      `"${e.statusLabel}"`,
      `"${e.totalHoursFormatted}"`,
      `"${e.timeElapsed}"`,
      e.totalBreakMinutes,
      e.totalLunchMinutes,
      `"${e.lastActive}"`,
      e.trafficLight,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workforce_roster_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#101D3D] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      
      {/* Background Watermark from Supabase storage */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-10 dark:opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("${heroImageUrl}")`,
        }}
      />

      {/* Search & Date Controls Bar */}
      <div className="relative z-10 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-slate-50/50 dark:bg-slate-900/30">
        
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Employee ID or Name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/30 transition-all"
          />
        </div>

        {/* Right Filter Tools: Date & Export */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          
          {/* Date Picker Input */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none cursor-pointer"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            title="Export Roster CSV"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#2F6798]" />
          </button>

        </div>

      </div>

      {/* Roster Data Table */}
      <div className="relative z-10 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
          
          {/* Table Header */}
          <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[11px] tracking-wider select-none">
            <tr>
              <th 
                onClick={() => handleSort('name')}
                className="py-3.5 px-4 font-bold cursor-pointer hover:text-[#2F6798] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Employee Name</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                </div>
              </th>

              <th 
                onClick={() => handleSort('employeeCode')}
                className="py-3.5 px-3 font-bold cursor-pointer hover:text-[#2F6798] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                </div>
              </th>

              <th className="py-3.5 px-3 font-bold">Current Status</th>

              <th 
                onClick={() => handleSort('totalHoursWorked')}
                className="py-3.5 px-3 font-bold cursor-pointer hover:text-[#2F6798] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Total Hours Worked</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                </div>
              </th>

              <th className="py-3.5 px-3 font-bold">Time Elapsed</th>
              <th className="py-3.5 px-3 font-bold">Total Break Minutes</th>
              <th className="py-3.5 px-3 font-bold">Total Lunch Minutes</th>
              <th className="py-3.5 px-4 font-bold">Last Active</th>
              <th className="py-3.5 px-3 font-bold">Traffic Light</th>
              <th className="py-3.5 px-4 font-bold text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 opacity-40 text-[#2F6798]" />
                    <span>No employees match your search criteria.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                return (
                  <tr 
                    key={emp.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Employee Name */}
                    <td className="py-3.5 px-4 font-bold text-[#2F6798] dark:text-blue-400 group-hover:underline cursor-pointer">
                      {emp.name}
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                      {emp.employeeCode}
                    </td>

                    {/* Current Status Pill */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        emp.status === 'working'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                          : emp.status === 'lunch'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
                          : emp.status === 'break'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {emp.statusLabel}
                      </span>
                    </td>

                    {/* Total Hours Worked */}
                    <td className="py-3.5 px-3 text-slate-800 dark:text-slate-200 font-bold">
                      {emp.totalHoursFormatted}
                    </td>

                    {/* Time Elapsed */}
                    <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {emp.timeElapsed}
                    </td>

                    {/* Total Break Minutes */}
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      {emp.totalBreakMinutes.toFixed(1)} mins
                    </td>

                    {/* Total Lunch Minutes */}
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      {emp.totalLunchMinutes.toFixed(1)} mins
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {emp.lastActive}
                    </td>

                    {/* Traffic Light */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 font-bold text-[11px] ${
                        emp.trafficLight === 'GREEN'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : emp.trafficLight === 'YELLOW'
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          emp.trafficLight === 'GREEN'
                            ? 'bg-emerald-500'
                            : emp.trafficLight === 'YELLOW'
                            ? 'bg-[#C8A54B]'
                            : 'bg-rose-500'
                        }`} />
                        <span>{emp.trafficLight}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* View Calendar Button */}
                        <button
                          onClick={() => onViewCalendar(emp)}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          View Calendar
                        </button>

                        {/* End Shift Button */}
                        <button
                          onClick={() => onEndShift(emp)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                        >
                          End Shift
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {/* Table Footer Count */}
      <div className="relative z-10 p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between">
        <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
        <span className="text-[11px] font-semibold text-[#2F6798]">Workforce Portal Live Sync</span>
      </div>

    </div>
  );
}
