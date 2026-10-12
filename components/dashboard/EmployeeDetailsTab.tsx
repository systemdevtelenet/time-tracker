'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Download, 
  RotateCw, 
  Users, 
  Calendar, 
  Building2, 
  Briefcase, 
  Clock, 
  ChevronDown, 
  RefreshCw,
  Save,
  X,
} from 'lucide-react';
import { RosterEmployee } from './RosterTable';
import { showToast } from '@/lib/toast';

export interface EmployeeDetailRecord {
  id: string;
  name: string;
  employeeId: string;
  userType: string;
  shiftTime: string;
  shiftType: string;
  position: string;
  clientAccount: string;
  supervisor: string;
  department: string;
  startDate: string;
  tenureMonths: number;
}

function shiftTimeToInput(value: string): string {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '';
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

function splitShiftRange(value: string): [string, string] {
  const [start = '', end = ''] = value.split(/\s*(?:–|—|-|to)\s*/i);
  return [shiftTimeToInput(start), shiftTimeToInput(end)];
}

interface EmployeeDetailsTabProps {
  employees?: RosterEmployee[];
  onViewCalendar?: (employee: RosterEmployee) => void;
  searchTerm?: string;
  filterAccount?: string;
  isHeadOrAdmin?: boolean;
  supervisorName?: string;
}

export default function EmployeeDetailsTab({
  employees,
  onViewCalendar,
  searchTerm = '',
  filterAccount = 'all',
  isHeadOrAdmin = true,
  supervisorName,
}: EmployeeDetailsTabProps) {
  const [dbEmployees, setDbEmployees] = useState<EmployeeDetailRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<EmployeeDetailRecord | null>(null);
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [scheduleType, setScheduleType] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // The roster endpoint reads the HR employees, positions, roles, and account assignment tables.
  const fetchLiveRosterFromDb = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/team-roster');
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const mapped: EmployeeDetailRecord[] = json.data.map((r: any) => ({
          id: String(r.id || r.employee_id),
          employeeId: String(r.employee_id || r.id),
          name: r.name || '',
          userType: (r.userRole || '').toLowerCase(),
          shiftTime: r.shift || '',
          shiftType: r.shift_type || '',
          position: r.position || '',
          clientAccount: r.account || '',
          supervisor: r.supervisor || '',
          department: r.department || '',
          startDate: r.hire_date || '',
          tenureMonths: r.hire_date
            ? Math.max(0, Math.floor((Date.now() - new Date(r.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 30.4375)))
            : 0,
        }));

        if (!isHeadOrAdmin && supervisorName) {
          const sName = supervisorName.toLowerCase().trim();
          const filtered = mapped.filter((r) => r.name.toLowerCase().trim().includes(sName) || sName.includes(r.name.toLowerCase().trim()));
          setDbEmployees(filtered);
        } else {
          setDbEmployees(mapped);
        }
      } else {
        setDbEmployees([]);
      }
    } catch (err) {
      console.error('Failed to load database roster:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveRosterFromDb();
  }, [isHeadOrAdmin, supervisorName]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLiveRosterFromDb();
  };

  const openScheduleEditor = (employee: EmployeeDetailRecord) => {
    const [start, end] = splitShiftRange(employee.shiftTime);
    setScheduleTarget(employee);
    setScheduleStart(start);
    setScheduleEnd(end);
    setScheduleType(employee.shiftType);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleTarget || isSavingSchedule) return;
    setIsSavingSchedule(true);
    try {
      const response = await fetch('/api/employee-schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_code: scheduleTarget.employeeId,
          shift_start: scheduleStart,
          shift_end: scheduleEnd,
          shift_type: scheduleType,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Could not save schedule.');

      const saved = payload.data;
      setDbEmployees((current) => current.map((employee) => employee.employeeId === scheduleTarget.employeeId
        ? { ...employee, shiftTime: saved.shift, shiftType: saved.shift_type }
        : employee));
      window.dispatchEvent(new CustomEvent('work-schedule-updated', { detail: saved }));
      showToast({ title: 'Schedule updated', message: `The work schedule for ${scheduleTarget.name} was saved.`, type: 'success' });
      setScheduleTarget(null);
    } catch (error) {
      showToast({
        title: 'Schedule not saved',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const isCurrentUser = (emp: EmployeeDetailRecord) => {
    if (!supervisorName) return false;
    const sName = supervisorName.toLowerCase().trim();
    const rName = (emp.name || '').toLowerCase().trim();
    return Boolean(sName && (rName === sName || rName.includes(sName) || sName.includes(rName)));
  };

  // Filter using top filter search term and client account
  const filtered = useMemo(() => {
    const matches = dbEmployees.filter((emp) => {
      const q = (searchTerm || '').toLowerCase();
      const matchesSearch = !q || (
        emp.name.toLowerCase().includes(q) ||
        emp.employeeId.includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.clientAccount.toLowerCase().includes(q) ||
        emp.supervisor.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.userType.toLowerCase().includes(q) ||
        emp.shiftType.toLowerCase().includes(q)
      );

      const matchesAccount = 
        filterAccount === 'all' || 
        !filterAccount || 
        emp.clientAccount.toLowerCase().includes(filterAccount.toLowerCase()) ||
        filterAccount.toLowerCase().includes(emp.clientAccount.toLowerCase());

      return matchesSearch && matchesAccount;
    });

    const currentUserList: EmployeeDetailRecord[] = [];
    const otherList: EmployeeDetailRecord[] = [];
    matches.forEach((emp) => {
      if (isCurrentUser(emp)) {
        currentUserList.push(emp);
      } else {
        otherList.push(emp);
      }
    });

    return [...currentUserList, ...otherList];
  }, [dbEmployees, searchTerm, filterAccount, supervisorName]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'EMPLOYEE NAME',
      'EMPLOYEE ID',
      'ROLE',
      'SHIFT TIME',
      'SHIFT TYPE',
      'POSITION',
      'CLIENT ACCOUNT',
      'SUPERVISOR',
      'DEPARTMENT',
      'HIRE DATE',
      'TENURE',
    ];

    const rows = filtered.map((e) => [
      `"${e.name}"`,
      `"${e.employeeId}"`,
      `"${e.userType}"`,
      `"${e.shiftTime}"`,
      `"${e.shiftType}"`,
      `"${e.position}"`,
      `"${e.clientAccount}"`,
      `"${e.supervisor}"`,
      `"${e.department}"`,
      `"${e.startDate}"`,
      e.tenureMonths,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workforce_team_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans select-none animate-in fade-in">
      
      {/* Top Controls Container: Search removed from card, only Action buttons */}
      <div className="bg-white dark:bg-[#0E1B38] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
            Workforce Portal Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Workforce profiles, shifts, client accounts, supervisors, and tenure
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Sync Database Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2F6798]' : ''}`} />
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-[#2F6798] hover:bg-[#24537C] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#0E1B38] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            
            {/* Table Header: Clean headers without arrows, with dedicated ID column next to Name */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10.5px] tracking-wider">
                
                <th className="py-3 px-4">
                  EMPLOYEE NAME
                </th>

                <th className="py-3 px-3">
                  EMPLOYEE ID
                </th>

                <th className="py-3 px-3">
                  ROLE
                </th>

                <th className="py-3 px-3">
                  SHIFT TIME
                </th>

                <th className="py-3 px-3">
                  SHIFT TYPE
                </th>

                <th className="py-3 px-3">
                  POSITION
                </th>

                <th className="py-3 px-3">
                  CLIENT ACCOUNT
                </th>

                <th className="py-3 px-3">
                  SUPERVISOR
                </th>

                <th className="py-3 px-3">
                  DEPARTMENT
                </th>

                <th className="py-3 px-3">
                  HIRE DATE
                </th>

                <th className="py-3 px-3">
                  TENURE
                </th>

                <th className="py-3 px-3 text-right">
                  ACTIONS
                </th>

              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#2F6798] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold">Retrieving actual data from database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-xs text-slate-400">
                    No workforce members found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const isSupervisor = emp.userType === 'supervisor' || emp.userType === 'admin';

                  return (
                    <tr 
                      key={emp.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. Employee Name with Circular Initials Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#2F6798]/10 text-[#2F6798] dark:bg-blue-900/40 dark:text-blue-300 font-black text-[10px] flex items-center justify-center shrink-0 border border-[#2F6798]/20">
                            {getInitials(emp.name)}
                          </div>
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs block leading-tight whitespace-nowrap">
                            {emp.name}
                          </span>
                        </div>
                      </td>

                      {/* 2. Employee ID (Dedicated Column next to Name) */}
                      <td className="py-3 px-3 font-bold text-xs text-slate-700 dark:text-slate-300">
                        {emp.employeeId}
                      </td>

                      {/* 3. User Type / Role */}
                      <td className="py-3 px-3 font-medium text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isSupervisor 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' 
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {emp.userType}
                        </span>
                      </td>

                      {/* 4. Shift Time */}
                      <td className="py-3 px-3 font-semibold text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {emp.shiftTime || 'Not set'}
                      </td>

                      {/* 5. Shift Type */}
                      <td className="py-3 px-3 font-bold text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {emp.shiftType || 'Not set'}
                      </td>

                      {/* 6. Position */}
                      <td className="py-3 px-3 font-medium text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {emp.position}
                      </td>

                      {/* 7. Client Account */}
                      <td className="py-3 px-3 font-bold text-xs text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {emp.clientAccount}
                      </td>

                      {/* 8. Supervisor */}
                      <td className="py-3 px-3 font-medium text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {emp.supervisor}
                      </td>

                      {/* 9. Department */}
                      <td className="py-3 px-3 font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {emp.department}
                      </td>

                      {/* 10. Hire Date */}
                      <td className="py-3 px-3 font-medium text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {emp.startDate}
                      </td>

                      {/* 11. Tenure */}
                      <td className="py-3 px-3 font-bold text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {emp.tenureMonths}
                      </td>

                      {/* 12. Actions: Calendar Button */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                        {isHeadOrAdmin && (
                          <button
                            type="button"
                            onClick={() => openScheduleEditor(emp)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Schedule</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewCalendar) {
                              onViewCalendar({
                                id: emp.id,
                                name: emp.name,
                                employeeCode: emp.employeeId,
                                status: 'working',
                                statusLabel: 'Active',
                                totalHoursWorked: 8.0,
                                totalHoursFormatted: '8.00 hrs',
                                timeElapsed: '8h 00m',
                                totalBreakMinutes: 30,
                                totalLunchMinutes: 60,
                                lastActive: '9/17/2026',
                                trafficLight: 'GREEN',
                                department: emp.department,
                                account: emp.clientAccount,
                                shiftTime: emp.shiftTime,
                                shiftType: emp.shiftType,
                              });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2F6798] dark:text-blue-300 hover:bg-[#2F6798] hover:text-white dark:hover:bg-[#2F6798] dark:hover:text-white transition-all text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Calendar</span>
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

        {/* Footer Pagination Bar */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{paginatedEmployees.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> team members
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            {/* Page navigation */}
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

        </div>

      </div>

      {scheduleTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isSavingSchedule) setScheduleTarget(null);
        }}>
          <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-[#111C3D]" role="dialog" aria-modal="true" aria-labelledby="schedule-dialog-title">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 id="schedule-dialog-title" className="text-base font-extrabold text-slate-900 dark:text-white">Work schedule</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{scheduleTarget.name} · {scheduleTarget.employeeId}</p>
              </div>
              <button type="button" disabled={isSavingSchedule} onClick={() => setScheduleTarget(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800" aria-label="Close schedule editor">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Start time
                <input type="time" value={scheduleStart} onChange={(event) => setScheduleStart(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                End time
                <input type="time" value={scheduleEnd} onChange={(event) => setScheduleEnd(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required />
              </label>
              <label className="col-span-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Shift label
                <input type="text" value={scheduleType} onChange={(event) => setScheduleType(event.target.value)} maxLength={80} placeholder="Optional" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </label>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">Times are saved in the company time zone. A new schedule keeps the previous assignment in history.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={isSavingSchedule} onClick={() => setScheduleTarget(null)} className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
              <button type="button" disabled={isSavingSchedule || !scheduleStart || !scheduleEnd || scheduleStart === scheduleEnd} onClick={handleSaveSchedule} className="inline-flex items-center gap-1.5 rounded-xl bg-[#2F6798] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#24537C] disabled:cursor-not-allowed disabled:opacity-50">
                <Save className="h-3.5 w-3.5" />
                {isSavingSchedule ? 'Saving…' : 'Save schedule'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
