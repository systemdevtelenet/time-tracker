'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, Clock, ExternalLink, RotateCw } from 'lucide-react';
import { parseShiftStartHour } from '@/lib/shiftSchedule';

interface PersonalDashboardSummaryProps {
  employeeId: string;
  shift?: string;
  onOpenAttendance?: () => void;
  variant?: 'dashboard' | 'attendance';
}

interface AttendanceCounts {
  present: number;
  late: number;
  undertime: number;
  absent: number;
  restDays: number;
  leave: number;
}

const EMPTY_COUNTS: AttendanceCounts = { present: 0, late: 0, undertime: 0, absent: 0, restDays: 0, leave: 0 };

function getSingaporeDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  return { year: part('year'), month: part('month'), day: part('day') };
}

function getShiftDateKey(timestamp: string, shift?: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  let year = get('year');
  let month = get('month');
  let day = get('day');
  const shiftStartHour = parseShiftStartHour(shift);
  if (shiftStartHour !== null && get('hour') < shiftStartHour) {
    const priorDate = new Date(Date.UTC(year, month - 1, day - 1));
    year = priorDate.getUTCFullYear();
    month = priorDate.getUTCMonth() + 1;
    day = priorDate.getUTCDate();
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizeStatus(value: unknown) {
  const status = String(value || '').trim().toLowerCase();
  const aliases: Record<string, string> = {
    p: 'present', present: 'present',
    l: 'late', late: 'late',
    u: 'undertime', undertime: 'undertime',
    a: 'absent', absent: 'absent',
    rd: 'rest day', 'rest day': 'rest day',
    vl: 'leave', vacation: 'leave', 'vacation leave': 'leave',
    sl: 'leave', sick: 'leave', 'sick leave': 'leave',
    bl: 'leave', bereavement: 'leave', 'bereavement leave': 'leave',
    ml: 'leave', maternity: 'leave', 'maternity leave': 'leave',
    pl: 'leave', paternity: 'leave', 'paternity leave': 'leave',
    hol: 'leave', holiday: 'leave',
  };
  return aliases[status] || status;
}

export default function PersonalDashboardSummary({ employeeId, shift, onOpenAttendance, variant = 'dashboard' }: PersonalDashboardSummaryProps) {
  const [counts, setCounts] = useState<AttendanceCounts>(EMPTY_COUNTS);
  const [shiftStatus, setShiftStatus] = useState('Loading');
  const [lastPunch, setLastPunch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [monthLabel, setMonthLabel] = useState('');

  const refresh = useCallback(async () => {
    if (!employeeId) return;
    setIsRefreshing(true);
    try {
      const id = encodeURIComponent(employeeId.replace(/^emp-/, ''));
      const [punchResponse, attendanceResponse] = await Promise.all([
        fetch(`/api/punch-logs?empId=${id}&scope=calendar`, { cache: 'no-store' }),
        fetch('/api/attendance-overrides?scope=calendar', { cache: 'no-store' }),
      ]);
      if (!punchResponse.ok || !attendanceResponse.ok) throw new Error('Unable to refresh personal attendance.');
      const [punchJson, attendanceJson] = await Promise.all([punchResponse.json(), attendanceResponse.json()]);
      const now = getSingaporeDateParts();
      const employeeCode = employeeId.replace(/^emp-/, '');
      const punchItems: Array<{ timestamp?: string; status?: string; type?: string }> =
        Array.isArray(punchJson.data) ? punchJson.data : [];
      const punchDays = new Map<string, Array<{ status?: string; type?: string }>>();
      for (const punch of punchItems) {
        if (!punch.timestamp) continue;
        const key = getShiftDateKey(punch.timestamp, shift);
        if (!key) continue;
        const list = punchDays.get(key) || [];
        list.push(punch);
        punchDays.set(key, list);
      }

      const overrideMap: Record<string, string> = attendanceJson.overrides || {};
      const nextCounts = { ...EMPTY_COUNTS };
      const monthDays = new Date(Date.UTC(now.year, now.month, 0)).getUTCDate();
      for (let day = 1; day <= monthDays; day += 1) {
        const dateKey = `${now.year}-${String(now.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const overrideKey = `${employeeCode}-${now.year}-${now.month - 1}-${day}`;
        let status = overrideMap[overrideKey] ? normalizeStatus(overrideMap[overrideKey]) : '';
        const dayPunches = punchDays.get(dateKey) || [];
        if (!status && dayPunches.length) {
          const hasLate = dayPunches.some((punch) => String(punch.status || '').toLowerCase() === 'late');
          const hasUndertime = dayPunches.some((punch) => String(punch.status || '').toLowerCase() === 'undertime');
          status = hasLate ? 'late' : hasUndertime ? 'undertime' : 'present';
        }
        if (!status) {
          const weekday = new Date(Date.UTC(now.year, now.month - 1, day)).getUTCDay();
          if (weekday === 0 || weekday === 6) status = 'rest day';
        }
        if (status === 'present') nextCounts.present += 1;
        if (status === 'late' || status === 'late / ut') nextCounts.late += 1;
        if (status === 'undertime' || status === 'late / ut') nextCounts.undertime += 1;
        if (status === 'absent') nextCounts.absent += 1;
        if (status === 'rest day') nextCounts.restDays += 1;
        if (status === 'leave') nextCounts.leave += 1;
      }
      setCounts(nextCounts);
      const status = String(punchJson.currentStatus?.status || 'offline');
      setShiftStatus(status === 'working' ? 'On shift' : status === 'lunch' ? 'On lunch' : status.startsWith('break') ? 'On break' : 'Off shift');
      setLastPunch(punchJson.currentStatus?.lastPunchType && punchJson.currentStatus.lastPunchType !== 'None'
        ? `${punchJson.currentStatus.lastPunchType} · ${punchJson.currentStatus.lastPunchTime}`
        : 'No punches recorded yet');
      setMonthLabel(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Singapore', month: 'long', year: 'numeric' }).format(new Date()));
    } catch (error) {
      console.error('Could not load personal dashboard attendance:', error);
      setShiftStatus('Unavailable');
    } finally {
      setIsRefreshing(false);
    }
  }, [employeeId, shift]);

  useEffect(() => {
    refresh();
    const onPunchUpdate = () => refresh();
    window.addEventListener('punch-updated', onPunchUpdate);
    window.addEventListener('attendance-override-updated', onPunchUpdate);
    return () => {
      window.removeEventListener('punch-updated', onPunchUpdate);
      window.removeEventListener('attendance-override-updated', onPunchUpdate);
    };
  }, [refresh]);

  const summaryCards = [
    { label: 'Present', value: counts.present, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/55 dark:border-emerald-800/70' },
    { label: 'Late', value: counts.late, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-950/55 dark:border-amber-800/70' },
    { label: 'Undertime', value: counts.undertime, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-300 dark:bg-orange-950/55 dark:border-orange-800/70' },
    { label: 'Absent', value: counts.absent, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-300 dark:bg-rose-950/55 dark:border-rose-800/70' },
    { label: 'Rest Days', value: counts.restDays, icon: CalendarDays, color: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800/80 dark:border-slate-700' },
    { label: 'Leave Days', value: counts.leave, icon: CalendarDays, color: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-300 dark:bg-blue-950/55 dark:border-blue-800/70' },
  ];

  if (variant === 'attendance') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3" aria-label="Your monthly attendance summary">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="relative isolate overflow-hidden p-3.5 rounded-2xl bg-white dark:bg-[#363435] border border-slate-200/90 dark:border-[#434142] shadow-xs flex items-center justify-between min-h-[82px] sm:min-h-[86px]">
              <div className="absolute inset-0 -z-10 bg-no-repeat bg-cover bg-center opacity-20 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://zhdmsmwrskxowvytedgh.supabase.co/storage/v1/object/public/Images/design%20(1).png")' }} />
              <div className="relative flex flex-col justify-center">
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase">{item.label}</span>
                <span className={`text-xl sm:text-2xl font-bold tracking-tight mt-0.5 ${item.color.split(' ').find((token) => token.startsWith('text-'))}`}>{item.value}</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">this month</span>
              </div>
              <div className={`relative w-8.5 h-8.5 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs dark:bg-[#272626] dark:border-[#434142] ${item.color}`}>
                <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0E1B38] sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2F6798] via-sky-400 to-emerald-400" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#2F6798] dark:bg-sky-950/50 dark:text-sky-300 sm:flex">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">My Attendance &amp; Shift Summary</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Your personal punch status and attendance for {monthLabel || 'this month'}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={refresh} disabled={isRefreshing} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-60">
            <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button type="button" onClick={onOpenAttendance} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F6798] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#24537C]">
            <CalendarDays className="h-3.5 w-3.5" /> My Attendance <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 px-3.5 py-3 dark:border-sky-900/60 dark:from-sky-950/40 dark:to-slate-900/50 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm dark:bg-slate-800 dark:text-sky-300"><Activity className="h-4 w-4" /></div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">Shift status</div>
            <div className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-white">{shiftStatus}</div>
          </div>
        </div>
        <div className="min-w-0 text-xs font-medium text-slate-600 dark:text-slate-300 sm:max-w-[55%] sm:text-right" title={lastPunch}>
          <span className="text-slate-400 dark:text-slate-500">Last activity</span>
          <span className="mx-2 hidden text-slate-300 dark:text-slate-700 sm:inline">·</span>
          <span className="ml-1 sm:ml-0">{lastPunch}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`group relative min-h-[88px] overflow-hidden rounded-xl border p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${item.color}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide opacity-80"><Icon className="h-3.5 w-3.5" /> {item.label}</div>
                <span className="text-[9px] font-semibold opacity-55">{monthLabel || 'This month'}</span>
              </div>
              <div className="mt-1 text-2xl font-black leading-none">{item.value}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
