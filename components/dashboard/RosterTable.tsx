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
  AlertCircle,
  ChevronLeft,
  ChevronRight
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
  filterQuarter?: string;
  filterMonth?: string;
  filterAccount?: string;
  onToast?: (msg: string) => void;
  onRefresh?: () => void;
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
  filterQuarter = 'all',
  filterMonth = 'all',
  filterAccount = 'all',
  onToast,
  onRefresh,
}: RosterTableProps) {
  const [internalSearch, setInternalSearch] = useState('');
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearch;
  const setSearchTerm = onSearchTermChange || setInternalSearch;

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [sortField, setSortField] = useState<keyof RosterEmployee>('name');
  const [sortAsc, setSortAsc] = useState(true);

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

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredEmployees.slice(start, start + rowsPerPage);
  }, [filteredEmployees, currentPage, rowsPerPage]);

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
    if (onRefresh) {
      onRefresh();
    } else if (onToast) {
      onToast('Roster data refreshed!');
    }
    setTimeout(() => setIsRefreshing(false), 600);
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
    link.setAttribute('download', `workforce_roster_${selectedDate || '2026-09-16'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) {
      onToast(`Exported ${filteredEmployees.length} employee records to CSV.`);
    }
  };

  return (
    <div className="animate-in fade-in">
      
      {/* Table Top Controls Bar (Header Title + Rows Per Page + Record Count + Refresh + Export) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
        
        {/* Title & Count - Bold */}
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-[#2F6798]" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight font-sans">
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

      {/* Table Rows Grid matching exact screenshot columns without watermark */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-50/90 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[10px] tracking-wider select-none">
              
              <th 
                onClick={() => handleSort('name')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-[#2F6798] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>EMPLOYEE NAME</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                </div>
              </th>

              <th 
                onClick={() => handleSort('employeeCode')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#2F6798] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">CURRENT STATUS</th>

              <th 
                onClick={() => handleSort('totalHoursWorked')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#2F6798] transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>TOTAL HOURS WORKED</span>
                  <ArrowUpDown className="w-3 h-3 text-[#2F6798] opacity-70" />
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">TIME ELAPSED</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">TOTAL BREAK MINUTES</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">TOTAL LUNCH MINUTES</th>
              <th className="py-2.5 px-4 font-semibold whitespace-nowrap">LAST ACTIVE</th>
              <th className="py-2.5 px-3 font-semibold whitespace-nowrap">TRAFFIC LIGHT</th>
              <th className="py-2.5 px-4 font-semibold text-center whitespace-nowrap">ACTIONS</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No matching employees found.
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => {
                const initials = emp.name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('');

                return (
                  <tr 
                    key={emp.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Employee Name (Semi bold Navy with Link Style, No Underline) */}
                    <td 
                      onClick={() => onViewCalendar(emp)}
                      className="py-2.5 px-4 cursor-pointer whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10.5px] flex items-center justify-center shrink-0 border border-[#2F6798]/20">
                          {initials}
                        </div>
                        <span className="font-semibold text-[#2F6798] dark:text-blue-400 hover:text-[#1d4b72] dark:hover:text-blue-300 transition-colors">
                          {emp.name}
                        </span>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {emp.employeeCode}
                    </td>

                    {/* Current Status Badge (Reduced size by 2) */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                        emp.status === 'working'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : emp.status === 'lunch'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : emp.status === 'break'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          emp.status === 'working' ? 'bg-emerald-500' : emp.status === 'lunch' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        {emp.statusLabel}
                      </span>
                    </td>

                    {/* Total Hours Worked (Bold Navy with slight grey/blue background) */}
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-900/30 whitespace-nowrap">
                      {emp.totalHoursFormatted}
                    </td>

                    {/* Time Elapsed */}
                    <td className="py-2.5 px-3 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono text-[11px]">
                      {emp.timeElapsed}
                    </td>

                    {/* Total Break Minutes */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {emp.totalBreakMinutes.toFixed(1)} mins
                    </td>

                    {/* Total Lunch Minutes */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {emp.totalLunchMinutes.toFixed(1)} mins
                    </td>

                    {/* Last Active */}
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {emp.lastActive}
                    </td>

                    {/* Traffic Light as clean Pill without circles */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wide border ${
                        emp.trafficLight === 'GREEN'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : emp.trafficLight === 'YELLOW'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {emp.trafficLight}
                      </span>
                    </td>

                    {/* Actions: View Calendar + End Shift (Reduced size by 2) */}
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* View Calendar */}
                        <button
                          type="button"
                          onClick={() => onViewCalendar(emp)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10.5px] font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap leading-tight"
                        >
                          View Calendar
                        </button>

                        {/* End Shift */}
                        <button
                          type="button"
                          onClick={() => onEndShift(emp)}
                          className="px-2.5 py-1 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white text-[10.5px] font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap leading-tight"
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

      {/* Table Footer Bar with Interactive Pagination Controls */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0E1B38] text-xs flex flex-col sm:flex-row items-center justify-between gap-3 select-none font-sans">
        <div className="text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredEmployees.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * rowsPerPage, filteredEmployees.length)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{filteredEmployees.length}</span> employees
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              currentPage <= 1
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400'
                : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                currentPage === pageNum
                  ? 'bg-[#2F6798] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              currentPage >= totalPages
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400'
                : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
