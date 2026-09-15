'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Building2, 
  Clock, 
  RotateCw, 
  Download, 
  ArrowUpDown, 
  Eye, 
  Edit3, 
  LayoutGrid,
  CheckCircle,
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

  const [filterQuarter, setFilterQuarter] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.account && emp.account.toLowerCase().includes(searchTerm.toLowerCase()));

      // Account filter
      let matchesAccount = true;
      if (filterAccount !== 'all') {
        matchesAccount = emp.account?.toLowerCase() === filterAccount.toLowerCase();
      }

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

      return matchesSearch && matchesAccount && matchesStatus;
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
  }, [employees, searchTerm, filterAccount, activeStatusFilter, sortField, sortAsc]);

  const handleSort = (field: keyof RosterEmployee) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
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
    <div className="space-y-4 animate-in fade-in">
      
      {/* 1. Top 4-Column Filter Controls Bar matching exact reference design */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0E1B38] border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Quarter Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>QUARTER FILTER</span>
            </label>
            <select
              value={filterQuarter}
              onChange={(e) => setFilterQuarter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30"
            >
              <option value="all">All Quarters</option>
              <option value="q1">Q1 (Jan - Mar)</option>
              <option value="q2">Q2 (Apr - Jun)</option>
              <option value="q3">Q3 (Jul - Sep)</option>
              <option value="q4">Q4 (Oct - Dec)</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>MONTH FILTER</span>
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30"
            >
              <option value="all">All Months</option>
              <option value="9">September 2026</option>
              <option value="8">August 2026</option>
              <option value="7">July 2026</option>
            </select>
          </div>

          {/* Client Account Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>CLIENT ACCOUNT FILTER</span>
            </label>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#2F6798]/30"
            >
              <option value="all">All Client Accounts</option>
              <option value="Corporate">Corporate</option>
              <option value="DFT">DFT</option>
              <option value="Care">Care</option>
              <option value="Billing">Billing</option>
            </select>
          </div>

          {/* Search Employee / Trainee */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#2F6798]" />
              <span>SEARCH EMPLOYEE / TRAINEE</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type name, role, or ID..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/30"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Table Card with Header Bar & Watermark */}
      <div className="relative overflow-hidden bg-white dark:bg-[#0E1B38] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        
        {/* Subtle Watermark Background from Supabase */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-15 dark:opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("${heroImageUrl}")`,
          }}
        />

        {/* Table Top Controls Bar (Header Title + Rows Per Page + Record Count + Refresh + Export) */}
        <div className="relative z-10 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
          
          {/* Title & Count */}
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#2F6798]" />
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
              ALL EMPLOYEES ROSTER ({employees.length})
            </h3>
          </div>

          {/* Right Actions Bar */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 flex-wrap self-stretch sm:self-auto justify-end">
            
            {/* Rows Per Page Dropdown */}
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Range Label */}
            <span className="hidden md:inline text-slate-500">
              Showing 1 to {Math.min(rowsPerPage, filteredEmployees.length)} of {filteredEmployees.length} records
            </span>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh Roster"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#2F6798] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Solid Blue Export Button */}
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2F6798] hover:bg-[#235179] active:bg-[#1c4366] text-white text-xs font-black shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

          </div>

        </div>

        {/* 3. Table Rows Grid matching exact screenshot columns */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-black border-b border-slate-200/80 dark:border-slate-800 uppercase text-[10px] tracking-wider select-none">
                
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-5 font-black cursor-pointer hover:text-[#2F6798] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>EMPLOYEE NAME</span>
                    <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('employeeCode')}
                  className="py-3.5 px-3 font-black cursor-pointer hover:text-[#2F6798] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                  </div>
                </th>

                <th className="py-3.5 px-3 font-black">CURRENT STATUS</th>

                <th 
                  onClick={() => handleSort('totalHoursWorked')}
                  className="py-3.5 px-3 font-black cursor-pointer hover:text-[#2F6798] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>TOTAL HOURS WORKED</span>
                    <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                  </div>
                </th>

                <th className="py-3.5 px-3 font-black">TIME ELAPSED</th>
                <th className="py-3.5 px-3 font-black">TOTAL BREAK MINUTES</th>
                <th className="py-3.5 px-3 font-black">TOTAL LUNCH MINUTES</th>
                <th className="py-3.5 px-4 font-black">LAST ACTIVE</th>
                <th className="py-3.5 px-3 font-black">TRAFFIC LIGHT</th>
                <th className="py-3.5 px-5 font-black text-center">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {filteredEmployees.slice(0, rowsPerPage).map((emp) => {
                return (
                  <tr 
                    key={emp.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Employee Name (Bold Navy with Link Style) */}
                    <td 
                      onClick={() => onViewCalendar(emp)}
                      className="py-3.5 px-5 font-extrabold text-[#2F6798] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {emp.name}
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                      {emp.employeeCode}
                    </td>

                    {/* Current Status Pill */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        emp.status === 'working'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : emp.status === 'lunch'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : emp.status === 'break'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                      }`}>
                        {emp.statusLabel}
                      </span>
                    </td>

                    {/* Total Hours Worked */}
                    <td className="py-3.5 px-3 text-slate-900 dark:text-slate-100 font-black">
                      {emp.totalHoursFormatted}
                    </td>

                    {/* Time Elapsed */}
                    <td className="py-3.5 px-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {emp.timeElapsed}
                    </td>

                    {/* Total Break Minutes */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">
                      {emp.totalBreakMinutes.toFixed(1)} mins
                    </td>

                    {/* Total Lunch Minutes */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">
                      {emp.totalLunchMinutes.toFixed(1)} mins
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {emp.lastActive}
                    </td>

                    {/* Traffic Light */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 font-black text-xs ${
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
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`} />
                        <span>{emp.trafficLight}</span>
                      </span>
                    </td>

                    {/* Actions: View Calendar + End Shift */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* View Calendar */}
                        <button
                          type="button"
                          onClick={() => onViewCalendar(emp)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          View Calendar
                        </button>

                        {/* End Shift */}
                        <button
                          type="button"
                          onClick={() => onEndShift(emp)}
                          className="px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white text-xs font-black transition-all shadow-xs cursor-pointer"
                        >
                          End Shift
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* 4. Table Footer Bar */}
        <div className="relative z-10 p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between">
          <span>Showing {Math.min(rowsPerPage, filteredEmployees.length)} of {employees.length} employees</span>
          <span className="text-[11px] font-semibold text-[#2F6798]">Workforce Portal Live Sync</span>
        </div>

      </div>

    </div>
  );
}
