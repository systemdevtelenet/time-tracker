'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Award, 
  Search, 
  Download, 
  RefreshCw, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown
} from 'lucide-react';
import { PhoneTimeRecord, EmployeeOption, AccountOption } from '@/lib/types';
import { parseDurationToSeconds, formatTotalDurationHuman } from '@/lib/utils';

interface MemberAttendanceRosterTableProps {
  records?: PhoneTimeRecord[];
  employees?: EmployeeOption[];
  accounts?: AccountOption[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onOpenCalendar?: (record: PhoneTimeRecord) => void;
  isHeadOrAdmin?: boolean;
  currentUserName?: string;
}

export interface MemberRosterEntry {
  name: string;
  count: number;
  lateCount: number;
  totalSeconds: number;
  formattedTime: string;
  role: string;
  shift: string;
  account?: string;
  onTimeRate: number | null;
  onTimeRateText: string;
  badge: { text: string; color: string };
  sampleRecord?: PhoneTimeRecord;
}

export default function MemberAttendanceRosterTable({
  records = [],
  employees: propEmployees,
  accounts = [],
  isLoading = false,
  onRefresh,
  onOpenCalendar,
  isHeadOrAdmin = true,
  currentUserName = '',
}: MemberAttendanceRosterTableProps) {
  // Local state for fetched employees if not passed via props
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number | 'all'>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<'hours' | 'punctuality' | 'shifts' | 'name'>('hours');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Fetch real team roster if not supplied
  useEffect(() => {
    if (!propEmployees || propEmployees.length === 0) {
      let isMounted = true;
      fetch('/api/team-roster')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data?.data && Array.isArray(data.data)) {
            setDbEmployees(data.data);
          }
        })
        .catch((err) => console.error('Error fetching roster in MemberAttendanceRosterTable:', err));
      return () => {
        isMounted = false;
      };
    }
  }, [propEmployees]);

  const activeEmployees = useMemo(() => {
    if (propEmployees && propEmployees.length > 0) return propEmployees;
    return dbEmployees;
  }, [propEmployees, dbEmployees]);

  // Aggregate member leaderboard data from records and employee roster (scoped for non-admins)
  const memberLeaderboard = useMemo(() => {
    const scopedEmployees = isHeadOrAdmin
      ? activeEmployees
      : activeEmployees.filter((emp: any) => {
          if (!currentUserName) return true;
          const eName = (emp.name || '').toLowerCase().trim();
          const uName = currentUserName.toLowerCase().trim();
          return eName === uName || eName.includes(uName) || uName.includes(eName);
        });

    const scopedRecords = isHeadOrAdmin
      ? records
      : records.filter((r) => {
          if (!currentUserName) return true;
          const rName = (r.name || '').toLowerCase().trim();
          const uName = currentUserName.toLowerCase().trim();
          return rName === uName || rName.includes(uName) || uName.includes(rName);
        });

    const map: Record<string, { 
      name: string; 
      count: number; 
      lateCount: number; 
      totalSeconds: number; 
      role?: string; 
      shift?: string;
      account?: string;
      sampleRecord?: PhoneTimeRecord;
    }> = {};

    // 1. Initialize strictly for the official roster employees only
    scopedEmployees.forEach((emp: any) => {
      const name = (emp.name || '').trim();
      if (!name) return;
      const empPosition = (emp as any)?.position || emp.role;
      const actualRole = empPosition && empPosition !== 'User' && empPosition !== 'Admin'
        ? empPosition
        : 'Trainer';

      map[name] = {
        name,
        count: 0,
        lateCount: 0,
        totalSeconds: 0,
        role: actualRole,
        shift: (emp as any)?.shift || '9:00 PM to 6:00 AM',
        account: (emp as any)?.account || (emp as any)?.department || 'Corporate',
      };
    });

    // 2. Accumulate stats ONLY for matching official roster employees
    scopedRecords.forEach((r) => {
      const rawName = (r.name || '').trim();
      if (!rawName) return;

      // Find if this record matches any official roster employee
      const matchKey = Object.keys(map).find((empName) => {
        const e = empName.toLowerCase().trim();
        const rName = rawName.toLowerCase().trim();
        return e === rName || e.includes(rName) || rName.includes(e);
      });

      if (matchKey && map[matchKey]) {
        map[matchKey].count += 1;
        map[matchKey].totalSeconds += parseDurationToSeconds(r.total_minutes);
        if (!map[matchKey].sampleRecord) map[matchKey].sampleRecord = r;

        const text = `${r.tagging || ''} ${r.summary || ''}`.toLowerCase();
        if (text.includes('late') || text.includes('tardy') || text.includes('delay')) {
          map[matchKey].lateCount += 1;
        }
      }
    });

    // 3. Transform to entries
    const entries: MemberRosterEntry[] = Object.values(map).map((member) => {
      const hasLogs = member.count > 0;
      const onTimeCount = Math.max(0, member.count - member.lateCount);
      const onTimeRate = hasLogs ? Math.round((onTimeCount / member.count) * 100) : null;
      
      let badge = { 
        text: 'No Logs', 
        color: 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700' 
      };

      if (hasLogs && onTimeRate !== null) {
        if (onTimeRate >= 95) {
          badge = { 
            text: 'Excellent (95%+)', 
            color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
          };
        } else if (onTimeRate >= 85) {
          badge = { 
            text: 'Good Adherence', 
            color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' 
          };
        } else {
          badge = { 
            text: 'Needs Attention', 
            color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' 
          };
        }
      }

      return {
        name: member.name,
        count: member.count,
        lateCount: member.lateCount,
        totalSeconds: member.totalSeconds,
        formattedTime: member.totalSeconds > 0 ? formatTotalDurationHuman(member.totalSeconds) : '0h 0m',
        role: member.role || 'Trainer',
        shift: member.shift || '9:00 PM to 6:00 AM',
        account: member.account,
        onTimeRate,
        onTimeRateText: onTimeRate !== null ? `${onTimeRate}%` : 'N/A',
        badge,
        sampleRecord: member.sampleRecord,
      };
    });

    // 4. Sort entries
    entries.sort((a, b) => {
      let multiplier = sortAsc ? 1 : -1;
      if (sortField === 'hours') {
        if (b.totalSeconds !== a.totalSeconds) return (a.totalSeconds - b.totalSeconds) * multiplier;
        return (a.count - b.count) * multiplier;
      }
      if (sortField === 'punctuality') {
        const rateA = a.onTimeRate ?? -1;
        const rateB = b.onTimeRate ?? -1;
        return (rateA - rateB) * multiplier;
      }
      if (sortField === 'shifts') {
        return (a.count - b.count) * multiplier;
      }
      if (sortField === 'name') {
        return a.name.localeCompare(b.name) * (sortAsc ? 1 : -1);
      }
      return 0;
    });

    return entries;
  }, [records, activeEmployees, sortField, sortAsc]);

  // Search filtering
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return memberLeaderboard;
    const q = searchTerm.toLowerCase().trim();
    return memberLeaderboard.filter((m) => 
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      (m.account && m.account.toLowerCase().includes(q)) ||
      m.shift.toLowerCase().includes(q)
    );
  }, [memberLeaderboard, searchTerm]);

  // Pagination
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  
  const paginatedMembers = useMemo(() => {
    if (pageSize === 'all') return filteredMembers;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMembers.slice(startIndex, startIndex + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const handleSort = (field: 'hours' | 'punctuality' | 'shifts' | 'name') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredMembers.length === 0) return;

    const headers = ['Rank', 'Member Name', 'Role', 'Shift Schedule', 'Recorded Shifts', 'Punctuality Rate', 'Logged Hours', 'Reliability Status'];
    const rows = filteredMembers.map((m, idx) => [
      actualIndexText(idx),
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.role.replace(/"/g, '""')}"`,
      `"${m.shift}"`,
      m.count,
      m.onTimeRateText,
      `"${m.formattedTime}"`,
      `"${m.badge.text}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `member_attendance_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actualIndexText = (idx: number) => {
    const actualRank = pageSize === 'all' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
    return `${actualRank}`;
  };

  return (
    <div className="space-y-3">
      {/* MAIN CONTAINER */}
      <div className="relative overflow-hidden bg-white dark:bg-[#101D3D] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        
        {/* Table Title Bar & Controls (Full line with smooth horizontal wrapping/scroll) */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3.5 bg-slate-50/50 dark:bg-slate-900/30">
          
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center shadow-2xs shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  Member Attendance &amp; Adherence Roster
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 whitespace-nowrap">
                  {filteredMembers.length} Members
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                Punctuality rate, shift attendance, logged duration, and adherence score
              </p>
            </div>
          </div>

          {/* Right: Search, Rows & Export */}
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end whitespace-nowrap shrink-0">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search member or role..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F6798]/30 transition-all font-medium"
              />
            </div>

            {/* Rows Per Page Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold whitespace-nowrap">
              <span className="text-[10px] text-slate-400 px-1 font-bold">Rows:</span>
              {[5, 10, 25].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                    pageSize === size
                      ? 'bg-white dark:bg-slate-700 text-[#24537D] dark:text-blue-300 shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPageSize('all');
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                  pageSize === 'all'
                    ? 'bg-white dark:bg-slate-700 text-[#24537D] dark:text-blue-300 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All
              </button>
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh Roster"
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              disabled={filteredMembers.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2F6798] hover:bg-[#24537D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

        </div>

        {/* Table Content with smooth horizontal scroll and no next-lining */}
        <div className="overflow-x-auto w-full max-w-full custom-scrollbar pb-1">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 text-[10.5px] font-black uppercase tracking-wider text-slate-400 select-none whitespace-nowrap">
                <th className="py-3.5 px-4 font-black w-14 text-center whitespace-nowrap">RANK</th>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 font-black cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>MEMBER</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-black whitespace-nowrap">ROLE &amp; DEPT</th>
                <th className="py-3.5 px-4 font-black whitespace-nowrap">SHIFT SCHEDULE</th>
                <th 
                  onClick={() => handleSort('shifts')}
                  className="py-3.5 px-4 font-black text-center cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>SHIFTS</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('punctuality')}
                  className="py-3.5 px-4 font-black cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>PUNCTUALITY</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('hours')}
                  className="py-3.5 px-4 font-black cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>LOGGED HOURS</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-black text-right whitespace-nowrap">RELIABILITY STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#2F6798]" />
                      <span>Loading attendance records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic whitespace-nowrap">
                    No members found matching &quot;{searchTerm}&quot;.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m, idx) => {
                  const actualRank = pageSize === 'all' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                  
                  // Rank styling - strictly numerical badges without any emojis
                  let rankBadge = (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {actualRank}
                    </span>
                  );
                  if (actualRank === 1) {
                    rankBadge = (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 ring-1.5 ring-amber-400/80 shadow-2xs">
                        1
                      </span>
                    );
                  } else if (actualRank === 2) {
                    rankBadge = (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 ring-1.5 ring-slate-400/80 shadow-2xs">
                        2
                      </span>
                    );
                  } else if (actualRank === 3) {
                    rankBadge = (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300 ring-1.5 ring-orange-400/80 shadow-2xs">
                        3
                      </span>
                    );
                  }

                  const initials = m.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'TM';

                  return (
                    <tr 
                      key={m.name + idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group whitespace-nowrap"
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {rankBadge}
                      </td>

                      {/* Member */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2F6798]/20 to-[#2F6798]/10 dark:from-blue-900/40 dark:to-blue-800/20 text-[#2F6798] dark:text-blue-300 font-black text-[11px] flex items-center justify-center shrink-0 border border-[#2F6798]/20">
                            {initials}
                          </div>
                          <div className="whitespace-nowrap">
                            <span 
                              onClick={() => {
                                if (m.sampleRecord && onOpenCalendar) {
                                  onOpenCalendar(m.sampleRecord);
                                }
                              }}
                              className={`font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap inline-block ${
                                m.sampleRecord && onOpenCalendar ? 'hover:text-[#2F6798] cursor-pointer hover:underline' : ''
                              }`}
                            >
                              {m.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {m.role}
                        </span>
                      </td>

                      {/* Shift Schedule */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="whitespace-nowrap font-medium">{m.shift}</span>
                        </div>
                      </td>

                      {/* Recorded Shifts */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {m.count} {m.count === 1 ? 'shift' : 'shifts'}
                        </span>
                      </td>

                      {/* Punctuality */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 whitespace-nowrap min-w-[130px]">
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {m.onTimeRateText}
                          </span>
                          {m.onTimeRate !== null && (
                            <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shrink-0">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  m.onTimeRate >= 95
                                    ? 'bg-emerald-500'
                                    : m.onTimeRate >= 85
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.max(8, m.onTimeRate)}%` }}
                              />
                            </div>
                          )}
                          {m.lateCount > 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 whitespace-nowrap">
                              ({m.lateCount} late)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Logged Hours */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-black text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md whitespace-nowrap">
                          {m.formattedTime}
                        </span>
                      </td>

                      {/* Reliability Status */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${m.badge.color}`}>
                          {m.badge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/20 whitespace-nowrap">
          <div className="whitespace-nowrap">
            Showing{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {filteredMembers.length === 0 ? 0 : pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {pageSize === 'all' ? filteredMembers.length : Math.min(currentPage * pageSize, filteredMembers.length)}
            </strong>{' '}
            of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{filteredMembers.length}</strong> members
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
