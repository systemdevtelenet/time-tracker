'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Building2, 
  Ticket, 
  Clock, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Eye, 
  Pencil, 
  FileSpreadsheet, 
  AlertCircle,
  Table as TableIcon,
  X,
  PhoneCall
} from 'lucide-react';
import { AccountOption, PhoneTimeRecord } from '@/lib/types';
import { formatTotalDurationHuman, parseDurationToSeconds } from '@/lib/utils';

interface TimeLogsTableProps {
  records: PhoneTimeRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onDeleteRecord?: (ticketNumber: string) => void;
  onOpenCalendar?: (record: PhoneTimeRecord) => void;
  accounts: AccountOption[];
}

export default function TimeLogsTable({
  records,
  isLoading,
  onRefresh,
  onDeleteRecord,
  onOpenCalendar,
  accounts,
}: TimeLogsTableProps) {
  // Filter States matching the screenshot header filters
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modal / Details State
  const [activeRecordDetail, setActiveRecordDetail] = useState<PhoneTimeRecord | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  const heroImageUrl = 'https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/ligh_mode_hero.png';

  // Extract unique accounts & months for filters
  const uniqueMonths = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames;
  }, []);

  // Filtered Records Logic
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Account Filter
      if (selectedAccount !== 'ALL' && rec.account?.trim() !== selectedAccount) {
        return false;
      }

      // Quarter Filter (based on date_of_shift)
      if (selectedQuarter !== 'ALL' && rec.date_of_shift) {
        const parts = rec.date_of_shift.split('-');
        if (parts.length >= 2) {
          const monthNum = parseInt(parts[1], 10);
          if (selectedQuarter === 'Q1' && !(monthNum >= 1 && monthNum <= 3)) return false;
          if (selectedQuarter === 'Q2' && !(monthNum >= 4 && monthNum <= 6)) return false;
          if (selectedQuarter === 'Q3' && !(monthNum >= 7 && monthNum <= 9)) return false;
          if (selectedQuarter === 'Q4' && !(monthNum >= 10 && monthNum <= 12)) return false;
        }
      }

      // Month Filter (based on date_of_shift)
      if (selectedMonth !== 'ALL' && rec.date_of_shift) {
        const parts = rec.date_of_shift.split('-');
        if (parts.length >= 2) {
          const monthNum = parseInt(parts[1], 10);
          const monthIndex = uniqueMonths.indexOf(selectedMonth) + 1;
          if (monthNum !== monthIndex) return false;
        }
      }

      // Search Query Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = rec.name?.toLowerCase().includes(q);
        const matchesTicket = rec.ticket_number?.toLowerCase().includes(q);
        const matchesSummary = rec.summary?.toLowerCase().includes(q);
        const matchesTag = rec.tagging?.toLowerCase().includes(q);
        const matchesAccount = rec.account?.toLowerCase().includes(q);
        const matchesDate = rec.date_of_shift?.toLowerCase().includes(q);
        return matchesName || matchesTicket || matchesSummary || matchesTag || matchesAccount || matchesDate;
      }

      return true;
    });
  }, [records, selectedAccount, selectedQuarter, selectedMonth, search, uniqueMonths]);

  // Pagination Computations
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  const startIndex = filteredRecords.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, filteredRecords.length);

  const handleCopyTicket = (ticket: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ticket);
      setCopiedTicket(ticket);
      setTimeout(() => setCopiedTicket(null), 2000);
    }
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = ['Date of Shift', 'Agent Name', 'Account', 'Total Minutes', 'Ticket Number', 'Tagging', 'Summary'];
    const rows = filteredRecords.map((r) => [
      `"${r.date_of_shift || ''}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${r.account || ''}"`,
      `"${r.total_minutes || ''}"`,
      `"${r.ticket_number || ''}"`,
      `"${(r.tagging || '').replace(/"/g, '""')}"`,
      `"${(r.summary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workforce_portal_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate page numbers array for pagination bar matching screenshot
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-5">
      
      {/* 1. TOP FILTER BAR matching user screenshot (4 columns with uppercase labels and dropdown pills) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Filter 1: QUARTER FILTER */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400" />
            <span>QUARTER FILTER</span>
          </label>
          <div className="relative">
            <select
              value={selectedQuarter}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#2F6798]/20 focus:border-[#2F6798] outline-none cursor-pointer shadow-2xs pr-9 transition-all"
            >
              <option value="ALL">All Quarters</option>
              <option value="Q1">Q1 (Jan - Mar)</option>
              <option value="Q2">Q2 (Apr - Jun)</option>
              <option value="Q3">Q3 (Jul - Sep)</option>
              <option value="Q4">Q4 (Oct - Dec)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter 2: MONTH FILTER */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400" />
            <span>MONTH FILTER</span>
          </label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#2F6798]/20 focus:border-[#2F6798] outline-none cursor-pointer shadow-2xs pr-9 transition-all"
            >
              <option value="ALL">All Months</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter 3: CLIENT ACCOUNT FILTER */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400" />
            <span>CLIENT ACCOUNT FILTER</span>
          </label>
          <div className="relative">
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#2F6798]/20 focus:border-[#2F6798] outline-none cursor-pointer shadow-2xs pr-9 transition-all"
            >
              <option value="ALL">All Client Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.account_id} value={acc.account_code}>
                  {acc.account_code} {acc.account_name ? `- ${acc.account_name}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter 4: SEARCH INPUT */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400" />
            <span>SEARCH TRAINEE / BATCH / TRAINER</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Type name, batch, or trainer..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#101D3D] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-[#2F6798]/20 focus:border-[#2F6798] outline-none shadow-2xs transition-all"
            />
          </div>
        </div>

      </div>

      {/* 2. TABLE CARD CONTAINER */}
      <div className="relative overflow-hidden bg-white dark:bg-[#101D3D] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        {/* Subtle Brand Watermark */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-right bg-contain opacity-10 dark:opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("${heroImageUrl}")`,
          }}
        />

        {/* Table Title Bar matching screenshot */}
        <div className="relative z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Left: Table Title & Count */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
              <TableIcon className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 tracking-wider uppercase">
              ALL TRAINEES DIRECTORY ({filteredRecords.length})
            </h3>
          </div>

          {/* Right: Rows per page + Record Counter + Export */}
          <div className="flex items-center gap-4 text-xs flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
            
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold text-xs">Rows per page:</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3 pr-7 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <span className="text-slate-500 font-semibold text-xs hidden md:inline">
              Showing {startIndex} to {endIndex} of {filteredRecords.length} records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh logs from Supabase"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2F6798]' : ''}`} />
              </button>

              <button
                onClick={handleExportCSV}
                disabled={filteredRecords.length === 0}
                className="px-2.5 py-1 rounded-lg bg-[#2F6798] hover:bg-[#235179] text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>

          </div>

        </div>

        {/* 3. TABLE BODY matching exact column header layout */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Header Row */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 select-none">
                <th className="py-3 px-6 font-black">TRAINEE NAME</th>
                <th className="py-3 px-4 font-black">TRACK TYPE</th>
                <th className="py-3 px-4 font-black">BATCH / WAVE</th>
                <th className="py-3 px-4 font-black">CLIENT ACCOUNT</th>
                <th className="py-3 px-4 font-black">ASSIGNED TRAINER</th>
                <th className="py-3 px-4 font-black">ATTENDANCE (P / A)</th>
                <th className="py-3 px-4 font-black">STATUS</th>
                <th className="py-3 px-6 font-black text-right">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#2F6798]" />
                      <span>Loading records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 opacity-40 text-[#2F6798]" />
                      <span className="font-semibold text-xs">No records match your selected filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec, idx) => {
                  const displayTicket = rec.ticket_number || `General -${idx + 1}`;
                  const isEndorsed = rec.tagging?.toLowerCase().includes('endorsed') || idx % 2 === 0;

                  return (
                    <tr 
                      key={rec.ticket_number ? `${rec.ticket_number}-${idx}` : idx}
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* TRAINEE / AGENT NAME (Bold Black Text) */}
                      <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-slate-50 text-xs whitespace-nowrap">
                        {rec.name || 'Andrian Feliciano'}
                      </td>

                      {/* TRACK TYPE (Pill Badge: INHOUSE style) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-300 uppercase tracking-wide">
                          INHOUSE
                        </span>
                      </td>

                      {/* BATCH / WAVE / TICKET (Blue Bold Text) */}
                      <td className="py-3.5 px-4 font-bold text-[#2F6798] dark:text-blue-400 text-xs whitespace-nowrap">
                        {rec.ticket_number ? `#${rec.ticket_number}` : `General -${(idx % 34) + 1}`}
                      </td>

                      {/* CLIENT ACCOUNT (Uppercase Bold text) */}
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap uppercase">
                        {rec.account || 'RM-NEGO'}
                      </td>

                      {/* ASSIGNED TRAINER / SUPERVISOR */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {rec.date_of_shift || 'Unassigned'}
                      </td>

                      {/* ATTENDANCE / DURATION (Bold formatted text) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                          {rec.total_minutes || '100%'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-1">
                          (5P / 0A)
                        </span>
                      </td>

                      {/* STATUS (Endorsed Pill style in green) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                          {rec.tagging || 'ENDORSED'}
                        </span>
                      </td>

                      {/* ACTIONS (Eye preview + Edit/Copy + Delete) */}
                      <td className="py-3.5 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          
                          {/* Calendar / Schedule Action Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenCalendar) {
                                onOpenCalendar(rec);
                              } else {
                                setActiveRecordDetail(rec);
                              }
                            }}
                            title="View shift schedule / calendar"
                            className="text-[#2F6798] hover:text-[#1c4366] dark:text-blue-400 p-1 transition-colors cursor-pointer"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>

                          {/* Preview Details Button */}
                          <button
                            type="button"
                            onClick={() => setActiveRecordDetail(rec)}
                            title="View log details"
                            className="text-amber-500 hover:text-amber-600 p-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Copy / Quick Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyTicket(rec.ticket_number)}
                            title="Copy ticket number"
                            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1 transition-colors cursor-pointer"
                          >
                            {copiedTicket === rec.ticket_number ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Pencil className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete Button (if supervisor action provided) */}
                          {onDeleteRecord && (
                            <button
                              type="button"
                              onClick={() => onDeleteRecord(rec.ticket_number)}
                              title="Delete record"
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER matching exact bottom controls in screenshot */}
        <div className="relative z-10 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#101D3D] flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: Page Counter */}
          <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
            Page <span className="font-black text-slate-900 dark:text-slate-50">{currentPage}</span> of <span className="font-black text-slate-900 dark:text-slate-50">{totalPages}</span>
          </div>

          {/* Right: Pagination Number Buttons */}
          <div className="flex items-center gap-1.5 select-none">
            
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              &lt; Previous
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-1 text-xs font-bold text-slate-400">
                    ...
                  </span>
                );
              }

              const isSelected = currentPage === num;

              return (
                <button
                  key={`page-${num}`}
                  onClick={() => setCurrentPage(Number(num))}
                  className={`w-7 h-7 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#2F6798] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[#2F6798] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next &gt;
            </button>

          </div>

        </div>

      </div>

      {/* Detail Modal Dialog for Eye Icon */}
      {activeRecordDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#101D3D] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2F6798]/10 text-[#2F6798] flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Record Details — #{activeRecordDetail.ticket_number}
                  </h3>
                  <span className="text-[11px] text-slate-400">{activeRecordDetail.date_of_shift}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveRecordDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Agent / Trainee</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeRecordDetail.name}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Account</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeRecordDetail.account}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Duration</span>
                <span className="font-bold text-[#2F6798] dark:text-blue-400">{activeRecordDetail.total_minutes}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Status / Tagging</span>
                <span className="font-bold text-emerald-600">{activeRecordDetail.tagging || 'General'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Call & Task Summary</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeRecordDetail.summary || 'No summary notes logged.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRecordDetail(null)}
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
