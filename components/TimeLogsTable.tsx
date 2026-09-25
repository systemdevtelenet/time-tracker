'use client';

import React, { useState, useMemo } from 'react';
import { 
  Download, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  ChevronDown,
  Eye, 
  Table as TableIcon,
  X,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { AccountOption, PhoneTimeRecord } from '@/lib/types';

interface TimeLogsTableProps {
  records: PhoneTimeRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onDeleteRecord?: (ticketNumber: string) => void;
  onOpenCalendar?: (record: PhoneTimeRecord) => void;
  accounts?: AccountOption[];
}

export default function TimeLogsTable({
  records,
  isLoading,
  onRefresh,
  onDeleteRecord,
  onOpenCalendar,
}: TimeLogsTableProps) {
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Modal / Details State
  const [activeRecordDetail, setActiveRecordDetail] = useState<PhoneTimeRecord | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  // Pagination Computations based directly on dynamic records prop
  const totalPages = Math.ceil(records.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return records.slice(start, start + rowsPerPage);
  }, [records, currentPage, rowsPerPage]);

  const startIndex = records.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, records.length);

  const handleCopyTicket = (ticket: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ticket);
      setCopiedTicket(ticket);
      setTimeout(() => setCopiedTicket(null), 2000);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = ['Date of Shift', 'Agent Name', 'Account', 'Total Minutes', 'Ticket Number', 'Tagging', 'Summary'];
    const rows = records.map((r) => [
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

  // Generate page numbers array for pagination bar
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
    <div className="space-y-4">
      {/* TABLE CARD CONTAINER */}
      <div className="relative overflow-hidden bg-white dark:bg-[#101D3D] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        
        {/* Table Title Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30">
          
          {/* Left: Table Title & Dynamic Count */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
              <TableIcon className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wider uppercase">
              RECENT TIME LOGS & ACTIVITY DIRECTORY ({records.length})
            </h3>
          </div>

          {/* Right: Rows per page + Record Counter + Refresh + Export */}
          <div className="flex items-center gap-3 text-xs flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
            
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">Rows per page:</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-2.5 pr-6 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <span className="text-slate-500 dark:text-slate-400 font-medium text-xs hidden md:inline">
              Showing {startIndex} to {endIndex} of {records.length} records
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh logs from Supabase"
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-40 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={records.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F6798] hover:bg-[#235179] dark:bg-[#3678B0] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>

          </div>

        </div>

        {/* TABLE BODY */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Header Row */}
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#1D2433] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 select-none">
                <th className="py-2.5 px-5 font-bold">MEMBER</th>
                <th className="py-2.5 px-4 font-bold">CLIENT ACCOUNT</th>
                <th className="py-2.5 px-4 font-bold">DATE OF SHIFT</th>
                <th className="py-2.5 px-4 font-bold">TICKET / REF #</th>
                <th className="py-2.5 px-4 font-bold">DURATION</th>
                <th className="py-2.5 px-4 font-bold">TAGGING / CATEGORY</th>
                <th className="py-2.5 px-4 font-bold">SUMMARY / NOTES</th>
                <th className="py-2.5 px-5 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#2F6798]" />
                      <span>Loading records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 opacity-40 text-[#2F6798]" />
                      <span className="font-semibold text-xs">No records match your selected filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec, idx) => {
                  const initials = (rec.name || 'Member')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join('');

                  return (
                    <tr 
                      key={rec.id ? `rec-${rec.id}` : rec.ticket_number ? `${rec.ticket_number}-${idx}` : idx}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* MEMBER / AGENT NAME */}
                      <td className="py-3 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-950/60 dark:text-blue-300 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-[#2F6798]/20">
                            {initials || 'U'}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {rec.name || 'Anonymous User'}
                          </span>
                        </div>
                      </td>

                      {/* CLIENT ACCOUNT */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 text-[#2F6798] dark:text-blue-300 uppercase tracking-wide">
                          {rec.account || 'GENERAL'}
                        </span>
                      </td>

                      {/* DATE OF SHIFT */}
                      <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.date_of_shift || 'N/A'}</span>
                        </div>
                      </td>

                      {/* TICKET / REF # */}
                      <td className="py-3 px-4 font-bold text-[#2F6798] dark:text-blue-400 text-xs whitespace-nowrap">
                        {rec.ticket_number ? `#${rec.ticket_number}` : '—'}
                      </td>

                      {/* DURATION */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                            {rec.total_minutes || '0 mins'}
                          </span>
                        </div>
                      </td>

                      {/* TAGGING / CATEGORY */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 uppercase tracking-wide inline-block max-w-[150px] truncate" title={rec.tagging || 'General'}>
                          {rec.tagging || 'GENERAL'}
                        </span>
                      </td>

                      {/* SUMMARY / NOTES */}
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-[220px] truncate" title={rec.summary || 'No summary notes'}>
                        {rec.summary || '—'}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Calendar / Schedule Action Button */}
                          {onOpenCalendar && (
                            <button
                              type="button"
                              onClick={() => onOpenCalendar(rec)}
                              title="View shift schedule / calendar"
                              className="text-[#2F6798] hover:text-[#1c4366] dark:text-blue-400 p-1 transition-colors cursor-pointer"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          )}

                          {/* Preview Details Button */}
                          <button
                            type="button"
                            onClick={() => setActiveRecordDetail(rec)}
                            title="View log details"
                            className="text-amber-500 hover:text-amber-600 p-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Copy Ticket Button */}
                          {rec.ticket_number && (
                            <button
                              type="button"
                              onClick={() => handleCopyTicket(rec.ticket_number)}
                              title="Copy ticket number"
                              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1 transition-colors cursor-pointer"
                            >
                              {copiedTicket === rec.ticket_number ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Delete Button */}
                          {onDeleteRecord && rec.ticket_number && (
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

        {/* PAGINATION FOOTER */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#101D3D] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left: Page Counter */}
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Page <span className="font-bold text-slate-900 dark:text-slate-100">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span>
          </div>

          {/* Right: Pagination Number Buttons */}
          <div className="flex items-center gap-1 select-none">
            
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
                  className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
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
              className="px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-[#2F6798] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
